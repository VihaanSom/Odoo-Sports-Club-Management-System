import {  useEffect  } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './lib/queryClient';
import { useThemeStore } from './stores/themeStore';
import { AppShell, ProtectedRoute } from './components/layout';
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { MembersPage } from './features/members/MembersPage';
import { FacilitiesPage } from './features/facilities/FacilitiesPage';
import { EquipmentPage } from './features/equipment/EquipmentPage';
import { bookingRoutes } from './features/bookings/routes';
import { commerceJsxRoutes } from './features/commerce/routes';
import { crmJsxRoutes } from './features/crm/routes';
import { adminJsxRoutes, publicJsxRoutes } from './features/adminPublic/routes';
import { MembershipsPage } from './features/memberships/MembershipsPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { LoginPage, SignupPage, ForgotPasswordPage } from './features/auth';
import { NotFoundPage } from './features/errors/NotFoundPage';

export const App = () => {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Public Website Portal */}
          {publicJsxRoutes}

          {/* Main AppShell Layout Routes (Protected) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route element={<ProtectedRoute allowedRoles={['admin', 'front_desk']} />}>
                <Route path="members" element={<MembersPage />} />
              </Route>
              <Route path="facilities" element={<FacilitiesPage />} />
              <Route path="equipment" element={<EquipmentPage />} />
              {bookingRoutes}
              {commerceJsxRoutes}
              {crmJsxRoutes}
              {adminJsxRoutes}
              <Route path="memberships" element={<MembershipsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>


      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-base-200 text-base-content border border-base-300 shadow-lg text-sm rounded-xl',
          duration: 3500,
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
