import { FaUsers, FaCalendarCheck, FaDumbbell, FaDollarSign, FaArrowTrendUp } from 'react-icons/fa6';

export const KpiStatsGrid = () => {
  const stats = [
    {
      title: 'Total Active Members',
      value: '1,248',
      desc: '↗︎ 14% more than last month',
      icon: <FaUsers className="size-6 text-primary" />,
    },
    {
      title: "Today's Bookings",
      value: '38',
      desc: '92% slots occupied',
      icon: <FaCalendarCheck className="size-6 text-secondary" />,
    },
    {
      title: 'Equipment in Use',
      value: '42 / 60',
      desc: '70% utilization rate',
      icon: <FaDumbbell className="size-6 text-accent" />,
    },
    {
      title: 'Monthly Revenue',
      value: '$18,450',
      desc: '↗︎ $2,300 over projection',
      icon: <FaDollarSign className="size-6 text-success" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="stat bg-base-200/60 border border-base-300 rounded-2xl p-5 shadow-xs hover:border-primary/40 transition-colors"
        >
          <div className="stat-figure p-2 rounded-xl bg-base-300/60">
            {stat.icon}
          </div>
          <div className="stat-title text-xs font-semibold uppercase tracking-wider text-base-content/60">
            {stat.title}
          </div>
          <div className="stat-value text-2xl lg:text-3xl font-bold my-1 tracking-tight">
            {stat.value}
          </div>
          <div className="stat-desc text-xs font-medium text-success flex items-center gap-1">
            <FaArrowTrendUp className="size-3" />
            {stat.desc}
          </div>
        </div>
      ))}
    </div>
  );
};
