import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '@/services/orderService';
import type { OrderStatus } from '@/types/orders';

interface OrderStatusUpdateProps {
  orderId: number;
  currentStatus: OrderStatus;
  onStatusUpdated: () => Promise<void>;
}

export const OrderStatusUpdate: React.FC<OrderStatusUpdateProps> = ({
  orderId,
  currentStatus,
  onStatusUpdated,
}) => {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      await orderService.updateOrderStatus(orderId, {
        status,
        notes: notes || undefined,
      });
      toast.success(`Order status updated to ${status}`);
      setNotes('');
      await onStatusUpdated();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Status update failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card bg-base-100 border border-base-300 p-4 shadow-sm space-y-3">
      <h3 className="font-bold text-xs uppercase tracking-wide text-base-content/80">
        Update Order Lifecycle Status
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="form-control">
          <label className="label py-0.5">
            <span className="label-text text-xs font-semibold">New Status</span>
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="select select-bordered select-sm w-full text-xs font-semibold capitalize"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label py-0.5">
            <span className="label-text text-xs font-semibold">Status Notes (Optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Dispatched with tracking #TRK992"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input input-bordered input-sm w-full text-xs"
          />
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={handleUpdate}
          disabled={submitting || status === currentStatus && !notes}
          className="btn btn-primary btn-sm px-6"
        >
          {submitting ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            'Save'
          )}
        </button>
      </div>
    </div>
  );
};
