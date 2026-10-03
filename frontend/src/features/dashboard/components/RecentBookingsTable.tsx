import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaTableTennisPaddleBall,
  FaBaseballBatBall,
  FaCalendarDays,
  FaArrowUpRightFromSquare,
  FaUsers,
  FaUser,
} from 'react-icons/fa6';
import { bookingService } from '@/services/bookingService';
import type { BookingDetail } from '@/types/bookings';

export const RecentBookingsTable = () => {
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchRecent = async () => {
      try {
        const res = await bookingService.getBookings();
        if (isMounted && res.data) {
          setBookings(res.data.slice(0, 6));
        }
      } catch {
        // Fallback handled inside bookingService
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRecent();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatSlot = (startStr: string, endStr: string) => {
    try {
      const s = new Date(startStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const e = new Date(endStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${s} – ${e}`;
    } catch {
      return `${startStr} – ${endStr}`;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <span className="badge badge-success badge-xs font-semibold">Confirmed</span>;
      case 'in_progress':
      case 'in progress':
        return <span className="badge badge-warning badge-xs font-semibold">In Progress</span>;
      case 'cancelled':
        return <span className="badge badge-error badge-xs font-semibold">Cancelled</span>;
      default:
        return <span className="badge badge-info badge-xs font-semibold capitalize">{status}</span>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'member':
        return (
          <span className="badge badge-outline badge-primary badge-xs font-medium gap-1">
            <FaUser className="size-2" /> Member
          </span>
        );
      case 'social':
        return (
          <span className="badge badge-outline badge-secondary badge-xs font-medium gap-1">
            <FaUsers className="size-2" /> Social
          </span>
        );
      default:
        return (
          <span className="badge badge-outline badge-neutral badge-xs font-medium">
            Walk-in
          </span>
        );
    }
  };

  return (
    <div className="card bg-base-200/50 border border-base-300 shadow-xs">
      <div className="card-body p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-base-300">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <FaCalendarDays className="size-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">Recent & Today's Reservations</h2>
              <p className="text-xs text-base-content/60">Court bookings across the club</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/bookings/new" className="btn btn-primary btn-xs sm:btn-sm gap-1">
              New Booking
            </Link>
            <Link to="/bookings" className="btn btn-ghost btn-xs sm:btn-sm text-primary gap-1">
              <span>View All</span>
              <FaArrowUpRightFromSquare className="size-3" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-base-300/50 animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8 text-base-content/60 text-xs">
            No recent bookings found.
          </div>
        ) : (
          <div className="overflow-x-auto mt-3">
            <table className="table table-zebra table-sm w-full text-xs">
              <thead>
                <tr className="border-base-300 text-base-content/70">
                  <th>ID</th>
                  <th>Player / Member</th>
                  <th>Facility / Court</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-base-300/40">
                    <td className="font-mono font-bold text-primary">
                      #BK-{b.id}
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-semibold text-base-content">
                          {b.memberName || b.guestName || 'Guest Player'}
                        </span>
                        <div className="mt-0.5">{getTypeBadge(b.bookingType)}</div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 font-medium">
                        {b.sport === 'tennis' ? (
                          <FaTableTennisPaddleBall className="size-3.5 text-amber-500 shrink-0" />
                        ) : (
                          <FaBaseballBatBall className="size-3.5 text-blue-500 shrink-0" />
                        )}
                        <span className="truncate max-w-[160px]">{b.courtName}</span>
                      </div>
                    </td>
                    <td className="text-base-content/80 whitespace-nowrap">
                      {formatSlot(b.slotStart, b.slotEnd)}
                    </td>
                    <td>{getStatusBadge(b.status)}</td>
                    <td className="text-right">
                      <Link
                        to={`/bookings/${b.id}`}
                        className="btn btn-ghost btn-xs text-primary font-semibold hover:bg-primary/10"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentBookingsTable;
