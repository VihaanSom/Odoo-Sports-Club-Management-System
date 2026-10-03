import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { FaArrowLeft, FaPen, FaClock, FaCalendarDay } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { staffService } from '@/services/staffService';
import { StaffFormModal } from './components/StaffFormModal';
import type { StaffMember, Shift, LeaveRequest, CreateStaffPayload } from '@/types/staff';

export const StaffDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [staffData, shiftsData, leavesData] = await Promise.all([
        staffService.getStaffById(id),
        staffService.getShifts({ staffId: id }),
        staffService.getLeaveRequests({ staffId: id }),
      ]);
      setStaff(staffData);
      setShifts(shiftsData);
      setLeaves(leavesData);
    } catch {
      toast.error('Failed to load staff details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleUpdate = async (payload: CreateStaffPayload) => {
    if (!id) return;
    try {
      await staffService.updateStaff(id, payload);
      toast.success('Staff profile updated');
      loadData();
    } catch {
      toast.error('Update failed');
    }
  };

  const handleClock = async (shiftId: string, action: 'clock_in' | 'clock_out') => {
    try {
      await staffService.clockInOut({ shiftId, action });
      toast.success(action === 'clock_in' ? 'Clock In recorded' : 'Clock Out recorded');
      loadData();
    } catch {
      toast.error('Clock action failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-base-content/60">
        <span className="loading loading-spinner loading-lg mr-2" />
        Loading staff profile...
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="card bg-base-100 p-8 text-center border border-base-300">
        <h2 className="text-xl font-bold">Staff Member Not Found</h2>
        <div className="mt-4">
          <Button variant="neutral" size="sm" onClick={() => navigate('/staff')}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<FaArrowLeft />}
          onClick={() => navigate('/staff')}
        >
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<FaPen />}
            onClick={() => setIsEditOpen(true)}
          >
            Edit
          </Button>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card bg-base-100 border border-base-300 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-4">
            <div className="avatar">
              <div className="size-16 rounded-full ring-2 ring-primary">
                <img
                  src={staff.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
                  alt={staff.name}
                />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black">{staff.name}</h2>
              <div className="text-xs text-base-content/60 font-mono">{staff.id}</div>
              <div className="mt-1 flex gap-2">
                <span className="badge badge-primary badge-sm font-semibold capitalize">
                  {staff.role === 'front_desk' ? 'Front Desk' : staff.role}
                </span>
                <span className={`badge badge-sm font-semibold ${staff.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                  {staff.status}
                </span>
              </div>
            </div>
          </div>

          <div className="divider my-1" />

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-base-content/70">Hourly Rate:</span>
              <span className="font-mono font-bold text-sm text-primary">
                ₹{Math.round(staff.hourlyRatePaise / 100).toLocaleString('en-IN')}/hr
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-base-content/70">Joined Date:</span>
              <span>{staff.joinedDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-base-content/70">Email:</span>
              <span>{staff.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-base-content/70">Phone:</span>
              <span className="font-mono">{staff.phone}</span>
            </div>
          </div>

          {staff.notes && (
            <div className="p-3 bg-base-200/50 rounded-lg border border-base-300 text-xs">
              <span className="font-bold text-base-content/80 block mb-1">Internal Notes:</span>
              <p className="text-base-content/70">{staff.notes}</p>
            </div>
          )}
        </div>

        {/* Shifts & Leave Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shifts Section */}
          <div className="card bg-base-100 border border-base-300 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <FaClock className="text-primary" /> Shift Roster History
              </h3>
              <span className="text-xs text-base-content/60 font-mono">{shifts.length} shifts</span>
            </div>

            {shifts.length === 0 ? (
              <div className="text-center py-6 text-xs text-base-content/60">
                No shifts assigned to this staff member yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-xs w-full">
                  <thead>
                    <tr>
                      <th>Shift ID</th>
                      <th>Date</th>
                      <th>Schedule</th>
                      <th>Clock Times</th>
                      <th>Status</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.map((s) => (
                      <tr key={s.id}>
                        <td className="font-mono text-[11px] font-semibold">{s.id}</td>
                        <td className="text-xs">{s.date}</td>
                        <td className="font-mono text-xs">{s.startTime} - {s.endTime}</td>
                        <td className="text-[11px] font-mono text-base-content/70">
                          {s.clockInTime ? `In: ${s.clockInTime}` : '—'}
                          {s.clockOutTime ? ` | Out: ${s.clockOutTime}` : ''}
                        </td>
                        <td>
                          <span
                            className={`badge badge-xs font-semibold ${
                              s.status === 'completed'
                                ? 'badge-neutral'
                                : s.status === 'in_progress'
                                ? 'badge-success'
                                : 'badge-primary badge-outline'
                            }`}
                          >
                            {s.status === 'in_progress' ? 'Active' : s.status === 'completed' ? 'Completed' : s.status}
                          </span>
                        </td>
                        <td className="text-right">
                          {s.status === 'scheduled' && (
                            <button
                              type="button"
                              className="btn btn-xs btn-success font-medium px-3 whitespace-nowrap min-w-[76px]"
                              onClick={() => handleClock(s.id, 'clock_in')}
                            >
                              Clock In
                            </button>
                          )}
                          {s.status === 'in_progress' && (
                            <button
                              type="button"
                              className="btn btn-xs btn-error font-medium px-3 whitespace-nowrap min-w-[76px]"
                              onClick={() => handleClock(s.id, 'clock_out')}
                            >
                              Clock Out
                            </button>
                          )}
                          {s.status === 'completed' && (
                            <span className="badge badge-neutral badge-xs font-semibold">Done</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Leave Records Section */}
          <div className="card bg-base-100 border border-base-300 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <FaCalendarDay className="text-primary" /> Leave Records
              </h3>
              <span className="text-xs text-base-content/60 font-mono">{leaves.length} records</span>
            </div>

            {leaves.length === 0 ? (
              <div className="text-center py-6 text-xs text-base-content/60">
                No leave records on file.
              </div>
            ) : (
              <div className="space-y-2">
                {leaves.map((l) => (
                  <div
                    key={l.id}
                    className="p-3 bg-base-200/40 rounded-lg border border-base-300 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        <span className="capitalize">{l.leaveType} Leave</span>
                        <span
                          className={`badge badge-xs ${
                            l.status === 'approved'
                              ? 'badge-success'
                              : l.status === 'rejected'
                              ? 'badge-error'
                              : 'badge-warning'
                          }`}
                        >
                          {l.status}
                        </span>
                      </div>
                      <div className="text-base-content/60 mt-0.5">
                        {l.startDate} to {l.endDate} ({l.daysCount} days)
                      </div>
                      <div className="text-base-content/80 mt-1 italic">"{l.reason}"</div>
                    </div>

                    {l.reviewedBy && (
                      <div className="text-right text-[11px] text-base-content/60">
                        <div>Reviewed by {l.reviewedBy}</div>
                        <div className="text-[10px] text-base-content/40">{l.reviewRemarks}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <StaffFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdate}
        initialData={staff}
      />
    </motion.div>
  );
};

export default StaffDetailPage;
