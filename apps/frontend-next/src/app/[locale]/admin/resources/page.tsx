'use client';

/**
 * Admin Resources List Page
 * Displays ALL resources in the system
 */

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from '@/i18n/TranslationContext';
import {
  Resource,
  getResources,
  deleteResource,
  getResourceTypeLabel,
} from '@/lib/api/resources';

export default function AdminResourcesPage() {
  const t = useTranslations('resourcesManagement');
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getResources();
      setResources(data);
    } catch (err: any) {
      setError(err.message || t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resourceId: string) => {
    try {
      setDeleting(true);
      await deleteResource(resourceId);
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert(err.message || t('errors.deleteFailed'));
    } finally {
      setDeleting(false);
    }
  };

  const filteredResources = resources.filter((resource) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      resource.title.toLowerCase().includes(query) ||
      resource.summary.toLowerCase().includes(query) ||
      resource.category?.name.toLowerCase().includes(query) ||
      resource.author?.displayName?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-brandText/60">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brandText">
            {t('allResources')}
          </h1>
          <p className="mt-2 text-brandText/60">
            {resources.length} {resources.length === 1 ? 'ressource' : 'ressources'} au total
          </p>
        </div>
        <Link
          href={`/${locale}/admin/resources/new`}
          className="rounded-lg bg-brandGreen px-6 py-2 font-medium text-white transition hover:bg-brandGreen/90"
        >
          {t('createResource')}
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full max-w-md rounded-lg border border-brandBorder px-4 py-2 focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20"
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Empty state */}
      {filteredResources.length === 0 && !loading && (
        <div className="rounded-lg border-2 border-dashed border-brandBorder bg-brandSurface/30 p-12 text-center">
          <p className="text-lg font-medium text-brandText">
            {searchQuery ? 'Aucun résultat' : t('noResources')}
          </p>
          <p className="mt-2 text-brandText/60">
            {searchQuery
              ? 'Essayez un autre terme de recherche'
              : t('noResourcesDescription')}
          </p>
        </div>
      )}

      {/* Resources grid */}
      {filteredResources.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="rounded-lg border border-brandBorder bg-white p-6 transition hover:shadow-md"
            >
              {/* Type & Status badges */}
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-brandSurface px-2 py-1 text-xs font-medium text-brandText">
                  {getResourceTypeLabel(resource.type)}
                </span>
                {resource.isPremium && (
                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                    {t('card.premium')}
                  </span>
                )}
                {resource.isFeatured && (
                  <span className="rounded-full bg-brandGreen/10 px-2 py-1 text-xs font-medium text-brandGreen">
                    {t('card.featured')}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="mb-2 text-lg font-semibold text-brandText line-clamp-2">
                {resource.title}
              </h3>

              {/* Summary */}
              <p className="mb-4 text-sm text-brandText/60 line-clamp-3">
                {resource.summary}
              </p>

              {/* Meta */}
              <div className="mb-4 space-y-1 text-xs text-brandText/60">
                {resource.category && (
                  <div>
                    {resource.category.iconEmoji} {resource.category.name}
                  </div>
                )}
                {resource.author && (
                  <div>
                    Par: {resource.author.displayName || resource.author.email}
                  </div>
                )}
                {resource.readTimeMin && <div>{resource.readTimeMin} min</div>}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/${locale}/admin/resources/${resource.id}/edit`}
                  className="flex-1 rounded-lg border border-brandBorder bg-white px-4 py-2 text-center text-sm font-medium text-brandText transition hover:bg-brandSurface"
                >
                  {t('actions.edit')}
                </Link>
                <button
                  onClick={() => setDeleteConfirmId(resource.id)}
                  className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  {t('actions.delete')}
                </button>
              </div>

              {/* Delete confirmation modal */}
              {deleteConfirmId === resource.id && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="w-full max-w-md rounded-lg bg-white p-6">
                    <h3 className="text-lg font-semibold text-brandText">
                      {t('deleteConfirm.title')}
                    </h3>
                    <p className="mt-2 text-sm text-brandText/60">
                      {t('deleteConfirm.message')}
                    </p>
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() => handleDelete(resource.id)}
                        disabled={deleting}
                        className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                      >
                        {deleting ? '...' : t('deleteConfirm.confirm')}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        disabled={deleting}
                        className="flex-1 rounded-lg border border-brandBorder bg-white px-4 py-2 font-medium text-brandText transition hover:bg-brandSurface disabled:opacity-50"
                      >
                        {t('deleteConfirm.cancel')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
