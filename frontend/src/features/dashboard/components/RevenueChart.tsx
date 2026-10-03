import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { FaArrowUpRightFromSquare, FaChartLine } from 'react-icons/fa6';
import type { RevenueSummary } from '@/types/reports';

interface RevenueChartProps {
  data?: RevenueSummary | null;
  loading?: boolean;
}

export const RevenueChart = ({ data, loading }: RevenueChartProps) => {
  const [viewMode, setViewMode] = useState<'total' | 'breakdown'>('breakdown');

  const timeSeries = data?.timeSeries || [];

  const chartData = timeSeries.map((d) => ({
    period: d.period.replace(' (MTD)', ''),
    total: d.totalPaise / 100,
    memberships: d.membershipsPaise / 100,
    bookings: d.courtBookingsPaise / 100,
    bar: d.barOrdersPaise / 100,
    equipment: d.equipmentPaise / 100,
  }));

  const formatRupees = (val: number) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)}L`;
    }
    if (val >= 1000) {
      return `₹${(val / 1000).toFixed(0)}k`;
    }
    return `₹${val}`;
  };

  if (loading) {
    return (
      <div className="card bg-base-200/50 border border-base-300 shadow-xs">
        <div className="card-body p-5">
          <div className="h-6 w-48 bg-base-300 rounded animate-pulse mb-4" />
          <div className="h-64 bg-base-300/60 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200/50 border border-base-300 shadow-xs">
      <div className="card-body p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-base-300">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <FaChartLine className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">Revenue Trajectory</h2>
                <span className="badge badge-success badge-sm font-semibold">
                  +{data?.growthPercentage ?? 14.8}% MoM
                </span>
              </div>
              <p className="text-xs text-base-content/60">
                Monthly revenue across memberships, court bookings, bar & pro shop
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="join bg-base-300/60 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setViewMode('breakdown')}
                className={`join-item btn btn-xs ${viewMode === 'breakdown' ? 'btn-primary' : 'btn-ghost'}`}
              >
                Streams
              </button>
              <button
                type="button"
                onClick={() => setViewMode('total')}
                className={`join-item btn btn-xs ${viewMode === 'total' ? 'btn-primary' : 'btn-ghost'}`}
              >
                Total
              </button>
            </div>
            <Link
              to="/reports"
              className="btn btn-ghost btn-xs text-primary gap-1"
              title="Open full Reports Hub"
            >
              <span>Reports</span>
              <FaArrowUpRightFromSquare className="size-3" />
            </Link>
          </div>
        </div>

        {/* Chart canvas */}
        <div className="w-full h-64 sm:h-72 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorMemberships" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorEquipment" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={formatRupees} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: unknown) => [
                  `₹${Number(value ?? 0).toLocaleString('en-IN')}`,
                  '',
                ]}
                contentStyle={{
                  backgroundColor: 'var(--color-base-100, #1f2937)',
                  borderColor: 'var(--color-base-300, #374151)',
                  borderRadius: '10px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

              {viewMode === 'total' ? (
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Gross Revenue"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
              ) : (
                <>
                  <Area
                    type="monotone"
                    dataKey="memberships"
                    name="Memberships"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMemberships)"
                  />
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    name="Courts"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorBookings)"
                  />
                  <Area
                    type="monotone"
                    dataKey="bar"
                    name="Bar & Bistro"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorBar)"
                  />
                  <Area
                    type="monotone"
                    dataKey="equipment"
                    name="Pro Shop"
                    stroke="#ec4899"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#colorEquipment)"
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown pill metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-2 border-t border-base-300 text-xs">
          <div className="p-2 rounded-lg bg-base-100/60 border border-base-300 flex flex-col">
            <span className="text-[10px] text-base-content/60 font-semibold uppercase">Memberships</span>
            <span className="font-bold text-success mt-0.5">₹31.5L (65%)</span>
          </div>
          <div className="p-2 rounded-lg bg-base-100/60 border border-base-300 flex flex-col">
            <span className="text-[10px] text-base-content/60 font-semibold uppercase">Court Bookings</span>
            <span className="font-bold text-warning mt-0.5">₹9.5L (19.6%)</span>
          </div>
          <div className="p-2 rounded-lg bg-base-100/60 border border-base-300 flex flex-col">
            <span className="text-[10px] text-base-content/60 font-semibold uppercase">Bar & Bistro</span>
            <span className="font-bold text-secondary mt-0.5">₹5.5L (11.3%)</span>
          </div>
          <div className="p-2 rounded-lg bg-base-100/60 border border-base-300 flex flex-col">
            <span className="text-[10px] text-base-content/60 font-semibold uppercase">Pro Shop & Gear</span>
            <span className="font-bold text-accent mt-0.5">₹2.0L (4.1%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
