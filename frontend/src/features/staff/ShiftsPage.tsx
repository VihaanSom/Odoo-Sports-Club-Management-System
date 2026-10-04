import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'motion/react';
import { FaClock, FaPlus, FaArrowLeft } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { DatePicker } from '@/components/ui/DatePicker';
import { usePagination } from '@/hooks';
import { staffService } from '@/services/staffService';
import type { Shift, StaffMember, AssignShiftPayload } from '@/types/staff';

const shiftSchema = z.object({
  staffId: z.string().min(1, 'Select staff member'),
  date: z.string().min(1, 'Select date'),
  startTime: z.string().min(1, 'Start time required'),
  endTime: z.string().min(1, 'End time required'),
  notes: z.string().optional(),
});

type ShiftFormData = z.infer<typeof shiftSchema>;

const cleanShiftNotes = (notes?: string) => {
  if (!notes) return '—';
  const cleaned = notes
    .replace(/\[?\bClocked (?:In|Out)\b\]?/gi, '')
    .replace(/\|\s*\|/g, '|')
    .trim()
    .replace(/^\|\s*|\s*\|$/g, '')
    .trim();
  return cleaned || '—';
};

export const ShiftsPage = () => {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const {
    page,
    totalPages,
    startIndex,
    endIndex,
    paginateItems,
    setPage,
  } = usePagination({ totalItems: shifts.length, pageSize: 10 });
  const paginatedShifts = paginateItems(shifts);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShiftFormData>({
    resolver: zodResolver(shiftSchema),
    mode: 'onTouched',
    defaultValues: {
      staffId: '',
      date: todayStr,
      startTime: '08:00',
      endTime: '16:00',
      notes: '',
    },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [shiftsRes, staffRes] = await Promise.all([
        staffService.getShifts({
          date: selectedDate || undefined,
          role: roleFilter !== 'all' ? roleFilter : undefined,
        }),
        staffService.getStaffMembers(),
      ]);
      setShifts(shiftsRes);
      setStaffList(staffRes.data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load shifts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate, roleFilter]);

  const handleClockAction = async (shiftId: string, action: 'clock_in' | 'clock_out') => {
    try {
      await staffService.clockInOut({ shiftId, action });
      toast.success(action === 'clock_in' ? 'Clock In recorded' : 'Clock Out recorded');
      loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Clock action failed');
    }
  };

  const handleAssignShift = async (data: ShiftFormData) => {
    try {
      const payload: AssignShiftPayload = {
        staffId: data.staffId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes?.trim() || '',
      };
      await staffService.assignShift(payload);
      toast.success('Shift assigned');
      setIsAssignModalOpen(false);
      reset({
        staffId: '',
        date: todayStr,
        startTime: '08:00',
        endTime: '16:00',
        notes: '',
      });
      loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Shift assignment failed');
    }
  };

  const scheduledCount = shifts.filter((s) => s.status === 'scheduled').length;
  const inProgressCount = shifts.filter((s) => s.status === 'in_progress').length;
  const completedCount = shifts.filter((s) => s.status === 'completed').length;

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
            <FaClock className="size-7 text-primary" /> Shift Roster & Attendance
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            Monitor daily coach rosters, staff schedules, and real-time clock in/out status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<FaPlus />}
            onClick={() => setIsAssignModalOpen(true)}
          >
            Assign Shift
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card bg-base-100 border border-base-300 p-4 shadow-xs">
          <div className="text-xs text-base-content/70 uppercase font-semibold">Total Shifts</div>
          <div className="text-2xl font-black mt-1">{shifts.length}</div>
        </div>
        <div className="card bg-base-100 border border-base-300 p-4 shadow-xs">
          <div className="text-xs text-base-content/70 uppercase font-semibold">Clocked In Now</div>
          <div className="text-2xl font-black text-success mt-1">{inProgressCount}</div>
        </div>
        <div className="card bg-base-100 border border-base-300 p-4 shadow-xs">
          <div className="text-xs text-base-content/70 uppercase font-semibold">Scheduled</div>
          <div className="text-2xl font-black text-primary mt-1">{scheduledCount}</div>
        </div>
        <div className="card bg-base-100 border border-base-300 p-4 shadow-xs">
          <div className="text-xs text-base-content/70 uppercase font-semibold">Completed</div>
          <div className="text-2xl font-black text-neutral mt-1">{completedCount}</div>
        </div>
      </div>

      {/* Controls & Date Filter */}
      <div className="card bg-base-200/50 border border-base-300 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-48">
              <DatePicker
                value={selectedDate}
                onChange={(val) => setSelectedDate(val)}
                placeholder="Filter by date..."
              />
            </div>
            {selectedDate && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setSelectedDate('')}
              >
                Clear
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              className="select select-bordered select-sm text-xs w-full sm:w-44"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="front_desk">Front Desk</option>
              <option value="bar">Bar</option>
              <option value="shop">Shop</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shifts Table */}
      <div className="overflow-x-auto rounded-lg border border-base-300 bg-base-100 shadow-xs">
        <table className="table table-sm w-full">
          <thead className="bg-base-200/60 text-xs">
            <tr>
              <th>Shift ID</th>
              <th>Staff Member</th>
              <th>Role</th>
              <th>Date</th>
              <th>Time</th>
              <th>Clock Times</th>
              <th>Notes</th>
              <th className="text-center">Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-base-content/60">
                  <span className="loading loading-spinner loading-md mr-2" />
                  Loading shift roster...
                </td>
              </tr>
            ) : shifts.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-base-content/60">
                  No shifts scheduled for selected criteria.
                </td>
              </tr>
            ) : (
              paginatedShifts.map((s) => (
                <tr key={s.id} className="hover:bg-base-200/40">
                  <td className="font-mono text-xs font-semibold">{s.id}</td>
                  <td>
                    <div className="font-semibold text-xs text-base-content">{s.staffName}</div>
                    <div className="text-[10px] text-base-content/50 font-mono">{s.staffId}</div>
                  </td>
                  <td>
                    <span className="badge badge-outline badge-xs font-semibold whitespace-nowrap">
                      {s.role === 'front_desk' ? 'Front Desk' : s.role.charAt(0).toUpperCase() + s.role.slice(1)}
                    </span>
                  </td>
                  <td className="text-xs whitespace-nowrap">{s.date}</td>
                  <td className="font-mono text-xs whitespace-nowrap font-medium">
                    {s.startTime} - {s.endTime}
                  </td>
                  <td className="font-mono text-xs whitespace-nowrap">
                    {s.clockInTime ? (
                      <span className="text-success font-semibold">In: {s.clockInTime}</span>
                    ) : (
                      <span className="text-base-content/40">—</span>
                    )}
                    {s.clockOutTime ? (
                      <span className="text-base-content/70"> | Out: {s.clockOutTime}</span>
                    ) : null}
                  </td>
                  <td className="text-xs text-base-content/70 max-w-xs truncate" title={cleanShiftNotes(s.notes)}>
                    {cleanShiftNotes(s.notes)}
                  </td>
                  <td className="text-center">
                    {s.status === 'in_progress' && (
                      <span className="badge badge-success badge-sm font-semibold animate-pulse">
                        Active
                      </span>
                    )}
                    {s.status === 'scheduled' && (
                      <span className="badge badge-primary badge-outline badge-sm font-semibold">
                        Scheduled
                      </span>
                    )}
                    {s.status === 'completed' && (
                      <span className="badge badge-neutral badge-sm font-semibold">
                        Completed
                      </span>
                    )}
                    {s.status === 'cancelled' && (
                      <span className="badge badge-error badge-sm font-semibold">
                        Cancelled
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    {s.status === 'scheduled' && (
                      <button
                        type="button"
                        className="btn btn-xs btn-success font-medium px-3 whitespace-nowrap min-w-[76px]"
                        onClick={() => handleClockAction(s.id, 'clock_in')}
                      >
                        Clock In
                      </button>
                    )}
                    {s.status === 'in_progress' && (
                      <button
                        type="button"
                        className="btn btn-xs btn-error font-medium px-3 whitespace-nowrap min-w-[76px]"
                        onClick={() => handleClockAction(s.id, 'clock_out')}
                      >
                        Clock Out
                      </button>
                    )}
                    {s.status === 'completed' && (
                      <span className="btn btn-xs btn-ghost border border-base-300 text-base-content/60 font-medium px-3 whitespace-nowrap min-w-[76px] pointer-events-none select-none">
                        Done
                      </span>
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
              Showing {startIndex + 1} to {endIndex} of {shifts.length} shifts
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

      {/* Assign Shift Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Staff Shift"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(handleAssignShift)} className="space-y-4 text-sm">
          <div>
            <label className="label">
              <span className="label-text font-medium text-xs">Staff Member *</span>
            </label>
            <select
              className={`select select-bordered w-full select-sm ${errors.staffId ? 'select-error' : ''}`}
              {...register('staffId')}
            >
              <option value="">Select staff member...</option>
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

          <div>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Shift Date"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select shift date"
                  error={errors.date?.message}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">
                <span className="label-text font-medium text-xs">Start Time *</span>
              </label>
              <input
                type="time"
                className={`input input-bordered w-full input-sm ${errors.startTime ? 'input-error' : ''}`}
                {...register('startTime')}
              />
              {errors.startTime && (
                <span className="text-xs text-error mt-1">{errors.startTime.message}</span>
              )}
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium text-xs">End Time *</span>
              </label>
              <input
                type="time"
                className={`input input-bordered w-full input-sm ${errors.endTime ? 'input-error' : ''}`}
                {...register('endTime')}
              />
              {errors.endTime && (
                <span className="text-xs text-error mt-1">{errors.endTime.message}</span>
              )}
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium text-xs">Shift Notes</span>
            </label>
            <textarea
              rows={2}
              placeholder="Instructions or duties..."
              className="textarea textarea-bordered w-full text-xs"
              {...register('notes')}
            />
          </div>

          <div className="modal-action flex justify-end gap-2 pt-2 border-t border-base-300">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAssignModalOpen(false)}
            >
              Back
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default ShiftsPage;
