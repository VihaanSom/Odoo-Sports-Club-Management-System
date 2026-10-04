import {  useState, useEffect, useCallback  } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  FaTrophy,
  FaArrowLeft,
  FaReceipt,
  FaPlus,
  FaRotate,
  FaFolderOpen,
} from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { barService } from '@/services/barService';
import { formatPaise } from '@/lib/utils';
import { useDebounce, usePagination } from '@/hooks';
import { SearchBar } from '@/components/shared';

import type { BarTab, BarTable, CreateBarTabPayload } from '@/types/bar';
import { OpenTabModal, AddTabItemForm, SettleTabModal } from './components';

export const OpenTabsPage = () => {
  const [tabs, setTabs] = useState<BarTab[]>([]);
  const [tables, setTables] = useState<BarTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Modals
  const [isOpenTabModalOpen, setIsOpenTabModalOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [activeTabIdForAdd, setActiveTabIdForAdd] = useState<number | null>(null);

  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [activeTabForSettle, setActiveTabForSettle] = useState<BarTab | null>(null);

  const filteredTabs = tabs.filter((t) => {
    const q = debouncedSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      (t.tableNo && t.tableNo.toLowerCase().includes(q)) ||
      (t.memberName && t.memberName.toLowerCase().includes(q)) ||
      String(t.id).includes(q)
    );
  });

  const {
    page,
    totalPages,
    setPage,
    startIndex,
    endIndex,
    paginateItems,
  } = usePagination({ totalItems: filteredTabs.length, pageSize: 10 });
  const paginatedTabs = paginateItems(filteredTabs);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tabsData, tablesData] = await Promise.all([
        barService.getOpenTabs(),
        barService.getTables(),
      ]);
      setTabs(tabsData);
      setTables(tablesData);
    } catch {
      toast.error('Failed to load open bar tabs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenTabSubmit = async (payload: CreateBarTabPayload) => {
    try {
      const newTab = await barService.openTab(payload);
      toast.success(`Tab #${newTab.id} opened`);
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to open tab');
    }
  };

  const handleTriggerAddItem = (tabId: number) => {
    setActiveTabIdForAdd(tabId);
    setIsAddItemOpen(true);
  };

  const handleTriggerSettle = (tab: BarTab) => {
    setActiveTabForSettle(tab);
    setIsSettleModalOpen(true);
  };

  const totalRunningBalancePaise = tabs.reduce((sum, t) => sum + t.totalPaise, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/bar" className="btn btn-ghost btn-xs btn-circle" title="Back to floor plan">
              <FaArrowLeft className="size-3.5" />
            </Link>
            <FaTrophy className="size-6 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">
              Active Bar Tabs
            </h1>
          </div>
          <p className="text-sm text-base-content/70 mt-1">
            Running tab accounts, real-time item additions, member discounts, and checkout.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/bar" className="btn btn-outline btn-sm">
            Back to Floor
          </Link>
          <button
            type="button"
            onClick={() => setIsOpenTabModalOpen(true)}
            className="btn btn-primary btn-sm gap-2"
          >
            <FaPlus className="size-4" /> Open Tab
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="card bg-base-100 border border-base-300 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <FaReceipt className="size-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-base-content">
              {tabs.length} Running Tab{tabs.length === 1 ? '' : 's'} Active
            </div>
            <div className="text-xs text-base-content/60">
              Auto-updating with kitchen and bar additions
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-xs font-semibold text-base-content/60 uppercase">
            Total Outstanding
          </div>
          <div className="text-2xl font-extrabold text-primary">
            {formatPaise(totalRunningBalancePaise)}
          </div>
        </div>
      </div>

      {/* Tabs Table */}
      <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-base-300 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-sm tracking-wide uppercase text-base-content/80">
              Open Tabs Register
            </h2>
            <span className="badge badge-sm badge-neutral">{filteredTabs.length} active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-full sm:w-64">
              <SearchBar
                value={searchQuery}
                onChange={(val) => {
                  setSearchQuery(val);
                  setPage(1);
                }}
                placeholder="Search table, member, tab #..."
              />
            </div>
            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="btn btn-ghost btn-sm gap-1"
            >
              <FaRotate className={`size-3 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center items-center">
            <span className="loading loading-spinner loading-md text-primary" />
          </div>
        ) : filteredTabs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-base-content/60">
              {tabs.length === 0
                ? 'No open bar tabs currently active.'
                : 'No open tabs match your search query.'}
            </p>
            {tabs.length === 0 && (
              <button
                type="button"
                onClick={() => setIsOpenTabModalOpen(true)}
                className="btn btn-primary btn-xs mt-3 gap-1"
              >
                <FaPlus className="size-3" /> Open First Tab
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra table-sm">
              <thead>
                <tr className="text-xs text-base-content/60 uppercase bg-base-200/50">
                  <th>Tab #</th>
                  <th>Table</th>
                  <th>Customer / Member</th>
                  <th>Items Count</th>
                  <th>Opened At</th>
                  <th>Subtotal</th>
                  <th>Discount</th>
                  <th>Total Due</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTabs.map((tab) => (
                  <tr key={tab.id} className="hover">
                    <td className="font-mono font-semibold text-xs">#{tab.id}</td>
                    <td>
                      <span className="badge badge-sm badge-outline font-bold">
                        {tab.tableNo}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div className="font-semibold text-sm">
                          {tab.memberName || 'Walk-in Guest'}
                        </div>
                        {tab.memberTier && (
                          <span className="badge badge-xs badge-primary mt-0.5">
                            {tab.memberTier} Member
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-xs font-medium">
                      {tab.items.length} item{tab.items.length === 1 ? '' : 's'}
                    </td>
                    <td className="text-xs text-base-content/70">
                      {tab.openedAt ? new Date(tab.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="text-xs font-mono text-base-content/80">
                      {formatPaise(tab.subtotalPaise)}
                    </td>
                    <td className="text-xs font-mono text-success">
                      {tab.discountPaise > 0 ? `- ${formatPaise(tab.discountPaise)}` : '—'}
                    </td>
                    <td className="text-sm font-mono font-extrabold text-primary">
                      {formatPaise(tab.totalPaise)}
                    </td>
                    <td className="text-right space-x-1">
                      <Link
                        to={`/bar/tabs/${tab.id}`}
                        className="btn btn-ghost btn-xs gap-1"
                      >
                        <FaFolderOpen className="size-3" /> View
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleTriggerAddItem(tab.id)}
                        className="btn btn-secondary btn-xs gap-1"
                      >
                        <FaPlus className="size-2.5" /> Add
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTriggerSettle(tab)}
                        className="btn btn-warning btn-xs"
                      >
                        Settle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-base-300">
                <span className="text-xs text-base-content/60">
                  Showing {startIndex}–{endIndex} of {filteredTabs.length} tabs
                </span>
                <div className="join">
                  <button
                    className="join-item btn btn-xs"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    «
                  </button>
                  <button className="join-item btn btn-xs btn-active">
                    Page {page} of {totalPages}
                  </button>
                  <button
                    className="join-item btn btn-xs"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <OpenTabModal
        isOpen={isOpenTabModalOpen}
        tables={tables}
        onClose={() => setIsOpenTabModalOpen(false)}
        onSubmit={handleOpenTabSubmit}
      />

      {activeTabIdForAdd && (
        <AddTabItemForm
          isOpen={isAddItemOpen}
          tabId={activeTabIdForAdd}
          onClose={() => setIsAddItemOpen(false)}
          onItemAdded={fetchData}
        />
      )}

      <SettleTabModal
        isOpen={isSettleModalOpen}
        tab={activeTabForSettle}
        onClose={() => setIsSettleModalOpen(false)}
        onSettled={fetchData}
      />
    </motion.div>
  );
};

export default OpenTabsPage;
