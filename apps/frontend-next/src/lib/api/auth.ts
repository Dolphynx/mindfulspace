/**
 * Authentication API Client
 * Handles all authentication-related API calls
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  const res = await fetch(`${API_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Important for cookies
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
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Logout failed');
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User> {
  const res = await fetch(`${API_URL}/auth/me`, {
    credentials: 'include',
  });

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
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Token refresh failed');
  }

  return res.json();
}
