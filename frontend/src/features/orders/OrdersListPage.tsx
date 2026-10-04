import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  FaTrophy,
  FaPlus,
  FaMagnifyingGlass,
  FaRotate,
  FaFolderOpen,
  FaStore,
  FaGlobe,
  FaWineGlass,
} from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { useDebounce, usePagination } from '@/hooks';
import { orderService } from '@/services/orderService';
import { formatPaise } from '@/lib/utils';
import type { Order, OrderType, OrderStatus } from '@/types/orders';

export const OrdersListPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await orderService.getOrders({
        type: typeFilter === 'all' ? undefined : typeFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: debouncedSearch || undefined,
      });
      setOrders(response.data);
    } catch {
      toast.error('Failed to load orders ledger');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const {
    page,
    totalPages,
    startIndex,
    endIndex,
    paginateItems,
    setPage,
  } = usePagination({ totalItems: orders.length, pageSize: 10 });

  const paginatedOrders = paginateItems(orders);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'fulfilled':
        return <span className="badge badge-success text-white badge-xs uppercase font-bold">Fulfilled</span>;
      case 'confirmed':
        return <span className="badge badge-info text-white badge-xs uppercase font-bold">Confirmed</span>;
      case 'pending':
        return <span className="badge badge-warning badge-xs uppercase font-bold">Pending</span>;
      case 'cancelled':
        return <span className="badge badge-ghost badge-xs uppercase font-bold">Cancelled</span>;
      default:
        return <span className="badge badge-xs uppercase">{status}</span>;
    }
  };

  const getTypeIcon = (type: OrderType) => {
    switch (type) {
      case 'in_store':
        return <FaStore className="size-3 text-secondary" title="In-store Purchase" />;
      case 'online':
        return <FaGlobe className="size-3 text-info" title="Online Member Order" />;
      case 'bar':
        return <FaWineGlass className="size-3 text-warning" title="Bar Order" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FaTrophy className="size-6 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">
              Orders Ledger
            </h1>
          </div>
          <p className="text-sm text-base-content/70 mt-1">
            Complete transaction history across Pro Shop in-store, online gear delivery, and bar orders.
          </p>
        </div>

        <Link to="/orders/new" className="btn btn-primary btn-sm gap-2">
          <FaPlus className="size-4" /> New Order (POS)
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="card bg-base-100 border border-base-300 p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Order Type Tabs */}
          <div className="join">
            <button
              type="button"
              className={`btn btn-xs sm:btn-sm join-item ${typeFilter === 'all' ? 'btn-active btn-primary' : 'btn-ghost'}`}
              onClick={() => setTypeFilter('all')}
            >
              All Types
            </button>
            <button
              type="button"
              className={`btn btn-xs sm:btn-sm join-item ${typeFilter === 'in_store' ? 'btn-active btn-primary' : 'btn-ghost'}`}
              onClick={() => setTypeFilter('in_store')}
            >
              In-Store
            </button>
            <button
              type="button"
              className={`btn btn-xs sm:btn-sm join-item ${typeFilter === 'online' ? 'btn-active btn-primary' : 'btn-ghost'}`}
              onClick={() => setTypeFilter('online')}
            >
              Online
            </button>
            <button
              type="button"
              className={`btn btn-xs sm:btn-sm join-item ${typeFilter === 'bar' ? 'btn-active btn-primary' : 'btn-ghost'}`}
              onClick={() => setTypeFilter('bar')}
            >
              Bar
            </button>
          </div>

          {/* Status Filter & Search */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select select-bordered select-xs sm:select-sm text-xs capitalize"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <label className="input input-bordered input-xs sm:input-sm flex items-center gap-2 flex-1 sm:w-60 text-xs">
              <FaMagnifyingGlass className="size-3 shrink-0 text-base-content/40 pointer-events-none" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="grow bg-transparent border-none outline-none text-xs placeholder:text-base-content/50"
              />
            </label>

            <button
              type="button"
              onClick={fetchOrders}
              disabled={loading}
              className="btn btn-ghost btn-xs"
            >
              <FaRotate className={`size-3 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <span className="loading loading-spinner loading-md text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-base-content/60">No orders match the selected filters.</p>
            <Link to="/orders/new" className="btn btn-primary btn-xs mt-3 gap-1">
              <FaPlus className="size-3" /> Place First Order
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra table-sm">
              <thead>
                <tr className="text-xs text-base-content/60 uppercase bg-base-200/50">
                  <th>Order #</th>
                  <th>Type</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total Due</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover">
                    <td className="font-mono font-bold text-xs">
                      <Link
                        to={`/orders/${order.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>

                    <td>
                      <div className="flex items-center gap-1.5 text-xs font-semibold capitalize">
                        {getTypeIcon(order.orderType)}
                        <span className="hidden sm:inline">{order.orderType.replace('_', ' ')}</span>
                      </div>
                    </td>

                    <td>
                      <div>
                        <div className="font-semibold text-xs text-base-content">
                          {order.memberName || 'Walk-in Customer'}
                        </div>
                        {order.memberEmail && (
                          <div className="text-[11px] text-base-content/60 truncate max-w-[160px]">
                            {order.memberEmail}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="text-xs">
                      <span className="font-mono font-semibold">
                        {(order.items || []).reduce((sum, i) => sum + i.qty, 0)}
                      </span>{' '}
                      item(s)
                    </td>

                    <td className="text-xs font-mono font-extrabold text-primary">
                      {formatPaise(order.totalPaise)}
                    </td>

                    <td>
                      <span className="badge badge-ghost badge-xs uppercase font-medium">
                        {order.paymentMethod || 'cash'}
                      </span>
                    </td>

                    <td>{getStatusBadge(order.status)}</td>

                    <td className="text-xs text-base-content/60">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
                    </td>

                    <td className="text-right">
                      <Link
                        to={`/orders/${order.id}`}
                        className="btn btn-ghost btn-xs gap-1"
                      >
                        <FaFolderOpen className="size-3" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DaisyUI Pagination Controls */}
        {orders.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-base-300">
            <span className="text-xs text-base-content/60">
              Showing {startIndex + 1} to {endIndex} of {orders.length} orders
            </span>

            <div className="join">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="join-item btn btn-xs sm:btn-sm btn-outline"
              >
                Previous
              </button>
              <button
                type="button"
                className="join-item btn btn-xs sm:btn-sm btn-outline no-animation pointer-events-none font-mono"
              >
                {page} / {totalPages}
              </button>
              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="join-item btn btn-xs sm:btn-sm btn-outline"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OrdersListPage;
