import React, { useState } from 'react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { FaUsers, FaUserPlus } from 'react-icons/fa6';
import { SearchBar, FilterToolbar } from '@/components/shared';
import { Button } from '@/components/ui';
import { mockMembers } from '@/mock';
import type { Member } from '@/types';
import { MemberFormModal, MembersTable, type MemberFormData } from './components';

export const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const planFilterOptions = [
    { label: 'All Plans', value: 'all' },
    { label: 'Standard', value: 'standard' },
    { label: 'Premium', value: 'premium' },
    { label: 'VIP', value: 'vip' },
    { label: 'Junior', value: 'junior' },
  ];

  const handleAddMember = async (data: MemberFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const newMember: Member = {
      id: `MEM-00${members.length + 1}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      membershipPlan: data.membershipPlan,
      status: data.status,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setMembers([newMember, ...members]);
    toast.success(`Member ${data.name} successfully registered!`);
    setIsModalOpen(false);
  };

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

        <Button
          variant="primary"
          leftIcon={<FaUserPlus className="size-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Add New Member
        </Button>
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

      {/* Form Modal */}
      <MemberFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddMember}
      />
    </motion.div>
  );
};

export default MembersPage;
