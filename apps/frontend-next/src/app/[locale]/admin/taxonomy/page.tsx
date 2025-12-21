'use client';

/**
 * Admin Taxonomy Management Page
 * Allows admins to manage resource categories and tags
 */

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from '@/i18n/TranslationContext';
import AdminDashboardShell from '@/components/admin/AdminDashboardShell';
import {
  ResourceCategory,
  ResourceTag,
  ResourceCategoryTranslation,
  ResourceTagTranslation,
  getCategories,
  getTags,
  createCategory,
  updateCategory,
  deleteCategory,
  createTag,
  updateTag,
  deleteTag,
  getCategoryName,
  getTagName,
  getCategoryTranslations,
  upsertCategoryTranslation,
  deleteCategoryTranslation,
  getTagTranslations,
  upsertTagTranslation,
  deleteTagTranslation,
  CreateCategoryData,
  UpdateCategoryData,
  CreateTagData,
  UpdateTagData,
} from '@/lib/api/resources';

type Tab = 'categories' | 'tags';

export default function TaxonomyManagementPage() {
  const t = useTranslations('taxonomyManagement');
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  const [activeTab, setActiveTab] = useState<Tab>('categories');
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [tags, setTags] = useState<ResourceTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Category form state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ResourceCategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<CreateCategoryData>({
    name: '',
    slug: '',
    iconEmoji: '',
  });
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  // Tag form state
  const [showTagForm, setShowTagForm] = useState(false);
  const [editingTag, setEditingTag] = useState<ResourceTag | null>(null);
  const [tagFormData, setTagFormData] = useState<CreateTagData>({
    name: '',
    slug: '',
  });
  const [tagSubmitting, setTagSubmitting] = useState(false);

  // Delete confirmation state
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<ResourceCategory | null>(null);
  const [deleteConfirmTag, setDeleteConfirmTag] = useState<ResourceTag | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Translation management state
  const [translatingCategory, setTranslatingCategory] = useState<ResourceCategory | null>(null);
  const [translatingTag, setTranslatingTag] = useState<ResourceTag | null>(null);
  const [categoryTranslations, setCategoryTranslations] = useState<ResourceCategoryTranslation[]>([]);
  const [tagTranslations, setTagTranslations] = useState<ResourceTagTranslation[]>([]);
  const [activeTranslationLocale, setActiveTranslationLocale] = useState('en');
  const [translationFormData, setTranslationFormData] = useState({ name: '' });
  const [translationSubmitting, setTranslationSubmitting] = useState(false);

  // Available locales for translations
  const availableLocales = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [categoriesData, tagsData] = await Promise.all([
        getCategories(),
        getTags(),
      ]);
      setCategories(categoriesData);
      setTags(tagsData);
    } catch (err: any) {
      setError(err.message || t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  // ========== CATEGORY HANDLERS ==========

  const handleCreateCategory = () => {
    setCategoryFormData({ name: '', slug: '', iconEmoji: '' });
    setEditingCategory(null);
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category: ResourceCategory) => {
    // Get the name from the source locale translation
    const sourceTranslation = category.translations?.find(t => t.locale === category.sourceLocale);
    setCategoryFormData({
      name: sourceTranslation?.name || category.slug,
      slug: category.slug,
      iconEmoji: category.iconEmoji || '',
    });
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategorySubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (editingCategory) {
        // Update existing category
        const updated = await updateCategory(editingCategory.id, categoryFormData);
        setCategories((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
        setSuccess(t('success.categoryUpdated'));
      } else {
        // Create new category
        const created = await createCategory(categoryFormData);
        setCategories((prev) => [...prev, created]);
        setSuccess(t('success.categoryCreated'));
      }
      setShowCategoryForm(false);
      setCategoryFormData({ name: '', slug: '', iconEmoji: '' });
      setEditingCategory(null);
    } catch (err: any) {
      setError(
        err.message ||
          (editingCategory
            ? t('errors.categoryUpdateFailed')
            : t('errors.categoryCreateFailed'))
      );
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleDeleteCategory = async (category: ResourceCategory) => {
    setDeleting(true);
    setError('');
    setSuccess('');

    try {
      await deleteCategory(category.id);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      setSuccess(t('success.categoryDeleted'));
      setDeleteConfirmCategory(null);
    } catch (err: any) {
      setError(err.message || t('errors.categoryDeleteFailed'));
      setDeleteConfirmCategory(null);
    } finally {
      setDeleting(false);
    }
  };

  // ========== TAG HANDLERS ==========

  const handleCreateTag = () => {
    setTagFormData({ name: '', slug: '' });
    setEditingTag(null);
    setShowTagForm(true);
  };

  const handleEditTag = (tag: ResourceTag) => {
    // Get the name from the source locale translation
    const sourceTranslation = tag.translations?.find(t => t.locale === tag.sourceLocale);
    setTagFormData({
      name: sourceTranslation?.name || tag.slug,
      slug: tag.slug,
    });
    setEditingTag(tag);
    setShowTagForm(true);
  };

  const handleTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTagSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (editingTag) {
        // Update existing tag
        const updated = await updateTag(editingTag.id, tagFormData);
        setTags((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        setSuccess(t('success.tagUpdated'));
      } else {
        // Create new tag
        const created = await createTag(tagFormData);
        setTags((prev) => [...prev, created]);
        setSuccess(t('success.tagCreated'));
      }
      setShowTagForm(false);
      setTagFormData({ name: '', slug: '' });
      setEditingTag(null);
    } catch (err: any) {
      setError(
        err.message ||
          (editingTag ? t('errors.tagUpdateFailed') : t('errors.tagCreateFailed'))
      );
    } finally {
      setTagSubmitting(false);
    }
  };

  const handleDeleteTag = async (tag: ResourceTag) => {
    setDeleting(true);
    setError('');
    setSuccess('');

    try {
      await deleteTag(tag.id);
      setTags((prev) => prev.filter((t) => t.id !== tag.id));
      setSuccess(t('success.tagDeleted'));
      setDeleteConfirmTag(null);
    } catch (err: any) {
      setError(err.message || t('errors.tagDeleteFailed'));
      setDeleteConfirmTag(null);
    } finally {
      setDeleting(false);
    }
  };

  // ========== TRANSLATION HELPERS ==========

  /**
   * Auto-translate text using AI service
   */
  const autoTranslateText = async (
    text: string,
    sourceLocale: string,
    targetLocale: string
  ): Promise<string> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const response = await fetch(`${API_URL}/ai/translate-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        text,
        sourceLocale,
        targetLocale,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to translate text');
    }

    const data = await response.json();
    return data.translatedText || text;
  };

  // ========== TRANSLATION HANDLERS ==========

  const handleTranslateCategory = async (category: ResourceCategory) => {
    setTranslatingCategory(category);
    setTranslatingTag(null);
    setError('');
    setSuccess('');

    try {
      const translations = await getCategoryTranslations(category.id);
      setCategoryTranslations(translations);

      // Set initial locale to first non-source locale or English
      const initialLocale = availableLocales.find(l => l.code !== category.sourceLocale)?.code || 'en';
      setActiveTranslationLocale(initialLocale);

      // Check if translation already exists for this locale
      const existingTranslation = translations.find(t => t.locale === initialLocale);

      if (existingTranslation) {
        // Use existing translation
        setTranslationFormData({ name: existingTranslation.name });
      } else {
        // Auto-generate translation using AI
        const sourceTranslation = category.translations?.find(t => t.locale === category.sourceLocale);
        const sourceName = sourceTranslation?.name || category.slug;

        setTranslationFormData({ name: 'Generating...' });

        const translatedName = await autoTranslateText(
          sourceName,
          category.sourceLocale,
          initialLocale
        );

        setTranslationFormData({ name: translatedName });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load translations');
      setTranslationFormData({ name: '' });
    }
  };

  const handleTranslateTag = async (tag: ResourceTag) => {
    setTranslatingTag(tag);
    setTranslatingCategory(null);
    setError('');
    setSuccess('');

    try {
      const translations = await getTagTranslations(tag.id);
      setTagTranslations(translations);

      // Set initial locale to first non-source locale or English
      const initialLocale = availableLocales.find(l => l.code !== tag.sourceLocale)?.code || 'en';
      setActiveTranslationLocale(initialLocale);

      // Check if translation already exists for this locale
      const existingTranslation = translations.find(t => t.locale === initialLocale);

      if (existingTranslation) {
        // Use existing translation
        setTranslationFormData({ name: existingTranslation.name });
      } else {
        // Auto-generate translation using AI
        const sourceTranslation = tag.translations?.find(t => t.locale === tag.sourceLocale);
        const sourceName = sourceTranslation?.name || tag.slug;

        setTranslationFormData({ name: 'Generating...' });

        const translatedName = await autoTranslateText(
          sourceName,
          tag.sourceLocale,
          initialLocale
        );

        setTranslationFormData({ name: translatedName });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load translations');
      setTranslationFormData({ name: '' });
    }
  };

  const handleTranslationLocaleChange = async (newLocale: string) => {
    setActiveTranslationLocale(newLocale);
    const currentTranslations = translatingCategory ? categoryTranslations : tagTranslations;
    const existingTranslation = currentTranslations.find(t => t.locale === newLocale);

    if (existingTranslation) {
      // Use existing translation
      setTranslationFormData({ name: existingTranslation.name });
    } else {
      // Auto-generate translation using AI
      const entity = translatingCategory || translatingTag;
      if (!entity) return;

      const sourceTranslation = entity.translations?.find(t => t.locale === entity.sourceLocale);
      const sourceName = sourceTranslation?.name || entity.slug;

      setTranslationFormData({ name: 'Generating...' });

      try {
        const translatedName = await autoTranslateText(
          sourceName,
          entity.sourceLocale,
          newLocale
        );
        setTranslationFormData({ name: translatedName });
      } catch (err: any) {
        setError(err.message || 'Failed to generate translation');
        setTranslationFormData({ name: '' });
      }
    }
  };

  const handleSaveTranslation = async () => {
    setTranslationSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (translatingCategory) {
        const updated = await upsertCategoryTranslation(
          translatingCategory.id,
          activeTranslationLocale,
          translationFormData.name
        );

        // Update translations list
        setCategoryTranslations(prev => {
          const filtered = prev.filter(t => t.locale !== activeTranslationLocale);
          return [...filtered, updated];
        });

        // Refresh categories to show updated translations
        const categoriesData = await getCategories();
        setCategories(categoriesData);

        setSuccess('Translation saved successfully');
      } else if (translatingTag) {
        const updated = await upsertTagTranslation(
          translatingTag.id,
          activeTranslationLocale,
          translationFormData.name
        );

        // Update translations list
        setTagTranslations(prev => {
          const filtered = prev.filter(t => t.locale !== activeTranslationLocale);
          return [...filtered, updated];
        });

        // Refresh tags to show updated translations
        const tagsData = await getTags();
        setTags(tagsData);

        setSuccess('Translation saved successfully');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save translation');
    } finally {
      setTranslationSubmitting(false);
    }
  };

  const handleDeleteTranslation = async () => {
    if (!window.confirm(`Delete ${activeTranslationLocale} translation?`)) return;

    setTranslationSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (translatingCategory) {
        await deleteCategoryTranslation(translatingCategory.id, activeTranslationLocale);
        setCategoryTranslations(prev => prev.filter(t => t.locale !== activeTranslationLocale));
        setTranslationFormData({ name: '' });
        setSuccess('Translation deleted successfully');
      } else if (translatingTag) {
        await deleteTagTranslation(translatingTag.id, activeTranslationLocale);
        setTagTranslations(prev => prev.filter(t => t.locale !== activeTranslationLocale));
        setTranslationFormData({ name: '' });
        setSuccess('Translation deleted successfully');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete translation');
    } finally {
      setTranslationSubmitting(false);
    }
  };

  const handleRegenerateTranslation = async () => {
    const entity = translatingCategory || translatingTag;
    if (!entity) return;

    setError('');
    setSuccess('');

    const sourceTranslation = entity.translations?.find(t => t.locale === entity.sourceLocale);
    const sourceName = sourceTranslation?.name || entity.slug;

    setTranslationFormData({ name: 'Generating...' });

    try {
      const translatedName = await autoTranslateText(
        sourceName,
        entity.sourceLocale,
        activeTranslationLocale
      );
      setTranslationFormData({ name: translatedName });
      setSuccess('Translation regenerated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate translation');
      setTranslationFormData({ name: '' });
    }
  };

  // Auto-generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove consecutive hyphens
      .trim();
  };

  const handleTabChange = (tab: 'dashboard' | 'resources' | 'sessions' | 'taxonomy') => {
    if (tab === 'taxonomy') {
      // Already on taxonomy page, do nothing
      return;
    }
    // Navigate back to main admin page with the selected tab
    if (tab === 'dashboard') {
      router.push(`/${locale}/admin`);
    } else {
      router.push(`/${locale}/admin?tab=${tab}`);
    }
  };

  if (loading) {
    return (
      <AdminDashboardShell
        activeTab="taxonomy"
        onTabChange={handleTabChange}
        locale={locale}
      >
        <div className="flex h-64 items-center justify-center">
          <p className="text-brandText/60">{t('loading')}</p>
        </div>
      </AdminDashboardShell>
    );
  }

  return (
    <AdminDashboardShell
      activeTab="taxonomy"
      onTabChange={handleTabChange}
      locale={locale}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-brandText">{t('title')}</h1>
          <p className="mt-2 text-brandText/60">{t('subtitle')}</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="rounded-lg bg-green-50 p-4 text-green-600">
            {success}
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
        )}

        {/* Tabs */}
        <div className="border-b border-brandBorder">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('categories')}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition ${
                activeTab === 'categories'
                  ? 'border-brandGreen text-brandGreen'
                  : 'border-transparent text-brandText/60 hover:border-brandText/30 hover:text-brandText'
              }`}
            >
              {t('tabs.categories')}
            </button>
            <button
              onClick={() => setActiveTab('tags')}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition ${
                activeTab === 'tags'
                  ? 'border-brandGreen text-brandGreen'
                  : 'border-transparent text-brandText/60 hover:border-brandText/30 hover:text-brandText'
              }`}
            >
              {t('tabs.tags')}
            </button>
          </nav>
        </div>

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-brandText">
                  {t('categories.title')}
                </h2>
                <p className="mt-1 text-sm text-brandText/60">
                  {t('categories.description')}
                </p>
              </div>
              <button
                onClick={handleCreateCategory}
                className="rounded-lg bg-brandGreen px-6 py-2 font-medium text-white transition hover:bg-brandGreen/90"
              >
                {t('categories.createNew')}
              </button>
            </div>

            {/* Categories List */}
            {categories.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-brandBorder bg-brandSurface/30 p-12 text-center">
                <p className="text-lg font-medium text-brandText">
                  {t('categories.noCategories')}
                </p>
                <p className="mt-2 text-brandText/60">
                  {t('categories.noCategoriesDescription')}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="rounded-lg border border-brandBorder bg-white p-4 transition hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {category.iconEmoji && (
                          <span className="text-2xl">{category.iconEmoji}</span>
                        )}
                        <div>
                          <h3 className="font-semibold text-brandText">
                            {getCategoryName(category, locale)}
                          </h3>
                          <p className="text-xs text-brandText/60">
                            /{category.slug}
                          </p>
                        </div>
                      </div>
                    </div>
                    {category._count && (
                      <p className="mt-2 text-sm text-brandText/60">
                        {category._count.resources === 1
                          ? t('categories.resourceCount').replace('{{count}}', category._count.resources.toString())
                          : t('categories.resourceCount_plural').replace('{{count}}', category._count.resources.toString())}
                      </p>
                    )}
                    <div className="mt-4 flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="flex-1 rounded-lg border border-brandBorder bg-white px-4 py-2 text-sm font-medium text-brandText transition hover:bg-brandSurface"
                        >
                          {t('actions.edit')}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmCategory(category)}
                          className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                          {t('actions.delete')}
                        </button>
                      </div>
                      <button
                        onClick={() => handleTranslateCategory(category)}
                        className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                      >
                        🌐 Translate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tags Tab */}
        {activeTab === 'tags' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-brandText">
                  {t('tags.title')}
                </h2>
                <p className="mt-1 text-sm text-brandText/60">
                  {t('tags.description')}
                </p>
              </div>
              <button
                onClick={handleCreateTag}
                className="rounded-lg bg-brandGreen px-6 py-2 font-medium text-white transition hover:bg-brandGreen/90"
              >
                {t('tags.createNew')}
              </button>
            </div>

            {/* Tags List */}
            {tags.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-brandBorder bg-brandSurface/30 p-12 text-center">
                <p className="text-lg font-medium text-brandText">
                  {t('tags.noTags')}
                </p>
                <p className="mt-2 text-brandText/60">
                  {t('tags.noTagsDescription')}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="rounded-lg border border-brandBorder bg-white p-4 transition hover:shadow-md"
                  >
                    <div>
                      <h3 className="font-semibold text-brandText">
                        #{getTagName(tag, locale)}
                      </h3>
                      <p className="text-xs text-brandText/60">/{tag.slug}</p>
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditTag(tag)}
                          className="flex-1 rounded-lg border border-brandBorder bg-white px-3 py-1.5 text-xs font-medium text-brandText transition hover:bg-brandSurface"
                        >
                          {t('actions.edit')}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmTag(tag)}
                          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                          {t('actions.delete')}
                        </button>
                      </div>
                      <button
                        onClick={() => handleTranslateTag(tag)}
                        className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                      >
                        🌐 Translate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Category Form Modal */}
        {showCategoryForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6">
              <h3 className="text-lg font-semibold text-brandText">
                {editingCategory
                  ? t('categories.editCategory')
                  : t('categories.createNew')}
              </h3>
              <form onSubmit={handleCategorySubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brandText">
                    {t('categories.form.name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryFormData.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setCategoryFormData({
                        ...categoryFormData,
                        name: newName,
                        slug: editingCategory ? categoryFormData.slug : generateSlug(newName),
                      });
                    }}
                    placeholder={t('categories.form.namePlaceholder')}
                    className="mt-1 w-full rounded-lg border border-brandBorder px-4 py-2 focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20"
                  />
                  <p className="mt-1 text-xs text-brandText/60">
                    {t('categories.form.nameHelper')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brandText">
                    {t('categories.form.slug')}
                  </label>
                  <input
                    type="text"
                    required
                    pattern="^[a-z0-9-]+$"
                    value={categoryFormData.slug}
                    onChange={(e) =>
                      setCategoryFormData({
                        ...categoryFormData,
                        slug: e.target.value,
                      })
                    }
                    placeholder={t('categories.form.slugPlaceholder')}
                    className="mt-1 w-full rounded-lg border border-brandBorder px-4 py-2 focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20"
                  />
                  <p className="mt-1 text-xs text-brandText/60">
                    {t('categories.form.slugHelper')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brandText">
                    {t('categories.form.iconEmoji')}
                  </label>
                  <input
                    type="text"
                    value={categoryFormData.iconEmoji}
                    onChange={(e) =>
                      setCategoryFormData({
                        ...categoryFormData,
                        iconEmoji: e.target.value,
                      })
                    }
                    placeholder={t('categories.form.iconEmojiPlaceholder')}
                    className="mt-1 w-full rounded-lg border border-brandBorder px-4 py-2 focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20"
                  />
                  <p className="mt-1 text-xs text-brandText/60">
                    {t('categories.form.iconEmojiHelper')}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={categorySubmitting}
                    className="flex-1 rounded-lg bg-brandGreen px-4 py-2 font-medium text-white transition hover:bg-brandGreen/90 disabled:opacity-50"
                  >
                    {categorySubmitting
                      ? t('loading')
                      : editingCategory
                      ? t('actions.save')
                      : t('actions.create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryForm(false);
                      setCategoryFormData({ name: '', slug: '', iconEmoji: '' });
                      setEditingCategory(null);
                    }}
                    disabled={categorySubmitting}
                    className="flex-1 rounded-lg border border-brandBorder bg-white px-4 py-2 font-medium text-brandText transition hover:bg-brandSurface disabled:opacity-50"
                  >
                    {t('actions.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tag Form Modal */}
        {showTagForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6">
              <h3 className="text-lg font-semibold text-brandText">
                {editingTag ? t('tags.editTag') : t('tags.createNew')}
              </h3>
              <form onSubmit={handleTagSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brandText">
                    {t('tags.form.name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={tagFormData.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setTagFormData({
                        ...tagFormData,
                        name: newName,
                        slug: editingTag ? tagFormData.slug : generateSlug(newName),
                      });
                    }}
                    placeholder={t('tags.form.namePlaceholder')}
                    className="mt-1 w-full rounded-lg border border-brandBorder px-4 py-2 focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20"
                  />
                  <p className="mt-1 text-xs text-brandText/60">
                    {t('tags.form.nameHelper')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brandText">
                    {t('tags.form.slug')}
                  </label>
                  <input
                    type="text"
                    required
                    pattern="^[a-z0-9-]+$"
                    value={tagFormData.slug}
                    onChange={(e) =>
                      setTagFormData({
                        ...tagFormData,
                        slug: e.target.value,
                      })
                    }
                    placeholder={t('tags.form.slugPlaceholder')}
                    className="mt-1 w-full rounded-lg border border-brandBorder px-4 py-2 focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20"
                  />
                  <p className="mt-1 text-xs text-brandText/60">
                    {t('tags.form.slugHelper')}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={tagSubmitting}
                    className="flex-1 rounded-lg bg-brandGreen px-4 py-2 font-medium text-white transition hover:bg-brandGreen/90 disabled:opacity-50"
                  >
                    {tagSubmitting
                      ? t('loading')
                      : editingTag
                      ? t('actions.save')
                      : t('actions.create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTagForm(false);
                      setTagFormData({ name: '', slug: '' });
                      setEditingTag(null);
                    }}
                    disabled={tagSubmitting}
                    className="flex-1 rounded-lg border border-brandBorder bg-white px-4 py-2 font-medium text-brandText transition hover:bg-brandSurface disabled:opacity-50"
                  >
                    {t('actions.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Category Delete Confirmation Modal */}
        {deleteConfirmCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6">
              <h3 className="text-lg font-semibold text-brandText">
                {t('categories.deleteConfirm.title')}
              </h3>
              <p className="mt-2 text-sm text-brandText/60">
                {t('categories.deleteConfirm.message')}
              </p>
              {deleteConfirmCategory._count &&
                deleteConfirmCategory._count.resources > 0 && (
                  <p className="mt-2 text-sm text-red-600">
                    {deleteConfirmCategory._count.resources === 1
                      ? t('categories.deleteConfirm.warningHasResources').replace('{{count}}', deleteConfirmCategory._count.resources.toString())
                      : t('categories.deleteConfirm.warningHasResources_plural').replace('{{count}}', deleteConfirmCategory._count.resources.toString())}
                  </p>
                )}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleDeleteCategory(deleteConfirmCategory)}
                  disabled={
                    deleting ||
                    (deleteConfirmCategory._count &&
                      deleteConfirmCategory._count.resources > 0)
                  }
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? t('loading') : t('categories.deleteConfirm.confirm')}
                </button>
                <button
                  onClick={() => setDeleteConfirmCategory(null)}
                  disabled={deleting}
                  className="flex-1 rounded-lg border border-brandBorder bg-white px-4 py-2 font-medium text-brandText transition hover:bg-brandSurface disabled:opacity-50"
                >
                  {t('categories.deleteConfirm.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tag Delete Confirmation Modal */}
        {deleteConfirmTag && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6">
              <h3 className="text-lg font-semibold text-brandText">
                {t('tags.deleteConfirm.title')}
              </h3>
              <p className="mt-2 text-sm text-brandText/60">
                {t('tags.deleteConfirm.message')}
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleDeleteTag(deleteConfirmTag)}
                  disabled={deleting}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? t('loading') : t('tags.deleteConfirm.confirm')}
                </button>
                <button
                  onClick={() => setDeleteConfirmTag(null)}
                  disabled={deleting}
                  className="flex-1 rounded-lg border border-brandBorder bg-white px-4 py-2 font-medium text-brandText transition hover:bg-brandSurface disabled:opacity-50"
                >
                  {t('tags.deleteConfirm.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Translation Modal */}
        {(translatingCategory || translatingTag) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
            <div className="w-full max-w-2xl rounded-lg bg-white p-6 my-8">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-brandText">
                  🌐 Translate:{' '}
                  {translatingCategory
                    ? getCategoryName(translatingCategory, translatingCategory.sourceLocale)
                    : translatingTag
                      ? getTagName(translatingTag, translatingTag.sourceLocale)
                      : ''}
                </h3>
                <button
                  onClick={() => {
                    setTranslatingCategory(null);
                    setTranslatingTag(null);
                  }}
                  className="text-2xl text-brandText/60 hover:text-brandText"
                >
                  ×
                </button>
              </div>

              {/* Locale Tabs */}
              <div className="mb-4 flex gap-2 border-b border-brandBorder">
                {availableLocales.map((loc) => {
                  const entitySourceLocale = translatingCategory
                    ? translatingCategory.sourceLocale
                    : translatingTag?.sourceLocale || 'fr';
                  const isSource = loc.code === entitySourceLocale;
                  const isActive = loc.code === activeTranslationLocale;

                  return (
                    <button
                      key={loc.code}
                      onClick={() => handleTranslationLocaleChange(loc.code)}
                      disabled={isSource}
                      className={`px-4 py-2 font-medium transition ${
                        isActive
                          ? 'border-b-2 border-brandPrimary text-brandPrimary'
                          : isSource
                            ? 'cursor-not-allowed text-brandText/30'
                            : 'text-brandText/60 hover:text-brandText'
                      }`}
                    >
                      {loc.name}
                      {isSource && ' (Source)'}
                    </button>
                  );
                })}
              </div>

              {/* Translation Form */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-brandText">
                      Translated Name
                    </label>
                    <button
                      type="button"
                      onClick={handleRegenerateTranslation}
                      disabled={translationSubmitting}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                      🔄 Re-generate with AI
                    </button>
                  </div>
                  <input
                    type="text"
                    value={translationFormData.name}
                    onChange={(e) =>
                      setTranslationFormData({ ...translationFormData, name: e.target.value })
                    }
                    disabled={translationFormData.name === 'Generating...'}
                    className="mt-1 w-full rounded-lg border border-brandBorder px-4 py-2 focus:border-brandPrimary focus:outline-none disabled:bg-gray-50 disabled:cursor-wait"
                    placeholder={`Enter name in ${availableLocales.find((l) => l.code === activeTranslationLocale)?.name}`}
                  />
                  <p className="mt-1 text-xs text-brandText/60">
                    AI-generated translation. Edit as needed before saving.
                  </p>
                </div>

                {/* Existing Translations Display */}
                <div className="rounded-lg bg-brandSurface p-4">
                  <h4 className="mb-2 text-sm font-semibold text-brandText">
                    Current Translations:
                  </h4>
                  <div className="space-y-1">
                    {(() => {
                      const currentTranslations = translatingCategory ? categoryTranslations : tagTranslations;
                      return currentTranslations.length === 0 ? (
                        <p className="text-sm text-brandText/60">
                          No translations yet. Start by adding one above.
                        </p>
                      ) : (
                        currentTranslations.map((trans) => (
                          <div
                            key={trans.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-brandText">
                              <span className="font-semibold">
                                {availableLocales.find((l) => l.code === trans.locale)?.name}:
                              </span>{' '}
                              {trans.name}
                            </span>
                          </div>
                        ))
                      );
                    })()}
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
                    {success}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSaveTranslation}
                    disabled={translationSubmitting || !translationFormData.name.trim() || translationFormData.name === 'Generating...'}
                    className="flex-1 min-w-[120px] rounded-lg bg-brandGreen px-4 py-2 font-medium text-white transition hover:bg-brandGreen/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {translationSubmitting ? 'Saving...' : 'Save Translation'}
                  </button>
                  <button
                    onClick={handleDeleteTranslation}
                    disabled={
                      translationSubmitting ||
                      !(translatingCategory ? categoryTranslations : tagTranslations).some(
                        (t) => t.locale === activeTranslationLocale
                      )
                    }
                    className="rounded-lg border border-red-200 bg-white px-4 py-2 font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete Translation
                  </button>
                  <button
                    onClick={() => {
                      setTranslatingCategory(null);
                      setTranslatingTag(null);
                    }}
                    className="rounded-lg border border-brandBorder bg-white px-4 py-2 font-medium text-brandText transition hover:bg-brandSurface"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardShell>
  );
}
