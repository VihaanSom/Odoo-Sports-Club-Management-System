import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
  /** Render multiple skeleton items with standard spacing */
  count?: number;
}

export const Skeleton = ({
  className,
  variant = 'rectangular',
  width,
  height,
  style,
  count = 1,
  ...props
}: SkeletonProps) => {
  const variantClass = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded h-4',
  }[variant];

  if (count > 1) {
    return (
      <div className="flex flex-col gap-2 w-full">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={cn('skeleton bg-base-300 animate-pulse', variantClass, className)}
            style={{ width, height, ...style }}
            {...props}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn('skeleton bg-base-300 animate-pulse', variantClass, className)}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
};

export interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className,
  lastLineWidth = '70%',
}) => {
  return (
    <div className={cn('flex flex-col gap-2.5 w-full', className)}>
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          variant="text"
          height="14px"
          className={cn(idx === lines - 1 && 'max-w-[70%]')}
          style={idx === lines - 1 ? { width: lastLineWidth } : undefined}
        />
      ))}
    </div>
  );
};

export interface SkeletonCardProps {
  hasImage?: boolean;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  hasImage = true,
  className,
}) => {
  return (
    <div className={cn('card bg-base-200/50 border border-base-300 p-5 rounded-2xl flex flex-col gap-4', className)}>
      {hasImage && <Skeleton variant="rectangular" height="140px" className="w-full rounded-xl" />}
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width="40px" height="40px" className="shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton variant="text" height="16px" width="60%" />
          <Skeleton variant="text" height="12px" width="40%" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
};

export interface SkeletonTableProps {
  rows?: number;
  cols?: number;
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  cols = 4,
  className,
}) => {
  return (
    <div className={cn('w-full overflow-hidden border border-base-300 rounded-xl bg-base-100', className)}>
      {/* Table Header Skeleton */}
      <div className="bg-base-200/80 p-4 border-b border-base-300 flex items-center gap-4">
        {Array.from({ length: cols }).map((_, cIdx) => (
          <Skeleton key={cIdx} variant="text" height="16px" className="flex-1" />
        ))}
      </div>
      {/* Table Rows Skeleton */}
      <div className="divide-y divide-base-200">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="p-4 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <Skeleton
                key={cIdx}
                variant="text"
                height="14px"
                className={cn('flex-1', cIdx === 0 ? 'max-w-[140px]' : '')}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
