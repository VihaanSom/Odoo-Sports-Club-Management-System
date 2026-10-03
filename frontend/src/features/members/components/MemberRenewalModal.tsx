import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FaTrophy,
  FaRotateRight,
  FaMoneyBillWave,
  FaCreditCard,
  FaQrcode,
  FaClock,
  FaCircleCheck,
  FaMobileScreenButton,
} from 'react-icons/fa6';
import { Modal, Button } from '@/components/ui';
import { formatPaise, cn } from '@/lib/utils';
import type { MemberDetail, MemberRenewalPayload } from '@/types/members';

const renewalSchema = z.object({
  durationMonths: z.coerce.number().min(1, 'Please select a duration'),
  paymentMethod: z.enum(['cash', 'card', 'upi']),
  amountPaise: z.coerce.number().min(100, 'Amount is required'),
});

type RenewalFormData = z.infer<typeof renewalSchema>;

interface MemberRenewalModalProps {
  isOpen: boolean;
  member: MemberDetail;
  onClose: () => void;
  onSubmit: (data: MemberRenewalPayload) => Promise<void>;
}

export const MemberRenewalModal = ({
  isOpen,
  member,
  onClose,
  onSubmit,
}: MemberRenewalModalProps) => {
  // Monthly rates in paise per tier matching backend seeds
  const tierMonthlyRatePaise: Record<string, number> = {
    Gold: 500000,
    Silver: 300000,
    Junior: 200000,
    Standard: 300000,
    Premium: 500000,
    VIP: 500000,
  };

  const monthlyRate = tierMonthlyRatePaise[member.tier] || 500000;
  const displayName =
    member.name ||
    `${member.firstName || ''} ${member.lastName || ''}`.trim() ||
    'Club Member';

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(displayName);
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardErrors, setCardErrors] = useState<{
    cardNumber?: string;
    cardHolder?: string;
    cardExpiry?: string;
    cardCvv?: string;
  }>({});

  // UPI state
  const [upiTimer, setUpiTimer] = useState(300);
  const [isUpiSimulated, setIsUpiSimulated] = useState(false);

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
    },
  });

  const selectedMonths = watch('durationMonths');
  const selectedPaymentMethod = watch('paymentMethod');
  const currentAmount = watch('amountPaise');

  // Auto-calculate amount when duration changes
  useEffect(() => {
    if (selectedMonths) {
      setValue('amountPaise', monthlyRate * selectedMonths, { shouldValidate: true });
    }
  }, [selectedMonths, monthlyRate, setValue]);

  // Countdown timer for UPI QR Code
  useEffect(() => {
    if (!isOpen || selectedPaymentMethod !== 'upi' || upiTimer <= 0) return;
    const interval = setInterval(() => {
      setUpiTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, selectedPaymentMethod, upiTimer]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const handleCardNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(val);
    if (cardErrors.cardNumber) {
      setCardErrors((prev) => ({ ...prev, cardNumber: undefined }));
    }
  };

  const handleExpiryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardExpiry(val);
    if (cardErrors.cardExpiry) {
      setCardErrors((prev) => ({ ...prev, cardExpiry: undefined }));
    }
  };

  const handleCvvInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvv(val);
    if (cardErrors.cardCvv) {
      setCardErrors((prev) => ({ ...prev, cardCvv: undefined }));
    }
  };

  const handleFormSubmit = async (data: RenewalFormData) => {
    // If card payment, validate card details
    if (data.paymentMethod === 'card') {
      const rawCard = cardNumber.replace(/\s/g, '');
      const errs: typeof cardErrors = {};
      if (!rawCard || rawCard.length !== 16) {
        errs.cardNumber = 'Card number must be 16 digits';
      }
      if (!cardHolder.trim()) {
        errs.cardHolder = 'Cardholder name is required';
      }
      if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        errs.cardExpiry = 'Expiry date must be MM/YY';
      }
      if (!cardCvv || cardCvv.length < 3) {
        errs.cardCvv = 'CVV must be 3 or 4 digits';
      }

      if (Object.keys(errs).length > 0) {
        setCardErrors(errs);
        return;
      }
    }

    // Generate simulated reference
    let referenceNo = '';
    if (data.paymentMethod === 'card') {
      referenceNo = `TXN-CARD-${Date.now().toString().slice(-6)}`;
    } else if (data.paymentMethod === 'upi') {
      referenceNo = `UPI-${Date.now().toString().slice(-8)}`;
    } else {
      referenceNo = `CASH-REC-${Date.now().toString().slice(-6)}`;
    }

    await onSubmit({
      durationMonths: data.durationMonths,
      paymentMethod: data.paymentMethod,
      amountPaise: data.amountPaise,
      referenceNo,
    });

    reset();
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setIsUpiSimulated(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <FaTrophy className="size-5 text-amber-500" /> Renew Membership
        </span>
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Member & Tier summary */}
        <div className="bg-base-200/60 p-3.5 rounded-xl flex items-center justify-between text-xs border border-base-300">
          <div>
            <span className="text-base-content/60 block">Member</span>
            <span className="font-bold text-sm text-base-content">{displayName}</span>
          </div>
          <div className="text-right">
            <span className="text-base-content/60 block">Current Plan Tier</span>
            <span className="badge badge-sm badge-warning font-bold gap-1 mt-0.5">
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

        {/* Fee overview banner */}
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-base-content/70 block">Total Renewal Fee</span>
            <span className="text-2xl font-black text-primary">
              {formatPaise(currentAmount)}
            </span>
          </div>
          <span className="text-xs text-base-content/60 font-mono bg-base-100/70 px-2.5 py-1 rounded-md border border-base-300">
            {formatPaise(monthlyRate)} / mo
          </span>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-2">
          <label className="fieldset-label font-bold text-xs uppercase tracking-wider text-base-content/80 block">
            Payment Method
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Card Option */}
            <label
              onClick={() => setValue('paymentMethod', 'card')}
              className={cn(
                'flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all',
                selectedPaymentMethod === 'card'
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-base-300 hover:border-base-content/20 bg-base-100'
              )}
            >
              <input
                type="radio"
                value="card"
                {...register('paymentMethod')}
                className="radio radio-primary radio-sm"
              />
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FaCreditCard className="size-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-base-content">Card</div>
                <div className="text-[10px] text-base-content/60">Debit / Credit</div>
              </div>
            </label>

            {/* UPI Option */}
            <label
              onClick={() => setValue('paymentMethod', 'upi')}
              className={cn(
                'flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all',
                selectedPaymentMethod === 'upi'
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-base-300 hover:border-base-content/20 bg-base-100'
              )}
            >
              <input
                type="radio"
                value="upi"
                {...register('paymentMethod')}
                className="radio radio-primary radio-sm"
              />
              <div className="size-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <FaQrcode className="size-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-base-content">UPI</div>
                <div className="text-[10px] text-base-content/60">Scan & Pay</div>
              </div>
            </label>

            {/* Cash Option */}
            <label
              onClick={() => setValue('paymentMethod', 'cash')}
              className={cn(
                'flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all',
                selectedPaymentMethod === 'cash'
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-base-300 hover:border-base-content/20 bg-base-100'
              )}
            >
              <input
                type="radio"
                value="cash"
                {...register('paymentMethod')}
                className="radio radio-primary radio-sm"
              />
              <div className="size-8 rounded-lg bg-success/10 text-success flex items-center justify-center shrink-0">
                <FaMoneyBillWave className="size-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-base-content">Cash</div>
                <div className="text-[10px] text-base-content/60">Pay at Counter</div>
              </div>
            </label>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. CARD VIEW: Simulated Card Details Form                                 */}
        {/* ========================================================================= */}
        {selectedPaymentMethod === 'card' && (
          <div className="rounded-xl border border-base-300 bg-base-100 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-base-200 pb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-base-content">
                Enter Card Details
              </span>
              <span className="badge badge-sm badge-neutral font-mono">
                {formatPaise(currentAmount)}
              </span>
            </div>

            <div className="space-y-3">
              <div className="fieldset w-full">
                <label className="fieldset-label font-medium text-xs text-base-content/80">
                  Card Number <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="4532 8901 2345 6789"
                  value={cardNumber}
                  onChange={handleCardNumberInput}
                  maxLength={19}
                  className={cn(
                    'input input-bordered w-full font-mono text-sm',
                    cardErrors.cardNumber && 'input-error'
                  )}
                />
                {cardErrors.cardNumber && (
                  <span className="text-error text-xs mt-1">{cardErrors.cardNumber}</span>
                )}
              </div>

              <div className="fieldset w-full">
                <label className="fieldset-label font-medium text-xs text-base-content/80">
                  Cardholder Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. JOHN HACKATHON"
                  value={cardHolder}
                  onChange={(e) => {
                    setCardHolder(e.target.value.toUpperCase());
                    if (cardErrors.cardHolder) {
                      setCardErrors((prev) => ({ ...prev, cardHolder: undefined }));
                    }
                  }}
                  className={cn(
                    'input input-bordered w-full text-sm uppercase',
                    cardErrors.cardHolder && 'input-error'
                  )}
                />
                {cardErrors.cardHolder && (
                  <span className="text-error text-xs mt-1">{cardErrors.cardHolder}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="fieldset w-full">
                  <label className="fieldset-label font-medium text-xs text-base-content/80">
                    Expiry Date <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={handleExpiryInput}
                    maxLength={5}
                    className={cn(
                      'input input-bordered w-full font-mono text-sm',
                      cardErrors.cardExpiry && 'input-error'
                    )}
                  />
                  {cardErrors.cardExpiry && (
                    <span className="text-error text-xs mt-1">{cardErrors.cardExpiry}</span>
                  )}
                </div>

                <div className="fieldset w-full">
                  <label className="fieldset-label font-medium text-xs text-base-content/80">
                    CVV <span className="text-error">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="123"
                    value={cardCvv}
                    onChange={handleCvvInput}
                    maxLength={4}
                    className={cn(
                      'input input-bordered w-full font-mono text-sm',
                      cardErrors.cardCvv && 'input-error'
                    )}
                  />
                  {cardErrors.cardCvv && (
                    <span className="text-error text-xs mt-1">{cardErrors.cardCvv}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. UPI VIEW: Minimal QR & Simulated Scan & Pay                            */}
        {/* ========================================================================= */}
        {selectedPaymentMethod === 'upi' && (
          <div className="rounded-xl border border-base-300 bg-base-100 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-base-200 pb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-base-content">
                UPI Intent & QR Code
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-warning">
                <FaClock className="size-3" />
                <span>{formatTimer(upiTimer)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 py-1">
              {/* Minimal SVG UPI QR Code */}
              <div className="p-2 bg-white rounded-xl shadow-sm border border-base-300 flex flex-col items-center shrink-0">
                <div className="size-32 flex items-center justify-center bg-white">
                  <svg viewBox="0 0 100 100" className="size-28 text-neutral fill-current">
                    <rect x="0" y="0" width="30" height="30" rx="2" fill="#1e293b" />
                    <rect x="4" y="4" width="22" height="22" rx="1" fill="#ffffff" />
                    <rect x="8" y="8" width="14" height="14" fill="#1e293b" />

                    <rect x="70" y="0" width="30" height="30" rx="2" fill="#1e293b" />
                    <rect x="74" y="4" width="22" height="22" rx="1" fill="#ffffff" />
                    <rect x="78" y="8" width="14" height="14" fill="#1e293b" />

                    <rect x="0" y="70" width="30" height="30" rx="2" fill="#1e293b" />
                    <rect x="4" y="74" width="22" height="22" rx="1" fill="#ffffff" />
                    <rect x="8" y="78" width="14" height="14" fill="#1e293b" />

                    <rect x="36" y="6" width="6" height="6" />
                    <rect x="48" y="6" width="12" height="6" />
                    <rect x="36" y="18" width="18" height="6" />
                    <rect x="6" y="36" width="6" height="12" />
                    <rect x="18" y="42" width="12" height="6" />
                    <rect x="36" y="36" width="12" height="12" fill="#2563eb" />
                    <circle cx="50" cy="50" r="10" fill="#ffffff" />
                    <circle cx="50" cy="50" r="6" fill="#f59e0b" />
                    <rect x="54" y="36" width="12" height="6" />
                    <rect x="72" y="42" width="18" height="6" />
                    <rect x="36" y="54" width="6" height="12" />
                    <rect x="48" y="60" width="18" height="6" />
                    <rect x="72" y="54" width="12" height="12" />
                    <rect x="36" y="72" width="12" height="6" />
                    <rect x="54" y="78" width="18" height="6" />
                    <rect x="78" y="72" width="12" height="18" />
                  </svg>
                </div>
                <div className="mt-1 font-mono text-[10px] text-base-content/80 font-bold">
                  championsclub@icici
                </div>
              </div>

              {/* UPI Details & Simulate Trigger */}
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="font-bold text-sm text-base-content">
                    {formatPaise(currentAmount)}
                  </span>
                  <span className="badge badge-sm badge-neutral">{member.tier} Tier</span>
                </div>
                <p className="text-xs text-base-content/70">
                  Scan and pay using any UPI app (GPay, PhonePe, Paytm, BHIM).
                </p>

                <button
                  type="button"
                  onClick={() => setIsUpiSimulated(true)}
                  className={cn(
                    'btn btn-sm rounded-lg font-bold gap-2 mt-1',
                    isUpiSimulated ? 'btn-success' : 'btn-outline btn-secondary'
                  )}
                >
                  {isUpiSimulated ? (
                    <>
                      <FaCircleCheck className="size-4" />
                      Payment Verified
                    </>
                  ) : (
                    <>
                      <FaMobileScreenButton className="size-4" />
                      Simulate Scan & Pay
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. CASH VIEW: Reception instructions                                      */}
        {/* ========================================================================= */}
        {selectedPaymentMethod === 'cash' && (
          <div className="rounded-xl border border-base-300 bg-base-200/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-base-content">
                Plz pay cash at counter
              </h4>
              <span className="badge badge-sm badge-neutral font-mono">
                {formatPaise(currentAmount)}
              </span>
            </div>
            <p className="text-xs text-base-content/70">
              Please pay cash at the club reception counter to complete renewal. The membership will be extended immediately upon submission.
            </p>
          </div>
        )}

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
