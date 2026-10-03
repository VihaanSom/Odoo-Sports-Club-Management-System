import React from 'react';
import { FaCheck, FaCrown } from 'react-icons/fa6';
import { Card, Badge, Button } from '@/components/ui';
import type { MembershipPlan } from '@/types';

interface MembershipPlanCardProps {
  plan: MembershipPlan;
  onSelect: (plan: MembershipPlan) => void;
}

export const MembershipPlanCard: React.FC<MembershipPlanCardProps> = ({
  plan,
  onSelect,
}) => {
  return (
    <Card
      className={`p-6 flex flex-col justify-between ${
        plan.popular ? 'border-primary shadow-lg ring-1 ring-primary' : ''
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <Badge
            size="sm"
            variant={plan.popular ? 'primary' : 'ghost'}
          >
            {plan.badge}
          </Badge>
          {plan.popular && <FaCrown className="size-4 text-warning" />}
        </div>

        <h3 className="text-xl font-bold">{plan.name}</h3>
        <p className="text-xs text-base-content/60 mt-1">{plan.desc}</p>

        <div className="my-5">
          <span className="text-3xl font-black">{plan.price}</span>
          <span className="text-xs text-base-content/60 font-medium">{plan.period}</span>
        </div>

        <ul className="space-y-2 text-xs">
          {plan.features.map((f, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <FaCheck className="size-3.5 text-success shrink-0 mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        size="sm"
        variant={plan.popular ? 'primary' : 'outline'}
        className="mt-6 w-full"
        onClick={() => onSelect(plan)}
      >
        Select Plan
      </Button>
    </Card>
  );
};
