import React, { useState, useEffect } from 'react';
import {
  FaMoneyBillWave,
  FaCreditCard,
  FaQrcode,
  FaCircleCheck,
  FaClock,
  FaMobileScreenButton,
} from 'react-icons/fa6';
import type { PaymentMethodType, TierType } from '@/types';
import { MEMBERSHIP_TIERS } from '@/types';
import { cn } from '@/lib/utils';

interface PaymentMethodSectionProps {
  selectedMethod: PaymentMethodType;
  onSelectMethod: (method: PaymentMethodType) => void;
  selectedTier: TierType;
  // Card fields
  cardNumber?: string;
  onCardNumberChange?: (val: string) => void;
  cardHolder?: string;
  onCardHolderChange?: (val: string) => void;
  cardExpiry?: string;
  onCardExpiryChange?: (val: string) => void;
  cardCvv?: string;
  onCardCvvChange?: (val: string) => void;
  cardErrors?: {
    cardNumber?: string;
    cardHolder?: string;
    cardExpiry?: string;
    cardCvv?: string;
  };
  onSimulateUpiSuccess?: () => void;
}

export const PaymentMethodSection: React.FC<PaymentMethodSectionProps> = ({
  selectedMethod,
  onSelectMethod,
  selectedTier,
  cardNumber = '',
  onCardNumberChange,
  cardHolder = '',
  onCardHolderChange,
  cardExpiry = '',
  onCardExpiryChange,
  cardCvv = '',
  onCardCvvChange,
  cardErrors = {},
  onSimulateUpiSuccess,
}) => {
  const [upiTimer, setUpiTimer] = useState(300); // 5 minutes in seconds
  const [isUpiPaid, setIsUpiPaid] = useState(false);

  const tierData = MEMBERSHIP_TIERS.find((t) => t.id === selectedTier) || MEMBERSHIP_TIERS[0];
  const payableAmount = tierData.pricePerMonth;

  // Countdown timer for UPI QR Code
  useEffect(() => {
    if (selectedMethod !== 'upi' || upiTimer <= 0) return;
    const interval = setInterval(() => {
      setUpiTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedMethod, upiTimer]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const handleCardNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    onCardNumberChange?.(val);
  };

  const handleExpiryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    onCardExpiryChange?.(val);
  };

  const handleCvvInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    onCardCvvChange?.(val);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="fieldset-label font-bold text-xs uppercase tracking-wider text-base-content/80 block mb-2">
          Method to Pay <span className="text-error">*</span>
        </label>

        {/* Radio Option Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Cash Option */}
          <label
            onClick={() => onSelectMethod('cash')}
            className={cn(
              'flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all',
              selectedMethod === 'cash'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-base-300 hover:border-base-content/20 bg-base-100'
            )}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="cash"
              checked={selectedMethod === 'cash'}
              onChange={() => onSelectMethod('cash')}
              className="radio radio-primary radio-sm"
            />
            <div className="size-8 rounded-lg bg-success/10 text-success flex items-center justify-center">
              <FaMoneyBillWave className="size-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-base-content">Cash</div>
              <div className="text-[10px] text-base-content/60">Pay at Counter</div>
            </div>
          </label>

          {/* Card Option */}
          <label
            onClick={() => onSelectMethod('card')}
            className={cn(
              'flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all',
              selectedMethod === 'card'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-base-300 hover:border-base-content/20 bg-base-100'
            )}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={selectedMethod === 'card'}
              onChange={() => onSelectMethod('card')}
              className="radio radio-primary radio-sm"
            />
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <FaCreditCard className="size-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-base-content">Card</div>
              <div className="text-[10px] text-base-content/60">Debit / Credit</div>
            </div>
          </label>

          {/* UPI Option */}
          <label
            onClick={() => onSelectMethod('upi')}
            className={cn(
              'flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all',
              selectedMethod === 'upi'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-base-300 hover:border-base-content/20 bg-base-100'
            )}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="upi"
              checked={selectedMethod === 'upi'}
              onChange={() => onSelectMethod('upi')}
              className="radio radio-primary radio-sm"
            />
            <div className="size-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
              <FaQrcode className="size-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-base-content">UPI</div>
              <div className="text-[10px] text-base-content/60">Scan & Pay</div>
            </div>
          </label>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. CASH VIEW: "plz pay cash at counter"                                  */}
      {/* ========================================================================= */}
      {selectedMethod === 'cash' && (
        <div className="rounded-xl border border-base-300 bg-base-200/40 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-base-content">
              Plz pay cash at counter
            </h4>
            <span className="badge badge-sm badge-neutral font-mono">
              ₹{payableAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs text-base-content/70">
            Please pay cash at the club reception counter upon your first visit.
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CARD VIEW: Minimal Card Details Form                                  */}
      {/* ========================================================================= */}
      {selectedMethod === 'card' && (
        <div className="rounded-xl border border-base-300 bg-base-100 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-base-200 pb-2">
            <span className="font-bold text-xs uppercase tracking-wider text-base-content">
              Enter Card Details
            </span>
            <span className="badge badge-sm badge-neutral font-mono">
              ₹{payableAmount.toLocaleString('en-IN')}
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
                placeholder="Full Name"
                value={cardHolder}
                onChange={(e) => onCardHolderChange?.(e.target.value.toUpperCase())}
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
      {/* 3. UPI VIEW: Minimal QR & Scan & Pay                                     */}
      {/* ========================================================================= */}
      {selectedMethod === 'upi' && (
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
                  ₹{payableAmount.toLocaleString('en-IN')}
                </span>
                <span className="badge badge-sm badge-neutral">{selectedTier} Tier</span>
              </div>
              <p className="text-xs text-base-content/70">
                Scan and pay using any UPI app (GPay, PhonePe, Paytm, BHIM).
              </p>

              <button
                type="button"
                onClick={() => {
                  setIsUpiPaid(true);
                  onSimulateUpiSuccess?.();
                }}
                className={cn(
                  'btn btn-sm rounded-lg font-bold gap-2 mt-1',
                  isUpiPaid ? 'btn-success' : 'btn-outline btn-secondary'
                )}
              >
                {isUpiPaid ? (
                  <>
                    <FaCircleCheck className="size-4" />
                    Verified
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
    </div>
  );
};
