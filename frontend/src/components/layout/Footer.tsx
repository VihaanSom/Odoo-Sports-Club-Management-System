import React from 'react';
import { FaVolleyball, FaHeart } from 'react-icons/fa6';

export const Footer: React.FC = () => {
  return (
    <footer className="footer sm:footer-horizontal bg-base-200 text-base-content border-t border-base-300 p-6 items-center">
      <aside className="grid-flow-col items-center">
        <FaVolleyball className="size-6 text-primary" />
        <p className="text-sm">
          <span className="font-bold">Odoo Sports Club Management</span> &copy; {new Date().getFullYear()} — All rights reserved
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
