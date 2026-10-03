import { Outlet } from 'react-router-dom';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-base-200/40 flex flex-col justify-center items-center p-4 relative">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <Outlet />
    </div>
  );
};
