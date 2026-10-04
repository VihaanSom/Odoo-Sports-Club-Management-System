import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCheck,
  FaLock,
} from 'react-icons/fa6';
import { courtService } from '@/services/courtService';
import { formatSlotTime, formatSlotRange } from '@/lib/utils';
import type { CourtAvailability } from '@/types/courts';
import { DatePicker } from '@/components/ui/DatePicker';
import { useAuthStore } from '@/stores/authStore';
import { isStaffRole } from '@/lib/permissions';

interface CourtAvailabilityMatrixProps {
  initialDate?: string;
  initialSport?: string;
  onSelectSlot?: (courtId: number, slotStart: string, slotEnd: string) => void;
}

export const CourtAvailabilityMatrix = ({
  initialDate,
  initialSport,
  onSelectSlot,
}: CourtAvailabilityMatrixProps) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isStaff = isStaffRole(user?.role);
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState<string>(initialDate || todayStr);
  const [sport] = useState<string>(initialSport || '');
  const [availability, setAvailability] = useState<CourtAvailability[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    try {
      const data = await courtService.getAvailability(date, sport || undefined);
      setAvailability(data);
    } finally {
      setLoading(false);
    }
  }, [date, sport]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const handleSlotClick = (courtId: number, slotStart: string, slotEnd: string, isFree: boolean) => {
    if (!isFree) return;
    if (onSelectSlot) {
      onSelectSlot(courtId, slotStart, slotEnd);
    } else {
      navigate(
        `/bookings/new?courtId=${courtId}&slotStart=${encodeURIComponent(
          slotStart
        )}&slotEnd=${encodeURIComponent(slotEnd)}`
      );
    }
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm rounded-2xl p-5 space-y-5">
      {/* Control Bar - Only Date Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-base-300">
        <div className="w-64 max-w-full">
          <DatePicker
            value={date}
            onChange={(newDate) => {
              if (newDate) setDate(newDate);
            }}
            placeholder="Select date"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="size-3 rounded bg-emerald-500/20 border border-emerald-500 inline-block" />
          Available (Click to book)
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="size-3 rounded bg-base-300 border border-base-content/20 inline-block" />
          Booked
        </span>
      </div>

      {/* Matrix Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : availability.length === 0 ? (
        <div className="py-16 text-center text-base-content/60">
          No courts available for this selection.
        </div>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[850px] space-y-3">
            {availability.map((court) => (
              <div
                key={court.courtId}
                className="bg-base-200/40 border border-base-300 rounded-xl p-3 flex flex-col md:flex-row md:items-center gap-3"
              >
                {/* Court Info Column */}
                <div className="w-52 shrink-0">
                  <div className="font-bold text-sm text-base-content">{court.courtName}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="badge badge-xs badge-outline uppercase font-semibold text-[10px]">
                      {court.sport}
                    </span>
                    <span className="text-[11px] text-base-content/60 font-mono">
                      #{court.courtId}
                    </span>
                  </div>
                </div>

                {/* Slots Strip */}
                <div className="flex-1 flex flex-wrap gap-1.5">
                  {court.slots.map((slot, idx) => {
                    const isFree = slot.status === 'free';
                    const timeLabel = formatSlotTime(slot.slotStart);
                    const rangeLabel = formatSlotRange(slot.slotStart, slot.slotEnd);

                    const tipText = isFree
                      ? `Available: ${rangeLabel}`
                      : isStaff
                      ? `Booked: ${rangeLabel} (${slot.bookingType === 'walk_in' ? 'WALK IN' : (slot.bookingType || 'reserved')})`
                      : `Booked: ${rangeLabel}`;

                    return (
                      <div key={idx} className="tooltip tooltip-top" data-tip={tipText}>
                        <button
                          type="button"
                          onClick={() =>
                            handleSlotClick(court.courtId, slot.slotStart, slot.slotEnd, isFree)
                          }
                          disabled={!isFree}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex flex-col items-center justify-center min-w-[62px] ${
                            isFree
                              ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white cursor-pointer shadow-2xs'
                              : 'bg-base-300 text-base-content/40 border border-base-content/10 cursor-not-allowed'
                          }`}
                        >
                          <span className="font-bold">{timeLabel}</span>
                          <span className="text-[9px] mt-0.5 flex items-center gap-0.5">
                            {isFree ? (
                              <>
                                <FaCheck className="size-2 text-emerald-500" /> Free
                              </>
                            ) : (
                              <>
                                <FaLock className="size-2" /> Booked
                              </>
                            )}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
