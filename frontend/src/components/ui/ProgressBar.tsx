import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  className?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'primary',
  className,
  showLabel = false,
}) => {
  const variantClass = {
    primary: 'progress-primary',
    secondary: 'progress-secondary',
    accent: 'progress-accent',
    success: 'progress-success',
    warning: 'progress-warning',
    error: 'progress-error',
  }[variant];

  const percentage = Math.round((value / max) * 100);

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs font-semibold mb-1">
          <span>{value} / {max}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <progress
        className={cn('progress w-full', variantClass, className)}
        value={value}
        max={max}
      />
    </div>
  );
};
