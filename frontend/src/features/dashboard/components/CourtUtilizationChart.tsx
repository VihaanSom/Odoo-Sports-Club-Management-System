import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTableTennisPaddleBall, FaArrowUpRightFromSquare, FaFire } from 'react-icons/fa6';
import type { CourtHeatmapPoint } from '@/types/reports';
import { Skeleton } from '@/components/ui';

interface CourtUtilizationChartProps {
  data?: CourtHeatmapPoint[];
  loading?: boolean;
}

export const CourtUtilizationChart = ({ data, loading }: CourtUtilizationChartProps) => {
  const [hoveredPoint, setHoveredPoint] = useState<CourtHeatmapPoint | null>(null);

  const heatmapData = data || [];

  const days: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'> = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const hours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

  const getPoint = (day: string, hour: string) => {
    return heatmapData.find((d) => d.day === day && d.hour === hour);
  };

  const getColorClass = (rate: number) => {
    if (rate >= 80) return 'bg-rose-500 text-white font-bold';
    if (rate >= 60) return 'bg-amber-500 text-slate-900 font-semibold';
    if (rate >= 40) return 'bg-emerald-500 text-white font-medium';
    if (rate >= 20) return 'bg-sky-400 text-slate-900 font-medium';
    return 'bg-base-300/60 text-base-content/60';
  };

  if (loading) {
    return (
      <div className="card bg-base-200/50 border border-base-300 shadow-xs">
        <div className="card-body p-4 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-base-300">
            <div className="flex items-center gap-2.5">
              <Skeleton variant="rectangular" height="36px" width="36px" className="rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton variant="text" height="18px" width="180px" />
                <Skeleton variant="text" height="11px" width="220px" />
              </div>
            </div>
            <Skeleton variant="rectangular" height="28px" width="80px" className="rounded-lg" />
          </div>
          <Skeleton variant="rectangular" height="220px" className="w-full rounded-xl mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200/50 border border-base-300 shadow-xs">
      <div className="card-body p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-base-300">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <FaTableTennisPaddleBall className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">Court Utilization Heatmap</h2>
                <span className="badge badge-warning badge-sm gap-1 font-semibold">
                  <FaFire className="size-3 text-rose-500" /> Peak Hours 18:00 - 22:00
                </span>
              </div>
              <p className="text-xs text-base-content/60">
                Weekly hourly court occupancy across all tennis & cricket facilities
              </p>
            </div>
          </div>

          <Link
            to="/bookings/calendar"
            className="btn btn-ghost btn-xs text-primary gap-1 self-start sm:self-auto"
            title="Open Schedule Grid"
          >
            <span>Schedule Grid</span>
            <FaArrowUpRightFromSquare className="size-3" />
          </Link>
        </div>

        {/* Heatmap table */}
        <div className="overflow-x-auto mt-3 pb-2">
          <table className="table table-xs w-full border-collapse">
            <thead>
              <tr>
                <th className="w-20 text-left font-bold text-[11px] text-base-content/70">Day</th>
                {hours.map((h) => (
                  <th key={h} className="text-center font-bold text-[11px] px-1 py-1 text-base-content/70">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day} className="border-t border-base-300/40">
                  <td className="font-semibold text-xs text-base-content/80 whitespace-nowrap py-1.5">
                    {day.slice(0, 3)}
                  </td>
                  {hours.map((hour) => {
                    const pt = getPoint(day, hour);
                    const rate = pt ? pt.occupancyRate : 0;
                    return (
                      <td key={hour} className="p-1 text-center">
                        <div
                          onMouseEnter={() => pt && setHoveredPoint(pt)}
                          onMouseLeave={() => setHoveredPoint(null)}
                          className={`h-7 w-11 mx-auto rounded-md flex items-center justify-center text-[11px] transition-all cursor-pointer hover:scale-110 shadow-xs ${getColorClass(
                            rate
                          )}`}
                          title={`${day} @ ${hour}: ${rate}% occupied (${pt?.bookingCount ?? 0} courts booked)`}
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

        {/* Legend & Hover Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-base-100/70 p-2.5 rounded-xl border border-base-300 mt-2">
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="font-bold text-base-content/70">Occupancy:</span>
            <div className="flex items-center gap-1">
              <span className="size-2.5 rounded bg-base-300/60 inline-block" /> &lt;20%
            </div>
            <div className="flex items-center gap-1">
              <span className="size-2.5 rounded bg-sky-400 inline-block" /> 20-39%
            </div>
            <div className="flex items-center gap-1">
              <span className="size-2.5 rounded bg-emerald-500 inline-block" /> 40-59%
            </div>
            <div className="flex items-center gap-1">
              <span className="size-2.5 rounded bg-amber-500 inline-block" /> 60-79%
            </div>
            <div className="flex items-center gap-1">
              <span className="size-2.5 rounded bg-rose-500 inline-block" /> 80%+ Peak
            </div>
          </div>

          <div className="text-[11px] font-medium min-h-4">
            {hoveredPoint ? (
              <span className="text-primary font-bold">
                {hoveredPoint.day} @ {hoveredPoint.hour}: {hoveredPoint.occupancyRate}% ({hoveredPoint.bookingCount} courts booked)
              </span>
            ) : (
              <span className="text-base-content/50">Hover over any slot for court count</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourtUtilizationChart;
