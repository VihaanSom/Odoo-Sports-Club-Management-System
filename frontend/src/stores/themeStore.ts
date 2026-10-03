import { create } from 'zustand';

export type AppTheme = 'corporate';

interface ThemeState {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const DEFAULT_THEME: AppTheme = 'corporate';

if (typeof window !== 'undefined') {
  localStorage.setItem('sports_club_theme', DEFAULT_THEME);
}
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', DEFAULT_THEME);
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: DEFAULT_THEME,
  setTheme: () => {
    // Locked to light mode
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', DEFAULT_THEME);
    }
    set({ theme: DEFAULT_THEME });
  },
  toggleTheme: () => {
    // No-op: dark mode removed
  },
}));
