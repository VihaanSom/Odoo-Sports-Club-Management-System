import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FaTrophy, FaPlus, FaFolderOpen, FaRotate } from 'react-icons/fa6';

import toast from 'react-hot-toast';
import { barService } from '@/services/barService';
import { formatPaise } from '@/lib/utils';
import { useDebounce, usePagination } from '@/hooks';
import { SearchBar } from '@/components/shared';
import type { BarTable, BarTab, CreateBarTabPayload, BarTodayEarnings } from '@/types/bar';
import {
  BarTableGrid,
  OpenTabModal,
  AddTabItemForm,
  SettleTabModal,
} from './components';

export const BarTablesPage = () => {
  const [tables, setTables] = useState<BarTable[]>([]);
  const [todayEarnings, setTodayEarnings] = useState<BarTodayEarnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'occupied'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Modal states
  const [isOpenTabModalOpen, setIsOpenTabModalOpen] = useState(false);
  const [selectedTableForOpen, setSelectedTableForOpen] = useState<number | null>(null);

  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [activeTabIdForAdd, setActiveTabIdForAdd] = useState<number | null>(null);

  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [activeTabForSettle, setActiveTabForSettle] = useState<BarTab | null>(null);

  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      const [data, earningsData] = await Promise.all([
        barService.getTables(),
        barService.getTodayEarnings().catch(() => null),
      ]);
      setTables(data);
      if (earningsData) setTodayEarnings(earningsData);
    } catch {
      toast.error('Failed to load bar floor plan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleOpenTabSubmit = async (payload: CreateBarTabPayload) => {
    try {
      const newTab = await barService.openTab(payload);
      toast.success(`Tab #${newTab.id} opened`);
      await fetchTables();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to open tab');
    }
  };

  const handleTriggerOpenTab = (table?: BarTable) => {
    setSelectedTableForOpen(table ? Number(table.id) : null);
    setIsOpenTabModalOpen(true);
  };

  const handleTriggerAddItem = (tabId: number) => {
    setActiveTabIdForAdd(tabId);
    setIsAddItemOpen(true);
  };

  const handleTriggerSettle = (tab: BarTab) => {
    setActiveTabForSettle(tab);
    setIsSettleModalOpen(true);
  };

  // Filtered tables
  const filteredTables = tables.filter((t) => {
    if (filter === 'available' && (!t.isActive || t.activeTab)) return false;
    if (filter === 'occupied' && !t.activeTab) return false;

    const q = debouncedSearch.toLowerCase().trim();
    if (!q) return true;

    return (
      (t.tableNo && t.tableNo.toLowerCase().includes(q)) ||
      (t.label && t.label.toLowerCase().includes(q)) ||
      (t.activeTab?.memberName && t.activeTab.memberName.toLowerCase().includes(q)) ||
      (t.activeTab?.id && String(t.activeTab.id).includes(q))
    );
  });

  const {
    page,
    totalPages,
    setPage,
    startIndex,
    endIndex,
    paginateItems,
  } = usePagination({ totalItems: filteredTables.length, pageSize: 10 });
  const paginatedTables = paginateItems(filteredTables);

  // KPI Calculations
  const occupiedCount = tables.filter((t) => Boolean(t.activeTab)).length;
  const availableCount = tables.filter((t) => t.isActive && !t.activeTab).length;
  const runningRevenuePaise = tables.reduce((acc, curr) => {
    return acc + (curr.activeTab?.totalPaise || 0);
  }, 0);

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
            <FaTrophy className="size-6 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">
              Champions Bar POS & Floor
            </h1>
          </div>
          <p className="text-sm text-base-content/70 mt-1">
            Real-time floor occupancy, active table tabs, drink orders, and tab settlement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/bar/tabs"
            className="btn btn-outline btn-sm gap-2"
          >
            <FaFolderOpen className="size-4" /> Open Tabs ({occupiedCount})
          </Link>
          <button
            type="button"
            onClick={() => handleTriggerOpenTab()}
            className="btn btn-primary btn-sm gap-2"
          >
            <FaPlus className="size-4" /> Open Tab
          </button>
        </div>
      </div>

      {/* KPI Snapshot Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card bg-base-100 border border-base-300 p-4 shadow-sm">
          <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
            Total Tables
          </span>
          <div className="text-2xl font-extrabold mt-1">{tables.length}</div>
          <span className="text-[11px] text-base-content/50 mt-1">Full club bar capacity</span>
        </div>

        <div className="card bg-base-100 border border-base-300 p-4 shadow-sm">
          <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
            Occupied Tables
          </span>
          <div className="text-2xl font-extrabold text-warning mt-1">{occupiedCount}</div>
          <span className="text-[11px] text-warning/80 mt-1">Running bar bills</span>
        </div>

        <div className="card bg-base-100 border border-base-300 p-4 shadow-sm">
          <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
            Available Tables
          </span>
          <div className="text-2xl font-extrabold text-success mt-1">{availableCount}</div>
          <span className="text-[11px] text-success/80 mt-1">Ready for seating</span>
        </div>

        <div className="card bg-base-100 border border-base-300 p-4 shadow-sm">
          <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
            Active Tab Balance
          </span>
          <div className="text-2xl font-extrabold text-primary mt-1">
            {formatPaise(runningRevenuePaise)}
          </div>
          <span className="text-[11px] text-base-content/50 mt-1">Unsettled bar charges</span>
        </div>

        <div className="card bg-base-100 border border-base-300 p-4 shadow-sm col-span-2 lg:col-span-1 bg-gradient-to-br from-success/5 to-base-100">
          <span className="text-xs font-semibold text-success uppercase tracking-wider flex items-center justify-between">
            <span>Total Earnings Today</span>
            <span className="badge badge-xs badge-success badge-outline">Settled</span>
          </span>
          <div className="text-2xl font-extrabold text-success mt-1">
            {formatPaise(todayEarnings?.totalPaise ?? 0)}
          </div>
          <span className="text-[11px] text-base-content/60 mt-1">
            {todayEarnings ? `${todayEarnings.settledTabsCount} settled tab${todayEarnings.settledTabsCount === 1 ? '' : 's'}` : 'Loading today earnings...'}
          </span>
        </div>
      </div>

      {/* Filter Tabs, Search & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-base-300 pb-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="join">
            <button
              type="button"
              className={`btn btn-sm join-item ${filter === 'all' ? 'btn-active btn-primary' : 'btn-ghost'}`}
              onClick={() => {
                setFilter('all');
                setPage(1);
              }}
            >
              All Tables ({tables.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm join-item ${filter === 'available' ? 'btn-active btn-primary' : 'btn-ghost'}`}
              onClick={() => {
                setFilter('available');
                setPage(1);
              }}
            >
              Available ({availableCount})
            </button>
            <button
              type="button"
              className={`btn btn-sm join-item ${filter === 'occupied' ? 'btn-active btn-primary' : 'btn-ghost'}`}
              onClick={() => {
                setFilter('occupied');
                setPage(1);
              }}
            >
              Occupied ({occupiedCount})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-full sm:w-60">
            <SearchBar
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setPage(1);
              }}
              placeholder="Search table, guest..."
            />
          </div>
          <button
            type="button"
            onClick={fetchTables}
            disabled={loading}
            className="btn btn-ghost btn-sm gap-1"
            title="Refresh floor plan"
          >
            <FaRotate className={`size-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <span className="loading loading-spinner loading-md text-primary" />
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="text-center py-16 bg-base-100 border border-base-300 rounded-2xl">
          <p className="text-base-content/60 text-sm">
            {tables.length === 0
              ? 'No bar tables have been created yet.'
              : 'No tables match the selected filter or search.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <BarTableGrid
            tables={paginatedTables}
            onOpenTab={handleTriggerOpenTab}
            onAddItem={handleTriggerAddItem}
            onSettle={handleTriggerSettle}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-base-300 bg-base-100 rounded-xl">
              <span className="text-xs text-base-content/60">
                Showing {startIndex}–{endIndex} of {filteredTables.length} tables
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

      {/* Modals */}
      <OpenTabModal
        isOpen={isOpenTabModalOpen}
        tables={tables}
        preselectedTableId={selectedTableForOpen}
        onClose={() => setIsOpenTabModalOpen(false)}
        onSubmit={handleOpenTabSubmit}
      />

      {activeTabIdForAdd && (
        <AddTabItemForm
          isOpen={isAddItemOpen}
          tabId={activeTabIdForAdd}
          onClose={() => setIsAddItemOpen(false)}
          onItemAdded={fetchTables}
        />
      )}

      <SettleTabModal
        isOpen={isSettleModalOpen}
        tab={activeTabForSettle}
        onClose={() => setIsSettleModalOpen(false)}
        onSettled={fetchTables}
      />
    </motion.div>
  );
};

export default BarTablesPage;
