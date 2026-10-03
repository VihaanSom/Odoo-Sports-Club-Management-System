import { FaCheck, FaCrown, FaTrophy } from 'react-icons/fa6';
import { Card, Badge, Button } from '@/components/ui';
import { formatPaise } from '@/lib/utils';
import type { MembershipPlan } from '@/types';

interface MembershipPlanCardProps {
  plan: MembershipPlan;
  onSelect: (plan: MembershipPlan) => void;
  onEdit?: (plan: MembershipPlan) => void;
  isAdmin?: boolean;
}

export const MembershipPlanCard = ({
  plan,
  onSelect,
  onEdit,
  isAdmin = false,
}: MembershipPlanCardProps) => {
  const duration = plan.durationMonths ?? (plan as any).duration_months ?? 1;
  const pricePaise = plan.pricePaise ?? (plan.price ? Math.round(Number(plan.price) * 100) : 0);
  const displayPrice =
    plan.price && typeof plan.price === 'string' && !plan.price.includes('NaN')
      ? plan.price
      : pricePaise > 0
      ? formatPaise(pricePaise)
      : '₹0';
  const displayPeriod =
    plan.period && !plan.period.includes('undefined')
      ? plan.period
      : `/ ${duration} mo`;
  const displayName =
    plan.name && !plan.name.includes('undefined')
      ? plan.name
      : `${plan.tier || 'Club'} Plan (${duration} Months)`;

  const features =
    plan.features && plan.features.length > 0
      ? plan.features
      : [
          `Court rate: ${plan.courtRatePaise ? formatPaise(plan.courtRatePaise) : 'Standard'}/hr`,
          `${plan.shopDiscountPct ?? 0}% Pro Shop discount`,
          `${plan.barDiscountPct ?? 0}% Bar discount`,
          `${duration} month membership access`,
        ];

  const badgeText =
    plan.badge || (plan.tier === 'Gold' ? 'Best Value' : plan.tier === 'Junior' ? 'Youth' : 'Popular');

  return (
    <Card
      className={`p-6 flex flex-col justify-between transition-all hover:border-primary/50 ${
        plan.popular ? 'border-primary shadow-lg ring-1 ring-primary' : ''
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <Badge size="sm" variant={plan.popular ? 'primary' : 'ghost'} className="gap-1 font-bold">
            <FaTrophy className={plan.tier === 'Gold' ? 'text-amber-500' : 'text-slate-400'} />
            {badgeText}
          </Badge>
          {plan.popular && <FaCrown className="size-4 text-warning" />}
        </div>

        <h3 className="text-xl font-bold text-base-content">{displayName}</h3>
        <p className="text-xs text-base-content/60 mt-1">
          {plan.desc || `${plan.tier} tier subscription for ${plan.durationMonths} months`}
        </p>

        <div className="my-5">
          <span className="text-3xl font-black text-primary">{displayPrice}</span>
          <span className="text-xs text-base-content/60 font-medium ml-1">{displayPeriod}</span>
        </div>

        <ul className="space-y-2 text-xs">
          {features.map((f, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <FaCheck className="size-3.5 text-success shrink-0 mt-0.5" />
              <span className="text-base-content/80">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <Button
          size="sm"
          variant={plan.popular ? 'primary' : 'outline'}
          className="w-full"
          onClick={() => onSelect(plan)}
        >
          Select Plan
        </Button>

        {isAdmin && onEdit && (
          <Button
            size="xs"
            variant="ghost"
            className="w-full text-base-content/60"
            onClick={() => onEdit(plan)}
          >
            Edit Plan
          </Button>
        )}
      </div>
    </Card>
  );
};
