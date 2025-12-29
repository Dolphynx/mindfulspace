/**
 * Admin API Client
 * Functions for admin-specific operations and statistics
 */

import { apiFetch } from './client';

/**
 * Dashboard statistics response
 */
export interface DashboardStatistics {
  users: {
    total: number;
    growthThisPeriod: number;
    growthPercent: number;
    growthLabel: string;
  };
  resources: {
    total: number;
    newThisPeriod: number;
    growthLabel: string;
  };
  sessions: {
    total: number;
    breakdown: {
      meditation: number;
      exercise: number;
      sleep: number;
    };
    newThisPeriod: number;
    growthLabel: string;
  };
}

/**
 * Get dashboard statistics
 * Admin-only endpoint
 */
export async function getDashboardStatistics(): Promise<DashboardStatistics> {
  const res = await apiFetch('/admin/statistics');

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to fetch statistics' }));
    throw new Error(error.message || 'Failed to fetch statistics');
  }

  return res.json();
}
