import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { FaIdCard, FaPlus, FaRotate } from 'react-icons/fa6';
import { Button, Skeleton, Modal, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { canManagePlans, isMemberRole } from '@/lib/permissions';
import { membershipPlanService, memberService } from '@/services/memberService';
import type { MembershipPlan } from '@/types';
import { MembershipPlanCard } from './components';

export const MembershipsPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const canManage = canManagePlans(user?.role);
  const isMember = isMemberRole(user?.role);

  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);

  // Form states for creating a plan
  const [newTier, setNewTier] = useState<'Gold' | 'Silver' | 'Junior'>('Gold');
  const [newDuration, setNewDuration] = useState<1 | 6 | 12>(1);
  const [newPriceRupees, setNewPriceRupees] = useState('5000');
  const [newCourtRateRupees, setNewCourtRateRupees] = useState('200');
  const [newShopDiscount, setNewShopDiscount] = useState('15');
  const [newBarDiscount, setNewBarDiscount] = useState('15');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for editing a plan
  const [editPriceRupees, setEditPriceRupees] = useState('');
  const [editCourtRateRupees, setEditCourtRateRupees] = useState('');
  const [editShopDiscount, setEditShopDiscount] = useState('');
  const [editBarDiscount, setEditBarDiscount] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await membershipPlanService.getAll();
      setPlans(data);
    } catch {
      toast.error('Failed to load membership plans');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSelectPlan = async (plan: MembershipPlan) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isMember) {
      if (user.planId === plan.id) {
        toast.success(`You are currently on the ${plan.name || plan.tier} plan!`);
        return;
      }
      try {
        setIsSubmitting(true);
        const res = await memberService.changePlan(user.id, plan.id);
        setUser({
          ...user,
          tier: res.tier,
          planId: res.planId,
        });
        toast.success(
          `Membership updated! You are now subscribed to ${res.tier} (${plan.durationMonths || 1} Mo).`
        );
        fetchPlans();
      } catch (err: any) {
        const msg =
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          'Failed to update membership plan';
        toast.error(msg);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast('As club staff, you can configure plan rates or manage member subscriptions in Members directory.', {
        icon: 'ℹ️',
      });
    }
  };

  const handleOpenEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setEditPriceRupees(String((plan.pricePaise || 0) / 100));
    setEditCourtRateRupees(String((plan.courtRatePaise || 0) / 100));
    setEditShopDiscount(String(plan.shopDiscountPct ?? 0));
    setEditBarDiscount(String(plan.barDiscountPct ?? 0));
    setEditIsActive(plan.isActive ?? true);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const pricePaise = Math.round(parseFloat(newPriceRupees) * 100);
      const courtRatePaise = Math.round(parseFloat(newCourtRateRupees) * 100);
      const shopDiscountPct = parseInt(newShopDiscount, 10);
      const barDiscountPct = parseInt(newBarDiscount, 10);

      // Check if a plan for this tier and duration already exists
      const existing = plans.find(
        (p) => p.tier === newTier && p.durationMonths === newDuration
      );

      if (existing) {
        await membershipPlanService.update(existing.id, {
          pricePaise,
          courtRatePaise,
          shopDiscountPct,
          barDiscountPct,
          isActive: true,
        });
        toast.success(`Updated existing ${newTier} (${newDuration} Mo) plan rates!`);
      } else {
        await membershipPlanService.create({
          tier: newTier,
          durationMonths: newDuration,
          pricePaise,
          courtRatePaise,
          shopDiscountPct,
          barDiscountPct,
        });
        toast.success('Membership plan created successfully');
      }

      setIsCreateModalOpen(false);
      fetchPlans();
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to save membership plan. Ensure you are logged in as admin.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    try {
      setIsSubmitting(true);
      const pricePaise = Math.round(parseFloat(editPriceRupees) * 100);
      const courtRatePaise = Math.round(parseFloat(editCourtRateRupees) * 100);
      const shopDiscountPct = parseInt(editShopDiscount, 10);
      const barDiscountPct = parseInt(editBarDiscount, 10);

      await membershipPlanService.update(editingPlan.id, {
        pricePaise,
        courtRatePaise,
        shopDiscountPct,
        barDiscountPct,
        isActive: editIsActive,
      });

      toast.success('Membership plan updated');
      setEditingPlan(null);
      fetchPlans();
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to update plan';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <FaIdCard className="size-7 text-primary" /> Membership Plans & Tiers
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            {isMember
              ? 'Explore club subscription tiers, court reservation discounts, and member benefits.'
              : 'Club subscription tiers, court reservation discounts, and pro-shop benefits.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchPlans}
            leftIcon={<FaRotate className="size-3.5" />}
          >
            Refresh
          </Button>

          {canManage && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<FaPlus className="size-3.5" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Plan
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <MembershipPlanCard
              key={plan.id}
              plan={plan}
              onSelect={handleSelectPlan}
              onEdit={canManage ? handleOpenEdit : undefined}
              isAdmin={canManage}
              isCurrentPlan={
                isMember &&
                (user?.planId
                  ? user.planId === plan.id
                  : user?.tier?.toLowerCase() === plan.tier?.toLowerCase())
              }
            />
          ))}

          {plans.length === 0 && (
            <div className="col-span-full card bg-base-200/50 border border-base-300 p-12 text-center">
              <p className="text-base-content/60">No membership plans available.</p>
            </div>
          )}
        </div>
      )}

      {/* Create Plan Modal */}
      {canManage && isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Membership Plan"
          maxWidth="md"
        >
          <form onSubmit={handleCreatePlan} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="fieldset">
                <label className="fieldset-label font-medium text-xs text-base-content/80">Tier</label>
                <select
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value as any)}
                  className="select select-bordered w-full text-sm"
                >
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Junior">Junior</option>
                </select>
              </div>

              <div className="fieldset">
                <label className="fieldset-label font-medium text-xs text-base-content/80">Duration (Months)</label>
                <select
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number(e.target.value) as any)}
                  className="select select-bordered w-full text-sm"
                >
                  <option value={1}>1 Month</option>
                  <option value={6}>6 Months</option>
                  <option value={12}>12 Months</option>
                </select>
              </div>
            </div>

            {plans.some((p) => p.tier === newTier && p.durationMonths === newDuration) && (
              <div className="p-2.5 bg-info/10 text-info border border-info/20 rounded-xl text-xs flex items-center gap-2">
                <span>
                  A <strong>{newTier} ({newDuration} Month)</strong> plan already exists. Saving will update its pricing and discounts.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Subscription Price (₹)"
                type="number"
                min="0"
                value={newPriceRupees}
                onChange={(e) => setNewPriceRupees(e.target.value)}
                placeholder="5000"
                required
              />
              <Input
                label="Court Rate (₹/hr)"
                type="number"
                min="0"
                value={newCourtRateRupees}
                onChange={(e) => setNewCourtRateRupees(e.target.value)}
                placeholder="200"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Pro Shop Discount (%)"
                type="number"
                min="0"
                max="100"
                value={newShopDiscount}
                onChange={(e) => setNewShopDiscount(e.target.value)}
                placeholder="15"
                required
              />
              <Input
                label="Bar Discount (%)"
                type="number"
                min="0"
                max="100"
                value={newBarDiscount}
                onChange={(e) => setNewBarDiscount(e.target.value)}
                placeholder="15"
                required
              />
            </div>

            <div className="modal-action pt-4 border-t border-base-300">
              <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Create Plan
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Plan Modal */}
      {canManage && editingPlan && (
        <Modal
          isOpen={!!editingPlan}
          onClose={() => setEditingPlan(null)}
          title={`Edit ${editingPlan.tier} Plan (${editingPlan.durationMonths} Mo)`}
          maxWidth="md"
        >
          <form onSubmit={handleUpdatePlan} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Subscription Price (₹)"
                type="number"
                min="0"
                value={editPriceRupees}
                onChange={(e) => setEditPriceRupees(e.target.value)}
                required
              />
              <Input
                label="Court Rate (₹/hr)"
                type="number"
                min="0"
                value={editCourtRateRupees}
                onChange={(e) => setEditCourtRateRupees(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Pro Shop Discount (%)"
                type="number"
                min="0"
                max="100"
                value={editShopDiscount}
                onChange={(e) => setEditShopDiscount(e.target.value)}
                required
              />
              <Input
                label="Bar Discount (%)"
                type="number"
                min="0"
                max="100"
                value={editBarDiscount}
                onChange={(e) => setEditBarDiscount(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-base-200/50 border border-base-300">
              <input
                type="checkbox"
                id="editIsActive"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                className="checkbox checkbox-primary checkbox-sm"
              />
              <label htmlFor="editIsActive" className="text-xs font-semibold cursor-pointer">
                Plan is active for member subscriptions
              </label>
            </div>

            <div className="modal-action pt-4 border-t border-base-300">
              <Button type="button" variant="ghost" onClick={() => setEditingPlan(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </motion.div>
  );
};

export default MembershipsPage;
