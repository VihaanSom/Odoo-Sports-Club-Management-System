import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="fieldset w-full">
        {label && <label className="fieldset-label font-medium text-xs text-base-content/80">{label}</label>}
        <textarea
          ref={ref}
          className={cn(
            'textarea textarea-bordered w-full text-sm',
            error && 'textarea-error',
            className
          )}
          {...props}
        />
        {error && <span className="text-error text-xs mt-1">{error}</span>}
        {helperText && !error && <span className="text-base-content/60 text-xs mt-1">{helperText}</span>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
