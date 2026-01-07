'use client';

/**
 * Dashboard Hooks - REST API + React Query
 *
 * Refactored from tRPC to use fetch + React Query.
 * Maintains the same interface and functionality.
 *
 * Requirements: 1.2, 1.3 - REST API migration
 */

import { useQuery } from '@tanstack/react-query';

// Query keys for cache management
const DASHBOARD_KEY = ['dashboard'] as const;

// Dashboard stats response type
interface DashboardStats {
  overview: {
    totalQuilts: number;
    inUseCount: number;
    storageCount: number;
    maintenanceCount: number;
  };
  distribution: {
    seasonal: {
      WINTER: number;
      SPRING_AUTUMN: number;
      SUMMER: number;
    };
    location: Record<string, number>;
    brand: Record<string, number>;
  };
  topUsedQuilts: Array<{
    id: string;
    name: string;
    usageCount: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    quiltName: string;
    date: string;
  }>;
  inUseQuilts: Array<{
    id: string;
    name: string;
    itemNumber: string;
    season: string;
    fillMaterial: string;
    weightGrams: number;
    location: string;
  }>;
  historicalUsage: Array<{
    id: string;
    quiltId: string;
    quiltName: string;
    itemNumber: string;
    season: string;
    startDate: string;
    endDate: string | null;
    year: number;
  }>;
  date: {
    today: string;
    monthDay: string;
  };
  lastUpdated: string;
  error?: string;
}

// Input type for dashboard stats (optional filters)
interface DashboardStatsInput {
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// API response type for unified format
interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Fetch dashboard statistics from REST API
 */
async function fetchDashboardStats(_options?: DashboardStatsInput): Promise<DashboardStats> {
  const response = await fetch('/api/dashboard');

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '获取仪表板数据失败' }));
    throw new Error(error.error?.message || error.error || '获取仪表板数据失败');
  }

  const result: ApiResponse<{ dashboard: DashboardStats }> = await response.json();

  // Handle new unified API response format
  if (result.success && result.data) {
    return result.data.dashboard || (result.data as unknown as DashboardStats);
  }

  // Fallback for old format (backward compatibility)
  return result as unknown as DashboardStats;
}

/**
 * Hook to fetch dashboard statistics
 */
export function useDashboardStats(options?: DashboardStatsInput) {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, options],
    queryFn: () => fetchDashboardStats(options),
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus to reduce API calls
  });
}

/**
 * Hook for real-time dashboard with auto-refresh
 * Simplified version - removes unused complex features
 * Note: Auto-refresh is handled by React Query's refetchInterval in useDashboardStats
 */
export function useRealtimeDashboard() {
  const { data: stats, isLoading, error, refetch } = useDashboardStats();

  return { stats, isLoading, error, refetch };
}
