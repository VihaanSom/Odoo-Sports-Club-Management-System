import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FaUserTie, FaPlus, FaCalendarDays, FaCalendarCheck } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/shared/SearchBar';
import { StaffFormModal } from './components/StaffFormModal';
import { staffService } from '@/services/staffService';
import { useDebounce, usePagination } from '@/hooks';
import type { StaffMember, StaffRole, CreateStaffPayload } from '@/types/staff';

export const StaffListPage = () => {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<StaffMember | null>(null);

  const {
    page,
    totalPages,
    setPage,
    startIndex,
    endIndex,
    paginateItems,
  } = usePagination({ totalItems: staffList.length, pageSize: 10 });
  const paginatedStaff = paginateItems(staffList);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await staffService.getStaffMembers({
        search: debouncedSearch,
        role: roleFilter as StaffRole | 'all',
      });
      setStaffList(res.data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load staff list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
    setPage(1);
  }, [debouncedSearch, roleFilter]);

  const handleSaveStaff = async (payload: CreateStaffPayload) => {
    try {
      if (selectedStaffForEdit) {
        await staffService.updateStaff(selectedStaffForEdit.id, payload);
        toast.success('Staff member updated');
      } else {
        await staffService.createStaff(payload);
        toast.success('Staff member created');
      }
      setSelectedStaffForEdit(null);
      fetchStaff();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const activeCount = staffList.filter((s) => s.status === 'active').length;
  const onLeaveCount = staffList.filter((s) => s.status === 'on_leave').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Header & Quick Links */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <FaUserTie className="size-7 text-primary" /> Staff Management
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            Roster, coaches, trainers, shift attendance, and leave tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/staff/shifts">
            <Button variant="outline" size="sm" leftIcon={<FaCalendarDays />}>
              Shifts
            </Button>
          </Link>
          <Link to="/staff/leave">
            <Button variant="outline" size="sm" leftIcon={<FaCalendarCheck />}>
              Leaves
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<FaPlus />}
            onClick={() => {
              setSelectedStaffForEdit(null);
              setIsModalOpen(true);
            }}
          >
            Add Staff
          </Button>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card bg-base-100 border border-base-300 p-4 shadow-xs">
          <div className="text-xs text-base-content/70 uppercase font-semibold">Total Staff</div>
          <div className="text-2xl font-black mt-1">{staffList.length}</div>
        </div>
        <div className="card bg-base-100 border border-base-300 p-4 shadow-xs">
          <div className="text-xs text-base-content/70 uppercase font-semibold">Active</div>
          <div className="text-2xl font-black text-success mt-1">{activeCount}</div>
        </div>
        <div className="card bg-base-100 border border-base-300 p-4 shadow-xs">
          <div className="text-xs text-base-content/70 uppercase font-semibold">On Leave</div>
          <div className="text-2xl font-black text-warning mt-1">{onLeaveCount}</div>
        </div>
        <div className="card bg-base-100 border border-base-300 p-4 shadow-xs">
          <div className="text-xs text-base-content/70 uppercase font-semibold">Avg Rate</div>
          <div className="text-2xl font-black text-primary mt-1">
            ₹
            {staffList.length > 0
              ? Math.round(
                  staffList.reduce((acc, cur) => acc + cur.hourlyRatePaise, 0) /
                    staffList.length /
                    100
                )
              : 0}
            /h
          </div>
        </div>
      </div>

      {/* Filters and search */}
      <div className="card bg-base-200/50 border border-base-300 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, role, specialization..."
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              className="select select-bordered select-sm w-full sm:w-44 text-xs"
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

      {/* Staff Table */}
      <div className="overflow-x-auto rounded-lg border border-base-300 bg-base-100 shadow-xs">
        <table className="table table-sm w-full">
          <thead className="bg-base-200/60 text-xs">
            <tr>
              <th>Staff Member</th>
              <th>Role</th>
              <th>Contact Details</th>
              <th className="text-right">Rate (₹/hr)</th>
              <th className="text-center">Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-base-content/60">
                  <span className="loading loading-spinner loading-md mr-2" />
                  Loading staff...
                </td>
              </tr>
            ) : staffList.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-base-content/60">
                  No staff members found matching criteria.
                </td>
              </tr>
            ) : (
              paginatedStaff.map((s) => (
                <tr key={s.id} className="hover:bg-base-200/40">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="size-9 rounded-full ring-1 ring-base-300">
                          <img
                            src={s.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt={s.name}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-base-content">{s.name}</div>
                        <div className="text-[11px] text-base-content/50 font-mono">{s.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="badge badge-outline badge-sm font-semibold capitalize">
                      {s.role === 'front_desk' ? 'Front Desk' : s.role}
                    </div>
                  </td>
                  <td className="text-xs">
                    <div>{s.email}</div>
                    <div className="text-base-content/60 font-mono text-[11px]">{s.phone}</div>
                  </td>
                  <td className="text-right font-mono font-semibold text-xs">
                    ₹{Math.round(s.hourlyRatePaise / 100).toLocaleString('en-IN')}
                  </td>
                  <td className="text-center">
                    {s.status === 'active' && (
                      <span className="badge badge-success badge-xs font-semibold">Active</span>
                    )}
                    {s.status === 'on_leave' && (
                      <span className="badge badge-warning badge-xs font-semibold">On Leave</span>
                    )}
                    {s.status === 'inactive' && (
                      <span className="badge badge-neutral badge-xs">Inactive</span>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => navigate(`/staff/${s.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          setSelectedStaffForEdit(s);
                          setIsModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-base-300">
            <span className="text-xs text-base-content/60">
              Showing {startIndex}–{endIndex} of {staffList.length} staff members
            </span>
            <div className="join">
              <button
                className="join-item btn btn-xs"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                «
              </button>
              <button className="join-item btn btn-xs btn-active">
                Page {page} of {totalPages}
              </button>
              <button
                className="join-item btn btn-xs"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      <StaffFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStaffForEdit(null);
        }}
        onSubmit={handleSaveStaff}
        initialData={selectedStaffForEdit}
      />
    </motion.div>
  );
};

export default StaffListPage;
