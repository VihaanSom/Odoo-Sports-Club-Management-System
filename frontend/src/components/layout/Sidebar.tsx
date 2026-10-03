import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaChartPie,
  FaUsers,
  FaTrophy,
  FaCalendarCheck,
  FaDumbbell,
  FaWineGlass,
  FaUtensils,
  FaReceipt,
  FaIdCard,
  FaGear,
  FaLayerGroup,
} from 'react-icons/fa6';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: <FaChartPie className="size-4" />,
  },
  {
    label: 'Members',
    path: '/members',
    icon: <FaUsers className="size-4" />,
    badge: '142',
  },
  {
    label: 'Courts & Facilities',
    path: '/facilities',
    icon: <FaTrophy className="size-4 text-amber-500" />,
  },
  {
    label: 'Bookings & Slots',
    path: '/bookings',
    icon: <FaCalendarCheck className="size-4" />,
    badge: 'Live',
  },
  {
    label: 'Bar & Floor POS',
    path: '/bar',
    icon: <FaWineGlass className="size-4" />,
  },
  {
    label: 'F&B Menu',
    path: '/menu',
    icon: <FaUtensils className="size-4" />,
  },
  {
    label: 'Orders & POS',
    path: '/orders',
    icon: <FaReceipt className="size-4" />,
  },
  {
    label: 'Equipment Store',
    path: '/equipment',
    icon: <FaDumbbell className="size-4" />,
  },
  {
    label: 'Membership Plans',
    path: '/memberships',
    icon: <FaIdCard className="size-4" />,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: <FaGear className="size-4" />,
  },
];


interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed top-16 bottom-0 left-0 z-40 w-64 bg-base-200 border-r border-base-300 transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col justify-between p-4',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col gap-6">
          <div className="px-2">
            <span className="text-xs font-bold text-base-content/50 uppercase tracking-widest flex items-center gap-2">
              <FaLayerGroup className="size-3 text-primary" /> Management
            </span>
          </div>

          <ul className="menu menu-md p-0 gap-1.5 w-full">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between rounded-xl px-3.5 py-2.5 font-medium transition-colors text-sm',
                      isActive
                        ? 'bg-primary text-primary-content font-semibold shadow-sm'
                        : 'text-base-content/80 hover:bg-base-300 hover:text-base-content'
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="badge badge-sm badge-secondary font-semibold">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Club Quick Status Card */}
        <div className="card bg-base-100 border border-base-300 p-4 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-base-content/70">Club Status</span>
            <span className="badge badge-xs badge-success gap-1">Open</span>
          </div>
          <p className="text-xs text-base-content/60 mt-1">Operating Hours: 06:00 - 23:00</p>
          <progress className="progress progress-primary w-full h-1.5 mt-3" value={78} max={100} />
          <span className="text-[10px] text-base-content/50 mt-1 block text-right">78% Court Capacity</span>
        </div>
      </aside>
    </>
  );
};
