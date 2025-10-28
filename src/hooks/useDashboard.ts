'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { DashboardStatsInput, AnalyticsDateRangeInput } from '@/lib/validations/quilt';

export function useDashboardStats(options?: DashboardStatsInput) {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
      }
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
  });
}

// Simplified hooks - remove unused complex features for now
export function useRealtimeDashboard() {
  const { data: stats, isLoading, error, refetch } = useDashboardStats();

  // Auto-refresh every 30 seconds for real-time feel
  React.useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30 * 1000); // 30 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  return { stats, isLoading, error, refetch };
}
