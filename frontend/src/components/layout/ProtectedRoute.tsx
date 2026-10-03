import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types';

export interface ProtectedRouteProps {
  children?: React.ReactNode;
  /** Restrict route to specific roles (e.g. ['admin'] or ['staff', 'admin']) */
  allowedRoles?: UserRole[];
  /** Where to redirect if unauthenticated. Defaults to '/login' */
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectPath = '/login',
}) => {
  const { isAuthenticated, user, token } = useAuthStore();
  const location = useLocation();

  // Check if a token exists in Zustand store or in localStorage
  const hasToken = Boolean(token || localStorage.getItem('auth_token'));

  if (!isAuthenticated && !hasToken) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If roles are restricted and user is loaded, verify authorization
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
