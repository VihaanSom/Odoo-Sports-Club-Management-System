import {
  FaMoneyBill1,
  FaCreditCard,
  FaMobileScreenButton,
  FaIdCard,
  FaCircleCheck,
} from 'react-icons/fa6';
import type { BookingPaymentMethod, BookingType } from '@/types/bookings';

interface BookingPaymentSectionProps {
  bookingType: BookingType;
  paymentMethod: BookingPaymentMethod;
  onChangePaymentMethod: (method: BookingPaymentMethod) => void;
  notes: string;
  onChangeNotes: (notes: string) => void;
  finalPrice: number;
}

export const BookingPaymentSection = ({
  bookingType,
  paymentMethod,
  onChangePaymentMethod,
  notes,
  onChangeNotes,
  finalPrice,
}: BookingPaymentSectionProps) => {
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

      {/* UPI QR Code & Instructions */}
      {paymentMethod === 'upi' && (
        <div className="card bg-base-200/50 border border-base-300 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-200 flex flex-col items-center shrink-0">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  `upi://pay?pa=championsclub@okaxis&pn=Champions%20Club&am=${finalPrice}&cu=INR`
                )}`}
                alt="UPI Payment QR Code"
                className="size-44 object-contain rounded-lg"
              />
              <span className="text-[10px] text-slate-500 font-mono mt-2 uppercase tracking-wider font-semibold">
                Scan with any UPI App
              </span>
            </div>

            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div>
                <span className="text-xs uppercase tracking-wider text-base-content/60 font-semibold block">
                  Final Payment Price
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-primary">
                  ₹{finalPrice.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-base-content/80">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-base-content/60">UPI ID:</span>
                  <span className="font-mono font-bold bg-base-100 px-2 py-0.5 rounded border border-base-300">
                    championsclub@okaxis
                  </span>
                </div>
                <div className="text-[11px] text-base-content/60">
                  Accepted Apps: Google Pay, PhonePe, Paytm, BHIM, CRED
                </div>
              </div>

              <div className="badge badge-success badge-outline gap-1 text-xs py-2 px-3">
                <FaCircleCheck className="size-3" /> QR code auto-configured for ₹{finalPrice}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card / POS Payment Details */}
      {paymentMethod === 'card' && (
        <div className="card bg-base-200/50 border border-base-300 rounded-2xl p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-base-content/60 font-semibold block">
                Final Payment Price
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-primary">
                ₹{finalPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="badge badge-info badge-outline gap-1 text-xs py-2 px-3">
              <FaCreditCard className="size-3" /> Card / POS Machine
            </div>
          </div>
          <p className="text-xs text-base-content/70">
            Please tap or swipe your Debit/Credit card at the club front-desk POS terminal upon check-in.
          </p>
        </div>
      )}

      {/* Cash Payment Details */}
      {paymentMethod === 'cash' && (
        <div className="card bg-base-200/50 border border-base-300 rounded-2xl p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-base-content/60 font-semibold block">
                Final Payment Price
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-primary">
                ₹{finalPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="badge badge-warning badge-outline gap-1 text-xs py-2 px-3">
              <FaMoneyBill1 className="size-3" /> Cash at Front Desk
            </div>
          </div>
          <p className="text-xs text-base-content/70">
            Please hand over cash payment of ₹{finalPrice.toLocaleString('en-IN')} to the front desk reception before entering the court.
          </p>
        </div>
      )}

      {/* Plan Details */}
      {paymentMethod === 'plan' && (
        <div className="card bg-base-200/50 border border-base-300 rounded-2xl p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-base-content/60 font-semibold block">
                Final Payment Price
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-success">
                ₹0 (Covered by Membership)
              </span>
            </div>
            <div className="badge badge-success badge-outline gap-1 text-xs py-2 px-3">
              <FaIdCard className="size-3" /> Active Plan Benefit
            </div>
          </div>
          <p className="text-xs text-base-content/70">
            This court session will be deducted from your included membership allocation with no additional charges.
          </p>
        </div>
      )}

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
