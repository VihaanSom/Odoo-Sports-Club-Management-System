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
            'textarea w-full min-w-full text-sm bg-base-100 border border-base-300 focus:border-primary focus:outline-primary rounded-xl',
            error && 'textarea-error border-error',
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
