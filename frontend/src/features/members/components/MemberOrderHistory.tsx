import { FaReceipt, FaWineGlass } from 'react-icons/fa6';
import { usePagination } from '@/hooks';
import { Badge } from '@/components/ui';
import { formatPaise, formatDate } from '@/lib/utils';
import type { MemberHistoryOrder, MemberHistoryBarTab } from '@/types/members';

interface MemberOrderHistoryProps {
  orders: MemberHistoryOrder[];
  barTabs: MemberHistoryBarTab[];
}

export const MemberOrderHistory = ({
  orders,
  barTabs,
}: MemberOrderHistoryProps) => {
  const {
    page: orderPage,
    totalPages: orderTotalPages,
    startIndex: orderStartIndex,
    endIndex: orderEndIndex,
    paginateItems: paginateOrders,
    setPage: setOrderPage,
  } = usePagination({ totalItems: orders.length, pageSize: 10 });

  const paginatedOrders = paginateOrders(orders);

  return (
    <div className="space-y-6">
      {/* Orders Table */}
      <div className="card bg-base-200/50 border border-base-300 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-base-300 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/80 flex items-center gap-2">
            <FaReceipt className="size-4 text-primary" /> Store & POS Orders ({orders.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full text-xs sm:text-sm">
            <thead>
              <tr className="bg-base-300/40">
                <th>Order #</th>
                <th>Channel</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((o) => (
                <tr key={o.id} className="hover:bg-base-300/30">
                  <td className="font-mono font-bold text-xs">{o.orderNumber || `ORD-${o.id}`}</td>
                  <td>
                    <span className="badge badge-xs badge-ghost capitalize py-2">
                      {o.orderType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="text-xs text-base-content/70">
                    {o.itemsCount ? `${o.itemsCount} items` : '—'}
                  </td>
                  <td className="font-semibold text-primary">
                    {formatPaise(o.totalAmountPaise)}
                  </td>
                  <td>
                    <Badge
                      size="xs"
                      variant={
                        o.status === 'fulfilled'
                          ? 'success'
                          : o.status === 'confirmed'
                          ? 'secondary'
                          : o.status === 'pending'
                          ? 'warning'
                          : 'error'
                      }
                      className="capitalize"
                    >
                      {o.status}
                    </Badge>
                  </td>
                  <td className="text-xs text-base-content/70 font-mono">
                    {formatDate(o.createdAt)}
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-base-content/50">
                    No store or POS orders on record.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {orderTotalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-base-300">
            <span className="text-xs text-base-content/60">
              Showing {orderStartIndex + 1} to {orderEndIndex} of {orders.length} orders
            </span>

            <div className="join">
              <button
                type="button"
                onClick={() => setOrderPage(Math.max(1, orderPage - 1))}
                disabled={orderPage <= 1}
                className="join-item btn btn-xs btn-outline"
              >
                Previous
              </button>
              <button
                type="button"
                className="join-item btn btn-xs btn-outline no-animation pointer-events-none font-mono"
              >
                {orderPage} / {orderTotalPages}
              </button>
              <button
                type="button"
                onClick={() => setOrderPage(Math.min(orderTotalPages, orderPage + 1))}
                disabled={orderPage >= orderTotalPages}
                className="join-item btn btn-xs btn-outline"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bar Tabs Table */}
      <div className="card bg-base-200/50 border border-base-300 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-base-300 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/80 flex items-center gap-2">
            <FaWineGlass className="size-4 text-secondary" /> Bar Tabs ({barTabs.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full text-xs sm:text-sm">
            <thead>
              <tr className="bg-base-300/40">
                <th>Tab ID</th>
                <th>Table</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Settled Date</th>
              </tr>
            </thead>
            <tbody>
              {barTabs.map((t) => (
                <tr key={t.id} className="hover:bg-base-300/30">
                  <td className="font-mono font-bold text-xs">{`TAB-${t.id}`}</td>
                  <td className="font-semibold">{t.tableNo}</td>
                  <td className="font-semibold text-primary">
                    {formatPaise(t.totalPaise)}
                  </td>
                  <td>
                    <Badge
                      size="xs"
                      variant={t.status === 'settled' ? 'success' : 'warning'}
                      className="capitalize"
                    >
                      {t.status}
                    </Badge>
                  </td>
                  <td className="text-xs text-base-content/70 font-mono">
                    {t.settledAt ? formatDate(t.settledAt) : 'Active / Open'}
                  </td>
                </tr>
              ))}

              {barTabs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-base-content/50">
                    No bar tabs recorded for this member.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
