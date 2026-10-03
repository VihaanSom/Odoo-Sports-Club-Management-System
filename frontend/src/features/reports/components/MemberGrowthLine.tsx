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
import type { MemberGrowthPoint } from '@/types/reports';

interface MemberGrowthLineProps {
  data: MemberGrowthPoint[];
}

export const MemberGrowthLine = ({ data }: MemberGrowthLineProps) => {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[95, 100]}
            unit="%"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-base-100, #1f2937)',
              borderColor: 'var(--color-base-300, #374151)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Bar
            yAxisId="left"
            dataKey="newMembers"
            name="New Members"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            yAxisId="left"
            dataKey="churnedMembers"
            name="Churned Members"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="activeMembers"
            name="Active Members Total"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="retentionRate"
            name="Retention Rate %"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="4 4"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MemberGrowthLine;
