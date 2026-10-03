import { Link } from 'react-router-dom';
import {
  FaCalendarPlus,
  FaUserPlus,
  FaCashRegister,
  FaWineGlass,
  FaBullhorn,
  FaChartPie,
} from 'react-icons/fa6';

export const QuickActions = () => {
  const actions = [
    {
      to: '/bookings/new',
      label: 'Book Court',
      desc: 'Reserve tennis/cricket slot',
      icon: <FaCalendarPlus className="size-4.5 text-primary" />,
    },
    {
      to: '/members',
      label: 'New Member',
      desc: 'Register member or view list',
      icon: <FaUserPlus className="size-4.5 text-secondary" />,
    },
    {
      to: '/orders/new',
      label: 'POS Checkout',
      desc: 'Pro shop & F&B sale',
      icon: <FaCashRegister className="size-4.5 text-accent" />,
    },
    {
      to: '/bar',
      label: 'Bar Tabs',
      desc: 'Manage floor & open tabs',
      icon: <FaWineGlass className="size-4.5 text-warning" />,
    },
    {
      to: '/leads',
      label: 'Enquiry Leads',
      desc: 'Review inbound trials',
      icon: <FaBullhorn className="size-4.5 text-info" />,
    },
    {
      to: '/reports',
      label: 'Reports Hub',
      desc: 'Executive analytics',
      icon: <FaChartPie className="size-4.5 text-success" />,
    },
  ];

  return (
    <div className="card bg-base-200/50 border border-base-300 shadow-xs">
      <div className="card-body p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-base font-bold tracking-tight">Quick Actions</h2>
            <p className="text-xs text-base-content/60">One-click shortcuts to key operations</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {actions.map((act) => (
            <Link
              key={act.label}
              to={act.to}
              className="group flex flex-col items-start p-3 rounded-xl bg-base-100/70 border border-base-300 hover:border-primary/50 hover:bg-base-100 hover:shadow-sm transition-all"
            >
              <div className="p-2 rounded-lg bg-base-200 group-hover:scale-110 transition-transform mb-2">
                {act.icon}
              </div>
              <span className="font-bold text-xs sm:text-sm text-base-content group-hover:text-primary transition-colors">
                {act.label}
              </span>
              <span className="text-[11px] text-base-content/60 truncate w-full mt-0.5">
                {act.desc}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
