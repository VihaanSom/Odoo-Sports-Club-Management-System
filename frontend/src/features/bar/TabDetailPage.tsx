import {  useState, useEffect, useCallback  } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  FaTrophy,
  FaArrowLeft,
  FaReceipt,
  FaPlus,
  FaMinus,
  FaClock,
  FaUser,
  FaTable,
} from 'react-icons/fa6';

import toast from 'react-hot-toast';
import { barService } from '@/services/barService';
import { formatPaise } from '@/lib/utils';
import type { BarTab } from '@/types/bar';
import { AddTabItemForm, SettleTabModal } from './components';

export const TabDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tab, setTab] = useState<BarTab | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);

  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);

  const fetchTab = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await barService.getTabById(id);
      setTab(data);
    } catch {
      toast.error('Failed to load tab details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleUpdateQty = async (itemId: number, delta: number) => {
    if (!tab) return;
    setUpdatingItemId(itemId);
    try {
      const updatedTab = await barService.updateItemQty(tab.id, itemId, delta);
      setTab(updatedTab);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update quantity');
    } finally {
      setUpdatingItemId(null);
    }
  };

  useEffect(() => {
    fetchTab();
  }, [fetchTab]);

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (!tab) {
    return (
      <div className="text-center py-20 bg-base-100 border border-base-300 rounded-2xl max-w-lg mx-auto">
        <FaReceipt className="size-12 mx-auto text-base-content/40 mb-3" />
        <h2 className="text-lg font-bold">Tab Not Found</h2>
        <p className="text-xs text-base-content/60 mt-1">The requested bar tab does not exist.</p>
        <button
          type="button"
          onClick={() => navigate('/bar')}
          className="btn btn-primary btn-sm mt-4"
        >
          Back to Floor
        </button>
      </div>
    );
  }

  const isOpen = tab.status === 'open';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/bar/tabs" className="btn btn-ghost btn-xs btn-circle" title="Back to Open Tabs">
              <FaArrowLeft className="size-3.5" />
            </Link>
            <FaTrophy className="size-6 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">
              Tab #{tab.id} — {tab.tableNo}
            </h1>
            <span
              className={`badge badge-sm font-semibold uppercase text-xs ${
                isOpen ? 'badge-warning' : 'badge-success text-white'
              }`}
            >
              {tab.status}
            </span>
          </div>
          <p className="text-xs text-base-content/60 mt-1">
            Opened on {new Date(tab.openedAt).toLocaleString()} by {tab.openedByName || 'Staff'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/bar" className="btn btn-outline btn-sm">
            Back
          </Link>
          {isOpen && (
            <>
              <button
                type="button"
                onClick={() => setIsAddItemOpen(true)}
                className="btn btn-secondary btn-sm gap-1.5"
              >
                <FaPlus className="size-3" /> Add Item
              </button>
              <button
                type="button"
                onClick={() => setIsSettleModalOpen(true)}
                className="btn btn-warning btn-sm"
              >
                Settle
              </button>
            </>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-base-100 border border-base-300 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-base-200 rounded-xl text-primary">
              <FaTable className="size-5" />
            </div>
            <div>
              <span className="text-xs text-base-content/60 font-semibold uppercase">Table</span>
              <div className="text-base font-extrabold">{tab.tableNo}</div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-base-200 rounded-xl text-primary">
              <FaUser className="size-5" />
            </div>
            <div>
              <span className="text-xs text-base-content/60 font-semibold uppercase">Customer</span>
              <div className="text-base font-extrabold truncate">
                {tab.memberName || 'Walk-in Guest'}
              </div>
              {tab.memberTier && (
                <span className="badge badge-xs badge-primary font-semibold mt-0.5">
                  {tab.memberTier} Perk
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-base-200 rounded-xl text-primary">
              <FaClock className="size-5" />
            </div>
            <div>
              <span className="text-xs text-base-content/60 font-semibold uppercase">Status</span>
              <div className="text-base font-extrabold capitalize">
                {isOpen ? 'Active Tab' : 'Settled & Paid'}
              </div>
              {tab.settledAt && (
                <span className="text-[11px] text-base-content/60 block">
                  Settled: {new Date(tab.settledAt).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {tab.notes && (
        <div className="alert bg-base-200 border-base-300 text-xs text-base-content/80 rounded-xl py-2">
          <span>
            <strong>Service Notes:</strong> {tab.notes}
          </span>
        </div>
      )}

      {/* Tab Ordered Items Table */}
      <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-base-300 flex items-center justify-between">
          <h2 className="font-bold text-sm tracking-wide uppercase text-base-content/80">
            Ordered Line Items ({(tab.items || []).length})
          </h2>
          {isOpen && (
            <button
              type="button"
              onClick={() => setIsAddItemOpen(true)}
              className="btn btn-ghost btn-xs text-primary gap-1"
            >
              <FaPlus className="size-2.5" /> Add Food/Drink
            </button>
          )}
        </div>

        {(tab.items || []).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xs text-base-content/60">No items on this tab yet.</p>
            {isOpen && (
              <button
                type="button"
                onClick={() => setIsAddItemOpen(true)}
                className="btn btn-primary btn-xs mt-2"
              >
                Add First Item
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra table-sm">
              <thead>
                <tr className="text-xs text-base-content/60 uppercase bg-base-200/50">
                  <th>Item</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Unit Price</th>
                  <th className="text-right">Subtotal</th>
                  <th className="text-right">Added At</th>
                </tr>
              </thead>
              <tbody>
                {(tab.items || []).map((item) => (
                  <tr key={item.id} className="hover">
                    <td className="font-semibold text-sm">{item.name}</td>
                    <td className="text-center">
                      {isOpen ? (
                        <div className="inline-flex items-center gap-1.5 justify-center">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, -1)}
                            disabled={item.qty <= 1 || updatingItemId === item.id}
                            className="btn btn-ghost btn-xs btn-square border border-base-300 hover:bg-base-200"
                            title="Decrease quantity"
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            <FaMinus className="size-2.5" />
                          </button>
                          <span
                            className="font-mono font-bold text-xs px-2.5 py-1 bg-base-200 rounded min-w-8 text-center select-none cursor-default"
                            aria-label="Item quantity"
                          >
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, 1)}
                            disabled={updatingItemId === item.id}
                            className="btn btn-ghost btn-xs btn-square border border-base-300 hover:bg-base-200"
                            title="Increase quantity"
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            <FaPlus className="size-2.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-mono text-xs">{item.qty}x</span>
                      )}
                    </td>
                    <td className="text-right font-mono text-xs text-base-content/80">
                      {formatPaise(item.unitPricePaise)}
                    </td>

                    <td className="text-right font-mono font-bold text-sm text-base-content">
                      {formatPaise(item.subtotalPaise)}
                    </td>
                    <td className="text-right text-xs text-base-content/60">
                      {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Billing Breakdown */}
        <div className="p-4 bg-base-200/40 border-t border-base-300 flex justify-end">
          <div className="w-full sm:w-72 space-y-2 text-sm">
            <div className="flex justify-between text-xs text-base-content/70">
              <span>Items Subtotal:</span>
              <span className="font-mono">{formatPaise(tab.subtotalPaise)}</span>
            </div>

            {tab.discountPaise > 0 && (
              <div className="flex justify-between text-xs text-success">
                <span>Member Tier Discount:</span>
                <span className="font-mono">- {formatPaise(tab.discountPaise)}</span>
              </div>
            )}

            <div className="flex justify-between font-extrabold text-base pt-2 border-t border-base-300">
              <span>Final Total Due:</span>
              <span className="text-primary font-mono">{formatPaise(tab.totalPaise)}</span>
            </div>

            {tab.paymentMethod && (
              <div className="flex justify-between text-xs text-base-content/60 pt-1">
                <span>Payment Method:</span>
                <span className="capitalize font-semibold">{tab.paymentMethod}</span>
              </div>
            )}

            {isOpen && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettleModalOpen(true)}
                  className="btn btn-warning btn-sm w-full font-bold"
                >
                  Settle Tab Bill
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddTabItemForm
        isOpen={isAddItemOpen}
        tabId={Number(tab.id)}
        onClose={() => setIsAddItemOpen(false)}
        onItemAdded={fetchTab}
      />

      <SettleTabModal
        isOpen={isSettleModalOpen}
        tab={tab}
        onClose={() => setIsSettleModalOpen(false)}
        onSettled={fetchTab}
      />
    </motion.div>
  );
};

export default TabDetailPage;
