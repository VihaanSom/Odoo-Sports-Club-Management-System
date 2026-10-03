import {  useState, useEffect, useCallback  } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  FaTrophy,
  FaArrowLeft,
  FaReceipt,
  FaStore,
  FaGlobe,
  FaWineGlass,
  FaDumbbell,
  FaUtensils,
  FaLocationDot,
} from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { orderService } from '@/services/orderService';
import { formatPaise } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types/orders';
import { OrderStatusUpdate } from './components';

export const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await orderService.getOrderById(id);
      setOrder(data);
    } catch {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 bg-base-100 border border-base-300 rounded-2xl max-w-lg mx-auto">
        <FaReceipt className="size-12 mx-auto text-base-content/40 mb-3" />
        <h2 className="text-lg font-bold">Order Not Found</h2>
        <p className="text-xs text-base-content/60 mt-1">The requested order does not exist.</p>
        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="btn btn-primary btn-sm mt-4"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'fulfilled':
        return <span className="badge badge-success text-white badge-sm uppercase font-bold">Fulfilled</span>;
      case 'confirmed':
        return <span className="badge badge-info text-white badge-sm uppercase font-bold">Confirmed</span>;
      case 'pending':
        return <span className="badge badge-warning badge-sm uppercase font-bold">Pending</span>;
      case 'cancelled':
        return <span className="badge badge-ghost badge-sm uppercase font-bold">Cancelled</span>;
      default:
        return <span className="badge badge-sm uppercase">{status}</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/orders" className="btn btn-ghost btn-xs btn-circle" title="Back to orders">
              <FaArrowLeft className="size-3.5" />
            </Link>
            <FaTrophy className="size-6 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">
              {order.orderNumber}
            </h1>
            {getStatusBadge(order.status)}
          </div>
          <p className="text-xs text-base-content/60 mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()} &bull; Order ID #{order.id}
          </p>
        </div>

        <Link to="/orders" className="btn btn-outline btn-sm">
          Back
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-base-100 border border-base-300 p-4 shadow-sm">
          <span className="text-xs font-semibold text-base-content/60 uppercase">Customer</span>
          <div className="font-extrabold text-sm mt-1">{order.memberName || 'Walk-in'}</div>
          {order.memberEmail && (
            <div className="text-xs text-base-content/60 mt-0.5">{order.memberEmail}</div>
          )}
          {order.memberPhone && (
            <div className="text-xs text-base-content/60 font-mono">{order.memberPhone}</div>
          )}
        </div>

        <div className="card bg-base-100 border border-base-300 p-4 shadow-sm">
          <span className="text-xs font-semibold text-base-content/60 uppercase">Order Type</span>
          <div className="font-extrabold text-sm mt-1 capitalize flex items-center gap-2">
            {order.orderType === 'in_store' && <FaStore className="size-4 text-secondary" />}
            {order.orderType === 'online' && <FaGlobe className="size-4 text-info" />}
            {order.orderType === 'bar' && <FaWineGlass className="size-4 text-warning" />}
            {order.orderType.replace('_', ' ')}
          </div>
          <div className="text-xs text-base-content/60 mt-0.5">
            Payment: <span className="uppercase font-semibold">{order.paymentMethod || 'cash'}</span>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 p-4 shadow-sm">
          <span className="text-xs font-semibold text-base-content/60 uppercase">Total Settled</span>
          <div className="text-2xl font-extrabold text-primary font-mono mt-1">
            {formatPaise(order.totalPaise)}
          </div>
          <span className="text-[11px] text-base-content/50">
            {order.items.reduce((acc, i) => acc + i.qty, 0)} total line items
          </span>
        </div>
      </div>

      {/* Online Delivery Address banner */}
      {order.deliveryAddress && (
        <div className="alert bg-base-200 border-base-300 rounded-xl text-xs flex items-center gap-2">
          <FaLocationDot className="size-4 text-primary shrink-0" />
          <div>
            <span className="font-bold">Delivery Address:</span> {order.deliveryAddress}
          </div>
        </div>
      )}

      {/* Status Lifecycle Updater */}
      <OrderStatusUpdate
        orderId={order.id}
        currentStatus={order.status}
        onStatusUpdated={fetchOrder}
      />

      {/* Line Items Table */}
      <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-base-300">
          <h2 className="font-bold text-sm tracking-wide uppercase text-base-content/80">
            Order Items Breakdown
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra table-sm">
            <thead>
              <tr className="text-xs text-base-content/60 uppercase bg-base-200/50">
                <th>Product</th>
                <th>Type</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Unit Price</th>
                <th className="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="hover">
                  <td>
                    <div className="flex items-center gap-3">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="size-10 rounded-lg object-cover border border-base-300"
                        />
                      ) : (
                        <div className="size-10 rounded-lg bg-base-200 flex items-center justify-center text-base-content/40">
                          {item.itemType === 'equipment' ? (
                            <FaDumbbell className="size-4" />
                          ) : (
                            <FaUtensils className="size-4" />
                          )}
                        </div>
                      )}
                      <span className="font-semibold text-sm">{item.name}</span>
                    </div>
                  </td>

                  <td>
                    <span className="badge badge-ghost badge-xs uppercase font-medium">
                      {item.itemType}
                    </span>
                  </td>

                  <td className="text-center font-mono text-xs">{item.qty}x</td>

                  <td className="text-right font-mono text-xs text-base-content/80">
                    {formatPaise(item.unitPricePaise)}
                  </td>

                  <td className="text-right font-mono font-bold text-sm">
                    {formatPaise(item.subtotalPaise)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="p-4 bg-base-200/40 border-t border-base-300 flex justify-end">
          <div className="w-full sm:w-72 space-y-2 text-sm">
            <div className="flex justify-between text-xs text-base-content/70">
              <span>Subtotal:</span>
              <span className="font-mono">{formatPaise(order.subtotalPaise)}</span>
            </div>

            {order.discountPaise > 0 && (
              <div className="flex justify-between text-xs text-success">
                <span>Member Discount:</span>
                <span className="font-mono">- {formatPaise(order.discountPaise)}</span>
              </div>
            )}

            <div className="flex justify-between font-extrabold text-base pt-2 border-t border-base-300">
              <span>Final Total:</span>
              <span className="text-primary font-mono">{formatPaise(order.totalPaise)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderDetailPage;
