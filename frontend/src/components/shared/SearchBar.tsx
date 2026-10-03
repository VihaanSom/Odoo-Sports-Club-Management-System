import { FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';
import { cn } from '@/lib/utils';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  className,
}: SearchBarProps) => {
  return (
    <label
      className={cn(
        'input input-bordered flex items-center gap-2.5 w-full text-sm',
        className
      )}
    >
      <FaMagnifyingGlass className="size-4 shrink-0 text-base-content/50 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="grow bg-transparent border-none outline-none text-sm placeholder:text-base-content/50"
      />
      {value && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onChange('');
          }}
          className="btn btn-xs btn-ghost btn-circle shrink-0 text-base-content/50 hover:text-base-content"
          aria-label="Clear search"
        >
          <FaXmark className="size-3" />
        </button>
      )}
    </label>
  );
};
