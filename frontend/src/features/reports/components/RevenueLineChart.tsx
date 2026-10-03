import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { RevenueTimeSeriesPoint } from '@/types/reports';

interface RevenueLineChartProps {
  data: RevenueTimeSeriesPoint[];
}

export const RevenueLineChart = ({ data }: RevenueLineChartProps) => {
  const chartData = data.map((d) => ({
    period: d.period,
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

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="period" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={formatRupees} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: unknown) => [
              `₹${Number(value ?? 0).toLocaleString('en-IN')}`,
              '',
            ]}
            contentStyle={{
              backgroundColor: 'var(--color-base-100, #1f2937)',
              borderColor: 'var(--color-base-300, #374151)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Line
            type="monotone"
            dataKey="total"
            name="Total Revenue"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="memberships"
            name="Memberships"
            stroke="#10b981"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="bookings"
            name="Court Bookings"
            stroke="#f59e0b"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="bar"
            name="Bar & Bistro"
            stroke="#8b5cf6"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="equipment"
            name="Equipment"
            stroke="#ec4899"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueLineChart;
