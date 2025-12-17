'use client';

/**
 * Coach Edit Resource Page
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
  getMyResources,
  updateResource,
} from '@/lib/api/resources';

export default function CoachEditResourcePage() {
  const t = useTranslations('resourcesManagement');
  const { user } = useAuth();
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

  useEffect(() => {
    loadData();
  }, [resourceId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allResources, categoriesData, tagsData] = await Promise.all([
        getMyResources(),
        getCategories(),
        getTags(),
      ]);

      const resourceData = allResources.find((r) => r.id === resourceId);

      if (!resourceData) {
        setError(t('errors.notFound'));
        return;
      }

      setResource(resourceData);
      setCategories(categoriesData);
      setTags(tagsData);
    } catch (err: any) {
      setError(err.message || t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: CreateResourceData | UpdateResourceData) => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      await updateResource(resourceId, data);

      setSuccess(t('success.updated'));

      // Redirect to list page after a short delay
      setTimeout(() => {
        router.push(`/${locale}/coach/resources`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || t('errors.updateFailed'));
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/coach/resources`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-brandText/60">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error && !resource) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
        <Link
          href={`/${locale}/coach/resources`}
          className="mt-4 inline-block text-sm text-brandText/60 transition hover:text-brandText"
        >
          ← {t('actions.back')}
        </Link>
      </div>
    );
  }

  const isAdmin = user?.roles.includes('admin') || false;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/${locale}/coach/resources`}
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
