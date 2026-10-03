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
        <div className="relative w-full">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-base-content/50">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'input input-bordered w-full text-sm',
              leftIcon && 'pl-10',
              error && 'input-error',
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-error text-xs mt-1">{error}</span>}
        {helperText && !error && <span className="text-base-content/60 text-xs mt-1">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
