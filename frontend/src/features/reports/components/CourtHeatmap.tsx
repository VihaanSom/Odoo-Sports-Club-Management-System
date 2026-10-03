import { useState } from 'react';
import type { CourtHeatmapPoint } from '@/types/reports';

interface CourtHeatmapProps {
  data: CourtHeatmapPoint[];
}

export const CourtHeatmap = ({ data }: CourtHeatmapProps) => {
  const [hoveredPoint, setHoveredPoint] = useState<CourtHeatmapPoint | null>(null);

  const days: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'> = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const hours = [
    '06:00',
    '08:00',
    '10:00',
    '12:00',
    '14:00',
    '16:00',
    '18:00',
    '20:00',
  ];

  const getPoint = (day: string, hour: string) => {
    return data.find((d) => d.day === day && d.hour === hour);
  };

  const getColorClass = (rate: number) => {
    if (rate >= 80) return 'bg-rose-500 text-white font-bold';
    if (rate >= 60) return 'bg-amber-500 text-slate-900 font-medium';
    if (rate >= 40) return 'bg-emerald-500 text-white';
    if (rate >= 20) return 'bg-sky-400 text-slate-900';
    return 'bg-base-300/60 text-base-content/70';
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto pb-2">
        <table className="table table-xs w-full border-collapse">
          <thead>
            <tr>
              <th className="w-24 text-left font-semibold text-xs text-base-content/70">Day / Hour</th>
              {hours.map((h) => (
                <th key={h} className="text-center font-semibold text-xs px-2 py-1 text-base-content/70">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day} className="border-t border-base-200">
                <td className="font-medium text-xs text-base-content/80 whitespace-nowrap py-2">{day}</td>
                {hours.map((hour) => {
                  const pt = getPoint(day, hour);
                  const rate = pt ? pt.occupancyRate : 0;
                  return (
                    <td key={hour} className="p-1 text-center">
                      <div
                        onMouseEnter={() => pt && setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        className={`h-9 w-14 mx-auto rounded flex items-center justify-center text-xs transition-all cursor-pointer hover:scale-105 shadow-xs ${getColorClass(
                          rate
                        )}`}
                        title={`${day} @ ${hour}: ${rate}% occupied (${pt?.bookingCount ?? 0} bookings)`}
                      >
                        {rate}%
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Heatmap Tooltip / Status Display */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-base-200/50 p-2.5 rounded-lg border border-base-300">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-base-content/70">Occupancy:</span>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded bg-base-300/60 inline-block" /> &lt;20%
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded bg-sky-400 inline-block" /> 20-39%
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded bg-emerald-500 inline-block" /> 40-59%
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded bg-amber-500 inline-block" /> 60-79%
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded bg-rose-500 inline-block" /> 80%+ Peak
          </div>
        </div>

        {hoveredPoint ? (
          <div className="font-medium text-primary">
            {hoveredPoint.day} @ {hoveredPoint.hour}: {hoveredPoint.occupancyRate}% ({hoveredPoint.bookingCount} courts booked)
          </div>
        ) : (
          <div className="text-base-content/50">Hover cell for court slot details</div>
        )}
      </div>
    </div>
  );
};

export default CourtHeatmap;
