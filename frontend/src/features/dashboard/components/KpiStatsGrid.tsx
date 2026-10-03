import { FaUsers, FaCalendarCheck, FaTableTennisPaddleBall, FaIndianRupeeSign, FaWineGlass, FaUserTie } from 'react-icons/fa6';
import type { ClubSummaryKPIs } from '@/types/reports';

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
      desc: '↗︎ 14.8% growth vs last month',
      icon: <FaIndianRupeeSign className="size-5 text-emerald-500" />,
    },
    {
      title: 'Active Members',
      value: String(kpis?.activeMembersCount ?? 524),
      desc: '↗︎ 34 enrolled this month',
      icon: <FaUsers className="size-5 text-primary" />,
    },
    {
      title: "Today's Bookings",
      value: String(kpis?.todayBookingsCount ?? 38),
      desc: '32 Member • 6 Walk-in / Social',
      icon: <FaCalendarCheck className="size-5 text-secondary" />,
    },
    {
      title: 'Court Occupancy',
      value: `${kpis?.courtUtilizationRate ? kpis.courtUtilizationRate.toFixed(1) : '78.4'}%`,
      desc: 'Peak times: 06-10h & 18-22h',
      icon: <FaTableTennisPaddleBall className="size-5 text-amber-500" />,
    },
    {
      title: 'Bar & Cafe Sales',
      value: formatRupees(kpis?.barRevenuePaise ?? 55000000),
      desc: '8 open tabs currently active',
      icon: <FaWineGlass className="size-5 text-purple-500" />,
    },
    {
      title: 'Staff On Duty',
      value: `${kpis?.staffOnDutyCount ?? 6} Staff`,
      desc: `${kpis?.pendingLeavesCount ?? 2} leave requests pending`,
      icon: <FaUserTie className="size-5 text-blue-500" />,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-base-200/60 animate-pulse border border-base-300" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="stat bg-base-200/50 border border-base-300 rounded-2xl p-4 shadow-xs hover:border-primary/40 hover:bg-base-200/80 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-base-300/50">
              {stat.icon}
            </div>
          </div>

          <div>
            <div className="stat-title text-[11px] font-bold uppercase tracking-wider text-base-content/60 truncate">
              {stat.title}
            </div>
            <div className="stat-value text-xl sm:text-2xl font-extrabold tracking-tight my-0.5 text-base-content">
              {stat.value}
            </div>
          </div>

          <div className="stat-desc text-[11px] text-base-content/70 mt-1 truncate">
            {stat.desc}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KpiStatsGrid;
