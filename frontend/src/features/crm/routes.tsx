import React from 'react';
import type { RouteObject } from 'react-router-dom';
import { Route } from 'react-router-dom';

// Member Pages
import MemberDetailPage from '../members/MemberDetailPage';

// CRM Leads Pages
import LeadsListPage from '../leads/LeadsListPage';
import LeadDetailPage from '../leads/LeadDetailPage';

export const crmRoutes: RouteObject[] = [
  {
    path: 'members/:id',
    element: <MemberDetailPage />,
  },
  {
    path: 'leads',
    element: <LeadsListPage />,
  },
  {
    path: 'leads/:id',
    element: <LeadDetailPage />,
  },
];

import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

// JSX fragment export for router compatibility if needed
export const crmJsxRoutes = (
  <React.Fragment key="agent-3-crm-routes">
    <Route element={<ProtectedRoute allowedRoles={['admin', 'front_desk']} />}>
      <Route path="members/:id" element={<MemberDetailPage />} />
      <Route path="leads" element={<LeadsListPage />} />
      <Route path="leads/:id" element={<LeadDetailPage />} />
    </Route>
  </React.Fragment>
);

export default crmRoutes;
