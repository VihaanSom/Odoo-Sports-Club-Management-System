import React from 'react';
import { newtonsCradle } from 'ldrs';

newtonsCradle.register();

export interface GlobalLoaderProps {
  message?: string;
  size?: number | string;
  color?: string;
}

export const GlobalLoader: React.FC<GlobalLoaderProps> = ({
  message = 'Loading sports club data...',
  size = 78,
  color = '#6366f1',
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 gap-4">
      <l-newtons-cradle
        size={size}
        speed="1.4"
        color={color}
      />
      {message && (
        <p className="text-sm font-medium text-base-content/70 animate-pulse tracking-wide">
          {message}
        </p>
      )}
    </div>
  );
};
