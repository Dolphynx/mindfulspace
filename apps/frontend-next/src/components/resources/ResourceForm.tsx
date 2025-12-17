'use client';

/**
 * ResourceForm Component
 * Reusable form for creating and editing resources
 * Used by both coaches and admins
 */

import { useState, useEffect } from 'react';
import { useTranslations } from '@/i18n/TranslationContext';
import {
  Resource,
  ResourceCategory,
  ResourceTag,
  ResourceType,
  CreateResourceData,
  UpdateResourceData,
  generateSlug,
  calculateReadTime,
  getResourceTypeLabel,
} from '@/lib/api/resources';

interface ResourceFormProps {
  initialData?: Resource;
  categories: ResourceCategory[];
  tags: ResourceTag[];
  onSubmit: (data: CreateResourceData | UpdateResourceData) => Promise<void>;
  onCancel: () => void;
  isAdmin?: boolean;
  isLoading?: boolean;
}

export default function ResourceForm({
  initialData,
  categories,
  tags,
  onSubmit,
  onCancel,
  isAdmin = false,
  isLoading = false,
}: ResourceFormProps) {
  const t = useTranslations('resourcesManagement');

  // Form state
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    summary: initialData?.summary || '',
    content: initialData?.content || '',
    type: initialData?.type || ResourceType.ARTICLE,
    isPremium: initialData?.isPremium || false,
    isFeatured: initialData?.isFeatured || false,
    authorName: initialData?.authorName || '',
    readTimeMin: initialData?.readTimeMin || null,
    externalUrl: initialData?.externalUrl || '',
    categoryId: initialData?.categoryId || '',
    tagIds: initialData?.tags?.map((t) => t.tag.id) || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(!initialData);

  // Auto-generate slug when title changes
  useEffect(() => {
    if (autoGenerateSlug && formData.title) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(formData.title),
      }));
    }
  }, [formData.title, autoGenerateSlug]);

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
    if (formData.content) {
      const readTime = calculateReadTime(formData.content);
      setFormData((prev) => ({ ...prev, readTimeMin: readTime }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = t('errors.requiredField');
    } else if (formData.title.length < 3) {
      newErrors.title = t('errors.minLength');
    }

    if (!formData.slug.trim()) {
      newErrors.slug = t('errors.requiredField');
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = t('errors.invalidSlug');
    }

    if (!formData.summary.trim()) {
      newErrors.summary = t('errors.requiredField');
    } else if (formData.summary.length < 10) {
      newErrors.summary = t('errors.minLength');
    }

    if (!formData.content.trim()) {
      newErrors.content = t('errors.requiredField');
    } else if (formData.content.length < 50) {
      newErrors.content = t('errors.minLength');
    }

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
      return;
    }

    // Prepare data for submission
    const submitData: CreateResourceData | UpdateResourceData = {
      title: formData.title,
      slug: formData.slug,
      summary: formData.summary,
      content: formData.content,
      type: formData.type as ResourceType,
      isPremium: formData.isPremium,
      // Only include isFeatured if user is admin
      ...(isAdmin && { isFeatured: formData.isFeatured }),
      authorName: formData.authorName || undefined,
      readTimeMin: formData.readTimeMin || undefined,
      externalUrl: formData.externalUrl || undefined,
      categoryId: formData.categoryId,
      tagIds: formData.tagIds.length > 0 ? formData.tagIds : undefined,
    };

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-brandText"
        >
          {t('form.title')} *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder={t('form.titlePlaceholder')}
          className={`mt-1 block w-full rounded-lg border ${
            errors.title ? 'border-red-500' : 'border-brandBorder'
          } px-4 py-2 text-brandText focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20`}
          disabled={isLoading}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
        <p className="mt-1 text-xs text-brandText/60">
          {t('form.titleHelper')}
        </p>
      </div>

      {/* Slug */}
      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-brandText"
        >
          {t('form.slug')} *
        </label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={(e) => {
              handleChange(e);
              setAutoGenerateSlug(false);
            }}
            placeholder={t('form.slugPlaceholder')}
            className={`block w-full rounded-lg border ${
              errors.slug ? 'border-red-500' : 'border-brandBorder'
            } px-4 py-2 text-brandText focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => {
              setAutoGenerateSlug(true);
              setFormData((prev) => ({
                ...prev,
                slug: generateSlug(formData.title),
              }));
            }}
            className="whitespace-nowrap rounded-lg border border-brandBorder bg-white px-4 py-2 text-sm font-medium text-brandText transition hover:bg-brandSurface"
            disabled={isLoading || !formData.title}
          >
            {t('form.generateSlug')}
          </button>
        </div>
        {errors.slug && (
          <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
        )}
        <p className="mt-1 text-xs text-brandText/60">{t('form.slugHelper')}</p>
      </div>

      {/* Summary */}
      <div>
        <label
          htmlFor="summary"
          className="block text-sm font-medium text-brandText"
        >
          {t('form.summary')} *
        </label>
        <textarea
          id="summary"
          name="summary"
          value={formData.summary}
          onChange={handleChange}
          placeholder={t('form.summaryPlaceholder')}
          rows={3}
          maxLength={500}
          className={`mt-1 block w-full rounded-lg border ${
            errors.summary ? 'border-red-500' : 'border-brandBorder'
          } px-4 py-2 text-brandText focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20`}
          disabled={isLoading}
        />
        {errors.summary && (
          <p className="mt-1 text-sm text-red-600">{errors.summary}</p>
        )}
        <p className="mt-1 text-xs text-brandText/60">
          {t('form.summaryHelper')} ({formData.summary.length}/500)
        </p>
      </div>

      {/* Content */}
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-brandText"
        >
          {t('form.content')} *
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder={t('form.contentPlaceholder')}
          rows={12}
          className={`mt-1 block w-full rounded-lg border ${
            errors.content ? 'border-red-500' : 'border-brandBorder'
          } px-4 py-2 font-mono text-sm focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20`}
          disabled={isLoading}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content}</p>
        )}
        <p className="mt-1 text-xs text-brandText/60">
          {t('form.contentHelper')}
        </p>
      </div>

      {/* Type */}
      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-brandText"
        >
          {t('form.type')} *
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-brandBorder px-4 py-2 text-brandText focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20"
          disabled={isLoading}
        >
          {Object.values(ResourceType).map((type) => (
            <option key={type} value={type}>
              {getResourceTypeLabel(type)}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-brandText/60">{t('form.typeHelper')}</p>
      </div>

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
              {category.iconEmoji} {category.name}
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
              {tag.name}
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
            disabled={isLoading || !formData.content}
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
