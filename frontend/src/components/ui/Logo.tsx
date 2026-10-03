import React from 'react';
import { cn } from '@/lib/utils';

export interface LogoProps {
  className?: string;
  alt?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className,
  alt = 'Champions Club Logo',
}) => {
  return (
    <img
      src="/favicon.svg"
      alt={alt}
      className={cn('size-7 object-contain select-none', className)}
    />
  );
};

export default Logo;
