import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { FaUsers, FaUserPlus, FaChevronLeft, FaChevronRight, FaRotate } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { useDebounce } from '@/hooks';
import { SearchBar, FilterToolbar } from '@/components/shared';
import { Button, Skeleton } from '@/components/ui';
import { memberService } from '@/services/memberService';
import type { MemberDetail, CreateMemberPayload } from '@/types/members';
import { MembersTable, MemberFormModal } from './components';

export const MembersPage = () => {
  const [members, setMembers] = useState<MemberDetail[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const planFilterOptions = [
    { label: 'All Plans', value: 'all' },
    { label: 'Gold', value: 'Gold' },
    { label: 'Silver', value: 'Silver' },
    { label: 'Junior', value: 'Junior' },
  ];

  const statusFilterOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Expired', value: 'expired' },
  ];

  const fetchMembers = useCallback(async (pageToFetch = pagination.page) => {
    try {
      setIsLoading(true);
      const res = await memberService.getAll({
        page: pageToFetch,
        pageSize: pagination.pageSize,
        search: debouncedSearch.trim() || undefined,
        tier: selectedPlanFilter !== 'all' ? selectedPlanFilter : undefined,
        status: selectedStatusFilter !== 'all' ? selectedStatusFilter : undefined,
      });

      setMembers(res.data || res);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to fetch members list';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.pageSize, debouncedSearch, selectedPlanFilter, selectedStatusFilter]);

  // Refetch when filters or search change (reset to page 1)
  useEffect(() => {
    fetchMembers(1);
  }, [debouncedSearch, selectedPlanFilter, selectedStatusFilter]);

  const handleCreateMember = async (payload: CreateMemberPayload) => {
    try {
      const created = await memberService.create(payload);
      toast.success(`Member registered successfully: #${created.id} ${created.name}`);
      setIsCreateModalOpen(false);
      fetchMembers(1);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to create member';
      toast.error(msg);
      throw err;
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
    fetchMembers(newPage);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <FaUsers className="size-7 text-primary" /> Members Directory
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            Manage club registrations, membership tiers, and contacts synchronized with the club database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchMembers(pagination.page)}
            leftIcon={<FaRotate className="size-3.5" />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<FaUserPlus className="size-3.5" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Register Member
          </Button>
        </div>
      </div>

      {/* Filters and search */}
      <div className="card bg-base-200/50 border border-base-300 p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          <div className="w-full lg:max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, email, or phone..."
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full lg:w-auto items-center justify-end">
            <FilterToolbar
              options={planFilterOptions}
              selectedValue={selectedPlanFilter}
              onSelect={setSelectedPlanFilter}
              label="Tier"
            />

            <FilterToolbar
              options={statusFilterOptions}
              selectedValue={selectedStatusFilter}
              onSelect={setSelectedStatusFilter}
              label="Status"
            />
          </div>
        </div>
      </div>

      {/* Members Table */}
      {isLoading ? (
        <div className="card bg-base-200/50 border border-base-300 p-6 space-y-3">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ) : (
        <>
          <MembersTable members={members} />

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-2">
              <span className="text-xs text-base-content/70">
                Showing Page <span className="font-bold text-base-content">{pagination.page}</span> of{' '}
                <span className="font-bold text-base-content">{pagination.totalPages}</span> ({pagination.total} total members)
              </span>

              <div className="join">
                <button
                  type="button"
                  className="join-item btn btn-sm btn-outline gap-1"
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  <FaChevronLeft className="size-3" /> Prev
                </button>
                <button type="button" className="join-item btn btn-sm btn-ghost cursor-default pointer-events-none font-bold">
                  {pagination.page}
                </button>
                <button
                  type="button"
                  className="join-item btn btn-sm btn-outline gap-1"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next <FaChevronRight className="size-3" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Register Member Modal */}
      {isCreateModalOpen && (
        <MemberFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateMember}
        />
      )}
    </motion.div>
  );
};

export default MembersPage;
