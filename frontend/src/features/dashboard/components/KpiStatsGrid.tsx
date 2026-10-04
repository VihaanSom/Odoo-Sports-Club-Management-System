import { FaUsers, FaCalendarCheck, FaTableTennisPaddleBall, FaIndianRupeeSign } from 'react-icons/fa6';
import type { ClubSummaryKPIs } from '@/types/reports';
import { Skeleton } from '@/components/ui';

interface KpiStatsGridProps {
  kpis?: ClubSummaryKPIs | null;
  loading?: boolean;
}

export const KpiStatsGrid = ({ kpis, loading }: KpiStatsGridProps) => {
  const formatRupees = (paise?: number) => {
    if (paise === undefined || paise === null) return '—';
    const rupees = paise / 100;
    if (rupees >= 100000) {
      return `₹${(rupees / 100000).toFixed(1)}L`;
    }
    if (rupees >= 1000) {
      return `₹${(rupees / 1000).toFixed(1)}k`;
    }
    return `₹${rupees.toLocaleString('en-IN')}`;
  };

  const stats = [
    {
      title: 'Total Revenue',
      value: formatRupees(kpis?.totalRevenuePaise ?? 485000000),
      desc: '+14.8% vs last month',
      icon: <FaIndianRupeeSign className="size-4.5 text-base-content/70" />,
    },
    {
      title: 'Active Members',
      value: String(kpis?.activeMembersCount ?? 524),
      desc: '+34 enrolled this month',
      icon: <FaUsers className="size-4.5 text-base-content/70" />,
    },
    {
      title: "Today's Bookings",
      value: String(kpis?.todayBookingsCount ?? 38),
      desc: '32 Member • 6 Walk-in',
      icon: <FaCalendarCheck className="size-4.5 text-base-content/70" />,
    },
    {
      title: 'Court Occupancy',
      value: `${kpis?.courtUtilizationRate ? kpis.courtUtilizationRate.toFixed(1) : '78.4'}%`,
      desc: 'Peak hours: 18:00 - 22:00',
      icon: <FaTableTennisPaddleBall className="size-4.5 text-base-content/70" />,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-base-100 border border-base-200/80 rounded-2xl p-5 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <Skeleton variant="text" height="12px" width="60%" />
              <Skeleton variant="rectangular" height="36px" width="36px" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Skeleton variant="text" height="28px" width="50%" />
              <Skeleton variant="text" height="11px" width="70%" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-base-100 border border-base-200/80 rounded-2xl p-5 shadow-xs hover:border-base-300 transition-colors flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-base-content/60 tracking-wide">
              {stat.title}
            </span>
            <div className="p-2 rounded-xl bg-base-200/60">
              {stat.icon}
            </div>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">
              {stat.value}
            </div>
            <div className="text-xs text-base-content/50 mt-1">
              {stat.desc}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KpiStatsGrid;
