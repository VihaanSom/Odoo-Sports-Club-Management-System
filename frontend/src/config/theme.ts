import type { AppTheme } from '@/types';

export const AVAILABLE_THEMES: { id: AppTheme; label: string; isDark: boolean }[] = [
  { id: 'corporate', label: 'Corporate (Light)', isDark: false },
];

export const THEME_STORAGE_KEY = 'sports_club_theme';
export const AUTH_STORAGE_KEY = 'auth_token';
export const REFRESH_STORAGE_KEY = 'refresh_token';
