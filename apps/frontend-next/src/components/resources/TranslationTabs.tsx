'use client';

/**
 * TranslationTabs Component
 * Tab navigation for switching between different language translations
 * Shows which locales have translations with visual indicators
 */

import { useTranslations } from '@/i18n/TranslationContext';

interface Locale {
  code: string;
  name: string;
}

interface TranslationTabsProps {
  activeLocale: string;
  onLocaleChange: (locale: string) => void;
  sourceLocale: string;
  availableLocales: Locale[];
  translations: Record<string, { title: string; summary: string; content: string }>;
}

export default function TranslationTabs({
  activeLocale,
  onLocaleChange,
  sourceLocale,
  availableLocales,
  translations,
}: TranslationTabsProps) {
  const t = useTranslations('resourcesManagement');

  const hasTranslation = (localeCode: string) => {
    const translation = translations[localeCode];
    return translation && (translation.title || translation.summary || translation.content);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 border-b border-brandBorder">
        {availableLocales.map((locale) => {
          const isActive = activeLocale === locale.code;
          const isSource = locale.code === sourceLocale;
          const hasContent = hasTranslation(locale.code);

          return (
            <button
              key={locale.code}
              type="button"
              onClick={() => onLocaleChange(locale.code)}
              className={`
                relative px-4 py-2.5 text-sm font-medium transition
                ${isActive
                  ? 'border-b-2 border-brandPrimary text-brandPrimary'
                  : 'text-brandText/60 hover:text-brandText'
                }
              `}
            >
              <span className="flex items-center gap-2">
                {locale.name}
                {isSource && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    {t('wizard.review.sourceLanguage') || 'Source'}
                  </span>
                )}
                {!isSource && hasContent && (
                  <span className="text-green-600" title="Has translation">
                    ✓
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
