import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import {
  FaIdCard,
  FaCalendarCheck,
  FaReceipt,
  FaBookBookmark,
  FaArrowLeft,
} from 'react-icons/fa6';
import { Button, Skeleton } from '@/components/ui';
import { memberService } from '@/services/memberService';
import type {
  MemberDetail,
  MemberActivityHistory,
  MemberAddress,
  MemberUpdatePayload,
  MemberRenewalPayload,
} from '@/types/members';
import {
  MemberDetailHeader,
  MemberAddressCard,
  MemberBookingHistory,
  MemberOrderHistory,
  MemberRenewalModal,
  MemberEditModal,
  MemberLedgerTable,
} from './components';

export const MemberDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [member, setMember] = useState<MemberDetail | null>(null);
  const [history, setHistory] = useState<MemberActivityHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'orders' | 'ledger'>('overview');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);

  const fetchMemberData = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const [memberData, historyData] = await Promise.all([
        memberService.getById(id),
        memberService.getHistory(id),
      ]);

      if (memberData) {
        setMember(memberData);
      }
      if (historyData) {
        setHistory(historyData);
      }
    } catch {
      toast.error('Failed to load member profile');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMemberData();
  }, [fetchMemberData]);

  const handleSaveAddress = async (newAddress: MemberAddress) => {
    if (!id || !member) return;
    const updated = await memberService.updateAddress(id, newAddress);
    setMember({ ...member, address: updated });
  };

  const handleUpdateProfile = async (data: MemberUpdatePayload) => {
    if (!id || !member) return;
    try {
      const updated = await memberService.update(id, data);
      setMember(updated);
      toast.success('Member profile updated');
      setIsEditModalOpen(false);
    } catch {
      toast.error('Failed to update member');
    }
  };

  const handleRenew = async (data: MemberRenewalPayload) => {
    if (!id || !member) return;
    try {
      const res = await memberService.renew(id, data);
      setMember(res.member);
      if (history) {
        setHistory({
          ...history,
          ledger: [res.ledgerEntry, ...history.ledger],
        });
      }
      toast.success('Membership renewed successfully');
      setIsRenewModalOpen(false);
    } catch {
      toast.error('Failed to renew membership');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 md:col-span-2 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="card bg-base-200/50 border border-base-300 p-12 text-center space-y-4">
        <h2 className="text-xl font-bold">Member Not Found</h2>
        <p className="text-sm text-base-content/60">
          The requested member profile ID ({id}) could not be located.
        </p>
        <div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<FaArrowLeft className="size-3.5" />}
            onClick={() => navigate('/members')}
          >
            Back to Directory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Top Header Card */}
      <MemberDetailHeader
        member={member}
        onOpenEdit={() => setIsEditModalOpen(true)}
        onOpenRenew={() => setIsRenewModalOpen(true)}
      />

      {/* Tabs navigation */}
      <div className="tabs tabs-box bg-base-200/60 p-1.5 rounded-2xl border border-base-300 w-full sm:w-auto inline-flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`tab tab-sm sm:tab-md gap-2 rounded-xl font-medium transition-all ${
            activeTab === 'overview' ? 'tab-active bg-primary text-primary-content font-bold shadow-xs' : ''
          }`}
        >
          <FaIdCard className="size-3.5" /> Overview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`tab tab-sm sm:tab-md gap-2 rounded-xl font-medium transition-all ${
            activeTab === 'bookings' ? 'tab-active bg-primary text-primary-content font-bold shadow-xs' : ''
          }`}
        >
          <FaCalendarCheck className="size-3.5" /> Bookings ({history?.bookings.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`tab tab-sm sm:tab-md gap-2 rounded-xl font-medium transition-all ${
            activeTab === 'orders' ? 'tab-active bg-primary text-primary-content font-bold shadow-xs' : ''
          }`}
        >
          <FaReceipt className="size-3.5" /> Orders & Tabs ({(history?.orders.length || 0) + (history?.barTabs.length || 0)})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ledger')}
          className={`tab tab-sm sm:tab-md gap-2 rounded-xl font-medium transition-all ${
            activeTab === 'ledger' ? 'tab-active bg-primary text-primary-content font-bold shadow-xs' : ''
          }`}
        >
          <FaBookBookmark className="size-3.5" /> Financial Ledger ({history?.ledger.length || 0})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <MemberAddressCard
              address={member.address}
              onSaveAddress={handleSaveAddress}
            />

            {/* Quick Membership Details Card */}
            <div className="card bg-base-200/50 border border-base-300 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-base-content/70">
                Membership Details
              </h3>
              <div className="text-xs space-y-2">
                <div className="flex justify-between border-b border-base-300/60 pb-1.5">
                  <span className="text-base-content/60">Plan Tier:</span>
                  <span className="font-bold">{member.tier || member.membershipPlan}</span>
                </div>
                <div className="flex justify-between border-b border-base-300/60 pb-1.5">
                  <span className="text-base-content/60">Start Date:</span>
                  <span className="font-mono">{member.membershipStart || member.joinedDate}</span>
                </div>
                <div className="flex justify-between border-b border-base-300/60 pb-1.5">
                  <span className="text-base-content/60">Renewal Due Date:</span>
                  <span className="font-mono">{member.membershipEnd || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/60">Odoo Partner Sync ID:</span>
                  <span className="font-mono font-bold text-primary">
                    {member.odooPartnerId ? `#${member.odooPartnerId}` : 'Synced'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <MemberBookingHistory bookings={history?.bookings.slice(0, 3) || []} />
            <MemberOrderHistory
              orders={history?.orders.slice(0, 3) || []}
              barTabs={history?.barTabs.slice(0, 2) || []}
            />
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <MemberBookingHistory bookings={history?.bookings || []} />
      )}

      {activeTab === 'orders' && (
        <MemberOrderHistory
          orders={history?.orders || []}
          barTabs={history?.barTabs || []}
        />
      )}

      {activeTab === 'ledger' && (
        <MemberLedgerTable ledger={history?.ledger || []} />
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <MemberEditModal
          isOpen={isEditModalOpen}
          member={member}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateProfile}
        />
      )}

      {/* Renew Modal */}
      {isRenewModalOpen && (
        <MemberRenewalModal
          isOpen={isRenewModalOpen}
          member={member}
          onClose={() => setIsRenewModalOpen(false)}
          onSubmit={handleRenew}
        />
      )}
    </motion.div>
  );
};

export default MemberDetailPage;
