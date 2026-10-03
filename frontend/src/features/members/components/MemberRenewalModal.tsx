import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaTrophy, FaRotateRight } from 'react-icons/fa6';
import { Modal, Button, Input } from '@/components/ui';
import { formatPaise } from '@/lib/utils';
import type { MemberDetail, MemberRenewalPayload } from '@/types/members';

const renewalSchema = z.object({
  durationMonths: z.coerce.number().min(1, 'Please select a duration'),
  paymentMethod: z.enum(['cash', 'card', 'upi']),
  amountPaise: z.coerce.number().min(100, 'Amount is required'),
  referenceNo: z.string().optional(),
});

type RenewalFormData = z.infer<typeof renewalSchema>;

interface MemberRenewalModalProps {
  isOpen: boolean;
  member: MemberDetail;
  onClose: () => void;
  onSubmit: (data: MemberRenewalPayload) => Promise<void>;
}

export const MemberRenewalModal: React.FC<MemberRenewalModalProps> = ({
  isOpen,
  member,
  onClose,
  onSubmit,
}) => {
  // Monthly rates in paise per tier
  const tierMonthlyRatePaise: Record<string, number> = {
    Junior: 290000,
    Standard: 490000,
    Premium: 890000,
    VIP: 1490000,
  };

  const monthlyRate = tierMonthlyRatePaise[member.tier] || 490000;

  // Forms: React Hook Form + Zod (mode: 'onTouched'). Fields start empty, no mock autofill.
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RenewalFormData>({
    resolver: zodResolver(renewalSchema),
    mode: 'onTouched',
    defaultValues: {
      durationMonths: 12,
      paymentMethod: 'card',
      amountPaise: monthlyRate * 12,
      referenceNo: '',
    },
  });

  const selectedMonths = watch('durationMonths');

  // Auto-calculate amount when duration changes
  useEffect(() => {
    if (selectedMonths) {
      setValue('amountPaise', monthlyRate * selectedMonths, { shouldValidate: true });
    }
  }, [selectedMonths, monthlyRate, setValue]);

  const handleFormSubmit = async (data: RenewalFormData) => {
    await onSubmit({
      durationMonths: data.durationMonths,
      paymentMethod: data.paymentMethod,
      amountPaise: data.amountPaise,
      referenceNo: data.referenceNo || undefined,
    });
    reset();
  };

  const currentAmount = watch('amountPaise');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <FaTrophy className="size-5 text-amber-500" /> Renew Membership
        </span>
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="bg-base-200 p-3 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="text-base-content/60 block">Member</span>
            <span className="font-bold text-sm text-base-content">{member.name}</span>
          </div>
          <div className="text-right">
            <span className="text-base-content/60 block">Current Tier</span>
            <span className="badge badge-sm badge-warning font-bold gap-1">
              <FaTrophy className="size-2.5 text-amber-500" /> {member.tier}
            </span>
          </div>
        </div>

        {/* Duration */}
        <div className="fieldset">
          <label className="fieldset-label font-medium text-xs text-base-content/80">
            Renewal Duration
          </label>
          <select
            {...register('durationMonths')}
            className="select select-bordered w-full text-sm"
          >
            <option value={1}>1 Month</option>
            <option value={3}>3 Months</option>
            <option value={6}>6 Months</option>
            <option value={12}>12 Months (1 Year)</option>
            <option value={24}>24 Months (2 Years)</option>
            <option value={36}>36 Months (3 Years)</option>
          </select>
          {errors.durationMonths && (
            <span className="text-error text-xs mt-1">{errors.durationMonths.message}</span>
          )}
        </div>

        {/* Amount display & input */}
        <div className="bg-primary/10 border border-primary/20 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-base-content/70 block">Total Renewal Fee</span>
            <span className="text-xl font-black text-primary">
              {formatPaise(currentAmount)}
            </span>
          </div>
          <span className="text-xs text-base-content/60 font-mono">
            {formatPaise(monthlyRate)} / mo
          </span>
        </div>

        {/* Payment method */}
        <div className="fieldset">
          <label className="fieldset-label font-medium text-xs text-base-content/80">
            Payment Method
          </label>
          <select
            {...register('paymentMethod')}
            className="select select-bordered w-full text-sm"
          >
            <option value="card">Credit / Debit Card</option>
            <option value="upi">UPI / QR Code</option>
            <option value="cash">Cash (Front Desk)</option>
          </select>
          {errors.paymentMethod && (
            <span className="text-error text-xs mt-1">{errors.paymentMethod.message}</span>
          )}
        </div>

        {/* Transaction reference */}
        <Input
          label="Payment Reference / Transaction ID"
          placeholder="TXN123456 or UPI ref"
          {...register('referenceNo')}
          error={errors.referenceNo?.message}
        />

        <div className="modal-action pt-4 border-t border-base-300">
          <Button type="button" variant="ghost" onClick={onClose}>
            Back
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<FaRotateRight className="size-4" />}
          >
            Renew
          </Button>
        </div>
      </form>
    </Modal>
  );
};
