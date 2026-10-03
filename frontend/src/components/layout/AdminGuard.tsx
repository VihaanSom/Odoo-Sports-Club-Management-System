import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export const AdminGuard = () => {
  const user = useAuthStore((s) => s.user);

  if (user && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
