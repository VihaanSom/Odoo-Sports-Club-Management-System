import React from 'react';
import { FaFilter } from 'react-icons/fa6';
import { cn } from '@/lib/utils';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterToolbarProps {
  options: FilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  label?: string;
  className?: string;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  options,
  selectedValue,
  onSelect,
  label = 'Filter',
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <FaFilter className="size-3.5 text-base-content/50" />
      <span className="text-xs font-medium text-base-content/70 hidden sm:inline">{label}:</span>
      <select
        value={selectedValue}
        onChange={(e) => onSelect(e.target.value)}
        className="select select-bordered select-sm text-sm"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
