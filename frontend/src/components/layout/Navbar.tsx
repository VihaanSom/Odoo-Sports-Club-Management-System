import { Link } from 'react-router-dom';
import {
  FaBars,
  FaArrowRightFromBracket,
  FaChevronDown,
} from 'react-icons/fa6';
import { Logo } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar = ({ onToggleSidebar }: NavbarProps) => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    (document.activeElement as HTMLElement)?.blur();
    try {
      await authService.logout();
    } catch {
      // Ignore if session already invalid
    } finally {
      logout();
    }
  };

  const displayName =
    user?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.email?.split('@')[0] ||
    'Club Member';

  const formatRole = (role?: string) => {
    if (!role) return 'Member';
    switch (role.toLowerCase()) {
      case 'admin':
        return 'Admin';
      case 'front_desk':
        return 'Front Desk';
      case 'bar':
        return 'Bar Staff';
      case 'shop':
        return 'Shop Staff';
      case 'member':
        return 'Member';
      default:
        return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'U';
  };

  const avatarUrl = user?.avatarUrl || user?.photoUrl;
  const initials = getInitials(displayName);
  const roleName = formatRole(user?.role);

  return (
    <header className="navbar bg-base-200/80 backdrop-blur-md sticky top-0 z-30 border-b border-base-300 px-4 lg:px-6 h-16 min-h-16 justify-between">
      {/* Brand & Mobile Toggle */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {onToggleSidebar && (
          <button
            type="button"
            className="btn btn-ghost btn-square btn-sm sm:btn-md lg:hidden"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar menu"
          >
            <FaBars className="size-5" />
          </button>
        )}
        <Link to="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight group">
          <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200">
            <Logo className="size-5" />
          </div>
          <span className="font-bold text-black text-lg">
            Champions Club
          </span>
        </Link>
      </div>

      {/* User Profile Pill & Dropdown */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="dropdown dropdown-end">
          <button
            tabIndex={0}
            type="button"
            className="group flex items-center gap-2 sm:gap-3 p-1 sm:py-1.5 sm:px-2.5 rounded-full sm:rounded-2xl border border-base-300/80 bg-base-100/70 hover:bg-base-100 hover:border-base-300 hover:shadow-xs transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="User profile menu"
          >
            {/* Avatar */}
            <div className="shrink-0">
              <div className="size-9 rounded-full ring-2 ring-primary/25 ring-offset-1 ring-offset-base-100 overflow-hidden flex items-center justify-center bg-base-300 shadow-2xs group-hover:ring-primary/40 transition-all">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-primary to-blue-600 text-white font-bold text-xs flex items-center justify-center tracking-wider select-none">
                    {initials}
                  </div>
                )}
              </div>
            </div>

            {/* Username and Role displayed directly in Header */}
            <div className="flex flex-col text-left leading-tight pr-0.5">
              <span className="font-semibold text-xs sm:text-sm text-base-content group-hover:text-primary transition-colors max-w-[110px] xs:max-w-[140px] sm:max-w-[180px] truncate">
                {displayName}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="badge badge-xs font-bold uppercase tracking-wider text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20">
                  {roleName}
                </span>
                {user?.tier && (
                  <span className="hidden xs:inline-flex badge badge-xs font-semibold text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-700 border border-amber-500/20">
                    {user.tier}
                  </span>
                )}
              </div>
            </div>

            {/* Dropdown Chevron */}
            <FaChevronDown className="size-3 text-base-content/40 group-hover:text-base-content/70 transition-transform duration-200 group-focus:rotate-180 mr-1 shrink-0" />
          </button>

          {/* Dropdown Content: Only Logout Option */}
          <ul
            tabIndex={0}
            className="dropdown-content menu z-50 mt-2 p-1.5 shadow-xl bg-base-100 rounded-2xl border border-base-200/90 w-44 sm:w-48"
          >
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-error hover:bg-error/10 active:bg-error/20 rounded-xl transition-colors w-full cursor-pointer"
              >
                <FaArrowRightFromBracket className="size-4 shrink-0 text-error" />
                <span>Sign Out</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};
