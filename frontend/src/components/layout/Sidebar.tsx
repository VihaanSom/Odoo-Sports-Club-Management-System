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
  FaUserTie,
  FaFileInvoiceDollar,
  FaUserGroup,
  FaMoneyBillTransfer,
  FaChartLine,
  FaGlobe,
} from 'react-icons/fa6';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
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
  },
  {
    label: 'Courts & Facilities',
    path: '/facilities',
    icon: <FaTrophy className="size-4" />,
  },
  {
    label: 'Bookings & Slots',
    path: '/bookings',
    icon: <FaCalendarCheck className="size-4" />,
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
    label: 'CRM Leads',
    path: '/leads',
    icon: <FaUserTie className="size-4" />,
  },
  {
    label: 'Renewal Invoices',
    path: '/invoices',
    icon: <FaFileInvoiceDollar className="size-4" />,
  },
  {
    label: 'Staff & Shifts',
    path: '/staff',
    icon: <FaUserGroup className="size-4" />,
  },
  {
    label: 'Payments Ledger',
    path: '/payments',
    icon: <FaMoneyBillTransfer className="size-4" />,
  },
  {
    label: 'Club Reports',
    path: '/reports',
    icon: <FaChartLine className="size-4" />,
  },
  {
    label: 'Public Website',
    path: '/public',
    icon: <FaGlobe className="size-4" />,
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
          'fixed top-16 bottom-0 left-0 z-40 w-64 bg-base-200 border-r border-base-300 transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col justify-between py-4 px-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col gap-4 overflow-y-auto flex-1 pl-3 pr-2 scrollbar-thin">
          <div className="px-2">
            <span className="text-xs font-bold text-base-content/50 uppercase tracking-widest flex items-center gap-2">
              <FaLayerGroup className="size-3 text-base-content/50" /> Management
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
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
};
