import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format any date string or Date object to DD-MM-YYYY
 */
export function formatDate(dateStr?: string | Date | null): string {
  if (!dateStr) return '';
  if (dateStr instanceof Date) {
    if (isNaN(dateStr.getTime())) return '';
    const d = String(dateStr.getDate()).padStart(2, '0');
    const m = String(dateStr.getMonth() + 1).padStart(2, '0');
    const y = dateStr.getFullYear();
    return `${d}-${m}-${y}`;
  }
  // If YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const [y, m, d] = dateStr.slice(0, 10).split('-');
    return `${d}-${m}-${y}`;
  }
  // If already DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    return dateStr;
  }
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    const d = String(parsed.getDate()).padStart(2, '0');
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const y = parsed.getFullYear();
    return `${d}-${m}-${y}`;
  }
  return dateStr;
}

/**
 * Parse DD-MM-YYYY to standard ISO YYYY-MM-DD
 */
export function parseDateToISO(dateStr?: string | null): string {
  if (!dateStr) return '';
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split('-');
    return `${y}-${m}-${d}`;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.slice(0, 10);
  }
  return dateStr;
}

/**
 * Format paise integer into INR string: 19950 -> ₹199.50
 */
export function formatPaise(paise?: number | null): string {
  if (paise == null || isNaN(paise)) return '₹0.00';
  return `₹${(paise / 100).toFixed(2)}`;
}
