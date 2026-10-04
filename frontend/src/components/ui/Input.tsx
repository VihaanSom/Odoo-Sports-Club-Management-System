import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, ...props }, ref) => {
    return (
      <div className="fieldset w-full">
        {label && <label className="fieldset-label font-medium text-xs text-base-content/80">{label}</label>}
        {leftIcon ? (
          <label
            className={cn(
              'input input-bordered flex items-center gap-2 w-full text-sm',
              error && 'input-error',
              className
            )}
          >
            <span className="shrink-0 text-base-content/50 pointer-events-none">{leftIcon}</span>
            <input
              ref={ref}
              className="grow bg-transparent border-none outline-none text-sm placeholder:text-base-content/50"
              {...props}
            />
          </label>
        ) : (
          <input
            ref={ref}
            className={cn(
              'input input-bordered w-full text-sm',
              error && 'input-error',
              className
            )}
            {...props}
          />
        )}
        {error && <span className="text-error text-xs mt-1">{error}</span>}
        {helperText && !error && <span className="text-base-content/60 text-xs mt-1">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
