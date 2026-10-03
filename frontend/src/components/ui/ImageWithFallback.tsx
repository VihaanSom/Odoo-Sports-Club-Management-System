import React, { useState } from 'react';
import { FaVolleyball } from 'react-icons/fa6';
import { cn } from '@/lib/utils';

export interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export const ImageWithFallback = ({
  src,
  alt,
  className,
  fallbackSrc,
  ...props
}: ImageWithFallbackProps) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    if (fallbackSrc) {
      return (
        <img
          src={fallbackSrc}
          alt={alt}
          className={className}
          {...props}
        />
      );
    }
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center bg-base-300 text-base-content/40',
          className
        )}
      >
        <FaVolleyball className="size-8 opacity-40 mb-1" />
        <span className="text-[11px] font-medium">Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
};
