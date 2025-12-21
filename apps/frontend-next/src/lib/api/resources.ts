/**
 * Frontend API client for resources management
 * Provides type-safe functions for CRUD operations on resources
 */

import { apiFetch } from './client';

// ==================== TYPES ====================

export interface ResourceCategoryTranslation {
  id: string;
  categoryId: string;
  locale: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceCategory {
  id: string;
  slug: string;
  iconEmoji: string | null;
  sourceLocale: string;
  createdAt: string;
  updatedAt: string;
  translations?: ResourceCategoryTranslation[];
  _count?: {
    resources: number;
  };
}

export interface ResourceTagTranslation {
  id: string;
  tagId: string;
  locale: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceTag {
  id: string;
  slug: string;
  sourceLocale: string;
  createdAt: string;
  updatedAt: string;
  translations?: ResourceTagTranslation[];
}

export interface ResourceTranslation {
  id: string;
  resourceId: string;
  locale: string;
  title: string;
  summary: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  slug: string; // Technical slug (always English)
  isPremium: boolean;
  isFeatured: boolean;
  sourceLocale: string; // NEW: source language (fr, en, etc.)
  authorName: string | null;
  readTimeMin: number | null;
  externalUrl: string | null;
  authorId: string | null;
  categoryId: string;
  meditationProgramId: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  category?: ResourceCategory;
  translations?: ResourceTranslation[]; // NEW: translations array
  tags?: Array<{
    tag: ResourceTag;
  }>;
  author?: {
    id: string;
    email: string;
    displayName: string | null;
  };

  // Convenience fields (from current locale translation)
  title?: string;
  summary?: string;
  content?: string;
}

export interface CreateResourceData {
  sourceLocale?: string; // NEW: source language (defaults to 'fr')
  title: string;
  // slug removed - auto-generated on backend
  summary: string;
  content: string;
  isPremium?: boolean;
  isFeatured?: boolean;
  authorName?: string;
  readTimeMin?: number;
  externalUrl?: string;
  categoryId: string;
  tagIds?: string[];
  meditationProgramId?: string;
}

export interface UpdateResourceData {
  title?: string;
  // slug removed - cannot be updated
  summary?: string;
  content?: string;
  isPremium?: boolean;
  isFeatured?: boolean;
  authorName?: string;
  readTimeMin?: number;
  externalUrl?: string;
  categoryId?: string;
  tagIds?: string[];
  meditationProgramId?: string;
}

export interface TranslationData {
  locale: string;
  title: string;
  summary: string;
  content: string;
}

export interface AutoTranslateRequest {
  targetLocales: string[];
}

export interface GetResourcesParams {
  q?: string;
  categorySlug?: string;
}

// ==================== API FUNCTIONS ====================

/**
 * Get list of resources with optional filters
 * Public endpoint - no auth required
 */
export async function getResources(params?: GetResourcesParams): Promise<Resource[]> {
  const queryParams = new URLSearchParams();
  if (params?.q) queryParams.append('q', params.q);
  if (params?.categorySlug) queryParams.append('categorySlug', params.categorySlug);

  const queryString = queryParams.toString();
  const url = `/resources${queryString ? `?${queryString}` : ''}`;

  const res = await apiFetch(url);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to fetch resources' }));
    throw new Error(error.message || 'Failed to fetch resources');
  }

  return res.json();
}

/**
 * Get list of resource categories with count
 * Public endpoint - no auth required
 */
export async function getCategories(): Promise<ResourceCategory[]> {
  const res = await apiFetch('/resources/categories');

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to fetch categories' }));
    throw new Error(error.message || 'Failed to fetch categories');
  }

  return res.json();
}

/**
 * Get list of all tags
 * Public endpoint - no auth required
 */
export async function getTags(): Promise<ResourceTag[]> {
  const res = await apiFetch('/resources/tags/all');

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to fetch tags' }));
    throw new Error(error.message || 'Failed to fetch tags');
  }

  return res.json();
}

/**
 * Get a single resource by slug
 * Public endpoint but returns 403 for premium resources without auth
 */
export async function getResourceBySlug(slug: string): Promise<Resource> {
  const res = await apiFetch(`/resources/${encodeURIComponent(slug)}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Resource not found' }));
    throw new Error(error.message || 'Resource not found');
  }

  return res.json();
}

/**
 * Get all resources created by the current user
 * Requires auth (coach or admin role)
 */
export async function getMyResources(): Promise<Resource[]> {
  const res = await apiFetch('/resources/my-resources/list');

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to fetch my resources' }));
    throw new Error(error.message || 'Failed to fetch my resources');
  }

  return res.json();
}

/**
 * Create a new resource
 * Requires auth (coach or admin role)
 */
export async function createResource(data: CreateResourceData): Promise<Resource> {
  const res = await apiFetch('/resources', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to create resource' }));
    throw new Error(error.message || 'Failed to create resource');
  }

  return res.json();
}

/**
 * Update an existing resource
 * Requires auth (owner or admin)
 * Only admins can set isFeatured
 */
export async function updateResource(
  id: string,
  data: UpdateResourceData
): Promise<Resource> {
  const res = await apiFetch(`/resources/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to update resource' }));
    throw new Error(error.message || 'Failed to update resource');
  }

  return res.json();
}

/**
 * Delete a resource
 * Requires auth (owner or admin)
 * Coaches cannot delete resources linked to meditation programs
 */
export async function deleteResource(id: string): Promise<void> {
  const res = await apiFetch(`/resources/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    let errorMessage = 'Failed to delete resource';
    try {
      const error = await res.json();
      errorMessage = error.message || errorMessage;
    } catch {
      // Response is not JSON, use default message
    }
    throw new Error(errorMessage);
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate a URL-friendly slug from a title
 * Example: "10 Benefits of Meditation" -> "10-benefits-of-meditation"
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD') // Normalize accents
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove duplicate hyphens
}

/**
 * Calculate estimated read time from content
 * Assumes average reading speed of 200 words per minute
 */
export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Get translation for a specific locale from a resource
 * Falls back to source locale if translation doesn't exist
 */
export function getTranslation(resource: Resource, locale: string): ResourceTranslation | null {
  if (!resource.translations || resource.translations.length === 0) {
    return null;
  }

  // Try to find translation for requested locale
  const translation = resource.translations.find(t => t.locale === locale);
  if (translation) {
    return translation;
  }

  // Fallback to source locale
  return resource.translations.find(t => t.locale === resource.sourceLocale) || resource.translations[0];
}

/**
 * Auto-translate a resource to target locales using AI
 * Requires auth (owner or admin)
 */
export async function autoTranslateResource(
  resourceId: string,
  targetLocales: string[]
): Promise<ResourceTranslation[]> {
  const res = await apiFetch(`/resources/${resourceId}/auto-translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetLocales }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to auto-translate resource' }));
    throw new Error(error.message || 'Failed to auto-translate resource');
  }

  return res.json();
}

/**
 * Update translation for a specific locale
 * Requires auth (owner or admin)
 */
export async function updateTranslation(
  resourceId: string,
  locale: string,
  data: Omit<TranslationData, 'locale'>
): Promise<ResourceTranslation> {
  const res = await apiFetch(`/resources/${resourceId}/translations/${locale}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      locale, // Add locale to the body as required by CreateTranslationDto
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to update translation' }));
    throw new Error(error.message || 'Failed to update translation');
  }

  return res.json();
}

/**
 * Get all translations for a resource
 */
export async function getTranslations(resourceId: string): Promise<ResourceTranslation[]> {
  const res = await apiFetch(`/resources/${resourceId}/translations`);

  if (!res.ok) {
    throw new Error('Failed to fetch translations');
  }

  return res.json();
}

/**
 * Get the translation for a specific locale from a resource
 * Falls back to source locale if requested locale not found
 *
 * @param resource - Resource with translations array
 * @param locale - Desired locale (e.g., 'fr', 'en')
 * @returns Translation object with title, summary, content
 */
export function getResourceTranslation(
  resource: Resource,
  locale: string
): { title: string; summary: string; content: string } | null {
  if (!resource.translations || resource.translations.length === 0) {
    return null;
  }

  // Try to find translation for requested locale
  let translation = resource.translations.find((t) => t.locale === locale);

  // Fallback to source locale if requested locale not found
  if (!translation) {
    translation = resource.translations.find((t) => t.locale === resource.sourceLocale);
  }

  // Fallback to first available translation
  if (!translation) {
    translation = resource.translations[0];
  }

  return {
    title: translation.title,
    summary: translation.summary,
    content: translation.content,
  };
}

/**
 * Enrich a resource with translation fields for easier display
 * Adds title, summary, content directly to the resource object
 *
 * @param resource - Resource with translations array
 * @param locale - Desired locale (e.g., 'fr', 'en')
 * @returns Resource with title, summary, content fields populated from translation
 */
export function enrichResourceWithTranslation(
  resource: Resource,
  locale: string
): Resource {
  const translation = getResourceTranslation(resource, locale);

  if (!translation) {
    return resource;
  }

  return {
    ...resource,
    title: translation.title,
    summary: translation.summary,
    content: translation.content,
  };
}

// ==================== CATEGORY MANAGEMENT (ADMIN ONLY) ====================

export interface CreateCategoryData {
  name: string;
  slug: string;
  iconEmoji?: string;
}

export interface UpdateCategoryData {
  name?: string;
  slug?: string;
  iconEmoji?: string;
}

/**
 * Create a new resource category
 * Admin-only operation
 */
export async function createCategory(data: CreateCategoryData): Promise<ResourceCategory> {
  const res = await apiFetch('/resources/admin/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to create category' }));
    throw new Error(error.message || 'Failed to create category');
  }

  return res.json();
}

/**
 * Update an existing resource category
 * Admin-only operation
 */
export async function updateCategory(
  categoryId: string,
  data: UpdateCategoryData
): Promise<ResourceCategory> {
  const res = await apiFetch(`/resources/admin/categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to update category' }));
    throw new Error(error.message || 'Failed to update category');
  }

  return res.json();
}

/**
 * Delete a resource category
 * Admin-only operation
 * Cannot delete if resources are still using this category
 */
export async function deleteCategory(categoryId: string): Promise<{ message: string }> {
  const res = await apiFetch(`/resources/admin/categories/${categoryId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to delete category' }));
    throw new Error(error.message || 'Failed to delete category');
  }

  return res.json();
}

// ==================== TAG MANAGEMENT (ADMIN ONLY) ====================

export interface CreateTagData {
  name: string;
  slug: string;
}

export interface UpdateTagData {
  name?: string;
  slug?: string;
}

/**
 * Create a new resource tag
 * Admin-only operation
 */
export async function createTag(data: CreateTagData): Promise<ResourceTag> {
  const res = await apiFetch('/resources/admin/tags', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to create tag' }));
    throw new Error(error.message || 'Failed to create tag');
  }

  return res.json();
}

/**
 * Update an existing resource tag
 * Admin-only operation
 */
export async function updateTag(
  tagId: string,
  data: UpdateTagData
): Promise<ResourceTag> {
  const res = await apiFetch(`/resources/admin/tags/${tagId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to update tag' }));
    throw new Error(error.message || 'Failed to update tag');
  }

  return res.json();
}

/**
 * Delete a resource tag
 * Admin-only operation
 * Can delete even if resources are using this tag
 */
export async function deleteTag(tagId: string): Promise<{ message: string }> {
  const res = await apiFetch(`/resources/admin/tags/${tagId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to delete tag' }));
    throw new Error(error.message || 'Failed to delete tag');
  }

  return res.json();
}

// ==================== CATEGORY TRANSLATION MANAGEMENT ====================

/**
 * Get all translations for a category
 */
export async function getCategoryTranslations(categoryId: string): Promise<ResourceCategoryTranslation[]> {
  const res = await apiFetch(`/resources/categories/${categoryId}/translations`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to get category translations' }));
    throw new Error(error.message || 'Failed to get category translations');
  }

  return res.json();
}

/**
 * Create or update a translation for a category
 * Admin-only operation
 */
export async function upsertCategoryTranslation(
  categoryId: string,
  locale: string,
  name: string
): Promise<ResourceCategoryTranslation> {
  const res = await apiFetch(`/resources/admin/categories/${categoryId}/translations/${locale}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to save category translation' }));
    throw new Error(error.message || 'Failed to save category translation');
  }

  return res.json();
}

/**
 * Delete a translation for a category
 * Admin-only operation
 * Cannot delete source locale translation
 */
export async function deleteCategoryTranslation(
  categoryId: string,
  locale: string
): Promise<{ message: string }> {
  const res = await apiFetch(`/resources/admin/categories/${categoryId}/translations/${locale}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to delete category translation' }));
    throw new Error(error.message || 'Failed to delete category translation');
  }

  return res.json();
}

// ==================== TAG TRANSLATION MANAGEMENT ====================

/**
 * Get all translations for a tag
 */
export async function getTagTranslations(tagId: string): Promise<ResourceTagTranslation[]> {
  const res = await apiFetch(`/resources/tags/${tagId}/translations`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to get tag translations' }));
    throw new Error(error.message || 'Failed to get tag translations');
  }

  return res.json();
}

/**
 * Create or update a translation for a tag
 * Admin-only operation
 */
export async function upsertTagTranslation(
  tagId: string,
  locale: string,
  name: string
): Promise<ResourceTagTranslation> {
  const res = await apiFetch(`/resources/admin/tags/${tagId}/translations/${locale}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to save tag translation' }));
    throw new Error(error.message || 'Failed to save tag translation');
  }

  return res.json();
}

/**
 * Delete a translation for a tag
 * Admin-only operation
 * Cannot delete source locale translation
 */
export async function deleteTagTranslation(
  tagId: string,
  locale: string
): Promise<{ message: string }> {
  const res = await apiFetch(`/resources/admin/tags/${tagId}/translations/${locale}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to delete tag translation' }));
    throw new Error(error.message || 'Failed to delete tag translation');
  }

  return res.json();
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get the name for a category in a specific locale
 * Falls back to source locale if translation not found
 */
export function getCategoryName(category: ResourceCategory, locale: string): string {
  if (!category.translations || category.translations.length === 0) {
    return category.slug; // Fallback to slug if no translations
  }

  // Try to find translation for requested locale
  const translation = category.translations.find(t => t.locale === locale);
  if (translation) {
    return translation.name;
  }

  // Fallback to source locale translation
  const sourceTranslation = category.translations.find(t => t.locale === category.sourceLocale);
  if (sourceTranslation) {
    return sourceTranslation.name;
  }

  // Last resort: return any translation or slug
  return category.translations[0]?.name || category.slug;
}

/**
 * Get the name for a tag in a specific locale
 * Falls back to source locale if translation not found
 */
export function getTagName(tag: ResourceTag, locale: string): string {
  if (!tag.translations || tag.translations.length === 0) {
    return tag.slug; // Fallback to slug if no translations
  }

  // Try to find translation for requested locale
  const translation = tag.translations.find(t => t.locale === locale);
  if (translation) {
    return translation.name;
  }

  // Fallback to source locale translation
  const sourceTranslation = tag.translations.find(t => t.locale === tag.sourceLocale);
  if (sourceTranslation) {
    return sourceTranslation.name;
  }

  // Last resort: return any translation or slug
  return tag.translations[0]?.name || tag.slug;
}
