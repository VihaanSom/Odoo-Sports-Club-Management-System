import {  useEffect, useState, useCallback  } from 'react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import {
  FaTrophy,
  FaFilter,
  FaTableList,
  FaLayerGroup,
  FaUserPlus,
} from 'react-icons/fa6';
import { Button, Skeleton } from '@/components/ui';
import { SearchBar, FilterToolbar } from '@/components/shared';
import { useDebounce, usePagination } from '@/hooks';
import { leadService } from '@/services/leadService';
import type { Lead, LeadStatus, CreateLeadPayload } from '@/types/leads';
import {
  LeadsTable,
  LeadKanbanBoard,
  LeadCaptureModal,
} from './components';

export const LeadsListPage = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);

  const {
    page,
    totalPages,
    setPage,
    startIndex,
    endIndex,
    paginateItems,
  } = usePagination({ totalItems: leads.length, pageSize: 10 });
  const paginatedLeads = paginateItems(leads);

  const fetchLeads = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await leadService.getAll({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: debouncedSearch || undefined,
      });
      setLeads(data);
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleTransitionStage = async (id: number | string, newStatus: LeadStatus) => {
    // Optimistic UI update: move card immediately for snappy 0ms drag & drop
    let previousLeads: Lead[] = [];
    setLeads((prev) => {
      previousLeads = prev;
      return prev.map((l) => (String(l.id) === String(id) ? { ...l, status: newStatus } : l));
    });

    try {
      const updated = await leadService.transitionStage(id, newStatus);
      setLeads((prev) => prev.map((l) => (String(l.id) === String(id) ? updated : l)));
      toast.success(`Lead moved to ${newStatus}`);
    } catch {
      setLeads(previousLeads);
      toast.error('Failed to update stage');
    }
  };

  const handleCaptureLead = async (data: CreateLeadPayload) => {
    try {
      const created = await leadService.create(data);
      setLeads((prev) => [created, ...prev]);
      toast.success('Lead captured successfully');
      setIsCaptureModalOpen(false);
    } catch {
      toast.error('Failed to create lead');
    }
  };

  const handleAssignLead = async (id: number | string, staffId: number | null) => {
    setLeads((prev) =>
      prev.map((l) => (String(l.id) === String(id) ? { ...l, assignedTo: staffId ?? undefined } : l))
    );
  };

  const statusOptions = [
    { label: 'All Leads', value: 'all' },
    { label: 'New', value: 'new' },
    { label: 'Contacted', value: 'contacted' },
    { label: 'Converted', value: 'converted' },
    { label: 'Lost', value: 'lost' },
  ];

  // Pipeline metrics
  const newCount = leads.filter((l) => l.status === 'new').length;
  const contactedCount = leads.filter((l) => l.status === 'contacted').length;
  const convertedCount = leads.filter((l) => l.status === 'converted').length;
  const conversionRate = leads.length > 0 ? Math.round((convertedCount / leads.length) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3 text-base-content">
            <FaTrophy className="size-7 text-amber-500" /> CRM Leads & Prospects
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            Track enquiries, court trials, and membership conversion pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="join bg-base-200 border border-base-300 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`join-item btn btn-xs gap-1.5 ${
                viewMode === 'board' ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              <FaLayerGroup className="size-3" /> Board
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`join-item btn btn-xs gap-1.5 ${
                viewMode === 'table' ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              <FaTableList className="size-3" /> Table
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<FaUserPlus className="size-3.5" />}
            onClick={() => setIsCaptureModalOpen(true)}
          >
            Submit
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-base-200/50 border border-base-300 p-4 shadow-xs rounded-2xl">
          <span className="text-xs uppercase font-bold text-base-content/50 tracking-wider">
            Total Enquiries
          </span>
          <span className="text-2xl font-black text-base-content mt-1">{leads.length}</span>
        </div>

        <div className="card bg-base-200/50 border border-base-300 p-4 shadow-xs rounded-2xl">
          <span className="text-xs uppercase font-bold text-accent tracking-wider">
            New Enquiries
          </span>
          <span className="text-2xl font-black text-accent mt-1">{newCount}</span>
        </div>

        <div className="card bg-base-200/50 border border-base-300 p-4 shadow-xs rounded-2xl">
          <span className="text-xs uppercase font-bold text-warning tracking-wider">
            Contacted & In Talks
          </span>
          <span className="text-2xl font-black text-warning mt-1">{contactedCount}</span>
        </div>

        <div className="card bg-base-200/50 border border-base-300 p-4 shadow-xs rounded-2xl">
          <span className="text-xs uppercase font-bold text-success tracking-wider">
            Converted ({conversionRate}%)
          </span>
          <span className="text-2xl font-black text-success mt-1">{convertedCount}</span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="card bg-base-200/50 border border-base-300 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by prospect name, email, sport, or notes..."
            />
          </div>

          <div className="flex items-center gap-2">
            <FaFilter className="size-3 text-base-content/40" />
            <FilterToolbar
              options={statusOptions}
              selectedValue={statusFilter}
              onSelect={setStatusFilter}
              label="Stage"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : viewMode === 'board' ? (
        <LeadKanbanBoard
          leads={leads}
          onTransitionStage={handleTransitionStage}
          onAssignLead={handleAssignLead}
        />
      ) : (
        <div className="space-y-3">
          <LeadsTable leads={paginatedLeads} />
          {leads.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-base-100 border border-base-300 rounded-xl">
              <span className="text-xs text-base-content/60">
                Showing {startIndex + 1} to {endIndex} of {leads.length} leads
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
      )}

      {/* Capture Lead Modal */}
      {isCaptureModalOpen && (
        <LeadCaptureModal
          isOpen={isCaptureModalOpen}
          onClose={() => setIsCaptureModalOpen(false)}
          onSubmit={handleCaptureLead}
        />
      )}
    </motion.div>
  );
};

export default LeadsListPage;
