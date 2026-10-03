import {  useState, useEffect, useCallback  } from 'react';
import { motion } from 'motion/react';
import {
  FaCalendarCheck,
  FaCalendarDays,
  FaPlus,
  FaGear,
  FaChevronDown,
} from 'react-icons/fa6';
import { Link, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { isMemberRole, canManageBookings } from '@/lib/permissions';
import { bookingService } from '@/services/bookingService';
import { courtService } from '@/services/courtService';
import type { BookingDetail, BookingType } from '@/types/bookings';
import type { Court } from '@/types/courts';
import { BookingsTable, BookingCancelModal } from './components';

export const BookingsPage = () => {
  const user = useAuthStore((s) => s.user);

  // Normal members should not see the global list of bookings; redirect to availability grid
  if (isMemberRole(user?.role)) {
    return <Navigate to="/bookings/calendar" replace />;
  }

  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCourtId, setSelectedCourtId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchMember, setSearchMember] = useState<string>('');

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Cancel modal state
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bookingsRes, courtsRes] = await Promise.all([
        bookingService.getBookings({
          courtId: selectedCourtId ? Number(selectedCourtId) : undefined,
          status: (selectedStatus as 'confirmed' | 'cancelled') || undefined,
          bookingType: (selectedType as BookingType) || undefined,
        }),
        courtService.getCourts(),
      ]);

      let result = bookingsRes.data;
      if (searchMember.trim()) {
        const q = searchMember.toLowerCase();
        result = result.filter(
          (b) =>
            (b.memberName && b.memberName.toLowerCase().includes(q)) ||
            (b.guestName && b.guestName.toLowerCase().includes(q))
        );
      }

      setBookings(result);
      setCourts(courtsRes);
      setPage(1); // Reset page on filter change
    } catch {
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  }, [selectedCourtId, selectedStatus, selectedType, searchMember]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleConfirmCancel = async (reason: string) => {
    if (!cancellingId) return;
    try {
      await bookingService.cancelBooking(cancellingId, { reason });
      toast.success('Reservation cancelled');
      setCancellingId(null);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to cancel reservation';
      toast.error(msg);
    }
  };

  const totalPages = Math.max(1, Math.ceil(bookings.length / pageSize));
  const paginatedBookings = bookings.slice((page - 1) * pageSize, page * pageSize);
  const selectedCourt = courts.find((c) => String(c.id) === selectedCourtId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <FaCalendarCheck className="size-7 text-primary" /> Court Bookings & Reservations
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            Real-time reservation ledger, schedule calendar, and court dispatch.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* DaisyUI Tooltip */}
          {canManageBookings(user?.role) && (
            <div className="tooltip tooltip-bottom" data-tip="Manage Courts & Schedules">
              <Link
                to="/facilities/manage"
                className="btn btn-ghost btn-sm gap-1.5 text-base-content/70"
              >
                <FaGear className="size-3.5" /> Manage Courts
              </Link>
            </div>
          )}

          <Link to="/bookings/calendar" className="btn btn-outline btn-sm gap-2">
            <FaCalendarDays className="size-3.5" /> Schedule Grid
          </Link>
          <Link to="/bookings/new" className="btn btn-primary btn-sm gap-2">
            <FaPlus className="size-3.5" /> Book Court
          </Link>
        </div>
      </div>

      {/* Filter Toolbar using DaisyUI Dropdown Components */}
      <div className="card bg-base-100 border border-base-300 shadow-sm p-4 rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="form-control">
            <input
              type="text"
              placeholder="Search member or guest name..."
              className="input input-bordered input-sm w-full text-xs"
              value={searchMember}
              onChange={(e) => setSearchMember(e.target.value)}
            />
          </div>

          {/* Court DaisyUI Dropdown */}
          <div className="dropdown w-full">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-outline btn-sm w-full justify-between text-xs font-normal bg-base-100"
            >
              <span className="truncate">{selectedCourt ? selectedCourt.name : 'All Courts'}</span>
              <FaChevronDown className="size-2.5 opacity-60 shrink-0 ml-1" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-30 w-full p-2 shadow-xl border border-base-300 text-xs max-h-56 overflow-y-auto"
            >
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedCourtId('')}
                  className={!selectedCourtId ? 'active font-bold' : ''}
                >
                  All Courts
                </button>
              </li>
              {courts.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedCourtId(String(c.id))}
                    className={selectedCourtId === String(c.id) ? 'active font-bold' : ''}
                  >
                    {c.name} ({c.sport})
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Booking Type DaisyUI Dropdown */}
          <div className="dropdown w-full">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-outline btn-sm w-full justify-between text-xs font-normal bg-base-100"
            >
              <span>
                {selectedType === 'walk_in'
                  ? 'WALK IN'
                  : selectedType === 'member'
                  ? 'MEMBER'
                  : selectedType === 'social'
                  ? 'SOCIAL'
                  : 'All Booking Types'}
              </span>
              <FaChevronDown className="size-2.5 opacity-60 shrink-0 ml-1" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-30 w-full p-2 shadow-xl border border-base-300 text-xs"
            >
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedType('')}
                  className={!selectedType ? 'active font-bold' : ''}
                >
                  All Booking Types
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedType('member')}
                  className={selectedType === 'member' ? 'active font-bold' : ''}
                >
                  MEMBER
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedType('walk_in')}
                  className={selectedType === 'walk_in' ? 'active font-bold' : ''}
                >
                  WALK IN
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedType('social')}
                  className={selectedType === 'social' ? 'active font-bold' : ''}
                >
                  SOCIAL
                </button>
              </li>
            </ul>
          </div>

          {/* Status DaisyUI Dropdown */}
          <div className="dropdown w-full">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-outline btn-sm w-full justify-between text-xs font-normal bg-base-100"
            >
              <span className="capitalize">{selectedStatus ? selectedStatus : 'All Statuses'}</span>
              <FaChevronDown className="size-2.5 opacity-60 shrink-0 ml-1" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-30 w-full p-2 shadow-xl border border-base-300 text-xs"
            >
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('')}
                  className={!selectedStatus ? 'active font-bold' : ''}
                >
                  All Statuses
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('confirmed')}
                  className={selectedStatus === 'confirmed' ? 'active font-bold' : ''}
                >
                  Confirmed
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('cancelled')}
                  className={selectedStatus === 'cancelled' ? 'active font-bold' : ''}
                >
                  Cancelled
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          <BookingsTable
            bookings={paginatedBookings}
            onCancel={(id) => setCancellingId(id)}
          />

          {/* DaisyUI Pagination Controls */}
          {bookings.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
              <span className="text-xs text-base-content/60">
                Showing {(page - 1) * pageSize + 1} to{' '}
                {Math.min(page * pageSize, bookings.length)} of {bookings.length} reservations
              </span>

              <div className="join">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="join-item btn btn-sm btn-outline"
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="join-item btn btn-sm btn-outline no-animation pointer-events-none font-mono"
                >
                  {page} / {totalPages}
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="join-item btn btn-sm btn-outline"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {cancellingId && (
        <BookingCancelModal
          isOpen={Boolean(cancellingId)}
          bookingId={cancellingId}
          onClose={() => setCancellingId(null)}
          onConfirm={handleConfirmCancel}
        />
      )}
    </motion.div>
  );
};

export default BookingsPage;
