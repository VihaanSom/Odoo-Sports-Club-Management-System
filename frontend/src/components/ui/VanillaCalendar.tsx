import React, { useEffect, useRef } from 'react';
import { Calendar, type Options } from 'vanilla-calendar-pro';
import 'vanilla-calendar-pro/styles/index.css';
import { useThemeStore } from '@/stores/themeStore';
import { cn } from '@/lib/utils';

export interface VanillaCalendarProps {
  id?: string;
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  className?: string;
  options?: Partial<Options>;
}

export const VanillaCalendar: React.FC<VanillaCalendarProps> = ({
  id = 'calendar',
  selectedDate,
  onSelectDate,
  className,
  options = {},
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<Calendar | null>(null);
  const onSelectDateRef = useRef(onSelectDate);
  onSelectDateRef.current = onSelectDate;

  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'black';

  useEffect(() => {
    if (!wrapperRef.current) return;

    wrapperRef.current.innerHTML = '';
    const calEl = document.createElement('div');
    calEl.id = id;
    calEl.className = 'vc';
    wrapperRef.current.appendChild(calEl);

    const cal = new Calendar(calEl, {
      selectedTheme: isDark ? 'dark' : 'light',
      selectedDates: selectedDate ? [selectedDate] : [],
      selectionYearsMode: true,
      selectionMonthsMode: true,
      onClickDate(self) {
        const chosen = self.context.selectedDates[0];
        if (chosen) {
          onSelectDateRef.current?.(chosen);
        }
      },
      ...options,
    });

    cal.init();
    calendarRef.current = cal;

    return () => {
      try {
        cal.destroy();
      } catch {
        // Safe cleanup
      }
      if (wrapperRef.current) {
        wrapperRef.current.innerHTML = '';
      }
      calendarRef.current = null;
    };
  }, [id, isDark, selectedDate]);

  return (
    <div className={cn('p-2 bg-base-100 rounded-2xl border border-base-300 shadow-sm inline-block', className)}>
      <div ref={wrapperRef} />
    </div>
  );
};

export default VanillaCalendar;
