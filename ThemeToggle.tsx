import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle as InteractiveThemeToggle } from '../ui/ThemeToggle';
import { Palette } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Current Theme Display */}
      <div className="flex items-center justify-between p-4 bg-secondary border border-primary rounded-lg">
        <div className="flex items-center space-x-3">
          <Palette className="text-accent-primary" size={20} />
          <div>
            <div className="text-sm font-semibold text-primary text-subheading">
              {theme === 'dark' ? t('profile.darkTheme') : t('profile.lightTheme')}
            </div>
            <div className="text-xs text-tertiary text-caption">
              {theme === 'dark' ? t('profile.darkThemeDescription') : t('profile.lightThemeDescription')}
            </div>
          </div>
        </div>
        
        {/* Interactive Toggle */}
        <InteractiveThemeToggle />
      </div>
    </div>
  );
};