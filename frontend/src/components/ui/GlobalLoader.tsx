import { newtonsCradle } from 'ldrs';
import { cn } from '@/lib/utils';

// Register custom element once
if (typeof window !== 'undefined') {
  newtonsCradle.register();
}

export interface GlobalLoaderProps {
  message?: string;
  size?: number | string;
  color?: string;
  /** Fullscreen viewport overlay (e.g. initial auth verification) */
  fullScreen?: boolean;
  /** Absolute container overlay (e.g. over a refetching card/table) */
  overlay?: boolean;
  /** Custom min-height for inline loaders */
  minHeight?: string | number;
  className?: string;
}

export const GlobalLoader = ({
  message = 'Loading sports club data...',
  size = 78,
  color = '#6366f1',
  fullScreen = false,
  overlay = false,
  minHeight = '300px',
  className,
}: GlobalLoaderProps) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 gap-4 text-center select-none">
      <l-newtons-cradle
        size={size}
        speed="1.4"
        color={color}
      />
      {message && (
        <p className="text-sm font-medium text-base-content/75 animate-pulse tracking-wide max-w-sm">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center bg-base-100/90 backdrop-blur-md transition-all',
          className
        )}
      >
        {content}
      </div>
    );
  }

  if (overlay) {
    return (
      <div
        className={cn(
          'absolute inset-0 z-20 flex items-center justify-center bg-base-100/70 backdrop-blur-xs rounded-xl transition-all',
          className
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={cn('flex flex-col items-center justify-center w-full', className)}
      style={{ minHeight }}
    >
      {content}
    </div>
  );
};
