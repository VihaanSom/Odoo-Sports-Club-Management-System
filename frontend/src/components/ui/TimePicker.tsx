import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaClock, FaXmark } from 'react-icons/fa6';
import { cn } from '@/lib/utils';

export interface TimePickerProps {
  value?: string; // HH:mm (24-hour)
  onChange?: (time: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

function formatDisplay(value: string): string {
  if (!value) return '';
  const [h, m] = value.split(':');
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(hour12).padStart(2, '0')}:${m} ${suffix}`;
}

export const TimePicker = ({
  value = '',
  onChange,
  label,
  placeholder = 'HH:MM',
  error,
  required = false,
  disabled = false,
  className,
  id,
}: TimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const selectedHour = value ? value.split(':')[0] : '';
  const selectedMinute = value ? value.split(':')[1] : '';

  const toggleOpen = () => {
    if (disabled) return;
    if (!isOpen && inputWrapRef.current) {
      const rect = inputWrapRef.current.getBoundingClientRect();
      setPopoverStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
    setIsOpen((prev) => !prev);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChangeRef.current?.('');
    setIsOpen(false);
  };

  const handleSelect = (hour: string, minute: string) => {
    onChangeRef.current?.(`${hour}:${minute}`);
    setIsOpen(false);
  };

  // Close on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        inputWrapRef.current &&
        !inputWrapRef.current.contains(e.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  const displayValue = formatDisplay(value);

  return (
    <div className={cn('fieldset w-full', className)}>
      {label && (
        <label className="fieldset-label font-medium text-xs text-base-content/80 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-error">*</span>}
          </span>
          {value && (
            <span className="text-[11px] font-mono text-base-content/50">{displayValue}</span>
          )}
        </label>
      )}

      <div
        ref={inputWrapRef}
        className={cn('relative w-full cursor-pointer', disabled && 'cursor-not-allowed')}
        onClick={toggleOpen}
      >
        <input
          id={id}
          type="text"
          readOnly
          disabled={disabled}
          value={displayValue || ''}
          placeholder={placeholder}
          className={cn(
            'input input-bordered w-full text-sm pl-3 pr-10 cursor-pointer bg-base-100 select-none font-medium',
            error && 'input-error',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-base-content/60">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:text-error transition-colors rounded-full z-10 cursor-pointer"
              title="Clear time"
            >
              <FaXmark className="size-3" />
            </button>
          )}
          <FaClock className="size-4 text-primary pointer-events-none" />
        </div>
      </div>

      {error && <span className="text-error text-xs mt-1">{error}</span>}

      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            style={popoverStyle}
            className="bg-base-100 rounded-2xl border border-base-300 shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="flex gap-2">
              {/* Hours */}
              <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                <div className="text-[10px] font-semibold text-base-content/50 uppercase mb-1 sticky top-0 bg-base-100">
                  Hour
                </div>
                {HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleSelect(h, selectedMinute || '00')}
                    className={cn(
                      'btn btn-xs font-mono w-10',
                      selectedHour === h ? 'btn-primary' : 'btn-ghost'
                    )}
                  >
                    {h}
                  </button>
                ))}
              </div>

              <div className="divider divider-horizontal mx-0" />

              {/* Minutes */}
              <div className="flex flex-col gap-0.5">
                <div className="text-[10px] font-semibold text-base-content/50 uppercase mb-1">
                  Min
                </div>
                {MINUTES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSelect(selectedHour || '08', m)}
                    className={cn(
                      'btn btn-xs font-mono w-10',
                      selectedMinute === m ? 'btn-primary' : 'btn-ghost'
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default TimePicker;
