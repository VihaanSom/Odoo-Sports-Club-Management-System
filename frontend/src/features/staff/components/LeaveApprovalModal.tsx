import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { LeaveRequest, ReviewLeavePayload } from '@/types/staff';

interface LeaveApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  leave: LeaveRequest | null;
  onReview: (payload: ReviewLeavePayload) => Promise<void>;
}

export const LeaveApprovalModal = ({
  isOpen,
  onClose,
  leave,
  onReview,
}: LeaveApprovalModalProps) => {
  const [remarks, setRemarks] = useState('');
  const [loadingAction, setLoadingAction] = useState<'approved' | 'rejected' | null>(null);

  if (!leave) return null;

  const handleAction = async (status: 'approved' | 'rejected') => {
    setLoadingAction(status);
    try {
      await onReview({
        leaveId: leave.id,
        status,
        remarks: remarks.trim() || (status === 'approved' ? 'Approved by admin' : 'Rejected by admin'),
      });
      onClose();
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review Leave: ${leave.staffName}`}
      maxWidth="md"
    >
      <div className="space-y-4 text-sm">
        <div className="bg-base-200/60 p-3 rounded-lg border border-base-300 space-y-2">
          <div className="flex justify-between">
            <span className="text-base-content/70">Staff Member:</span>
            <span className="font-semibold">{leave.staffName} ({leave.role === 'front_desk' ? 'Front Desk' : leave.role})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/70">Leave Type:</span>
            <span className="badge badge-outline capitalize">{leave.leaveType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/70">Duration:</span>
            <span className="font-semibold">{leave.startDate} to {leave.endDate} ({leave.daysCount} days)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/70">Applied Date:</span>
            <span>{leave.appliedOn}</span>
          </div>
          <div>
            <span className="text-base-content/70 block text-xs mb-1">Reason:</span>
            <p className="text-sm bg-base-100 p-2 rounded border border-base-300">
              {leave.reason}
            </p>
          </div>
        </div>

        <div>
          <label className="label">
            <span className="label-text font-medium text-xs">Review Remarks</span>
          </label>
          <textarea
            rows={2}
            className="textarea textarea-bordered w-full text-sm"
            placeholder="Add coverage details or explanation..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <div className="modal-action flex items-center justify-between pt-2 border-t border-base-300">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="error"
              size="sm"
              isLoading={loadingAction === 'rejected'}
              onClick={() => handleAction('rejected')}
            >
              Reject
            </Button>
            <Button
              variant="success"
              size="sm"
              isLoading={loadingAction === 'approved'}
              onClick={() => handleAction('approved')}
            >
              Approve
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LeaveApprovalModal;
