/**
 * @deprecated Decommissioned per Bug #18 in Champions Club Integration Plan Phase 1.
 * The /invoices route has been completely removed from navigation and CRM routes.
 */
import { Navigate } from 'react-router-dom';

export const RenewalInvoicesPage = () => {
  return <Navigate to="/" replace />;
};

export default RenewalInvoicesPage;
