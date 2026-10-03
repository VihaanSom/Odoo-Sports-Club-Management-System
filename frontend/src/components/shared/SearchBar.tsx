import React from 'react';
import { FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';
import { cn } from '@/lib/utils';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className,
}) => {
  return (
    <div className={cn('relative w-full', className)}>
      <FaMagnifyingGlass className="size-4 text-base-content/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input input-bordered w-full pl-10 pr-9 text-sm"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="btn btn-xs btn-ghost btn-circle absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/50"
          aria-label="Clear search"
        >
          <FaXmark className="size-3" />
        </button>
      )}
    </div>
  );
};
