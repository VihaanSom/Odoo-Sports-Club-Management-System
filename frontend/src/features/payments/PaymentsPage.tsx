import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'motion/react';
import { FaReceipt, FaPlus } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { SearchBar } from '@/components/shared/SearchBar';
import { PaymentsTable } from './components/PaymentsTable';
import { paymentService } from '@/services/paymentService';
import type {
  PaymentRecord,
  PaymentCategory,
  LedgerPaymentMethod,
  PaymentStatusType,
  PaymentSummaryStats,
  RecordPaymentPayload,
  RefundPaymentPayload,
} from '@/types/payments';

const recordSchema = z.object({
  memberName: z.string().min(2, 'Member name required'),
  memberPhone: z.string().min(10, 'Valid phone required'),
  category: z.enum(['membership', 'booking', 'bar_order', 'equipment_rental']),
  relatedEntityId: z.string().min(2, 'Reference entity ID required'),
  amountRupees: z.coerce.number().min(1, 'Amount must be greater than 0'),
  method: z.enum(['upi', 'card', 'cash', 'netbanking']),
  notes: z.string().optional(),
});

type RecordFormData = z.infer<typeof recordSchema>;

export const PaymentsPage = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [stats, setStats] = useState<PaymentSummaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecordFormData>({
    resolver: zodResolver(recordSchema),
    mode: 'onTouched',
    defaultValues: {
      memberName: '',
      memberPhone: '',
      category: 'membership',
      relatedEntityId: 'MEM-001',
      amountRupees: 0,
      method: 'upi',
      notes: '',
    },
  });

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentService.getPayments({
        search: searchQuery || undefined,
        category: categoryFilter !== 'all' ? (categoryFilter as PaymentCategory) : undefined,
        method: methodFilter !== 'all' ? (methodFilter as LedgerPaymentMethod) : undefined,
        status: statusFilter !== 'all' ? (statusFilter as PaymentStatusType) : undefined,
      });
      setPayments(res.data);
      setStats(res.stats);
    } catch {
      toast.error('Failed to load payments ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [searchQuery, categoryFilter, methodFilter, statusFilter]);

  const handleRefund = async (payload: RefundPaymentPayload) => {
    try {
      await paymentService.refundPayment(payload);
      toast.success('Refund processed successfully');
      loadPayments();
    } catch {
      toast.error('Refund failed');
    }
  };

  const handleRecordPayment = async (data: RecordFormData) => {
    try {
      const payload: RecordPaymentPayload = {
        amountPaise: Math.round(data.amountRupees * 100),
        category: data.category as PaymentCategory,
        relatedEntityId: data.relatedEntityId,
        memberName: data.memberName,
        memberPhone: data.memberPhone,
        method: data.method as LedgerPaymentMethod,
        notes: data.notes,
      };
      await paymentService.recordPayment(payload);
      toast.success('Payment recorded in ledger');
      setIsRecordModalOpen(false);
      reset();
      loadPayments();
    } catch {
      toast.error('Payment recording failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <FaReceipt className="size-7 text-primary" /> Unified Payments Ledger
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            Omnichannel ledger spanning membership dues, court reservations, lounge tabs, and equipment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<FaPlus />}
            onClick={() => setIsRecordModalOpen(true)}
          >
            Record Payment
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card bg-base-100 border border-base-300 p-4 shadow-xs">
            <div className="text-xs text-base-content/70 uppercase font-semibold">Total Settled</div>
            <div className="text-2xl font-black text-primary mt-1 font-mono">
              ₹{(stats.totalVolumePaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-success mt-0.5">{stats.successfulCount} successful txns</div>
          </div>

          <div className="card bg-base-100 border border-base-300 p-4 shadow-xs">
            <div className="text-xs text-base-content/70 uppercase font-semibold">Pending Volume</div>
            <div className="text-2xl font-black text-warning mt-1 font-mono">
              {stats.pendingCount}
            </div>
            <div className="text-[11px] text-base-content/60 mt-0.5">Awaiting gateway clearance</div>
          </div>

          <div className="card bg-base-100 border border-base-300 p-4 shadow-xs">
            <div className="text-xs text-base-content/70 uppercase font-semibold">Refunded Amount</div>
            <div className="text-2xl font-black text-error mt-1 font-mono">
              ₹{(stats.refundedVolumePaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-base-content/60 mt-0.5">Processed cancellations</div>
          </div>

          <div className="card bg-base-100 border border-base-300 p-4 shadow-xs">
            <div className="text-xs text-base-content/70 uppercase font-semibold">Method Share</div>
            <div className="text-sm font-semibold mt-2 flex items-center gap-2">
              <span className="badge badge-xs badge-primary font-mono">{stats.upiPercentage}% UPI</span>
              <span className="badge badge-xs badge-secondary font-mono">{stats.cardPercentage}% Card</span>
              <span className="badge badge-xs badge-neutral font-mono">{stats.cashPercentage}% Cash</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card bg-base-200/50 border border-base-300 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search txn ref, member name, phone, notes..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              className="select select-bordered select-sm text-xs"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="membership">Membership</option>
              <option value="booking">Court Booking</option>
              <option value="bar_order">Bar & Bistro</option>
              <option value="equipment_rental">Equipment</option>
            </select>

            <select
              className="select select-bordered select-sm text-xs"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
            >
              <option value="all">All Methods</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="netbanking">Net Banking</option>
            </select>

            <select
              className="select select-bordered select-sm text-xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Unified Ledger Table */}
      <PaymentsTable payments={payments} onRefund={handleRefund} isLoading={loading} />

      {/* Record Payment Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Payment"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(handleRecordPayment)} className="space-y-4 text-sm">
          <div>
            <label className="label">
              <span className="label-text font-medium text-xs">Member Name *</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Aarav Shah"
              className={`input input-bordered w-full input-sm ${errors.memberName ? 'input-error' : ''}`}
              {...register('memberName')}
            />
            {errors.memberName && (
              <span className="text-xs text-error mt-1">{errors.memberName.message}</span>
            )}
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium text-xs">Member Phone *</span>
            </label>
            <input
              type="text"
              placeholder="e.g. +91 98251 22334"
              className={`input input-bordered w-full input-sm ${errors.memberPhone ? 'input-error' : ''}`}
              {...register('memberPhone')}
            />
            {errors.memberPhone && (
              <span className="text-xs text-error mt-1">{errors.memberPhone.message}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">
                <span className="label-text font-medium text-xs">Category *</span>
              </label>
              <select
                className="select select-bordered w-full select-sm"
                {...register('category')}
              >
                <option value="membership">Membership</option>
                <option value="booking">Court Booking</option>
                <option value="bar_order">Bar Order</option>
                <option value="equipment_rental">Equipment Rental</option>
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium text-xs">Method *</span>
              </label>
              <select
                className="select select-bordered w-full select-sm"
                {...register('method')}
              >
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="cash">Cash</option>
                <option value="netbanking">Net Banking</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">
                <span className="label-text font-medium text-xs">Amount (₹) *</span>
              </label>
              <input
                type="number"
                step="1"
                placeholder="0"
                className={`input input-bordered w-full input-sm ${errors.amountRupees ? 'input-error' : ''}`}
                {...register('amountRupees')}
              />
              {errors.amountRupees && (
                <span className="text-xs text-error mt-1">{errors.amountRupees.message}</span>
              )}
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium text-xs">Ref Entity ID *</span>
              </label>
              <input
                type="text"
                placeholder="e.g. MEM-001, BK-1002"
                className={`input input-bordered w-full input-sm ${errors.relatedEntityId ? 'input-error' : ''}`}
                {...register('relatedEntityId')}
              />
              {errors.relatedEntityId && (
                <span className="text-xs text-error mt-1">{errors.relatedEntityId.message}</span>
              )}
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium text-xs">Notes / Narrative</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Annual renewal received via counter POS"
              className="input input-bordered w-full input-sm"
              {...register('notes')}
            />
          </div>

          <div className="modal-action flex justify-end gap-2 pt-2 border-t border-base-300">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsRecordModalOpen(false)}
            >
              Back
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default PaymentsPage;
