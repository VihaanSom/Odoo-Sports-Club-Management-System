import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'motion/react';
import { FaCalendarCheck, FaPlus, FaArrowLeft } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { DatePicker } from '@/components/ui/DatePicker';
import { usePagination } from '@/hooks';
import { LeaveApprovalModal } from './components/LeaveApprovalModal';
import { staffService } from '@/services/staffService';
import type {
  LeaveRequest,
  StaffMember,
  CreateLeavePayload,
  ReviewLeavePayload,
} from '@/types/staff';

const leaveSchema = z.object({
  staffId: z.string().min(1, 'Select staff member'),
  startDate: z.string().min(1, 'Start date required'),
  endDate: z.string().min(1, 'End date required'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

type LeaveFormData = z.infer<typeof leaveSchema>;

export const LeavePage = () => {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedForReview, setSelectedForReview] = useState<LeaveRequest | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const {
    page,
    totalPages,
    startIndex,
    endIndex,
    paginateItems,
    setPage,
  } = usePagination({ totalItems: leaves.length, pageSize: 10 });
  const paginatedLeaves = paginateItems(leaves);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
    mode: 'onTouched',
    defaultValues: {
      staffId: '',
      startDate: '',
      endDate: '',
      reason: '',
    },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [leavesRes, staffRes] = await Promise.all([
        staffService.getLeaveRequests({
          status: statusFilter !== 'all' ? statusFilter : undefined,
        }),
        staffService.getStaffMembers(),
      ]);
      setLeaves(leavesRes);
      setStaffList(staffRes.data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load leave records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleReviewLeave = async (payload: ReviewLeavePayload) => {
    try {
      await staffService.reviewLeaveRequest(payload);
      toast.success(`Leave ${payload.status}`);
      loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Review action failed');
    }
  };

  const handleApplyLeave = async (data: LeaveFormData) => {
    try {
      const payload: CreateLeavePayload = {
        staffId: data.staffId,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
      };
      await staffService.submitLeaveRequest(payload);
      toast.success('Leave request submitted');
      setIsApplyModalOpen(false);
      reset();
      loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Submission failed');
    }
  };

  const pendingCount = leaves.filter((l) => l.status === 'pending').length;
  const approvedCount = leaves.filter((l) => l.status === 'approved').length;
  const rejectedCount = leaves.filter((l) => l.status === 'rejected').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button
              variant="ghost"
              size="xs"
              leftIcon={<FaArrowLeft />}
              onClick={() => navigate('/staff')}
            >
              Back
            </Button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <FaCalendarCheck className="size-7 text-primary" /> Staff Leave & Absence
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            Review time-off requests, sick leaves, and manage coverage for sports coaches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<FaPlus />}
            onClick={() => setIsApplyModalOpen(true)}
          >
            Apply Leave
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card bg-base-100 border border-base-300 p-4 shadow-xs">
          <div className="text-xs text-base-content/70 uppercase font-semibold">Total Requests</div>
          <div className="text-2xl font-black mt-1">{leaves.length}</div>
        </div>
        <div className="card bg-base-100 border border-base-300 p-4 shadow-xs">
          <div className="text-xs text-base-content/70 uppercase font-semibold">Pending Review</div>
          <div className="text-2xl font-black text-warning mt-1">{pendingCount}</div>
        </div>
        <div className="card bg-base-100 border border-base-300 p-4 shadow-xs">
          <div className="text-xs text-base-content/70 uppercase font-semibold">Approved</div>
          <div className="text-2xl font-black text-success mt-1">{approvedCount}</div>
        </div>
        <div className="card bg-base-100 border border-base-300 p-4 shadow-xs">
          <div className="text-xs text-base-content/70 uppercase font-semibold">Rejected</div>
          <div className="text-2xl font-black text-error mt-1">{rejectedCount}</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card bg-base-200/50 border border-base-300 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-base-content/70">Status Filter:</span>
            <div className="join">
              {['all', 'pending', 'approved', 'rejected'].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`join-item btn btn-xs capitalize ${
                    statusFilter === st ? 'btn-active btn-primary' : 'btn-ghost'
                  }`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leaves Table */}
      <div className="overflow-x-auto rounded-lg border border-base-300 bg-base-100 shadow-xs">
        <table className="table table-sm w-full">
          <thead className="bg-base-200/60 text-xs">
            <tr>
              <th>ID</th>
              <th>Staff Member</th>
              <th>Duration</th>
              <th>Days</th>
              <th>Reason</th>
              <th className="text-center">Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-base-content/60">
                  <span className="loading loading-spinner loading-md mr-2" />
                  Loading leave records...
                </td>
              </tr>
            ) : leaves.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-base-content/60">
                  No leave requests found.
                </td>
              </tr>
            ) : (
              paginatedLeaves.map((l) => (
                <tr key={l.id} className="hover:bg-base-200/40">
                  <td className="font-mono text-xs font-semibold">{l.id}</td>
                  <td>
                    <div className="font-semibold text-xs text-base-content">{l.staffName}</div>
                    <div className="text-[10px] text-base-content/60 font-medium capitalize">
                      {l.role === 'front_desk' ? 'Front Desk' : l.role}
                    </div>
                  </td>
                  <td className="text-xs whitespace-nowrap">
                    {l.startDate.split('-').reverse().join('-')} to {l.endDate.split('-').reverse().join('-')}
                  </td>
                  <td className="font-mono text-xs font-bold">{l.daysCount}</td>
                  <td className="text-xs text-base-content/80 max-w-xs truncate" title={l.reason}>
                    {l.reason}
                  </td>
                  <td className="text-center">
                    {l.status === 'pending' && (
                      <span className="badge badge-warning badge-sm font-semibold">Pending</span>
                    )}
                    {l.status === 'approved' && (
                      <span className="badge badge-success badge-sm font-semibold">Approved</span>
                    )}
                    {l.status === 'rejected' && (
                      <span className="badge badge-error badge-sm font-semibold">Rejected</span>
                    )}
                  </td>
                  <td className="text-right">
                    {l.status === 'pending' ? (
                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() => setSelectedForReview(l)}
                      >
                        Review
                      </Button>
                    ) : (
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => setSelectedForReview(l)}
                      >
                        Details
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-base-300 text-xs">
            <span className="text-base-content/60">
              Showing {startIndex + 1} to {endIndex} of {leaves.length} leaves
            </span>
            <div className="join">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="join-item btn btn-xs btn-outline"
              >
                «
              </button>
              <button
                type="button"
                className="join-item btn btn-xs btn-outline no-animation pointer-events-none font-mono"
              >
                {page} / {totalPages}
              </button>
              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="join-item btn btn-xs btn-outline"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <LeaveApprovalModal
        isOpen={Boolean(selectedForReview)}
        onClose={() => setSelectedForReview(null)}
        leave={selectedForReview}
        onReview={handleReviewLeave}
      />

      {/* Request Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Submit Leave Request"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(handleApplyLeave)} className="space-y-4 text-sm">
          <div>
            <label className="label">
              <span className="label-text font-medium text-xs">Staff Member *</span>
            </label>
            <select
              className={`select select-bordered w-full select-sm ${errors.staffId ? 'select-error' : ''}`}
              {...register('staffId')}
            >
              <option value="">Select staff...</option>
              {staffList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role === 'front_desk' ? 'Front Desk' : m.role})
                </option>
              ))}
            </select>
            {errors.staffId && (
              <span className="text-xs text-error mt-1">{errors.staffId.message}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Start Date"
                    required
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select start date"
                    error={errors.startDate?.message}
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="End Date"
                    required
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select end date"
                    error={errors.endDate?.message}
                  />
                )}
              />
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium text-xs">Reason for Leave *</span>
            </label>
            <textarea
              rows={3}
              placeholder="State reason and coverage arrangements..."
              className={`textarea textarea-bordered w-full text-xs ${errors.reason ? 'textarea-error' : ''}`}
              {...register('reason')}
            />
            {errors.reason && (
              <span className="text-xs text-error mt-1">{errors.reason.message}</span>
            )}
          </div>

          <div className="modal-action flex justify-end gap-2 pt-2 border-t border-base-300">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsApplyModalOpen(false)}
            >
              Back
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Submit
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default LeavePage;
