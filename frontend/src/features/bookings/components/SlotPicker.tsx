import {  useEffect, useState  } from 'react';
import { FaClock, FaCheck, FaChevronDown } from 'react-icons/fa6';
import { courtService } from '@/services/courtService';
import { formatDate, formatSlotTime, formatSlotRange } from '@/lib/utils';
import type { Court, SlotAvailabilityItem } from '@/types/courts';
import { DatePicker } from '@/components/ui/DatePicker';

interface SlotPickerProps {
  selectedCourtId: number | null;
  selectedDate: string;
  selectedSlotStart: string;
  selectedSlotEnd: string;
  onSelectSlot: (courtId: number, slotStart: string, slotEnd: string) => void;
  onSelectDate: (date: string) => void;
  onSelectCourt: (courtId: number) => void;
}

export const SlotPicker = ({
  selectedCourtId,
  selectedDate,
  selectedSlotStart,
  onSelectSlot,
  onSelectDate,
  onSelectCourt,
}: SlotPickerProps) => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [slots, setSlots] = useState<SlotAvailabilityItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadCourtsAndSlots = async () => {
      setLoading(true);
      try {
        const dateToFetch = selectedDate || new Date().toISOString().split('T')[0];
        const avail = await courtService.getAvailability(dateToFetch);
        if (cancelled) return;

        const availableCourts: Court[] = avail.map((a) => ({
          id: a.courtId,
          name: a.courtName,
          sport: a.sport,
          openTime: '06:00',
          closeTime: '23:00',
          isActive: true,
        }));

        setCourts(availableCourts);

        // Auto-select first court if none selected
        if (availableCourts.length > 0) {
          if (!selectedCourtId || !availableCourts.some((c) => c.id === selectedCourtId)) {
            onSelectCourt(availableCourts[0].id);
          }
        }

        const activeCourtId =
          selectedCourtId && availableCourts.some((c) => c.id === selectedCourtId)
            ? selectedCourtId
            : availableCourts[0]?.id;

        if (activeCourtId) {
          const courtAvail = avail.find((a) => a.courtId === activeCourtId);
          setSlots(courtAvail ? courtAvail.slots : []);
        } else {
          setSlots([]);
        }
      } catch (err) {
        console.error('Failed to load court availability:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCourtsAndSlots();
    return () => {
      cancelled = true;
    };
  }, [selectedDate, selectedCourtId]);

  const selectedCourt = courts.find((c) => c.id === selectedCourtId);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text text-xs font-semibold uppercase tracking-wide">
              Select Court <span className="text-error">*</span>
            </span>
          </label>
          <div className="dropdown w-full">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-outline input-bordered w-full justify-between text-sm font-normal bg-base-100"
            >
              <span className="truncate">
                {selectedCourt ? `${selectedCourt.name} (${selectedCourt.sport})` : 'Choose Court...'}
              </span>
              <FaChevronDown className="size-2.5 opacity-60 ml-2" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-30 w-full p-2 shadow-xl border border-base-300 text-xs max-h-56 overflow-y-auto"
            >
              {courts.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onSelectCourt(c.id)}
                    className={selectedCourtId === c.id ? 'active font-bold' : ''}
                  >
                    {c.name} ({c.sport})
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="form-control">
          <label className="label py-1">
            <span className="label-text text-xs font-semibold uppercase tracking-wide">
              Date <span className="text-error">*</span>
            </span>
          </label>
          <DatePicker
            value={selectedDate}
            onChange={(d) => {
              if (d) onSelectDate(d);
            }}
          />
        </div>
      </div>

      <div>
        <label className="label py-1">
          <span className="label-text text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
            <FaClock className="size-3 text-primary" />
            Available Time Slots (60 min) <span className="text-error">*</span>
          </span>
        </label>

        {loading ? (
          <div className="py-8 text-center">
            <span className="loading loading-spinner loading-md text-primary" />
          </div>
        ) : slots.length === 0 ? (
          <div className="p-6 text-center text-xs text-base-content/50 border border-base-300 rounded-xl">
            No operating slots found for this court on {formatDate(selectedDate)}.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {slots.map((s, idx) => {
              const timeLabel = formatSlotTime(s.slotStart);
              const endLabel = formatSlotTime(s.slotEnd);
              const rangeLabel = formatSlotRange(s.slotStart, s.slotEnd);
              const isSelected = selectedSlotStart === s.slotStart;
              const isFree = s.status === 'free';

              return (
                <button
                  key={idx}
                  type="button"
                  title={rangeLabel}
                  disabled={!isFree}
                  onClick={() => {
                    if (selectedCourtId) {
                      onSelectSlot(selectedCourtId, s.slotStart, s.slotEnd);
                    }
                  }}
                  className={`p-2 rounded-xl text-xs font-mono flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-content font-bold shadow-md scale-102 ring-2 ring-primary ring-offset-2'
                      : isFree
                      ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white cursor-pointer'
                      : 'bg-base-200 text-base-content/30 border border-base-300 cursor-not-allowed'
                  }`}
                >
                  <span className="font-semibold text-[11px]">{timeLabel}</span>
                  <span className="text-[9px] opacity-65 font-sans">to {endLabel}</span>
                  <span className="text-[9px] mt-0.5 flex items-center gap-1 font-sans">
                    {isSelected ? (
                      <FaCheck className="size-2 text-primary-content" />
                    ) : isFree ? (
                      'Free'
                    ) : (
                      'Booked'
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
