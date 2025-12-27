'use client';

/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, getCurrentUser, login as apiLogin, logout as apiLogout, register as apiRegister, LoginData, RegisterData, AuthResponse } from '@/lib/api/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<{ message: string; userId: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const checkInProgress = useRef(false);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        // User not authenticated
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Periodic auth check (every 5 minutes) to detect token expiration
  useEffect(() => {
    const checkAuth = async () => {
      // Éviter les appels multiples simultanés
      if (checkInProgress.current) return;
      checkInProgress.current = true;

      try {
        await getCurrentUser();
        // Token still valid
      } catch (error) {
        // Token expired or invalid
        if (user !== null) {
          console.log('Session expired, logging out...');
          setUser(null);

          // Rediriger vers login seulement si on est sur une page protégée
          const segments = (pathname ?? '').split('/');
          const locale = segments[1] || 'fr';
          const isPublicRoute = pathname?.includes('/auth/') || pathname === `/${locale}` || pathname?.includes('/resources');

          if (!isPublicRoute) {
            router.replace(`/${locale}/auth/login?redirectTo=${encodeURIComponent(pathname || `/${locale}`)}`);
          }
        }
      } finally {
        checkInProgress.current = false;
      }
    };

    // Vérifier toutes les 5 minutes
    const interval = setInterval(checkAuth, 5 * 60 * 1000);

    // Cleanup
    return () => clearInterval(interval);
  }, [user, pathname, router]);

  const login = useCallback(async (data: LoginData) => {
    const response = await apiLogin(data);
    setUser(response.user);
    return response;
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    return await apiRegister(data);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (error) {
      // Ignore errors - user might already be logged out
      console.warn('Logout error (ignored):', error);
    } finally {
      // Always clear user state, even if API call fails
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
