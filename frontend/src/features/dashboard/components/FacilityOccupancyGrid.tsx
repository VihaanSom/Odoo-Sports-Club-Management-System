import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaClock,
  FaCheck,
  FaTableTennisPaddleBall,
  FaBaseballBatBall,
  FaCalendarPlus,
  FaWrench,
  FaCircleDot,
} from 'react-icons/fa6';
import { courtService } from '@/services/courtService';
import { bookingService } from '@/services/bookingService';
import type { Court } from '@/types/courts';
import type { TodaysBookingsResponse } from '@/types/bookings';
import { Skeleton } from '@/components/ui';

export const FacilityOccupancyGrid = () => {
  const [selectedSportTab, setSelectedSportTab] = useState<'All' | 'Tennis' | 'Cricket'>('All');
  const [courts, setCourts] = useState<Court[]>([]);
  const [todaysBookings, setTodaysBookings] = useState<TodaysBookingsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadCourtData = async () => {
      try {
        const [courtsRes, todayRes] = await Promise.all([
          courtService.getCourts(),
          bookingService.getTodayBookings(),
        ]);
        if (isMounted) {
          setCourts(courtsRes);
          setTodaysBookings(todayRes);
        }
      } catch {
        // Fallbacks handled inside service
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCourtData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCourts = courts.filter((court) => {
    if (selectedSportTab === 'All') return true;
    return court.sport.toLowerCase() === selectedSportTab.toLowerCase();
  });

  const getCourtSchedule = (courtId: number) => {
    return todaysBookings?.courts.find((c) => c.courtId === courtId);
  };

  const formatSlotTime = (slotStart: string, slotEnd: string) => {
    try {
      const s = new Date(slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const e = new Date(slotEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${s} - ${e}`;
    } catch {
      return 'Today';
    }
  };

  return (
    <div className="card bg-base-100 border border-base-200/80 shadow-xs rounded-2xl">
      <div className="card-body p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-base-200">
          <div>
            <h2 className="text-base font-bold tracking-tight text-base-content">Facility Occupancy</h2>
            <p className="text-xs text-base-content/60 mt-0.5">
              Court availability, surface condition, and today's reservations
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-base-200/80 p-0.5 text-xs font-medium self-start sm:self-auto">
            {(['All', 'Tennis', 'Cricket'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedSportTab(tab)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedSportTab === tab
                    ? 'bg-base-100 text-base-content font-semibold shadow-xs'
                    : 'text-base-content/70 hover:text-base-content'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-base-200/80 bg-base-100/50 flex flex-col justify-between gap-3 min-w-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <Skeleton variant="rectangular" height="36px" width="36px" className="rounded-lg shrink-0" />
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <Skeleton variant="text" height="14px" width="60%" />
                      <Skeleton variant="text" height="11px" width="40%" />
                    </div>
                  </div>
                  <Skeleton variant="rectangular" height="20px" width="64px" className="rounded-full shrink-0" />
                </div>
                <div className="flex items-center justify-between pt-2.5 border-t border-base-200/60 mt-1">
                  <Skeleton variant="text" height="12px" width="110px" />
                  <Skeleton variant="rectangular" height="24px" width="68px" className="rounded-lg shrink-0" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
            {filteredCourts.map((court) => {
              const schedule = getCourtSchedule(court.id);
              const activeBooking = schedule?.bookings?.[0];
              const isOccupied = Boolean(activeBooking && court.isActive);

              return (
                <div
                  key={court.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between min-w-0 ${
                    !court.isActive
                      ? 'bg-base-200/30 border-base-300/60 opacity-75'
                      : isOccupied
                      ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                      : 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`size-9 rounded-lg shrink-0 flex items-center justify-center font-bold text-sm ${
                          court.sport === 'tennis'
                            ? 'bg-amber-500/15 text-amber-600'
                            : 'bg-blue-500/15 text-blue-600'
                        }`}
                      >
                        {court.sport === 'tennis' ? (
                          <FaTableTennisPaddleBall className="size-4" />
                        ) : (
                          <FaBaseballBatBall className="size-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs sm:text-sm tracking-tight text-base-content truncate">
                          {court.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-base-content/60 truncate">
                          <span className="capitalize font-semibold">{court.sport}</span>
                          <span>•</span>
                          <span>{court.openTime} - {court.closeTime}</span>
                        </div>
                      </div>
                    </div>

                    {!court.isActive ? (
                      <span className="badge badge-neutral badge-xs font-semibold shrink-0 gap-1">
                        <FaWrench className="size-2.5" /> Maintenance
                      </span>
                    ) : isOccupied ? (
                      <span className="badge badge-warning badge-xs font-bold shrink-0 gap-1">
                        <FaCircleDot className="size-2 text-warning animate-ping" /> In Play
                      </span>
                    ) : (
                      <span className="badge badge-success badge-xs font-bold shrink-0 gap-1">
                        <FaCheck className="size-2.5" /> Open
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-base-200/80 flex items-center justify-between text-xs min-w-0">
                    {isOccupied && activeBooking ? (
                      <div className="flex items-center gap-1 text-[11px] text-amber-700 font-medium truncate flex-1 min-w-0 mr-2">
                        <FaClock className="size-2.5 shrink-0" />
                        <span className="truncate">
                          {formatSlotTime(activeBooking.slotStart, activeBooking.slotEnd)} ({activeBooking.memberName})
                        </span>
                      </div>
                    ) : !court.isActive ? (
                      <span className="text-[11px] text-base-content/50">Pitch resurfacing</span>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <FaCheck className="size-2.5 shrink-0" /> Available right now
                      </span>
                    )}

                    {court.isActive && (
                      <Link
                        to={`/bookings/new?courtId=${court.id}`}
                        className="btn btn-ghost btn-xs text-primary gap-1 font-semibold hover:bg-primary/10 shrink-0 ml-auto"
                      >
                        <FaCalendarPlus className="size-2.5" />
                        <span>Book</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-base-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-base-content/60">
          <span>
            Operating <strong>{courts.filter((c) => c.isActive).length}</strong> of{' '}
            <strong>{courts.length}</strong> facilities at <strong>Champions Club</strong>
          </span>
          <div className="flex items-center gap-3">
            <Link to="/facilities" className="link link-hover text-primary font-semibold">
              Facilities Directory &rarr;
            </Link>
            <Link to="/bookings/calendar" className="link link-hover text-base-content/70 font-semibold">
              Schedule Grid &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityOccupancyGrid;
