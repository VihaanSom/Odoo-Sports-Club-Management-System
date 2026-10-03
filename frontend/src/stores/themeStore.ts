import { create } from 'zustand';

export type AppTheme = 'corporate' | 'black';

interface ThemeState {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const getInitialTheme = (): AppTheme => {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('sports_club_theme') : null;
  if (stored === 'corporate' || stored === 'black') {
    return stored as AppTheme;
  }
  // Default to light mode (corporate) and persist
  if (typeof window !== 'undefined') {
    localStorage.setItem('sports_club_theme', 'corporate');
  }
  return 'corporate';
};

const initialTheme = getInitialTheme();
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', initialTheme);
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  setTheme: (theme: AppTheme) => {
    localStorage.setItem('sports_club_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
  toggleTheme: () => {
    const current = get().theme;
    const next: AppTheme = current === 'corporate' ? 'black' : 'corporate';
    get().setTheme(next);
  },
}));
