/**
 * Reusable ResourcesList Component
 * Displays resources in a grid with search, filtering, and management actions
 *
 * Modes:
 * - public: View-only for all users (locks premium content)
 * - myResources: Coach's own resources with edit/delete
 * - admin: All resources with full management capabilities
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/i18n/TranslationContext';
import {
  getResources,
  getMyResources,
  getCategories,
  deleteResource,
  enrichResourceWithTranslation,
  getCategoryName,
  getTagName,
  Resource,
  ResourceCategory,
} from '@/lib/api/resources';

// ==================== TYPES ====================

interface ResourcesListProps {
  mode: 'public' | 'myResources' | 'admin';
  locale: string;
  showCreateButton?: boolean;
  onResourceCreated?: () => void;
  className?: string;
}

// ==================== COMPONENT ====================

export default function ResourcesList({
  mode,
  locale,
  showCreateButton = false,
  onResourceCreated,
  className = '',
}: ResourcesListProps) {
  // ========== STATE ==========
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [categorySlug, setCategorySlug] = useState<string | undefined>();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ========== HOOKS ==========
  const { user } = useAuth();
  const t = useTranslations('resourcesManagement');
  const tPublic = useTranslations('resourcesPage');

  // Check if user has premium access
  const hasPremiumAccess = user?.roles.some(
    (role) => ['premium', 'coach', 'admin'].includes(role.toLowerCase())
  ) ?? false;

  const isAdmin = user?.roles.some(
    (role) => role.toLowerCase() === 'admin'
  ) ?? false;

  // ========== FETCH DATA ==========

  // Fetch categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    }
    loadCategories();
  }, []);

  // Fetch resources
  useEffect(() => {
    async function loadResources() {
      setLoading(true);
      try {
        let data: Resource[];

        if (mode === 'myResources') {
          // Fetch user's own resources
          data = await getMyResources();
        } else {
          // Fetch all resources (public or admin)
          data = await getResources({ q: query, categorySlug });
        }

        // Enrich resources with translations for current locale
        const enrichedData = data.map((r) => enrichResourceWithTranslation(r, locale));

        setResources(enrichedData);
      } catch (error) {
        console.error('Error loading resources:', error);
      } finally {
        setLoading(false);
      }
    }

    loadResources();
  }, [mode, query, categorySlug, locale]);

  // ========== HANDLERS ==========

  const handleDelete = async (resourceId: string) => {
    setDeletingId(resourceId);
    try {
      await deleteResource(resourceId);

      // Remove from local state
      setResources((prev) => prev.filter((r) => r.id !== resourceId));

      // Close confirmation modal
      setDeleteConfirmId(null);
    } catch (error: any) {
      console.error('Error deleting resource:', error);
      alert(error.message || t('errors.deleteFailed'));
    } finally {
      setDeletingId(null);
    }
  };

  // ========== FILTERED RESOURCES ==========

  // Client-side filtering for myResources mode
  const filteredResources = mode === 'myResources'
    ? resources.filter((r) => {
        const matchesQuery = query
          ? (r.title?.toLowerCase().includes(query.toLowerCase()) ?? false) ||
            (r.summary?.toLowerCase().includes(query.toLowerCase()) ?? false)
          : true;

        const matchesCategory = categorySlug
          ? r.category?.slug === categorySlug
          : true;

        return matchesQuery && matchesCategory;
      })
    : resources;

  // ========== RENDER HELPERS ==========

  const showManagementActions = mode === 'myResources' || mode === 'admin';

  const renderResourceCard = (r: Resource) => {
    const isLocked = mode === 'public' && r.isPremium && !hasPremiumAccess;
    const canEdit = mode === 'myResources' || (mode === 'admin' && isAdmin);

    const cardContent = (
      <div
        className={
          'rounded-2xl border border-brandBorder bg-brandBgCard p-4 flex flex-col justify-between transition-all ' +
          (isLocked
            ? 'opacity-70 cursor-not-allowed'
            : showManagementActions
            ? 'hover:shadow-md'
            : 'hover:shadow-lg hover:-translate-y-0.5')
        }
      >
        {/* Card Header */}
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase text-brandText-soft">
              {r.category ? getCategoryName(r.category, locale) : 'Uncategorized'}
            </span>

            <div className="flex items-center gap-2">
              {r.isFeatured && (
                <span className="text-yellow-500" title="Featured">
                  ⭐
                </span>
              )}
              {r.isPremium && (
                <div className="flex items-center gap-1">
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-medium text-purple-700">
                    {mode === 'public' ? tPublic('premiumBadge') : t('card.premium')}
                  </span>
                  <Image
                    src="/images/session_premium.png"
                    alt="Premium"
                    width={18}
                    height={18}
                  />
                </div>
              )}
            </div>
          </div>

          <h3 className="text-base font-semibold text-brandText mb-1">
            {r.title}
          </h3>

          <p className="text-sm text-brandText-soft line-clamp-3">
            {r.summary}
          </p>
        </div>

        {/* Card Footer */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-brandText-soft">
          <div className="flex flex-wrap gap-1">
            {r.tags?.map((tTag) => (
              <span
                key={tTag.tag.id}
                className="rounded-full bg-white/60 px-2 py-0.5"
              >
                {getTagName(tTag.tag, locale)}
              </span>
            ))}
          </div>

          {r.readTimeMin && (
            <span>
              {r.readTimeMin} {mode === 'public' ? tPublic('readTimeSuffix') : 'min'}
            </span>
          )}
        </div>

        {/* Management Actions */}
        {showManagementActions && canEdit && (
          <div className="mt-4 pt-3 border-t border-brandBorder flex gap-2">
            <Link
              href={
                mode === 'admin'
                  ? `/${locale}/admin/resources/${r.id}/edit`
                  : `/${locale}/resources/${r.slug}/edit`
              }
              className="flex-1 rounded-card bg-brandPrimary/10 hover:bg-brandPrimary/20 text-brandPrimary text-sm font-medium py-2 px-3 text-center transition-colors"
            >
              {t('actions.edit')}
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                setDeleteConfirmId(r.id);
              }}
              disabled={deletingId === r.id}
              className="flex-1 rounded-card bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium py-2 px-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deletingId === r.id ? '...' : t('actions.delete')}
            </button>
          </div>
        )}
      </div>
    );

    // Wrap in link for public/non-locked resources
    if (!showManagementActions && !isLocked) {
      return (
        <Link
          key={r.id}
          href={`/${locale}/resources/${r.slug}`}
          className="block"
        >
          {cardContent}
        </Link>
      );
    }

    // Return as div for locked or management views
    return (
      <div
        key={r.id}
        aria-label={isLocked ? tPublic('lockedPremiumResource') : undefined}
        title={isLocked ? tPublic('lockedPremiumTooltip') : undefined}
      >
        {cardContent}
      </div>
    );
  };

  // ========== RENDER ==========

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filters Card */}
      <article className="bg-white border border-brandBorder rounded-card shadow-card p-4 md:p-6 space-y-4">
        {/* Header with Create Button */}
        {showCreateButton && (
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-brandText">
              {mode === 'myResources' ? t('myResources') : t('allResources')}
            </h2>
            <Link
              href={
                mode === 'admin'
                  ? `/${locale}/admin/resources/new`
                  : `/${locale}/resources/new`
              }
              className="rounded-lg bg-brandGreen hover:bg-brandGreen/90 text-white text-sm font-medium py-2 px-4 transition-colors"
            >
              {t('createResource')}
            </Link>
          </div>
        )}

        {/* Search Input */}
        <div className="space-y-2">
          <label
            htmlFor="resources-search"
            className="text-sm font-medium text-brandText"
          >
            {t('searchPlaceholder')}
          </label>

          <input
            id="resources-search"
            className="w-full rounded-card border border-brandBorder bg-brandBg px-4 py-2 text-sm text-brandText focus:outline-none focus:ring-2 focus:ring-brandPrimary/60"
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategorySlug(undefined)}
            className={`rounded-full px-4 py-1 text-sm border ${
              !categorySlug
                ? 'bg-brandBorder border-brandBorder text-brandGreen'
                : 'bg-white border-brandBorder text-brandText-soft'
            }`}
          >
            {t('allCategories')}
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategorySlug(cat.slug)}
              className={`rounded-full px-4 py-1 text-sm border flex items-center gap-1 ${
                categorySlug === cat.slug
                  ? 'bg-brandBorder border-brandBorder text-brandGreen'
                  : 'bg-white border-brandBorder text-brandText-soft'
              }`}
            >
              {cat.iconEmoji && (
                <span aria-hidden="true">{cat.iconEmoji}</span>
              )}
              <span>{getCategoryName(cat, locale)}</span>

              {cat._count?.resources !== undefined && (
                <span className="text-[11px] opacity-70">
                  {cat._count.resources}
                </span>
              )}
            </button>
          ))}
        </div>
      </article>

      {/* Resources Grid Card */}
      <article className="bg-white border border-brandBorder rounded-card shadow-card p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4 text-brandText">
          {mode === 'public' ? tPublic('listTitle') : t('title')}
        </h2>

        {/* Loading State */}
        {loading && (
          <p className="text-sm text-brandText-soft">
            {mode === 'public' ? tPublic('loading') : 'Loading...'}
          </p>
        )}

        {/* Empty State */}
        {!loading && filteredResources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg font-medium text-brandText-soft mb-1">
              {t('noResources')}
            </p>
            <p className="text-sm text-brandText-soft">
              {mode === 'myResources'
                ? t('noResourcesDescription')
                : 'No resources match your filters.'}
            </p>
          </div>
        )}

        {/* Resources Grid */}
        {!loading && filteredResources.length > 0 && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {filteredResources.map(renderResourceCard)}
          </div>
        )}
      </article>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-xl font-semibold text-brandText">
              {t('deleteConfirm.title')}
            </h3>

            <p className="text-sm text-brandText-soft">
              {t('deleteConfirm.message')}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={deletingId === deleteConfirmId}
                className="flex-1 rounded-card bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 transition-colors disabled:opacity-50"
              >
                {t('deleteConfirm.cancel')}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deletingId === deleteConfirmId}
                className="flex-1 rounded-card bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingId === deleteConfirmId
                  ? 'Deleting...'
                  : t('deleteConfirm.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
