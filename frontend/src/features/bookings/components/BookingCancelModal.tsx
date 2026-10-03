import React, { useState } from 'react';
import { FaTriangleExclamation, FaXmark } from 'react-icons/fa6';

interface BookingCancelModalProps {
  isOpen: boolean;
  bookingId: number;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export const BookingCancelModal: React.FC<BookingCancelModalProps> = ({
  isOpen,
  bookingId,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCancel = async () => {
    setSubmitting(true);
    try {
      await onConfirm(reason);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle z-50">
      <div className="modal-box bg-base-100 border border-base-300 shadow-2xl max-w-md">
        <div className="flex items-center justify-between pb-3 border-b border-base-300">
          <div className="flex items-center gap-2 text-error">
            <FaTriangleExclamation className="size-5" />
            <h3 className="font-bold text-lg text-base-content">Cancel Booking #{bookingId}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-xs btn-circle text-base-content/60"
          >
            <FaXmark className="size-4" />
          </button>
        </div>

        <div className="space-y-4 pt-4">
          <p className="text-sm text-base-content/70">
            This will mark the slot as cancelled and release court capacity back to the schedule.
          </p>

          <div className="fieldset w-full flex flex-col gap-1.5">
            <label className="fieldset-label text-xs font-semibold uppercase tracking-wider text-base-content/80 flex items-center justify-between">
              <span>Cancellation Reason</span>
              <span className="font-mono text-[10px] text-base-content/50">{reason.length}/500</span>
            </label>
            <textarea
              className="textarea w-full min-w-full h-24 text-sm bg-base-100 border border-base-300 focus:border-error focus:outline-error rounded-xl p-3 resize-none transition-all placeholder:text-base-content/40 leading-relaxed"
              placeholder="e.g. Member requested rescheduling due to rain..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
            />
          </div>

          <div className="modal-action pt-3 border-t border-base-300">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn btn-ghost btn-sm"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="btn btn-error btn-sm px-5"
            >
              {submitting ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                'Confirm'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
