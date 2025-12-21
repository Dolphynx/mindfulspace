'use client';

/**
 * ResourceForm Component
 * Reusable form for creating and editing resources with translation support
 * Used by both coaches and admins
 *
 * Features:
 * - Source locale selection
 * - Tabbed interface for translations
 * - Auto-translate functionality per locale
 * - Manual translation editing
 */

import { useState, useEffect } from 'react';
import { useTranslations } from '@/i18n/TranslationContext';
import {
  Resource,
  ResourceCategory,
  ResourceTag,
  CreateResourceData,
  UpdateResourceData,
  calculateReadTime,
  getCategoryName,
  getTagName,
} from '@/lib/api/resources';
import SourceLocaleSelector from './SourceLocaleSelector';
import TranslationTabs from './TranslationTabs';
import TranslationFields from './TranslationFields';

interface Locale {
  code: string;
  name: string;
}

interface TranslationData {
  title: string;
  summary: string;
  content: string;
}

interface ResourceFormProps {
  initialData?: Resource;
  categories: ResourceCategory[];
  tags: ResourceTag[];
  availableLocales?: Locale[];  // NEW: Locales to support
  onSubmit: (
    data: CreateResourceData | UpdateResourceData,
    translations?: Record<string, TranslationData>
  ) => Promise<void>;
  onCancel: () => void;
  isAdmin?: boolean;
  isLoading?: boolean;
}

export default function ResourceForm({
  initialData,
  categories,
  tags,
  availableLocales = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' },
  ],
  onSubmit,
  onCancel,
  isAdmin = false,
  isLoading = false,
}: ResourceFormProps) {
  const t = useTranslations('resourcesManagement');

  // Source locale state (NEW)
  const [sourceLocale, setSourceLocale] = useState<string>(
    initialData?.sourceLocale || availableLocales[0]?.code || 'fr'
  );

  // Active locale for tab navigation (NEW)
  const [activeLocale, setActiveLocale] = useState<string>(sourceLocale);

  // Translation state for all locales (NEW)
  const [translations, setTranslations] = useState<Record<string, TranslationData>>(() => {
    const initial: Record<string, TranslationData> = {};

    // If initialData has translations array, load them all
    if (initialData?.translations && initialData.translations.length > 0) {
      initialData.translations.forEach((trans) => {
        initial[trans.locale] = {
          title: trans.title,
          summary: trans.summary,
          content: trans.content,
        };
      });
    } else {
      // Fallback: Initialize source locale with top-level data (for backward compatibility)
      initial[sourceLocale] = {
        title: initialData?.title || '',
        summary: initialData?.summary || '',
        content: initialData?.content || '',
      };
    }

    // Initialize any missing locales as empty
    availableLocales.forEach((locale) => {
      if (!initial[locale.code]) {
        initial[locale.code] = {
          title: '',
          summary: '',
          content: '',
        };
      }
    });

    return initial;
  });

  // Form state (metadata fields)
  const [formData, setFormData] = useState({
    isPremium: initialData?.isPremium || false,
    isFeatured: initialData?.isFeatured || false,
    authorName: initialData?.authorName || '',
    readTimeMin: initialData?.readTimeMin || null,
    externalUrl: initialData?.externalUrl || '',
    categoryId: initialData?.categoryId || '',
    tagIds: initialData?.tags?.map((t) => t.tag.id) || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update active locale when source locale changes
  useEffect(() => {
    setActiveLocale(sourceLocale);
  }, [sourceLocale]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'readTimeMin') {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? parseInt(value) : null,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedIds = selectedOptions.map((option) => option.value);
    setFormData((prev) => ({ ...prev, tagIds: selectedIds }));
  };

  const handleAutoCalculateReadTime = () => {
    const sourceData = translations[sourceLocale];
    if (sourceData?.content) {
      const readTime = calculateReadTime(sourceData.content);
      setFormData((prev) => ({ ...prev, readTimeMin: readTime }));
    }
  };

  // Handle translation field changes (NEW)
  const handleTranslationChange = (
    locale: string,
    field: 'title' | 'summary' | 'content',
    value: string
  ) => {
    setTranslations((prev) => ({
      ...prev,
      [locale]: {
        ...prev[locale],
        [field]: value,
      },
    }));

    // Clear errors for source locale fields
    if (locale === sourceLocale && errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Auto-translate functionality (NEW)
  const handleAutoTranslate = async (targetLocale: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const sourceData = translations[sourceLocale];

    if (!sourceData.title || !sourceData.summary || !sourceData.content) {
      throw new Error('Please fill in all source fields before translating');
    }

    // Call AI service to translate text directly from current form state
    // This ensures we translate the CURRENT content, not what's in the database
    const [translatedTitle, translatedSummary, translatedContent] = await Promise.all([
      fetch(`${API_URL}/ai/translate-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          text: sourceData.title,
          sourceLocale,
          targetLocale,
        }),
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to translate title');
        return res.json();
      }),
      fetch(`${API_URL}/ai/translate-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          text: sourceData.summary,
          sourceLocale,
          targetLocale,
        }),
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to translate summary');
        return res.json();
      }),
      fetch(`${API_URL}/ai/translate-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          text: sourceData.content,
          sourceLocale,
          targetLocale,
        }),
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to translate content');
        return res.json();
      }),
    ]);

    // Update translations state with AI-generated content
    setTranslations((prev) => ({
      ...prev,
      [targetLocale]: {
        title: translatedTitle.translatedText || translatedTitle,
        summary: translatedSummary.translatedText || translatedSummary,
        content: translatedContent.translatedText || translatedContent,
      },
    }));
  };


  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const sourceData = translations[sourceLocale];

    // Validate source translation fields
    if (!sourceData.title.trim()) {
      newErrors.title = t('errors.requiredField');
    } else if (sourceData.title.length < 3) {
      newErrors.title = t('errors.minLength');
    }

    if (!sourceData.summary.trim()) {
      newErrors.summary = t('errors.requiredField');
    } else if (sourceData.summary.length < 10) {
      newErrors.summary = t('errors.minLength');
    }

    if (!sourceData.content.trim()) {
      newErrors.content = t('errors.requiredField');
    } else if (sourceData.content.length < 50) {
      newErrors.content = t('errors.minLength');
    }

    // Validate metadata fields
    if (!formData.categoryId) {
      newErrors.categoryId = t('errors.requiredField');
    }

    if (formData.externalUrl && !isValidUrl(formData.externalUrl)) {
      newErrors.externalUrl = t('errors.invalidUrl');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Switch to source locale tab to show errors
      setActiveLocale(sourceLocale);
      return;
    }

    const sourceData = translations[sourceLocale];

    // Prepare main resource data
    const submitData: CreateResourceData | UpdateResourceData = {
      title: sourceData.title,
      summary: sourceData.summary,
      content: sourceData.content,
      // Only include sourceLocale when creating (not when updating)
      ...(!initialData && { sourceLocale }),
      isPremium: formData.isPremium,
      ...(isAdmin && { isFeatured: formData.isFeatured }),
      authorName: formData.authorName || undefined,
      readTimeMin: formData.readTimeMin || undefined,
      externalUrl: formData.externalUrl || undefined,
      categoryId: formData.categoryId,
      tagIds: formData.tagIds.length > 0 ? formData.tagIds : undefined,
    };

    // Collect ALL translations including source locale (filter out empty ones)
    // When editing, we need to update the source locale translation too!
    const translationsToSubmit: Record<string, TranslationData> = {};
    Object.entries(translations).forEach(([locale, data]) => {
      if (data.title || data.summary || data.content) {
        translationsToSubmit[locale] = data;
      }
    });

    await onSubmit(submitData, translationsToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Source Locale Selector (NEW) */}
      <SourceLocaleSelector
        value={sourceLocale}
        onChange={setSourceLocale}
        availableLocales={availableLocales}
        disabled={!!initialData || isLoading}  // Cannot change after creation
      />

      {/* Translation Tabs (NEW) */}
      <TranslationTabs
        activeLocale={activeLocale}
        onLocaleChange={setActiveLocale}
        sourceLocale={sourceLocale}
        availableLocales={availableLocales}
        translations={translations}
      />

      {/* Translation Fields (NEW) */}
      <TranslationFields
        locale={activeLocale}
        data={translations[activeLocale]}
        isSource={activeLocale === sourceLocale}
        onChange={(field, value) => handleTranslationChange(activeLocale, field, value)}
        onAutoTranslate={
          activeLocale !== sourceLocale
            ? () => handleAutoTranslate(activeLocale)
            : undefined
        }
        disabled={isLoading}
      />

      {/* Show validation errors for source fields */}
      {activeLocale === sourceLocale && Object.keys(errors).length > 0 && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">
            {t('errors.validationFailed') || 'Please fix the errors above'}
          </p>
        </div>
      )}

      {/* Metadata fields divider */}
      <hr className="border-brandBorder" />
      <h3 className="text-lg font-semibold text-brandText">
        {t('form.metadataSection') || 'Resource Metadata'}
      </h3>

      {/* Category */}
      <div>
        <label
          htmlFor="categoryId"
          className="block text-sm font-medium text-brandText"
        >
          {t('form.category')} *
        </label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-lg border ${
            errors.categoryId ? 'border-red-500' : 'border-brandBorder'
          } px-4 py-2 text-brandText focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20`}
          disabled={isLoading}
        >
          <option value="">{t('form.selectCategory')}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.iconEmoji} {getCategoryName(category, sourceLocale)}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
        )}
        <p className="mt-1 text-xs text-brandText/60">
          {t('form.categoryHelper')}
        </p>
      </div>

      {/* Tags */}
      <div>
        <label
          htmlFor="tagIds"
          className="block text-sm font-medium text-brandText"
        >
          {t('form.tags')}
        </label>
        <select
          id="tagIds"
          name="tagIds"
          multiple
          value={formData.tagIds}
          onChange={handleTagsChange}
          className="mt-1 block w-full rounded-lg border border-brandBorder px-4 py-2 text-brandText focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20"
          size={5}
          disabled={isLoading}
        >
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {getTagName(tag, sourceLocale)}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-brandText/60">{t('form.tagsHelper')}</p>
      </div>

      {/* Premium & Featured checkboxes */}
      <div className="space-y-3">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPremium"
            name="isPremium"
            checked={formData.isPremium}
            onChange={handleChange}
            className="h-4 w-4 rounded border-brandBorder text-brandGreen focus:ring-brandGreen"
            disabled={isLoading}
          />
          <label
            htmlFor="isPremium"
            className="ml-2 block text-sm text-brandText"
          >
            {t('form.isPremium')}
          </label>
        </div>
        <p className="ml-6 text-xs text-brandText/60">
          {t('form.isPremiumHelper')}
        </p>

        {isAdmin && (
          <>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isFeatured"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="h-4 w-4 rounded border-brandBorder text-brandGreen focus:ring-brandGreen"
                disabled={isLoading}
              />
              <label
                htmlFor="isFeatured"
                className="ml-2 block text-sm text-brandText"
              >
                {t('form.isFeatured')}
              </label>
            </div>
            <p className="ml-6 text-xs text-brandText/60">
              {t('form.isFeaturedHelper')}
            </p>
          </>
        )}
      </div>

      {/* Author Name */}
      <div>
        <label
          htmlFor="authorName"
          className="block text-sm font-medium text-brandText"
        >
          {t('form.authorName')}
        </label>
        <input
          type="text"
          id="authorName"
          name="authorName"
          value={formData.authorName}
          onChange={handleChange}
          placeholder={t('form.authorNamePlaceholder')}
          className="mt-1 block w-full rounded-lg border border-brandBorder px-4 py-2 text-brandText focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20"
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-brandText/60">
          {t('form.authorNameHelper')}
        </p>
      </div>

      {/* Read Time */}
      <div>
        <label
          htmlFor="readTimeMin"
          className="block text-sm font-medium text-brandText"
        >
          {t('form.readTimeMin')}
        </label>
        <div className="mt-1 flex gap-2">
          <input
            type="number"
            id="readTimeMin"
            name="readTimeMin"
            value={formData.readTimeMin || ''}
            onChange={handleChange}
            placeholder={t('form.readTimeMinPlaceholder')}
            min="1"
            className="block w-full rounded-lg border border-brandBorder px-4 py-2 text-brandText focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={handleAutoCalculateReadTime}
            className="whitespace-nowrap rounded-lg border border-brandBorder bg-white px-4 py-2 text-sm font-medium text-brandText transition hover:bg-brandSurface"
            disabled={isLoading || !translations[sourceLocale]?.content}
          >
            {t('form.calculateReadTime')}
          </button>
        </div>
        <p className="mt-1 text-xs text-brandText/60">
          {t('form.readTimeMinHelper')}
        </p>
      </div>

      {/* External URL */}
      <div>
        <label
          htmlFor="externalUrl"
          className="block text-sm font-medium text-brandText"
        >
          {t('form.externalUrl')}
        </label>
        <input
          type="url"
          id="externalUrl"
          name="externalUrl"
          value={formData.externalUrl}
          onChange={handleChange}
          placeholder={t('form.externalUrlPlaceholder')}
          className={`mt-1 block w-full rounded-lg border ${
            errors.externalUrl ? 'border-red-500' : 'border-brandBorder'
          } px-4 py-2 text-brandText focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20`}
          disabled={isLoading}
        />
        {errors.externalUrl && (
          <p className="mt-1 text-sm text-red-600">{errors.externalUrl}</p>
        )}
        <p className="mt-1 text-xs text-brandText/60">
          {t('form.externalUrlHelper')}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 border-t border-brandBorder pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-brandGreen px-6 py-2 font-medium text-white transition hover:bg-brandGreen/90 disabled:opacity-50"
        >
          {isLoading
            ? '...'
            : initialData
            ? t('actions.save')
            : t('actions.create')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-lg border border-brandBorder bg-white px-6 py-2 font-medium text-brandText transition hover:bg-brandSurface disabled:opacity-50"
        >
          {t('actions.cancel')}
        </button>
      </div>
    </form>
  );
}
