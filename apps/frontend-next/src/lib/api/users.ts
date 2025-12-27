/**
 * Users API Client
 * Handles all user profile-related API calls
 */

import { apiFetch } from './client';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles: string[];
  hasPassword: boolean;
  oauthAccounts: Array<{
    provider: string;
    createdAt: string;
  }>;
  refreshTokens: Array<{
    id: string;
    userAgent: string | null;
    ipAddress: string | null;
    createdAt: string;
  }>;
}

export interface UpdateProfileData {
  displayName?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Get user profile
 */
export async function getUserProfile(): Promise<UserProfile> {
  const res = await apiFetch('/users/profile');

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch profile');
  }

  return res.json();
}

/**
 * Update user profile
 */
export async function updateUserProfile(data: UpdateProfileData): Promise<UserProfile> {
  const res = await apiFetch('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update profile');
  }

  return res.json();
}

/**
 * Change password
 */
export async function changePassword(data: ChangePasswordData): Promise<{ message: string }> {
  const res = await apiFetch('/users/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to change password');
  }

  return res.json();
}

/**
 * Revoke a session
 */
export async function revokeSession(tokenId: string): Promise<{ message: string }> {
  const res = await apiFetch(`/users/sessions/${tokenId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to revoke session');
  }

  return res.json();
}

/**
 * Revoke all other sessions
 */
export async function revokeAllOtherSessions(): Promise<{ message: string }> {
  const res = await apiFetch('/users/sessions/revoke-all', {
    method: 'POST',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to revoke sessions');
  }

  return res.json();
}

/**
 * Unlink OAuth provider
 */
export async function unlinkOAuthProvider(provider: string): Promise<{ message: string }> {
  const res = await apiFetch(`/users/oauth/${provider}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to unlink OAuth provider');
  }

  return res.json();
}

/**
 * Export user data (GDPR)
 */
export async function exportUserData(): Promise<Blob> {
  const res = await apiFetch('/users/export-data');

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to export data');
  }

  const data = await res.json();

  // Convert to JSON blob for download
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  return blob;
}

/**
 * Delete user account (GDPR)
 */
export async function deleteAccount(password?: string): Promise<{ message: string }> {
  const res = await apiFetch('/users/account', {
    method: 'DELETE',
    body: JSON.stringify({ password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete account');
  }

  return res.json();
}
