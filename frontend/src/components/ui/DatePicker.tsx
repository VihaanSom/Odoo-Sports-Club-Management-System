import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, type Options, type DateAny } from 'vanilla-calendar-pro';
import 'vanilla-calendar-pro/styles/index.css';
import { FaCalendarDays, FaXmark } from 'react-icons/fa6';
import { cn, formatDate, parseDateToISO } from '@/lib/utils';

export interface DatePickerProps {
  value?: string; // YYYY-MM-DD or DD-MM-YYYY
  onChange?: (date: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const DatePicker = ({
  value = '',
  onChange,
  label,
  placeholder = 'DD-MM-YYYY',
  error,
  required = false,
  minDate,
  maxDate,
  disabled = false,
  className,
  id,
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const isoValue = parseDateToISO(value);
  const displayValue = formatDate(value);

  const updatePosition = () => {
    if (inputWrapRef.current) {
      const rect = inputWrapRef.current.getBoundingClientRect();
      const calHeight = 350;
      const fitsBelow = rect.bottom + 4 + calHeight <= window.innerHeight;
      const top = fitsBelow ? rect.bottom + 4 : Math.max(8, rect.top - calHeight - 4);
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - 300));
      setPopoverStyle({
        position: 'fixed',
        top,
        left,
        zIndex: 9999,
      });
    }
  };

  // Toggle calendar open/close
  const toggleCalendar = () => {
    if (!disabled) {
      if (!isOpen) {
        updatePosition();
      }
      setIsOpen((prev) => !prev);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChangeRef.current?.('');
    setIsOpen(false);
  };

  // Close calendar on outside click or Escape key, and keep repositioned on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedContainer = containerRef.current?.contains(target);
      const clickedPopover = popoverRef.current?.contains(target);
      if (!clickedContainer && !clickedPopover) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      updatePosition();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen]);

  // Mount Vanilla Calendar Pro inside wrapperRef when open
  useEffect(() => {
    if (!isOpen || !wrapperRef.current) return;

    const wrapper = wrapperRef.current;
    wrapper.innerHTML = '';

    const calEl = document.createElement('div');
    calEl.className = 'vc';
    wrapper.appendChild(calEl);

    const isoMin = parseDateToISO(minDate || '1920-01-01');
    const isoMax = parseDateToISO(maxDate || '2050-12-31');

    const options: Options = {
      selectedTheme: 'light',
      selectedDates: isoValue ? [isoValue] : [],
      dateMin: isoMin as DateAny,
      dateMax: isoMax as DateAny,
      enableDateToggle: false,
      selectionYearsMode: true,
      selectionMonthsMode: true,
      onClickDate(self) {
        const chosen = self.context.selectedDates[0];
        if (chosen) {
          onChangeRef.current?.(chosen);
          setIsOpen(false);
        }
      },
    };

    if (isoValue) {
      const d = new Date(isoValue);
      if (!isNaN(d.getTime())) {
        options.selectedYear = d.getFullYear();
        options.selectedMonth = d.getMonth() as unknown as Options['selectedMonth'];
      }
    }

    const calendar = new Calendar(calEl, options);
    calendar.init();

    return () => {
      try {
        calendar.destroy();
      } catch {
        // Safe cleanup
      }
      wrapper.innerHTML = '';
    };
  }, [isOpen, isoValue, minDate, maxDate]);

  return (
    <div ref={containerRef} className={cn('fieldset w-full relative', className)}>
      {label && (
        <label className="fieldset-label font-medium text-xs text-base-content/80 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-error">*</span>}
          </span>
          {value && (
            <span className="text-[11px] font-mono text-base-content/50">
              {displayValue}
            </span>
          )}
        </label>
      )}

      <div
        ref={inputWrapRef}
        className={cn(
          'relative w-full cursor-pointer',
          disabled && 'cursor-not-allowed'
        )}
        onClick={toggleCalendar}
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
              title="Clear date"
            >
              <FaXmark className="size-3" />
            </button>
          )}
          <FaCalendarDays className="size-4 text-primary pointer-events-none" />
        </div>
      </div>

      {error && <span className="text-error text-xs mt-1">{error}</span>}

      {/* Floating Calendar Popover — rendered via portal to escape modal overflow */}
      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            style={popoverStyle}
            className="bg-base-100 rounded-2xl border border-base-300 shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-100"
          >
            <div ref={wrapperRef} />
          </div>,
          document.body
        )}
    </div>
  );
};

export default DatePicker;
