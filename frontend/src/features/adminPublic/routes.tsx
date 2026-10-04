import React from 'react';
import type { RouteObject } from 'react-router-dom';
import { Route } from 'react-router-dom';

// Staff & Shifts Pages
import StaffListPage from '../staff/StaffListPage';
import StaffDetailPage from '../staff/StaffDetailPage';
import ShiftsPage from '../staff/ShiftsPage';
import LeavePage from '../staff/LeavePage';

// Reports Hub Page
import ReportsHubPage from '../reports/ReportsHubPage';

// Payments Ledger Page
import PaymentsPage from '../payments/PaymentsPage';

// Public Portal Layout & Pages
import PublicWebsiteLayout from '../public/PublicWebsiteLayout';
import PublicLandingPage from '../public/PublicLandingPage';
import PublicPlansPage from '../public/PublicPlansPage';
import PublicFacilitiesPage from '../public/PublicFacilitiesPage';
import PublicShopPage from '../public/PublicShopPage';
import PublicContactPage from '../public/PublicContactPage';
import PublicTrialPage from '../public/PublicTrialPage';

export const adminPublicRoutes: RouteObject[] = [
  // Admin Staff & HR
  {
    path: 'staff',
    element: <StaffListPage />,
  },
  {
    path: 'staff/:id',
    element: <StaffDetailPage />,
  },
  {
    path: 'staff/shifts',
    element: <ShiftsPage />,
  },
  {
    path: 'staff/leave',
    element: <LeavePage />,
  },

  // Admin Reports & Analytics
  {
    path: 'reports',
    element: <ReportsHubPage />,
  },

  // Admin Unified Payments Ledger
  {
    path: 'payments',
    element: <PaymentsPage />,
  },

  // Public Portal Website
  {
    path: 'public',
    element: <PublicWebsiteLayout />,
    children: [
      {
        index: true,
        element: <PublicLandingPage />,
      },
      {
        path: 'plans',
        element: <PublicPlansPage />,
      },
      {
        path: 'facilities',
        element: <PublicFacilitiesPage />,
      },
      {
        path: 'shop',
        element: <PublicShopPage />,
      },
      {
        path: 'contact',
        element: <PublicContactPage />,
      },
      {
        path: 'trial',
        element: <PublicTrialPage />,
      },
    ],
  },
];

import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

// Admin routes for AppShell layout
export const adminJsxRoutes = (
  <React.Fragment key="agent-4-admin-routes">
    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
      <Route path="staff" element={<StaffListPage />} />
      <Route path="staff/:id" element={<StaffDetailPage />} />
      <Route path="staff/shifts" element={<ShiftsPage />} />
      <Route path="staff/leave" element={<LeavePage />} />
      <Route path="reports" element={<ReportsHubPage />} />
      <Route path="payments" element={<PaymentsPage />} />
    </Route>
  </React.Fragment>
);

// Public portal routes for top-level layout
export const publicJsxRoutes = (
  <Route key="agent-4-public-routes" path="/public" element={<PublicWebsiteLayout />}>
    <Route index element={<PublicLandingPage />} />
    <Route path="plans" element={<PublicPlansPage />} />
    <Route path="facilities" element={<PublicFacilitiesPage />} />
    <Route path="shop" element={<PublicShopPage />} />
    <Route path="contact" element={<PublicContactPage />} />
    <Route path="trial" element={<PublicTrialPage />} />
  </Route>
);

// Combined JSX export
export const adminPublicJsxRoutes = (
  <React.Fragment key="agent-4-combined-routes">
    {adminJsxRoutes}
    {publicJsxRoutes}
  </React.Fragment>
);

export default adminPublicRoutes;
