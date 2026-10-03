import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'ghost' | 'link' | 'outline' | 'error' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-accent',
    neutral: 'btn-neutral',
    ghost: 'btn-ghost',
    link: 'btn-link',
    outline: 'btn-outline',
    error: 'btn-error',
    success: 'btn-success',
  }[variant];

  const sizeClass = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  }[size];

  return (
    <button
      className={cn('btn gap-2 font-medium', variantClass, sizeClass, className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
