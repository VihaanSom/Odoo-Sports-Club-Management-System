import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'ghost' | 'info' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'neutral',
  size = 'md',
  ...props
}) => {
  const variantClass = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    accent: 'badge-accent',
    neutral: 'badge-neutral',
    ghost: 'badge-ghost',
    info: 'badge-info',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    outline: 'badge-outline',
  }[variant];

  const sizeClass = {
    xs: 'badge-xs',
    sm: 'badge-sm',
    md: 'badge-md',
    lg: 'badge-lg',
  }[size];

  return (
    <span className={cn('badge font-medium', variantClass, sizeClass, className)} {...props}>
      {children}
    </span>
  );
};
