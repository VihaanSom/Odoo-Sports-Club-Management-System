import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
}

export const Skeleton = ({
  className,
  variant = 'rectangular',
  width,
  height,
  style,
  ...props
}: SkeletonProps) => {
  const variantClass = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded h-4',
  }[variant];

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
