import type { AppTheme } from '@/types';

export const AVAILABLE_THEMES: { id: AppTheme; label: string; isDark: boolean }[] = [
  { id: 'dark', label: 'Dark Mode', isDark: true },
  { id: 'light', label: 'Light Mode', isDark: false },
  { id: 'emerald', label: 'Emerald Turf', isDark: false },
  { id: 'corporate', label: 'Corporate Blue', isDark: false },
  { id: 'synthwave', label: 'Synthwave Night', isDark: true },
  { id: 'cupcake', label: 'Pastel Cupcake', isDark: false },
];

export const THEME_STORAGE_KEY = 'sports_club_theme';
export const AUTH_STORAGE_KEY = 'auth_token';
export const REFRESH_STORAGE_KEY = 'refresh_token';
