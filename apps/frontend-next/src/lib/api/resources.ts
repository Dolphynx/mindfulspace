/**
 * Frontend API client for resources management
 * Provides type-safe functions for CRUD operations on resources
 */

import { apiFetch } from './client';

// ==================== TYPES ====================

export enum ResourceType {
  ARTICLE = 'ARTICLE',
  VIDEO = 'VIDEO',
  MEDITATION_PROGRAM = 'MEDITATION_PROGRAM',
  EXERCICE_PROGRAM = 'EXERCICE_PROGRAM',
  GUIDE = 'GUIDE',
}

export interface ResourceCategory {
  id: string;
  name: string;
  slug: string;
  iconEmoji: string | null;
  _count?: {
    resources: number;
  };
}

export interface ResourceTag {
  id: string;
  name: string;
  slug: string;
}

export interface Resource {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  type: ResourceType;
  isPremium: boolean;
  isFeatured: boolean;
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
  tags?: Array<{
    tag: ResourceTag;
  }>;
  author?: {
    id: string;
    email: string;
    displayName: string | null;
  };
}

export interface CreateResourceData {
  title: string;
  slug: string;
  summary: string;
  content: string;
  type: ResourceType;
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
  slug?: string;
  summary?: string;
  content?: string;
  type?: ResourceType;
  isPremium?: boolean;
  isFeatured?: boolean;
  authorName?: string;
  readTimeMin?: number;
  externalUrl?: string;
  categoryId?: string;
  tagIds?: string[];
  meditationProgramId?: string;
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
 * Get display label for resource type
 */
export function getResourceTypeLabel(type: ResourceType): string {
  const labels: Record<ResourceType, string> = {
    [ResourceType.ARTICLE]: 'Article',
    [ResourceType.VIDEO]: 'Vidéo',
    [ResourceType.GUIDE]: 'Guide',
    [ResourceType.MEDITATION_PROGRAM]: 'Programme de méditation',
    [ResourceType.EXERCICE_PROGRAM]: "Programme d'exercice",
  };

  return labels[type] || type;
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
