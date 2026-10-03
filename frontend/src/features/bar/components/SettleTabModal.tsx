import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaTrophy, FaXmark, FaReceipt, FaCreditCard, FaMoneyBillWave, FaMobileScreenButton } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { barService } from '@/services/barService';
import { formatPaise } from '@/lib/utils';
import type { BarTab } from '@/types/bar';


const settleTabSchema = z.object({
  paymentMethod: z.enum(['card', 'cash', 'upi', 'plan'], {
    required_error: 'Payment method required',
  }),
  notes: z.string().max(250, 'Max 250 characters').optional(),
});

type SettleTabFormData = z.infer<typeof settleTabSchema>;

interface SettleTabModalProps {
  isOpen: boolean;
  tab: BarTab | null;
  onClose: () => void;
  onSettled: () => Promise<void>;
}

export const SettleTabModal: React.FC<SettleTabModalProps> = ({
  isOpen,
  tab,
  onClose,
  onSettled,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettleTabFormData>({
    resolver: zodResolver(settleTabSchema),
    mode: 'onTouched',
    defaultValues: {
      paymentMethod: 'card',
      notes: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        paymentMethod: 'card',
        notes: '',
      });
    }
  }, [isOpen, reset]);

  if (!isOpen || !tab) return null;

  const handleFormSubmit = async (values: SettleTabFormData) => {
    try {
      await barService.settleTab(tab.id, {
        paymentMethod: values.paymentMethod,
        notes: values.notes || undefined,
      });
      toast.success(`Tab #${tab.id} settled`);
      await onSettled();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Settlement failed');
    }
  };

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box bg-base-100 border border-base-300 shadow-2xl max-w-md">
        <div className="flex items-center justify-between pb-3 border-b border-base-300">
          <div className="flex items-center gap-2">
            <FaTrophy className="size-5 text-amber-500" />
            <h3 className="font-bold text-lg text-base-content">
              Settle Tab — {tab.tableNo}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-xs btn-circle text-base-content/60"
            aria-label="Close"
          >
            <FaXmark className="size-4" />
          </button>
        </div>

        {/* Tab Bill Summary */}
        <div className="mt-4 p-4 rounded-xl bg-base-200 border border-base-300 space-y-2 text-sm">
          <div className="flex items-center justify-between text-xs text-base-content/70 pb-2 border-b border-base-300">
            <span className="flex items-center gap-1.5 font-medium">
              <FaReceipt className="size-3 text-primary" /> Tab #{tab.id}
            </span>
            <span>{tab.memberName || 'Walk-in Guest'}</span>
          </div>

          <div className="flex justify-between text-xs pt-1">
            <span className="text-base-content/70">Subtotal ({tab.items.length} items):</span>
            <span className="font-medium">{formatPaise(tab.subtotalPaise)}</span>
          </div>

          {tab.discountPaise > 0 && (
            <div className="flex justify-between text-xs text-success">
              <span>Member Discount ({tab.memberTier}):</span>
              <span>- {formatPaise(tab.discountPaise)}</span>
            </div>
          )}

          <div className="flex justify-between font-extrabold text-base pt-2 border-t border-base-300">
            <span>Total to Settle:</span>
            <span className="text-primary">{formatPaise(tab.totalPaise)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-xs uppercase tracking-wide">
                Payment Method <span className="text-error">*</span>
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <label className="flex items-center gap-2 p-3 rounded-lg border border-base-300 cursor-pointer hover:bg-base-200 text-xs font-semibold">
                <input
                  type="radio"
                  value="card"
                  className="radio radio-primary radio-xs"
                  {...register('paymentMethod')}
                />
                <FaCreditCard className="size-3 text-primary" /> Credit/Debit Card
              </label>
              <label className="flex items-center gap-2 p-3 rounded-lg border border-base-300 cursor-pointer hover:bg-base-200 text-xs font-semibold">
                <input
                  type="radio"
                  value="upi"
                  className="radio radio-primary radio-xs"
                  {...register('paymentMethod')}
                />
                <FaMobileScreenButton className="size-3 text-success" /> UPI QR
              </label>
              <label className="flex items-center gap-2 p-3 rounded-lg border border-base-300 cursor-pointer hover:bg-base-200 text-xs font-semibold">
                <input
                  type="radio"
                  value="cash"
                  className="radio radio-primary radio-xs"
                  {...register('paymentMethod')}
                />
                <FaMoneyBillWave className="size-3 text-warning" /> Cash at Till
              </label>
              <label className="flex items-center gap-2 p-3 rounded-lg border border-base-300 cursor-pointer hover:bg-base-200 text-xs font-semibold">
                <input
                  type="radio"
                  value="plan"
                  className="radio radio-primary radio-xs"
                  {...register('paymentMethod')}
                />
                <FaTrophy className="size-3 text-amber-500" /> Member Account
              </label>
            </div>
            {errors.paymentMethod && (
              <span className="text-error text-xs mt-1">{errors.paymentMethod.message}</span>
            )}
          </div>

          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-xs uppercase tracking-wide">
                Settlement Notes (Optional)
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g. Card auth code or cash receipt number"
              className="input input-bordered w-full text-sm"
              {...register('notes')}
            />
            {errors.notes && (
              <span className="text-error text-xs mt-1">{errors.notes.message}</span>
            )}
          </div>

          <div className="modal-action pt-4 border-t border-base-300">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm"
              disabled={isSubmitting}
            >
              Back
            </button>
            <button
              type="submit"
              className="btn btn-success text-white btn-sm px-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                'Settle'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40 backdrop-blur-xs" onClick={onClose} />
    </div>
  );
};
