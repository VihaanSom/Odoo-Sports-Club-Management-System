import React from 'react';
import { FaMoneyBill1, FaCreditCard, FaMobileScreenButton, FaIdCard, FaCircleInfo } from 'react-icons/fa6';
import type { BookingPaymentMethod, BookingType } from '@/types/bookings';

interface BookingPaymentSectionProps {
  bookingType: BookingType;
  paymentMethod: BookingPaymentMethod;
  onChangePaymentMethod: (method: BookingPaymentMethod) => void;
  notes: string;
  onChangeNotes: (notes: string) => void;
}

export const BookingPaymentSection: React.FC<BookingPaymentSectionProps> = ({
  bookingType,
  paymentMethod,
  onChangePaymentMethod,
  notes,
  onChangeNotes,
}) => {
  const isMember = bookingType === 'member';

  return (
    <div className="space-y-4">
      <div>
        <label className="label py-1">
          <span className="label-text text-xs font-semibold uppercase tracking-wide">
            Payment Method <span className="text-error">*</span>
          </span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {isMember && (
            <button
              type="button"
              onClick={() => onChangePaymentMethod('plan')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
                paymentMethod === 'plan'
                  ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                  : 'border-base-300 hover:bg-base-200/50'
              }`}
            >
              <FaIdCard className="size-5" />
              <span>Membership Plan</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onChangePaymentMethod('upi')}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
              paymentMethod === 'upi'
                ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                : 'border-base-300 hover:bg-base-200/50'
            }`}
          >
            <FaMobileScreenButton className="size-5" />
            <span>UPI / QR</span>
          </button>

          <button
            type="button"
            onClick={() => onChangePaymentMethod('card')}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
              paymentMethod === 'card'
                ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                : 'border-base-300 hover:bg-base-200/50'
            }`}
          >
            <FaCreditCard className="size-5" />
            <span>Card / POS</span>
          </button>

          <button
            type="button"
            onClick={() => onChangePaymentMethod('cash')}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
              paymentMethod === 'cash'
                ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                : 'border-base-300 hover:bg-base-200/50'
            }`}
          >
            <FaMoneyBill1 className="size-5" />
            <span>Cash at Desk</span>
          </button>
        </div>
      </div>

      <div className="alert bg-base-200/60 border border-base-300 rounded-xl py-2 px-3 text-xs flex items-center gap-2">
        <FaCircleInfo className="size-4 text-primary shrink-0" />
        <span>Court fees calculated automatically per member tier at booking confirmation.</span>
      </div>

      <div className="fieldset w-full bg-base-200/40 p-4 rounded-2xl border border-base-300 flex flex-col gap-2">
        <label className="fieldset-label text-xs font-semibold uppercase tracking-wider text-base-content/80 px-1 flex items-center justify-between">
          <span>Reservation Notes (Optional)</span>
          <span className="font-mono text-[11px] text-base-content/50 lowercase">{notes.length} / 500 chars</span>
        </label>
        <textarea
          className="textarea w-full min-w-full h-28 text-sm bg-base-100 border border-base-300 focus:border-primary focus:outline-primary rounded-xl p-3 resize-none transition-all placeholder:text-base-content/40 leading-relaxed"
          placeholder="e.g. Member requested racket rental, warmup time, or specific court prep instructions..."
          value={notes}
          onChange={(e) => onChangeNotes(e.target.value)}
          maxLength={500}
        />
        <div className="flex items-center justify-between text-[11px] text-base-content/50 px-1">
          <span>Special requests or court prep instructions</span>
          <span className="font-mono">{500 - notes.length} remaining</span>
        </div>
      </div>
    </div>
  );
};
