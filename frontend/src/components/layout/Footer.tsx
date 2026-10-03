import { FaHeart } from 'react-icons/fa6';
import { Logo } from '@/components/ui';

export const Footer = () => {
  return (
    <footer className="footer sm:footer-horizontal bg-base-200 text-base-content border-t border-base-300 p-6 items-center">
      <aside className="grid-flow-col items-center gap-2">
        <Logo className="size-5" />
        <p className="text-sm">
          <span className="font-bold">Champions Club Management</span> &copy; {new Date().getFullYear()} — All rights reserved
        </p>
      </aside>
      <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end text-xs text-base-content/70">
        <span className="flex items-center gap-1">
          Built with <FaHeart className="size-3 text-error inline" /> for Sports Clubs
        </span>
      </nav>
    </footer>
  );
};
