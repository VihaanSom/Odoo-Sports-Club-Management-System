import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
  hoverable?: boolean;
}

export const Card = ({
  children,
  className,
  bordered = true,
  hoverable = false,
  ...props
}: CardProps) => {
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

export type CardBodyProps = React.HTMLAttributes<HTMLDivElement>;

export const CardBody = ({
  children,
  className,
  ...props
}: CardBodyProps) => (
  <div className={cn('card-body p-5 sm:p-6', className)} {...props}>
    {children}
  </div>
);

export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export const CardTitle = ({
  children,
  className,
  ...props
}: CardTitleProps) => (
  <h3 className={cn('card-title text-lg font-bold tracking-tight', className)} {...props}>
    {children}
  </h3>
);
