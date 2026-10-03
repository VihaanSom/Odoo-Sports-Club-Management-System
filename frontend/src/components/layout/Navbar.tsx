import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaBars,
  FaBell,
  FaMoon,
  FaSun,
  FaUserGear,
  FaArrowRightFromBracket,
  FaCircleUser,
} from 'react-icons/fa6';
import { Logo } from '@/components/ui';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isDark = theme === 'black';

  return (
    <header className="navbar bg-base-200/80 backdrop-blur-md sticky top-0 z-30 border-b border-base-300 px-4 lg:px-6">
      <div className="navbar-start gap-2">
        {onToggleSidebar && (
          <button
            type="button"
            className="btn btn-ghost btn-square lg:hidden"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar menu"
          >
            <FaBars className="size-5" />
          </button>
        )}
        <Link to="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-primary">
          <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-sm">
            <Logo className="size-5" />
          </div>
          <span className="hidden sm:inline bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Champions Club
          </span>
        </Link>
      </div>

      <div className="navbar-center hidden md:flex">
        <div className="badge badge-outline badge-primary gap-1.5 py-3 px-3 text-xs font-medium">
          <span className="size-2 rounded-full bg-success animate-pulse"></span>
          Connected to Odoo ERP
        </div>
      </div>

      <div className="navbar-end gap-2">
        {/* Theme Toggle Button */}
        <button
          type="button"
          className="btn btn-ghost btn-circle"
          onClick={toggleTheme}
          aria-label="Toggle light and dark theme"
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? (
            <FaSun className="size-5 text-warning" />
          ) : (
            <FaMoon className="size-5 text-primary" />
          )}
        </button>

        {/* Notifications */}
        <div className="dropdown dropdown-end">
          <button
            tabIndex={0}
            type="button"
            className="btn btn-ghost btn-circle"
            aria-label="Notifications"
          >
            <div className="indicator">
              <FaBell className="size-5 text-base-content/80" />
              <span className="badge badge-xs badge-secondary indicator-item"></span>
            </div>
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-50 w-72 p-3 shadow-xl border border-base-300 gap-1 mt-3"
          >
            <li className="menu-title px-2 py-1 text-xs font-semibold uppercase tracking-wider">
              Club Alerts
            </li>
            <li>
              <div className="flex flex-col items-start gap-1 p-2 rounded-lg hover:bg-base-200">
                <span className="font-semibold text-sm">Tennis Court 2 Booked</span>
                <span className="text-xs text-base-content/70">By Roger Federer • 10:00 AM</span>
              </div>
            </li>
            <li>
              <div className="flex flex-col items-start gap-1 p-2 rounded-lg hover:bg-base-200">
                <span className="font-semibold text-sm">Equipment Restocked</span>
                <span className="text-xs text-base-content/70">20 Wilson Tennis Balls received</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Profile Dropdown */}
        <div className="dropdown dropdown-end">
          <button
            tabIndex={0}
            type="button"
            className="btn btn-ghost btn-circle avatar"
            aria-label="User profile menu"
          >
            <div className="w-9 rounded-full ring-2 ring-primary/30 ring-offset-base-100 ring-offset-1 flex items-center justify-center bg-base-300">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} />
              ) : (
                <FaCircleUser className="size-7 text-primary" />
              )}
            </div>
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-50 w-56 p-2 shadow-xl border border-base-300 mt-3"
          >
            <li className="px-3 py-2 border-b border-base-200">
              <div className="flex flex-col p-0">
                <span className="font-bold text-sm">{user?.name || 'Club Admin'}</span>
                <span className="text-xs text-base-content/60">{user?.email || 'admin@odoosports.club'}</span>
                <span className="badge badge-sm badge-primary mt-1 self-start capitalize">
                  {user?.role || 'Administrator'}
                </span>
              </div>
            </li>
            <li className="mt-1">
              <Link to="/settings" className="flex items-center gap-2 py-2">
                <FaUserGear className="size-4 text-base-content/70" />
                Settings
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-2 py-2 text-error hover:bg-error/10"
              >
                <FaArrowRightFromBracket className="size-4" />
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};
