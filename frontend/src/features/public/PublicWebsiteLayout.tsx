import { Outlet, Link, useLocation } from 'react-router-dom';
import { FaTrophy, FaArrowRight } from 'react-icons/fa6';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Button } from '@/components/ui/Button';

export const PublicWebsiteLayout = () => {
  const location = useLocation();

  const navLinks = [
    { label: 'Overview', path: '/public' },
    { label: 'Plans', path: '/public/plans' },
    { label: 'Facilities', path: '/public/facilities' },
    { label: 'Shop', path: '/public/shop' },
    { label: 'Court Slots', path: '/public/slots' },
    { label: 'Contact', path: '/public/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/public') {
      return location.pathname === '/public' || location.pathname === '/public/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col text-base-content selection:bg-amber-500 selection:text-black">
      {/* Top Banner Notice */}
      <div className="bg-primary text-primary-content text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="badge badge-xs badge-neutral">Notice</span>
        <span>Spring Championship Trials Open. Book free 1-day pass today!</span>
        <Link to="/public/trial" className="underline font-bold hover:opacity-80">
          Claim Pass
        </Link>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-base-100/90 backdrop-blur-md border-b border-base-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/public" className="flex items-center gap-2.5 group">
            <div className="size-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform shadow-xs">
              <FaTrophy className="size-5 text-amber-500" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight font-serif uppercase">
                Champions Club
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-base-content/50">
                Ahmedabad • Gujarat
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive(link.path)
                    ? 'bg-base-200 text-primary font-bold'
                    : 'text-base-content/70 hover:text-base-content hover:bg-base-200/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions: Trial, Login, Theme */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Link to="/public/trial" className="hidden sm:inline-block">
              <Button size="xs" variant="primary" rightIcon={<FaArrowRight className="size-3" />}>
                Free Pass
              </Button>
            </Link>
            <Link to="/login">
              <Button size="xs" variant="outline">
                Member Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 pb-12">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicWebsiteLayout;
