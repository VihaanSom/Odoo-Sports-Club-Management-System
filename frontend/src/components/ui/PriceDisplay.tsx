import React from 'react';
import { cn } from '@/lib/utils';

export interface PriceDisplayProps {
  /** Amount in paise (integer, e.g. 250000 = ₹2,500.00) */
  amount?: number | null;
  /** Alias for amount in paise */
  paise?: number | null;
  /** Direct amount in rupees (will not be divided by 100) */
  rupees?: number | null;
  /** Currency symbol, default: '₹' */
  currency?: string;
  /** Whether to show decimal places (default: true). Set to 'auto' to hide .00 if whole rupee */
  showDecimals?: boolean | 'auto';
  /** Display size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Text/node to show before the price, e.g. 'From ' */
  prefix?: React.ReactNode;
  /** Text/node to show after the price, e.g. ' / month' */
  suffix?: React.ReactNode;
  /** Render with a line-through (e.g. original strikethrough price) */
  strikeThrough?: boolean;
  /** If provided, renders an original price with strikethrough before this price */
  originalPaise?: number | null;
  /** If price is 0, show "Free" label instead of ₹0 */
  freeLabel?: boolean | string;
  className?: string;
}

export const formatRupeeNumber = (
  rupeeValue: number,
  decimalsMode: boolean | 'auto' = true
): string => {
  if (isNaN(rupeeValue)) return '0.00';

  let minDecimals = 2;
  let maxDecimals = 2;

  if (decimalsMode === false) {
    minDecimals = 0;
    maxDecimals = 0;
  } else if (decimalsMode === 'auto') {
    const isWhole = Number.isInteger(rupeeValue) || rupeeValue % 1 === 0;
    minDecimals = isWhole ? 0 : 2;
    maxDecimals = 2;
  }

  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  }).format(rupeeValue);
};

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  amount,
  paise,
  rupees,
  currency = '₹',
  showDecimals = true,
  size = 'md',
  prefix,
  suffix,
  strikeThrough = false,
  originalPaise,
  freeLabel = false,
  className,
}) => {
  // Determine raw paise
  const rawPaise = amount ?? paise ?? (rupees != null ? Math.round(rupees * 100) : 0);
  const rupeeValue = (rawPaise || 0) / 100;

  if (freeLabel && rupeeValue === 0) {
    const label = typeof freeLabel === 'string' ? freeLabel : 'Free';
    return (
      <span className={cn('badge badge-success badge-sm font-semibold tracking-wide', className)}>
        {label}
      </span>
    );
  }

  const formattedAmount = formatRupeeNumber(rupeeValue, showDecimals);

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base font-semibold',
    lg: 'text-lg font-bold',
    xl: 'text-2xl font-black tracking-tight',
    '2xl': 'text-3xl font-black tracking-tight',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-baseline gap-1 font-sans text-base-content whitespace-nowrap',
        strikeThrough && 'line-through opacity-50',
        sizeClasses,
        className
      )}
    >
      {/* Optional original price strikethrough comparison */}
      {originalPaise != null && originalPaise > rawPaise && (
        <span className="text-xs line-through text-base-content/40 font-normal mr-1">
          {currency}
          {formatRupeeNumber(originalPaise / 100, showDecimals)}
        </span>
      )}

      {prefix && <span className="text-xs font-normal text-base-content/70 mr-0.5">{prefix}</span>}

      <span className="font-semibold text-primary/90">{currency}</span>
      <span className="tabular-nums">{formattedAmount}</span>

      {suffix && <span className="text-xs font-normal text-base-content/60 ml-0.5">{suffix}</span>}
    </span>
  );
};
