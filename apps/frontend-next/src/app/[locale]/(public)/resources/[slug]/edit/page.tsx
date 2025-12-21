'use client';

/**
 * Edit Resource Page
 * Accessible from public resources page for coaches/admins
 * Form for editing an existing resource
 */

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from '@/i18n/TranslationContext';
import { useAuth } from '@/contexts/AuthContext';
import ResourceForm from '@/components/resources/ResourceForm';
import {
  Resource,
  ResourceCategory,
  ResourceTag,
  CreateResourceData,
  UpdateResourceData,
  getCategories,
  getTags,
  getResourceBySlug,
  updateResource,
  updateTranslation,
} from '@/lib/api/resources';

interface TranslationData {
  title: string;
  summary: string;
  content: string;
}

export default function EditResourcePage() {
  const t = useTranslations('resourcesManagement');
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = pathname.split('/')[1] || 'en';
  const slug = params.slug as string;

  // Available locales for translation
  const availableLocales = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' },
  ];

  const [resource, setResource] = useState<Resource | null>(null);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [tags, setTags] = useState<ResourceTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if user is coach or admin
  const isCoach = user?.roles.some((role) =>
    ['coach', 'admin'].includes(role.toLowerCase())
  ) ?? false;

  const isAdmin = user?.roles.some(
    (role) => role.toLowerCase() === 'admin'
  ) ?? false;

  // Redirect if not authorized
  useEffect(() => {
    if (!user) {
      router.push(`/${locale}/auth/login`);
    } else if (!isCoach) {
      router.push(`/${locale}/resources`);
    }
  }, [user, isCoach, locale, router]);

  useEffect(() => {
    if (isCoach && slug) {
      loadData();
    }
  }, [isCoach, slug]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch resource by slug and categories/tags
      const [resourceData, categoriesData, tagsData] = await Promise.all([
        getResourceBySlug(slug),
        getCategories(),
        getTags(),
      ]);

      // Check authorization: owner or admin
      if (!isAdmin && resourceData.authorId !== user?.id) {
        setError(t('errors.unauthorized') || 'You do not have permission to edit this resource');
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

      if (!resource?.id) {
        throw new Error('Resource ID not found');
      }

      // Update resource
      await updateResource(resource.id, data);

      // Update translations (if any provided)
      if (translations && Object.keys(translations).length > 0) {
        await Promise.all(
          Object.entries(translations).map(([localeCode, translationData]) =>
            updateTranslation(resource.id, localeCode, {
              title: translationData.title,
              summary: translationData.summary,
              content: translationData.content,
            })
          )
        );
      }

      setSuccess(t('success.updated'));

      // Redirect back to resources page after a short delay
      setTimeout(() => {
        router.push(`/${locale}/resources`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || t('errors.updateFailed'));
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/resources`);
  };

  if (!isCoach) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-brandText/60">{t('loading') || 'Chargement...'}</p>
        </div>
      </div>
    );
  }

  if (error && !resource) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
        <Link
          href={`/${locale}/resources`}
          className="mt-4 inline-block text-sm text-brandText/60 transition hover:text-brandText"
        >
          ← {t('actions.back')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/${locale}/resources`}
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
        <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-600">
          {success}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
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
            isAdmin={isAdmin}
            isLoading={submitting}
          />
        </div>
      )}
    </div>
  );
}
