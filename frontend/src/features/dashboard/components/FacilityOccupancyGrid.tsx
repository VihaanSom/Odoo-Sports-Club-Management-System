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
    <div className="card bg-base-200/50 border border-base-300 shadow-xs">
      <div className="card-body p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-base-300">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">Facility Occupancy</h2>
            <p className="text-xs text-base-content/60">
              Court availability, surface condition, and today's reservations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="tabs tabs-box bg-base-300/60 p-1 rounded-xl">
              {(['All', 'Tennis', 'Cricket'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedSportTab(tab)}
                  className={`tab tab-xs sm:tab-sm font-semibold transition-all ${
                    selectedSportTab === tab
                      ? 'tab-active bg-primary text-primary-content shadow-xs'
                      : ''
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-base-300/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {filteredCourts.map((court) => {
              const schedule = getCourtSchedule(court.id);
              const activeBooking = schedule?.bookings?.[0];
              const isOccupied = Boolean(activeBooking && court.isActive);

              return (
                <div
                  key={court.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                    !court.isActive
                      ? 'bg-base-300/30 border-base-300 opacity-75'
                      : isOccupied
                      ? 'bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50'
                      : 'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`size-9 rounded-lg flex items-center justify-center font-bold text-sm ${
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
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm tracking-tight text-base-content truncate max-w-[140px] sm:max-w-[170px]">
                          {court.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-base-content/60">
                          <span className="capitalize font-semibold">{court.sport}</span>
                          <span>•</span>
                          <span>{court.openTime} - {court.closeTime}</span>
                        </div>
                      </div>
                    </div>

                    {!court.isActive ? (
                      <span className="badge badge-neutral badge-xs font-semibold gap-1">
                        <FaWrench className="size-2.5" /> Maintenance
                      </span>
                    ) : isOccupied ? (
                      <span className="badge badge-warning badge-xs font-bold gap-1">
                        <FaCircleDot className="size-2 text-warning animate-ping" /> In Play
                      </span>
                    ) : (
                      <span className="badge badge-success badge-xs font-bold gap-1">
                        <FaCheck className="size-2.5" /> Open
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-base-200/80 flex items-center justify-between text-xs">
                    {isOccupied && activeBooking ? (
                      <div className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-medium truncate max-w-[160px]">
                        <FaClock className="size-2.5 shrink-0" />
                        <span className="truncate">
                          {formatSlotTime(activeBooking.slotStart, activeBooking.slotEnd)} ({activeBooking.memberName})
                        </span>
                      </div>
                    ) : !court.isActive ? (
                      <span className="text-[11px] text-base-content/50">Pitch resurfacing</span>
                    ) : (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <FaCheck className="size-2.5" /> Available right now
                      </span>
                    )}

                    {court.isActive && (
                      <Link
                        to={`/bookings/new?courtId=${court.id}`}
                        className="btn btn-ghost btn-xs text-primary gap-1 font-semibold hover:bg-primary/10"
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

        <div className="mt-4 pt-3 border-t border-base-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-base-content/70">
          <span>
            Operating <strong>{courts.filter((c) => c.isActive).length}</strong> of{' '}
            <strong>{courts.length}</strong> facilities at <strong>Champions Club</strong>
          </span>
          <div className="flex items-center gap-3">
            <Link to="/facilities" className="link link-primary font-semibold">
              Facilities Directory &rarr;
            </Link>
            <Link to="/bookings/calendar" className="link link-secondary font-semibold">
              Full Schedule Grid &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityOccupancyGrid;
