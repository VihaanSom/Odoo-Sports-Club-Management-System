import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa6';
import { useThemeStore } from '@/stores/themeStore';

export const ThemeToggle: React.FC = () => {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isDark = theme === 'black';

  return (
    <button
      type="button"
      className="btn btn-ghost btn-circle"
      onClick={toggleTheme}
      aria-label="Toggle light and dark theme"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <FaSun className="size-5 text-warning" />
      ) : (
        <FaMoon className="size-5 text-primary" />
      )}
    </button>
  );
};
