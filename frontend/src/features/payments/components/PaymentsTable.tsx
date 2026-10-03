import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { PaymentRecord, RefundPaymentPayload } from '@/types/payments';

interface PaymentsTableProps {
  payments: PaymentRecord[];
  onRefund: (payload: RefundPaymentPayload) => Promise<void>;
  isLoading?: boolean;
}

export const PaymentsTable = ({ payments, onRefund, isLoading }: PaymentsTableProps) => {
  const [selectedForRefund, setSelectedForRefund] = useState<PaymentRecord | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  const getStatusBadge = (status: PaymentRecord['status']) => {
    switch (status) {
      case 'success':
        return <span className="badge badge-success badge-sm font-semibold">Success</span>;
      case 'pending':
        return <span className="badge badge-warning badge-sm font-semibold">Pending</span>;
      case 'failed':
        return <span className="badge badge-error badge-sm font-semibold">Failed</span>;
      case 'refunded':
        return <span className="badge badge-neutral badge-sm font-semibold">Refunded</span>;
      default:
        return <span className="badge badge-sm">{status}</span>;
    }
  };

  const getCategoryBadge = (category: PaymentRecord['category']) => {
    switch (category) {
      case 'membership':
        return <span className="badge badge-primary badge-outline badge-xs">Membership</span>;
      case 'booking':
        return <span className="badge badge-secondary badge-outline badge-xs">Court Booking</span>;
      case 'bar_order':
        return <span className="badge badge-accent badge-outline badge-xs">Bar & Bistro</span>;
      case 'equipment_rental':
        return <span className="badge badge-neutral badge-outline badge-xs">Equipment</span>;
      default:
        return <span className="badge badge-outline badge-xs">{category}</span>;
    }
  };

  const handleRefundSubmit = async () => {
    if (!selectedForRefund) return;
    setIsSubmittingRefund(true);
    try {
      await onRefund({
        paymentId: selectedForRefund.id,
        amountPaise: selectedForRefund.amountPaise,
        reason: refundReason.trim() || 'Admin requested refund',
      });
      setSelectedForRefund(null);
      setRefundReason('');
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-base-300 bg-base-100 shadow-xs">
        <table className="table table-sm w-full">
          <thead className="bg-base-200/60 text-xs">
            <tr>
              <th>Txn / Ref</th>
              <th>Date & Time</th>
              <th>Member</th>
              <th>Category</th>
              <th>Method</th>
              <th className="text-right">Amount (₹)</th>
              <th className="text-center">Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-base-content/60">
                  <span className="loading loading-spinner loading-md mr-2" />
                  Loading transactions...
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-base-content/60">
                  No payment records found.
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="hover:bg-base-200/40">
                  <td className="font-mono text-xs">
                    <div className="font-semibold text-base-content">{p.transactionRef}</div>
                    <div className="text-base-content/50 text-[10px]">{p.id}</div>
                  </td>
                  <td className="text-xs whitespace-nowrap">
                    <div>{new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    <div className="text-base-content/50 text-[11px]">
                      {new Date(p.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="text-xs">
                    <div className="font-medium text-base-content">{p.memberName}</div>
                    <div className="text-base-content/50 text-[11px]">{p.memberPhone}</div>
                  </td>
                  <td>{getCategoryBadge(p.category)}</td>
                  <td className="uppercase font-mono text-xs tracking-wider">{p.method}</td>
                  <td className="text-right font-mono font-bold text-xs">
                    ₹{(p.amountPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-center">{getStatusBadge(p.status)}</td>
                  <td className="text-right">
                    {p.status === 'success' ? (
                      <Button
                        size="xs"
                        variant="error"
                        onClick={() => setSelectedForRefund(p)}
                      >
                        Refund
                      </Button>
                    ) : (
                      <span className="text-xs text-base-content/40">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Refund Modal */}
      <Modal
        isOpen={Boolean(selectedForRefund)}
        onClose={() => setSelectedForRefund(null)}
        title="Issue Refund"
        maxWidth="md"
      >
        {selectedForRefund && (
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-base-200/70 rounded-lg space-y-1.5 border border-base-300">
              <div className="flex justify-between">
                <span className="text-base-content/70">Txn Ref:</span>
                <span className="font-mono font-semibold">{selectedForRefund.transactionRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">Member:</span>
                <span className="font-medium">{selectedForRefund.memberName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">Refund Amount:</span>
                <span className="font-bold text-error font-mono">
                  ₹{(selectedForRefund.amountPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium text-xs">Refund Reason *</span>
              </label>
              <textarea
                rows={2}
                className="textarea textarea-bordered w-full text-sm"
                placeholder="Reason for cancellation / refund..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              />
            </div>

            <div className="modal-action flex justify-between pt-2 border-t border-base-300">
              <Button variant="ghost" size="sm" onClick={() => setSelectedForRefund(null)}>
                Back
              </Button>
              <Button
                variant="error"
                size="sm"
                isLoading={isSubmittingRefund}
                onClick={handleRefundSubmit}
              >
                Submit
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentsTable;
