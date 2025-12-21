'use client';

/**
 * SourceLocaleSelector Component
 * Dropdown for selecting the source language when creating/editing a resource
 * Used in ResourceForm to specify which language the content is written in
 */

import { useTranslations } from '@/i18n/TranslationContext';

interface Locale {
  code: string;
  name: string;
}

interface SourceLocaleSelectorProps {
  value: string;
  onChange: (locale: string) => void;
  availableLocales: Locale[];
  disabled?: boolean;
}

export default function SourceLocaleSelector({
  value,
  onChange,
  availableLocales,
  disabled = false,
}: SourceLocaleSelectorProps) {
  const t = useTranslations('resourcesManagement');

  return (
    <div className="mb-6">
      <label
        htmlFor="sourceLocale"
        className="mb-1 block text-sm font-medium text-brandText"
      >
        {t('form.sourceLocale.label')}
      </label>
      <select
        id="sourceLocale"
        name="sourceLocale"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-brandBorder bg-white px-4 py-2 text-sm text-brandText transition focus:border-brandPrimary focus:outline-none focus:ring-2 focus:ring-brandPrimary/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
      >
        {availableLocales.map((locale) => (
          <option key={locale.code} value={locale.code}>
            {locale.name}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-brandText/60">
        {t('form.sourceLocale.helper')}
      </p>
    </div>
  );
}
