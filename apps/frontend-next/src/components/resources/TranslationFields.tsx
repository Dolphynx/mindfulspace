'use client';

/**
 * TranslationFields Component
 * Displays and manages translation fields for a specific locale
 * Shows source fields as read-only, target fields as editable
 * Includes Auto-Translate button for non-source locales
 */

import { useState } from 'react';
import { useTranslations } from '@/i18n/TranslationContext';

interface TranslationFieldsProps {
  locale: string;
  data: {
    title: string;
    summary: string;
    content: string;
  };
  isSource: boolean;
  onChange: (field: 'title' | 'summary' | 'content', value: string) => void;
  onAutoTranslate?: () => Promise<void>;
  disabled?: boolean;
}

export default function TranslationFields({
  locale,
  data,
  isSource,
  onChange,
  onAutoTranslate,
  disabled = false,
}: TranslationFieldsProps) {
  const t = useTranslations('resourcesManagement');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState('');

  const handleAutoTranslate = async () => {
    if (!onAutoTranslate) return;

    setIsTranslating(true);
    setTranslationError('');

    try {
      await onAutoTranslate();
    } catch (error: any) {
      setTranslationError(error.message || t('errors.translationFailed'));
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Auto-translate button (only for non-source locales) */}
      {!isSource && onAutoTranslate && (
        <div className="flex items-center justify-between rounded-lg bg-brandBg p-4">
          <div>
            <p className="text-sm font-medium text-brandText">
              {t('wizard.review.instructions')}
            </p>
            {translationError && (
              <p className="mt-1 text-xs text-red-600">{translationError}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleAutoTranslate}
            disabled={isTranslating || disabled}
            className="rounded-lg bg-brandPrimary px-4 py-2 text-sm font-medium text-white transition hover:bg-brandPrimary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isTranslating
              ? t('actions.translating')
              : t('actions.translateAndReview')}
          </button>
        </div>
      )}

      {/* Source locale indicator */}
      {isSource && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-blue-700">
            <span className="font-medium">{t('form.sourceLocale.label')}:</span> {t('form.sourceLocale.helper')}
          </p>
        </div>
      )}

      {/* Title field */}
      <div>
        <label
          htmlFor={`translation-title-${locale}`}
          className="mb-1 block text-sm font-medium text-brandText"
        >
          {t('form.title')}
          {isSource && <span className="ml-1 text-red-500">*</span>}
        </label>
        <input
          id={`translation-title-${locale}`}
          type="text"
          value={data.title}
          onChange={(e) => onChange('title', e.target.value)}
          disabled={disabled}
          placeholder={t('form.titlePlaceholder')}
          className="w-full rounded-lg border border-brandBorder bg-white px-4 py-2 text-sm text-brandText transition focus:border-brandPrimary focus:outline-none focus:ring-2 focus:ring-brandPrimary/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Summary field */}
      <div>
        <label
          htmlFor={`translation-summary-${locale}`}
          className="mb-1 block text-sm font-medium text-brandText"
        >
          {t('form.summary')}
          {isSource && <span className="ml-1 text-red-500">*</span>}
        </label>
        <textarea
          id={`translation-summary-${locale}`}
          value={data.summary}
          onChange={(e) => onChange('summary', e.target.value)}
          disabled={disabled}
          placeholder={t('form.summaryPlaceholder')}
          rows={2}
          className="w-full rounded-lg border border-brandBorder bg-white px-4 py-2 text-sm text-brandText transition focus:border-brandPrimary focus:outline-none focus:ring-2 focus:ring-brandPrimary/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Content field */}
      <div>
        <label
          htmlFor={`translation-content-${locale}`}
          className="mb-1 block text-sm font-medium text-brandText"
        >
          {t('form.content')}
          {isSource && <span className="ml-1 text-red-500">*</span>}
        </label>
        <textarea
          id={`translation-content-${locale}`}
          value={data.content}
          onChange={(e) => onChange('content', e.target.value)}
          disabled={disabled}
          placeholder={t('form.contentPlaceholder')}
          rows={12}
          className="w-full rounded-lg border border-brandBorder bg-white px-4 py-2 font-mono text-sm text-brandText transition focus:border-brandPrimary focus:outline-none focus:ring-2 focus:ring-brandPrimary/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p className="mt-1 text-xs text-brandText/60">
          {t('form.contentHelper')}
        </p>
      </div>
    </div>
  );
}
