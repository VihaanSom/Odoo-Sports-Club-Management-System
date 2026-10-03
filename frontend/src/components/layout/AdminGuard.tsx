import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export const AdminGuard: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  if (user && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
