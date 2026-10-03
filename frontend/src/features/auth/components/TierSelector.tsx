import React from 'react';
import { FaCrown, FaShieldHalved, FaGraduationCap, FaCheck } from 'react-icons/fa6';
import { MEMBERSHIP_TIERS, type TierType } from '@/types';
import { cn } from '@/lib/utils';

interface TierSelectorProps {
  selectedTier: TierType;
  onSelectTier: (tier: TierType) => void;
  error?: string;
}

export const TierSelector: React.FC<TierSelectorProps> = ({
  selectedTier,
  onSelectTier,
  error,
}) => {
  const getTierIcon = (id: TierType) => {
    switch (id) {
      case 'Gold':
        return <FaCrown className="size-4 text-warning" />;
      case 'Silver':
        return <FaShieldHalved className="size-4 text-base-content/70" />;
      case 'Junior':
        return <FaGraduationCap className="size-4 text-info" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="fieldset-label font-bold text-xs uppercase tracking-wider text-base-content/80">
          Select Membership Tier <span className="text-error">*</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {MEMBERSHIP_TIERS.map((tier) => {
          const isSelected = selectedTier === tier.id;
          return (
            <div
              key={tier.id}
              onClick={() => onSelectTier(tier.id)}
              className={cn(
                'flex flex-col justify-between p-4 rounded-xl border-2 transition-all cursor-pointer text-left',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-base-300 hover:border-base-content/20 bg-base-100'
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="size-8 rounded-lg bg-base-200 flex items-center justify-center">
                    {getTierIcon(tier.id)}
                  </div>
                  <input
                    type="radio"
                    name="membershipTierRadio"
                    checked={isSelected}
                    onChange={() => onSelectTier(tier.id)}
                    className="radio radio-primary radio-sm"
                  />
                </div>

                <div className="flex items-center gap-1.5 mb-1">
                  <h4 className="font-bold text-sm tracking-tight text-base-content">{tier.name}</h4>
                  <span className={cn('badge badge-xs text-[10px] font-semibold', tier.badgeColor)}>
                    {tier.badge}
                  </span>
                </div>

                <div className="mt-1 mb-2">
                  <span className="text-lg font-black text-base-content">
                    ₹{tier.pricePerMonth.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-base-content/60 ml-1">/ mo</span>
                </div>

                <p className="text-xs text-base-content/70 mb-3">
                  {tier.description}
                </p>

                <div className="border-t border-base-200 pt-2 space-y-1">
                  {tier.perks.slice(0, 3).map((perk, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-base-content/80">
                      <FaCheck className="size-3 text-success shrink-0 mt-0.5" />
                      <span className="leading-tight">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTier(tier.id);
                  }}
                  className={cn(
                    'btn btn-xs w-full rounded-lg font-bold',
                    isSelected ? 'btn-primary' : 'btn-outline'
                  )}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {error && <span className="text-error text-xs font-medium block mt-1">{error}</span>}
    </div>
  );
};
