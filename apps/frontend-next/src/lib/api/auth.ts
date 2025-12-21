/**
 * Authentication API Client
 * Handles all authentication-related API calls
 */

import { apiFetch } from './client';

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  emailVerified: boolean;
  roles: string[];
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<{ message: string; userId: string }> {
  const res = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Registration failed');
  }

  return res.json();
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<{ message: string }> {
  const res = await apiFetch('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Email verification failed');
  }

  return res.json();
}

/**
 * Login with email and password
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Login failed');
  }

  return res.json();
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  try {
    const res = await apiFetch('/auth/logout', {
      method: 'POST',
    });

    // Si 401, l'utilisateur est déjà déconnecté (token expiré)
    // On ne lance pas d'erreur dans ce cas
    if (!res.ok && res.status !== 401) {
      throw new Error('Logout failed');
    }
  } catch (error) {
    // Si l'erreur n'est pas une 401, on la propage
    if (error instanceof Error && !error.message.includes('Unauthorized')) {
      throw error;
    }
    // Sinon, on ignore (déjà déconnecté)
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User> {
  const res = await apiFetch('/auth/me');

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Not authenticated' }));
    throw new Error(error.message || 'Not authenticated');
  }

  return res.json();
}

/**
 * Request password reset
 */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Password reset request failed');
  }

  return res.json();
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const res = await apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Password reset failed');
  }

  return res.json();
}

/**
 * Refresh access token
 */
export async function refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await apiFetch('/auth/refresh', {
    method: 'POST',
  });

  if (!res.ok) {
    throw new Error('Token refresh failed');
  }

  return res.json();
}
