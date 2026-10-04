import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { FaUsers, FaArrowUpRightFromSquare } from 'react-icons/fa6';
import type { MemberGrowthPoint } from '@/types/reports';
import { Skeleton } from '@/components/ui';

interface MemberGrowthChartProps {
  data?: MemberGrowthPoint[];
  loading?: boolean;
}

export const MemberGrowthChart = ({ data, loading }: MemberGrowthChartProps) => {
  const growthList = data || [];

  if (loading) {
    return (
      <div className="card bg-base-200/50 border border-base-300 shadow-xs">
        <div className="card-body p-4 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-base-300">
            <div className="flex items-center gap-2.5">
              <Skeleton variant="rectangular" height="36px" width="36px" className="rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton variant="text" height="18px" width="180px" />
                <Skeleton variant="text" height="11px" width="240px" />
              </div>
            </div>
            <Skeleton variant="rectangular" height="28px" width="80px" className="rounded-lg" />
          </div>
          <Skeleton variant="rectangular" height="288px" className="w-full rounded-xl mt-3" />
          <div className="grid grid-cols-3 gap-2 mt-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height="52px" className="rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200/50 border border-base-300 shadow-xs">
      <div className="card-body p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-base-300">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
              <FaUsers className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">Membership Velocity</h2>
                <span className="badge badge-primary badge-sm font-semibold">99.4% Retention</span>
              </div>
              <p className="text-xs text-base-content/60">
                New member acquisitions vs churn and active member base
              </p>
            </div>
          </div>

          <Link
            to="/members"
            className="btn btn-ghost btn-xs text-primary gap-1 self-start sm:self-auto"
            title="View full Members Roster"
          >
            <span>Directory</span>
            <FaArrowUpRightFromSquare className="size-3" />
          </Link>
        </div>

        <div className="w-full h-64 sm:h-72 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={growthList} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[95, 100]}
                unit="%"
                tick={{ fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-base-100, #1f2937)',
                  borderColor: 'var(--color-base-300, #374151)',
                  borderRadius: '10px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar
                yAxisId="left"
                dataKey="newMembers"
                name="New Signups"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="left"
                dataKey="churnedMembers"
                name="Cancellations"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="activeMembers"
                name="Active Roster"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="retentionRate"
                name="Retention Rate %"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-3 mt-2 border-t border-base-300 text-xs">
          <div className="p-2 rounded-lg bg-base-100/60 border border-base-300 text-center">
            <span className="text-[10px] text-base-content/60 font-semibold uppercase">Total Active</span>
            <div className="font-extrabold text-sm text-primary mt-0.5">524 Members</div>
          </div>
          <div className="p-2 rounded-lg bg-base-100/60 border border-base-300 text-center">
            <span className="text-[10px] text-base-content/60 font-semibold uppercase">MTD New Signups</span>
            <div className="font-extrabold text-sm text-success mt-0.5">+34 Signups</div>
          </div>
          <div className="p-2 rounded-lg bg-base-100/60 border border-base-300 text-center">
            <span className="text-[10px] text-base-content/60 font-semibold uppercase">Avg Retention</span>
            <div className="font-extrabold text-sm text-warning mt-0.5">98.8%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberGrowthChart;
