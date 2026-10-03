import React from 'react';
import type { RouteObject } from 'react-router-dom';
import { Route } from 'react-router-dom';

// Member Pages
import MemberDetailPage from '../members/MemberDetailPage';

// CRM Leads Pages
import LeadsListPage from '../leads/LeadsListPage';
import LeadDetailPage from '../leads/LeadDetailPage';

// Invoices Pages
import RenewalInvoicesPage from '../invoices/RenewalInvoicesPage';

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
  {
    path: 'invoices',
    element: <RenewalInvoicesPage />,
  },
];

// JSX fragment export for router compatibility if needed
export const crmJsxRoutes = (
  <React.Fragment key="agent-3-crm-routes">
    <Route path="members/:id" element={<MemberDetailPage />} />
    <Route path="leads" element={<LeadsListPage />} />
    <Route path="leads/:id" element={<LeadDetailPage />} />
    <Route path="invoices" element={<RenewalInvoicesPage />} />
  </React.Fragment>
);

export default crmRoutes;
