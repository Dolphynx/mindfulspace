'use client';

/**
 * Admin Edit Resource Page
 * Form for editing any resource with admin privileges
 * Integrated within AdminDashboardShell
 */

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from '@/i18n/TranslationContext';
import AdminDashboardShell from '@/components/admin/AdminDashboardShell';
import ResourceForm from '@/components/resources/ResourceForm';
import {
  Resource,
  ResourceCategory,
  ResourceTag,
  CreateResourceData,
  UpdateResourceData,
  getCategories,
  getTags,
  getResources,
  updateResource,
  updateTranslation,
} from '@/lib/api/resources';

interface TranslationData {
  title: string;
  summary: string;
  content: string;
}

export default function AdminEditResourcePage() {
  const t = useTranslations('resourcesManagement');
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = pathname.split('/')[1] || 'en';
  const resourceId = params.id as string;

  const [resource, setResource] = useState<Resource | null>(null);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [tags, setTags] = useState<ResourceTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Available locales for translation
  const availableLocales = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' },
  ];

  useEffect(() => {
    loadData();
  }, [resourceId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allResources, categoriesData, tagsData] = await Promise.all([
        getResources(),
        getCategories(),
        getTags(),
      ]);

      const resourceData = allResources.find((r) => r.id === resourceId);

      if (!resourceData) {
        setError(t('errors.notFound'));
        return;
      }

      // Populate resource with all translations for the form
      // The form expects translations to be available in the format it understands
      const resourceWithTranslations = {
        ...resourceData,
        // Add title/summary/content from source locale translation for backward compatibility
        title: resourceData.translations?.find((tr) => tr.locale === resourceData.sourceLocale)?.title || '',
        summary: resourceData.translations?.find((tr) => tr.locale === resourceData.sourceLocale)?.summary || '',
        content: resourceData.translations?.find((tr) => tr.locale === resourceData.sourceLocale)?.content || '',
      };

      setResource(resourceWithTranslations);
      setCategories(categoriesData);
      setTags(tagsData);
    } catch (err: any) {
      setError(err.message || t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (
    data: CreateResourceData | UpdateResourceData,
    translations?: Record<string, TranslationData>
  ) => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      // Update resource
      await updateResource(resourceId, data);

      // Update translations (if any provided)
      if (translations && Object.keys(translations).length > 0) {
        await Promise.all(
          Object.entries(translations).map(([localeCode, translationData]) =>
            updateTranslation(resourceId, localeCode, {
              title: translationData.title,
              summary: translationData.summary,
              content: translationData.content,
            })
          )
        );
      }

      setSuccess(t('success.updated'));

      // Redirect to admin panel resources tab after a short delay
      setTimeout(() => {
        router.push(`/${locale}/admin`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || t('errors.updateFailed'));
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/admin`);
  };

  return (
    <AdminDashboardShell
      activeTab="resources"
      onTabChange={(tab) => router.push(`/${locale}/admin`)}
      locale={locale}
    >
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-brandText/60">Chargement...</p>
        </div>
      ) : error && !resource ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
          <Link
            href={`/${locale}/admin`}
            className="inline-block text-sm text-brandText/60 transition hover:text-brandText"
          >
            ← {t('actions.back')}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <Link
              href={`/${locale}/admin`}
              className="inline-flex items-center text-sm text-brandText/60 transition hover:text-brandText"
            >
              ← {t('actions.back')}
            </Link>
            <h1 className="mt-4 text-3xl font-bold text-brandText">
              {t('editResource')}
            </h1>
          </div>

          {/* Success message */}
          {success && (
            <div className="rounded-lg bg-green-50 p-4 text-green-600">
              {success}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          {resource && (
            <div className="rounded-lg border border-brandBorder bg-white p-6">
              <ResourceForm
                initialData={resource}
                categories={categories}
                tags={tags}
                availableLocales={availableLocales}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isAdmin={true}
                isLoading={submitting}
              />
            </div>
          )}
        </div>
      )}
    </AdminDashboardShell>
  );
}
