import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { FaTrophy, FaBoxesStacked, FaPlus, FaCartShopping } from 'react-icons/fa6';

import { Button } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { canManageEquipment, isMemberRole } from '@/lib/permissions';
import type { Equipment } from '@/types';
import type { CreateEquipmentPayload, UpdateEquipmentPayload } from '@/types/equipment';
import { equipmentService } from '@/services/equipmentService';
import { EquipmentTable, EquipmentCategoryTabs, EquipmentFormModal } from './components';

export const EquipmentPage = () => {
  const user = useAuthStore((s) => s.user);
  const canManage = canManageEquipment(user?.role);
  const isMember = isMemberRole(user?.role);

  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = ['All', 'Racket', 'Ball', 'Shoe', 'Accessory', 'Apparel'];

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    try {
      const data = await equipmentService.getAll();
      setItems(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load equipment');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const filtered = items.filter(
    (item) => selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  const handleRent = async (id: string | number, name: string) => {
    try {
      await equipmentService.rentItem(id);
      toast.success(`Issued 1x ${name} to member.`);
      await fetchEquipment();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to issue equipment');
    }
  };

  const handleReturn = async (id: string | number, name: string) => {
    try {
      await equipmentService.returnItem(id);
      toast.success(`Returned 1x ${name} to club stock.`);
      await fetchEquipment();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to return equipment');
    }
  };

  const handleCreateEquipment = async (
    payload: CreateEquipmentPayload | UpdateEquipmentPayload
  ) => {
    try {
      await equipmentService.createEquipment(payload as CreateEquipmentPayload);
      toast.success('Equipment item created successfully');
      await fetchEquipment();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create equipment');
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
          <div className="flex items-center gap-2">
            <FaTrophy className="size-6 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              Equipment & Rentals
            </h1>
          </div>
          <p className="text-sm text-base-content/70 mt-1">
            {isMember
              ? 'Browse sports gear catalog, equipment condition status, and available items.'
              : 'Track sports gear, monitor condition status, and record checkouts and returns.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isMember && (
            <Link to="/orders/new" className="btn btn-primary btn-sm gap-2">
              <FaCartShopping className="size-3.5" /> Order Gear
            </Link>
          )}

          {canManage && (
            <>
              <Button
                variant="outline"
                leftIcon={<FaBoxesStacked className="size-4" />}
                onClick={() => toast('Odoo inventory sync triggered')}
              >
                Sync Inventory
              </Button>
              <Button
                variant="primary"
                leftIcon={<FaPlus className="size-4" />}
                onClick={() => setIsModalOpen(true)}
              >
                New Equipment
              </Button>
            </>
          )}
        </div>
      </div>

      <EquipmentCategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <span className="loading loading-spinner loading-md text-primary" />
        </div>
      ) : (
        <EquipmentTable
          items={filtered}
          canManage={canManage}
          onRent={handleRent}
          onReturn={handleReturn}
        />
      )}

      {canManage && (
        <EquipmentFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateEquipment}
        />
      )}
    </motion.div>
  );
};

export default EquipmentPage;
