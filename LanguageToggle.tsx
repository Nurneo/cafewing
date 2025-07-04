import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
];

export const LanguageToggle: React.FC = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('themis_language', languageCode);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-4">
        <Globe className="accent-cyan" size={20} />
        <span className="text-sm font-semibold text-white text-subheading">
          {t('profile.currentLanguage')}: {languages.find(lang => lang.code === i18n.language)?.name}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`
              relative p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 gpu-accelerated
              ${i18n.language === language.code
                ? 'border-cyan-400 bg-cyan-400/10 shadow-neon'
                : 'border-gray-600 bg-gray-800 hover:border-cyan-400/50 hover:bg-cyan-400/5'
              }
            `}
            aria-label={`${t('profile.selectLanguage')}: ${language.name}`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl" role="img" aria-label={language.name}>
                {language.flag}
              </span>
              <div className="text-left flex-1">
                <div className={`font-semibold text-sm ${
                  i18n.language === language.code ? 'accent-cyan' : 'text-white'
                } text-subheading`}>
                  {language.name}
                </div>
                <div className="text-xs text-gray-400 text-caption">
                  {language.code.toUpperCase()}
                </div>
              </div>
              {i18n.language === language.code && (
                <Check className="accent-cyan" size={20} />
              )}
            </div>
            
            {/* Active indicator */}
            {i18n.language === language.code && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};