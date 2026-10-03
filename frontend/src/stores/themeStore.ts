import { create } from 'zustand';

export type AppTheme = 'dark' | 'light' | 'emerald' | 'cupcake' | 'synthwave' | 'corporate';

interface ThemeState {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const getInitialTheme = (): AppTheme => {
  const stored = localStorage.getItem('sports_club_theme') as AppTheme;
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  setTheme: (theme: AppTheme) => {
    localStorage.setItem('sports_club_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
  toggleTheme: () => {
    const current = get().theme;
    const next: AppTheme = current === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
}));
