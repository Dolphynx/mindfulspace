'use client';

/**
 * Create Resource Page
 * Accessible from public resources page for coaches/admins
 * Form for creating a new resource
 */

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from '@/i18n/TranslationContext';
import { useAuth } from '@/contexts/AuthContext';
import ResourceForm from '@/components/resources/ResourceForm';
import {
  ResourceCategory,
  ResourceTag,
  CreateResourceData,
  UpdateResourceData,
  getCategories,
  getTags,
  createResource,
} from '@/lib/api/resources';

export default function NewResourcePage() {
  const t = useTranslations('resourcesManagement');
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

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
    if (isCoach) {
      loadFormData();
    }
  }, [isCoach]);

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

  const handleSubmit = async (data: CreateResourceData | UpdateResourceData) => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      await createResource(data as CreateResourceData);

      setSuccess(t('success.created'));

      // Redirect back to resources page after a short delay
      setTimeout(() => {
        router.push(`/${locale}/resources`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || t('errors.createFailed'));
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
          {t('createResource')}
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
      <div className="rounded-lg border border-brandBorder bg-white p-6">
        <ResourceForm
          categories={categories}
          tags={tags}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isAdmin={isAdmin}
          isLoading={submitting}
        />
      </div>
    </div>
  );
}
