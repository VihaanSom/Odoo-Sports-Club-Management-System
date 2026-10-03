import React, { useState } from 'react';
import type { AxiosError } from 'axios';
import {
  FaTriangleExclamation,
  FaCircleInfo,
  FaRotateRight,
  FaXmark,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa6';
import { cn } from '@/lib/utils';

export interface ApiErrorAlertProps {
  /** The error object from React Query, Axios, or Error */
  error?: unknown;
  /** Custom title to override default */
  title?: string;
  /** Explicit error message override */
  message?: string;
  /** Explicit error code override (e.g. 'UNAUTHORIZED', 'NOT_FOUND') */
  code?: string;
  /** Optional callback when user clicks "Try Again" / "Retry" */
  onRetry?: () => void;
  /** Optional callback to close / dismiss the alert */
  onDismiss?: () => void;
  /** Alert visual theme */
  variant?: 'error' | 'warning' | 'info';
  /** Compact style for inline alerts inside cards or forms */
  compact?: boolean;
  className?: string;
}

interface ParsedError {
  message: string;
  code?: string;
  details?: Array<{ field?: string; message?: string }> | string[] | Record<string, unknown> | null;
}

function parseError(error: unknown, fallbackMessage?: string, explicitCode?: string): ParsedError {
  if (!error && !fallbackMessage) {
    return { message: 'An unexpected error occurred.' };
  }

  if (typeof error === 'string') {
    return { message: error, code: explicitCode };
  }

  // AxiosError or object with response
  const maybeAxios = error as AxiosError<{
    success?: boolean;
    error?: {
      code?: string;
      message?: string;
      details?: unknown;
    };
    message?: string;
  }>;

  if (maybeAxios?.isAxiosError || maybeAxios?.response) {
    const errorBody = maybeAxios.response?.data?.error;
    const responseMessage = errorBody?.message || maybeAxios.response?.data?.message;
    const responseCode = explicitCode || errorBody?.code || (maybeAxios.response?.status ? `HTTP_${maybeAxios.response.status}` : undefined);
    const details = (errorBody?.details as ParsedError['details']) ?? null;

    if (responseMessage) {
      return { message: responseMessage, code: responseCode, details };
    }

    if (maybeAxios.message) {
      return { message: maybeAxios.message, code: responseCode };
    }
  }

  // Standard Error instance
  if (error instanceof Error) {
    return {
      message: fallbackMessage || error.message,
      code: explicitCode,
    };
  }

  // Object with message property
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const msgObj = error as { message?: string; code?: string };
    return {
      message: fallbackMessage || String(msgObj.message || 'An error occurred'),
      code: explicitCode || msgObj.code,
    };
  }

  return {
    message: fallbackMessage || 'Something went wrong while connecting to the server. Please try again.',
    code: explicitCode,
  };
}

export const ApiErrorAlert: React.FC<ApiErrorAlertProps> = ({
  error,
  title,
  message: customMessage,
  code: customCode,
  onRetry,
  onDismiss,
  variant = 'error',
  compact = false,
  className,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // If no error and no message provided, don't render anything
  if (!error && !customMessage) {
    return null;
  }

  const parsed = parseError(error, customMessage, customCode);

  const variantStyles = {
    error: {
      container: 'bg-error/10 border-error/30 text-error-content',
      icon: <FaTriangleExclamation className="size-5 text-error shrink-0 mt-0.5" />,
      badge: 'badge-error text-white',
      defaultTitle: 'Request Failed',
    },
    warning: {
      container: 'bg-warning/10 border-warning/30 text-warning-content',
      icon: <FaTriangleExclamation className="size-5 text-warning shrink-0 mt-0.5" />,
      badge: 'badge-warning text-black',
      defaultTitle: 'Warning',
    },
    info: {
      container: 'bg-info/10 border-info/30 text-info-content',
      icon: <FaCircleInfo className="size-5 text-info shrink-0 mt-0.5" />,
      badge: 'badge-info text-white',
      defaultTitle: 'Notice',
    },
  }[variant];

  const displayTitle = title || variantStyles.defaultTitle;
  const hasDetails = parsed.details && (Array.isArray(parsed.details) ? parsed.details.length > 0 : Object.keys(parsed.details).length > 0);

  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl border p-4 shadow-sm transition-all',
        variantStyles.container,
        compact && 'p-3 text-sm',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {variantStyles.icon}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-sm leading-tight text-base-content">
              {displayTitle}
            </h4>
            {parsed.code && (
              <span className={cn('badge badge-xs font-mono font-medium', variantStyles.badge)}>
                {parsed.code}
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-base-content/80 leading-relaxed break-words">
            {parsed.message}
          </p>

          {/* Validation details accordion if available */}
          {hasDetails && (
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1.5 text-xs font-medium text-base-content/60 hover:text-base-content transition-colors cursor-pointer"
              >
                {showDetails ? (
                  <>
                    <FaChevronUp className="size-3" /> Hide technical details
                  </>
                ) : (
                  <>
                    <FaChevronDown className="size-3" /> Show technical details
                  </>
                )}
              </button>

              {showDetails && (
                <pre className="mt-2 p-2.5 bg-base-300/60 rounded-lg text-xs font-mono text-base-content/90 overflow-x-auto max-h-48">
                  {typeof parsed.details === 'string'
                    ? parsed.details
                    : JSON.stringify(parsed.details, null, 2)}
                </pre>
              )}
            </div>
          )}

          {/* Action buttons (Retry / Dismiss) */}
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex items-center gap-2">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="btn btn-xs btn-outline gap-1.5 font-medium hover:scale-[1.02] transition-transform"
                >
                  <FaRotateRight className="size-3" />
                  Try Again
                </button>
              )}
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="btn btn-xs btn-ghost text-base-content/70 hover:text-base-content"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss error"
            className="text-base-content/40 hover:text-base-content p-1 rounded-md transition-colors"
          >
            <FaXmark className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
};
