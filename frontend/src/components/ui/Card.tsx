import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  bordered = true,
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'card bg-base-200/50 shadow-xs rounded-2xl',
        bordered && 'border border-base-300',
        hoverable && 'hover:border-primary/40 transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('card-body p-5 sm:p-6', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => (
  <h3 className={cn('card-title text-lg font-bold tracking-tight', className)} {...props}>
    {children}
  </h3>
);
