import React from 'react';
import { ProtectedRoute, type ProtectedRouteProps } from './ProtectedRoute';

export const AuthGuard: React.FC<ProtectedRouteProps> = (props) => {
  return <ProtectedRoute {...props} />;
};

export default AuthGuard;
