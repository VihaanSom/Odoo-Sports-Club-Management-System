import React, { useState } from 'react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { FaIdCard } from 'react-icons/fa6';
import { mockPlans } from '@/mock';
import type { MembershipPlan } from '@/types';
import { MembershipPlanCard } from './components';

export const MembershipsPage: React.FC = () => {
  const [plans] = useState<MembershipPlan[]>(mockPlans);

  const handleSelectPlan = (plan: MembershipPlan) => {
    toast.success(`Selected ${plan.name} plan! Syncing recurring contract with Odoo ERP.`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <FaIdCard className="size-7 text-primary" /> Membership Plans & Tiers
        </h1>
        <p className="text-sm text-base-content/70 mt-1">
          Configured subscription plans mapped to Odoo recurring contracts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <MembershipPlanCard
            key={plan.id}
            plan={plan}
            onSelect={handleSelectPlan}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default MembershipsPage;
