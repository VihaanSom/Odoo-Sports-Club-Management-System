import {  useEffect, useState  } from 'react';
import { FaClock, FaUser, FaCircleCheck, FaBan, FaCalendarDay } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { bookingService } from '@/services/bookingService';
import { formatDate, formatSlotRange } from '@/lib/utils';
import type { TodaysBookingsResponse } from '@/types/bookings';

export const TodaysBookingsView = () => {
  const [data, setData] = useState<TodaysBookingsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await bookingService.getTodayBookings();
        setData(res);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="card bg-base-100 border border-base-300 p-6 shadow-sm flex items-center justify-center">
        <span className="loading loading-spinner loading-md text-primary" />
      </div>
    );
  }

  if (!data || data.courts.length === 0) {
    return (
      <div className="card bg-base-100 border border-base-300 p-6 text-center text-sm text-base-content/60">
        No court reservations scheduled for today.
      </div>
    );
  }

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-base-300 pb-3">
        <div className="flex items-center gap-2">
          <FaCalendarDay className="size-4 text-primary" />
          <h2 className="font-bold text-base text-base-content">Today's Court Lineup</h2>
        </div>
        <span className="text-xs font-mono font-semibold text-base-content/60">
          {formatDate(data.date)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.courts.map((court) => (
          <div
            key={court.courtId}
            className="border border-base-300 rounded-xl bg-base-200/30 p-3.5 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-base-content">{court.courtName}</span>
              <span className="badge badge-xs badge-outline uppercase text-[10px]">
                {court.sport}
              </span>
            </div>

            {court.bookings.length === 0 ? (
              <p className="text-xs text-base-content/50 italic py-2">No bookings today</p>
            ) : (
              <div className="space-y-1.5">
                {court.bookings.map((b) => {
                  const isCancelled = b.status === 'cancelled';
                  const bookingTypeLabel = b.bookingType === 'walk_in' ? 'WALK IN' : b.bookingType.replace('_', ' ').toUpperCase();

                  return (
                    <Link
                      key={b.id}
                      to={`/bookings/${b.id}`}
                      className="flex items-center justify-between p-2 rounded-lg bg-base-100 border border-base-300/80 hover:border-primary transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <FaClock className="size-3 text-base-content/40" />
                        <span className="font-mono font-bold">
                          {formatSlotRange(b.slotStart, b.slotEnd)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-base-content/80 truncate max-w-[110px]">
                          <FaUser className="size-2.5 text-base-content/40" />
                          {b.memberName || 'Guest'}
                        </span>
                        <div
                          className="tooltip tooltip-left"
                          data-tip={isCancelled ? 'Cancelled' : `Confirmed (${bookingTypeLabel})`}
                        >
                          {isCancelled ? (
                            <FaBan className="size-3 text-error shrink-0" />
                          ) : (
                            <FaCircleCheck className="size-3 text-success shrink-0" />
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
