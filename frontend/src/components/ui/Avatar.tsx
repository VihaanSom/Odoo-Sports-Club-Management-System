import React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallbackText?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  fallbackText,
  size = 'md',
  className,
}) => {
  const sizeMap = {
    xs: 'size-6 text-[10px]',
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-14 text-lg',
    xl: 'size-20 text-2xl',
  };

  return (
    <div className={cn('avatar', className)}>
      <div
        className={cn(
          'mask mask-circle bg-base-300 flex items-center justify-center font-bold text-base-content/80',
          sizeMap[size]
        )}
      >
        {src ? (
          <img src={src} alt={alt} className="object-cover size-full" />
        ) : (
          <span>{fallbackText?.charAt(0).toUpperCase() || 'U'}</span>
        )}
      </div>
    </div>
  );
};
