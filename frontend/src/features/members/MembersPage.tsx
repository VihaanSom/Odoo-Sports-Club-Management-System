import { useState } from 'react';
import { motion } from 'motion/react';
import { FaUsers } from 'react-icons/fa6';
import { SearchBar, FilterToolbar } from '@/components/shared';
import { mockMembers } from '@/mock';
import type { Member } from '@/types';
import { MembersTable } from './components';

export const MembersPage = () => {
  const [members] = useState<Member[]>(mockMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('all');

  const planFilterOptions = [
    { label: 'All Plans', value: 'all' },
    { label: 'Standard', value: 'standard' },
    { label: 'Premium', value: 'premium' },
    { label: 'VIP', value: 'vip' },
    { label: 'Junior', value: 'junior' },
  ];

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery);
    const matchesPlan =
      selectedPlanFilter === 'all' || m.membershipPlan.toLowerCase() === selectedPlanFilter.toLowerCase();
    return matchesSearch && matchesPlan;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <FaUsers className="size-7 text-primary" /> Members Directory
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            Manage club registrations, membership tiers, and contacts synchronized with Odoo.
          </p>
        </div>
      </div>

      {/* Filters and search */}
      <div className="card bg-base-200/50 border border-base-300 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, email, or phone..."
            />
          </div>

          <FilterToolbar
            options={planFilterOptions}
            selectedValue={selectedPlanFilter}
            onSelect={setSelectedPlanFilter}
            label="Plan"
          />
        </div>
      </div>

      {/* Members Table */}
      <MembersTable members={filteredMembers} />
    </motion.div>
  );
};

export default MembersPage;
