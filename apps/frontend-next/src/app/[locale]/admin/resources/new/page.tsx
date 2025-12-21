'use client';

/**
 * Admin Create Resource Page
 * Form for creating a new resource with admin privileges and translation support
 * Integrated within AdminDashboardShell
 */

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from '@/i18n/TranslationContext';
import AdminDashboardShell from '@/components/admin/AdminDashboardShell';
import ResourceForm from '@/components/resources/ResourceForm';
import {
  ResourceCategory,
  ResourceTag,
  CreateResourceData,
  UpdateResourceData,
  getCategories,
  getTags,
  createResource,
  updateTranslation,
} from '@/lib/api/resources';

interface TranslationData {
  title: string;
  summary: string;
  content: string;
}

export default function AdminNewResourcePage() {
  const t = useTranslations('resourcesManagement');
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

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
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoading(true);
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

  const handleSubmit = async (
    data: CreateResourceData | UpdateResourceData,
    translations?: Record<string, TranslationData>
  ) => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      // Step 1: Create resource with source translation
      const createdResource = await createResource(data as CreateResourceData);

      // Step 2: Save translations for other locales (if any)
      // IMPORTANT: Filter out the source locale - it's already created with the resource
      if (translations && Object.keys(translations).length > 0) {
        const sourceLocale = (data as CreateResourceData).sourceLocale || 'fr';
        const targetTranslations = Object.entries(translations).filter(
          ([localeCode]) => localeCode !== sourceLocale
        );

        if (targetTranslations.length > 0) {
          await Promise.all(
            targetTranslations.map(([localeCode, translationData]) =>
              updateTranslation(createdResource.id, localeCode, {
                title: translationData.title,
                summary: translationData.summary,
                content: translationData.content,
              })
            )
          );
        }
      }

      setSuccess(t('success.created'));

      // Redirect to admin panel resources tab after a short delay
      setTimeout(() => {
        router.push(`/${locale}/admin`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || t('errors.createFailed'));
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
              {t('createResource')}
            </h1>
            <p className="mt-2 text-brandText/60">
              {t('createResourceDescription') || 'Create a new resource with automatic translation support'}
            </p>
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
          <div className="rounded-lg border border-brandBorder bg-white p-6">
            <ResourceForm
              categories={categories}
              tags={tags}
              availableLocales={availableLocales}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isAdmin={true}
              isLoading={submitting}
            />
          </div>
        </div>
      )}
    </AdminDashboardShell>
  );
}
