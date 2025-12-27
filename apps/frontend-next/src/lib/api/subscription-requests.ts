import { apiFetch } from './client';

export enum SubscriptionRequestType {
  PREMIUM = 'PREMIUM',
  COACH = 'COACH',
}

export enum SubscriptionRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum CoachTier {
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  PREMIUM = 'PREMIUM',
}

export interface SubscriptionRequest {
  id: string;
  userId: string;
  requestType: SubscriptionRequestType;
  status: SubscriptionRequestStatus;
  coachTier?: CoachTier;
  motivation?: string;
  experience?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  adminNotes?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    displayName?: string;
  };
  reviewedByUser?: {
    id: string;
    displayName?: string;
  };
}

export interface CreateSubscriptionRequestData {
  requestType: SubscriptionRequestType;
  coachTier?: CoachTier;
  motivation?: string;
  experience?: string;
}

export interface ReviewSubscriptionRequestData {
  status: SubscriptionRequestStatus;
  adminNotes?: string;
}

/**
 * Create a new subscription request
 */
export async function createSubscriptionRequest(
  data: CreateSubscriptionRequestData
): Promise<SubscriptionRequest> {
  const res = await apiFetch('/subscription-requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create subscription request');
  }

  return res.json();
}

/**
 * Get all subscription requests (admin only)
 */
export async function getAllSubscriptionRequests(params?: {
  status?: SubscriptionRequestStatus;
  requestType?: SubscriptionRequestType;
}): Promise<SubscriptionRequest[]> {
  const query = new URLSearchParams();
  if (params?.status) query.append('status', params.status);
  if (params?.requestType) query.append('requestType', params.requestType);

  const url = `/subscription-requests${query.toString() ? `?${query}` : ''}`;
  const res = await apiFetch(url);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to get subscription requests');
  }

  return res.json();
}

/**
 * Get current user's subscription requests
 */
export async function getMySubscriptionRequests(): Promise<
  SubscriptionRequest[]
> {
  const res = await apiFetch('/subscription-requests/my-requests');

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to get subscription requests');
  }

  return res.json();
}

/**
 * Get a specific subscription request
 */
export async function getSubscriptionRequest(
  id: string
): Promise<SubscriptionRequest> {
  const res = await apiFetch(`/subscription-requests/${id}`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to get subscription request');
  }

  return res.json();
}

/**
 * Review a subscription request (admin only)
 */
export async function reviewSubscriptionRequest(
  id: string,
  data: ReviewSubscriptionRequestData
): Promise<SubscriptionRequest> {
  const res = await apiFetch(`/subscription-requests/${id}/review`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to review subscription request');
  }

  return res.json();
}

/**
 * Get unread notification decisions
 */
export async function getUnreadDecisions(): Promise<{
  unreadCount: number;
  items: Array<{
    id: string;
    requestType: SubscriptionRequestType;
    status: SubscriptionRequestStatus;
    coachTier?: string;
    reviewedAt: string;
  }>;
}> {
  const res = await apiFetch('/subscription-requests/notifications');

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to get unread decisions');
  }

  return res.json();
}

/**
 * Mark specific request as read
 */
export async function markSubscriptionRequestAsRead(
  id: string
): Promise<{ id: string; isRead: boolean }> {
  const res = await apiFetch(`/subscription-requests/${id}/read`, {
    method: 'PATCH',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to mark request as read');
  }

  return res.json();
}

/**
 * Mark all unread decisions as read
 */
export async function markAllSubscriptionRequestsAsRead(): Promise<{
  ok: boolean;
}> {
  const res = await apiFetch('/subscription-requests/read-all', {
    method: 'PATCH',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to mark all requests as read');
  }

  return res.json();
}

/**
 * Cancel a pending request
 */
export async function cancelSubscriptionRequest(
  id: string
): Promise<SubscriptionRequest> {
  const res = await apiFetch(`/subscription-requests/${id}/cancel`, {
    method: 'PUT',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to cancel subscription request');
  }

  return res.json();
}
