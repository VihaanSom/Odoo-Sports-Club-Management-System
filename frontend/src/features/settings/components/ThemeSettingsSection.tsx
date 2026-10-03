import React from 'react';
import { FaPalette } from 'react-icons/fa6';
import { useThemeStore } from '@/stores/themeStore';
import { AVAILABLE_THEMES } from '@/config/theme';
import { Card } from '@/components/ui';

export const ThemeSettingsSection: React.FC = () => {
  const currentTheme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <FaPalette className="size-4 text-primary" /> Appearance & Theme
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {AVAILABLE_THEMES.map((th) => (
          <button
            key={th.id}
            type="button"
            onClick={() => setTheme(th.id)}
            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all capitalize text-sm font-medium ${
              currentTheme === th.id
                ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                : 'border-base-300 hover:border-base-content/30'
            }`}
          >
            <span>{th.label}</span>
            <span className="text-[10px] text-base-content/50 uppercase mt-2">
              {currentTheme === th.id ? 'Active Theme' : 'Select'}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
};
