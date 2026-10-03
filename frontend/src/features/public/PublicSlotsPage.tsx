import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { FaCalendarDays, FaCircleCheck, FaBan } from 'react-icons/fa6';
import { Button } from '@/components/ui/Button';
import { publicService } from '@/services/publicService';
import type { PublicCourtSlot } from '@/types/public';

export const PublicSlotsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const sportParam = searchParams.get('sport') || 'all';

  const [slots, setSlots] = useState<PublicCourtSlot[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>(sportParam);
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-03');
  const [loading, setLoading] = useState(true);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const data = await publicService.getPublicCourtSlots(
        selectedSport !== 'all' ? selectedSport : undefined,
        selectedDate
      );
      setSlots(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
    if (selectedSport !== 'all') {
      setSearchParams({ sport: selectedSport });
    } else {
      setSearchParams({});
    }
  }, [selectedSport, selectedDate]);

  const sports = ['all', 'Tennis', 'Badminton', 'Squash', 'Swimming'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
            <FaCalendarDays className="size-8 text-primary" /> Live Court Slots & Schedule
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            Real-time court availability preview across clay tennis, indoor badminton, and squash courts.
          </p>
        </div>

        {/* Date & Sport picker */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            className="input input-bordered input-sm text-xs"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <div className="join">
            {sports.map((s) => (
              <button
                key={s}
                type="button"
                className={`join-item btn btn-xs capitalize ${
                  selectedSport.toLowerCase() === s.toLowerCase() ? 'btn-primary' : 'btn-ghost'
                }`}
                onClick={() => setSelectedSport(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Slots Table */}
      <div className="overflow-x-auto rounded-lg border border-base-300 bg-base-100 shadow-xs">
        <table className="table table-sm w-full">
          <thead className="bg-base-200/60 text-xs">
            <tr>
              <th>Facility / Court</th>
              <th>Sport</th>
              <th>Slot Timing</th>
              <th className="text-right">Rate (₹)</th>
              <th className="text-center">Availability</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-base-content/60">
                  <span className="loading loading-spinner loading-md mr-2" />
                  Checking real-time slot availability...
                </td>
              </tr>
            ) : slots.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-base-content/60">
                  No slots scheduled for this date and sport.
                </td>
              </tr>
            ) : (
              slots.map((slot) => (
                <tr key={slot.id} className="hover:bg-base-200/40">
                  <td>
                    <div className="font-bold text-xs text-base-content">{slot.facilityName}</div>
                    <div className="text-[10px] text-base-content/50 font-mono">{slot.date}</div>
                  </td>
                  <td>
                    <span className="badge badge-outline badge-xs">{slot.sport}</span>
                  </td>
                  <td className="font-mono text-xs font-semibold whitespace-nowrap">
                    {slot.startTime} - {slot.endTime}
                  </td>
                  <td className="text-right font-mono font-bold text-xs text-primary">
                    ₹{(slot.pricePaise / 100).toLocaleString('en-IN')}
                  </td>
                  <td className="text-center">
                    {slot.isAvailable ? (
                      <span className="inline-flex items-center gap-1 badge badge-success badge-xs font-semibold">
                        <FaCircleCheck className="size-2.5" /> Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 badge badge-neutral badge-xs">
                        <FaBan className="size-2.5" /> Booked
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    {slot.isAvailable ? (
                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() => navigate('/login')}
                      >
                        Book Now
                      </Button>
                    ) : (
                      <span className="text-xs text-base-content/40 font-mono">Unavailable</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default PublicSlotsPage;
