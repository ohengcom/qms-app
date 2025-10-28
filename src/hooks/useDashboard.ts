'use client';

import React from 'react';
import { api } from '@/lib/trpc';
import type { DashboardStatsInput, AnalyticsDateRangeInput } from '@/lib/validations/quilt';

export function useDashboardStats(options?: DashboardStatsInput) {
  return api.dashboard.getStats.useQuery(
    options || {
      includeAnalytics: true,
      includeTrends: false,
    },
    {
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
      staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    }
  );
}

export function useUsageTrends(dateRange: AnalyticsDateRangeInput) {
  return api.dashboard.getUsageTrends.useQuery(dateRange, {
    enabled: !!(dateRange.startDate && dateRange.endDate),
    staleTime: 10 * 60 * 1000, // Trends data can be stale for 10 minutes
  });
}

export function useSeasonalInsights() {
  return api.dashboard.getSeasonalInsights.useQuery(undefined, {
    staleTime: 30 * 60 * 1000, // Seasonal insights can be stale for 30 minutes
  });
}

export function useMaintenanceInsights() {
  return api.dashboard.getMaintenanceInsights.useQuery(undefined, {
    staleTime: 15 * 60 * 1000, // Maintenance insights can be stale for 15 minutes
  });
}

// Custom hook for real-time dashboard updates (using polling instead of subscriptions)
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

// Hook for dashboard notifications/alerts
export function useDashboardAlerts() {
  const { data: stats } = useDashboardStats();
  const { data: maintenanceInsights } = useMaintenanceInsights();

  const alerts = React.useMemo(() => {
    const alertList = [];

    // Low utilization alert
    if (stats && typeof stats === 'object' && 'overview' in stats && stats.overview) {
      const overview = stats.overview as any;
      const utilizationRate = (overview.inUseCount / Math.max(overview.totalQuilts, 1)) * 100;
      if (utilizationRate < 20) {
        alertList.push({
          type: 'info' as const,
          message: 'Low utilization rate - consider rotating quilts more frequently',
          priority: 'low' as const,
        });
      }
    }

    // Maintenance alerts
    if (
      maintenanceInsights?.summary?.upcomingMaintenanceCount &&
      maintenanceInsights.summary.upcomingMaintenanceCount > 5
    ) {
      alertList.push({
        type: 'warning' as const,
        message: `${maintenanceInsights.summary?.upcomingMaintenanceCount} quilts need maintenance soon`,
        priority: 'high' as const,
      });
    }

    if (
      maintenanceInsights?.summary?.quiltsNeedingAttention &&
      maintenanceInsights.summary.quiltsNeedingAttention > 0
    ) {
      alertList.push({
        type: 'info' as const,
        message: `${maintenanceInsights.summary?.quiltsNeedingAttention} quilts have no maintenance history`,
        priority: 'medium' as const,
      });
    }

    return alertList;
  }, [stats, maintenanceInsights]);

  return alerts;
}

// Hook for real-time quilt updates (using polling instead of subscriptions)
export function useRealtimeQuiltUpdates() {
  const utils = api.useContext();

  // Periodically invalidate cache to simulate real-time updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      // Invalidate dashboard stats to get fresh data
      utils.dashboard.getStats.invalidate();
      utils.dashboard.getUsageTrends.invalidate();
    }, 60 * 1000); // Every minute

    return () => clearInterval(interval);
  }, [utils]);
}

// Hook for cache management
export function useCacheManagement() {
  const clearCacheMutation = api.dashboard.clearCache.useMutation();
  const { data: cacheStats } = api.dashboard.getCacheStats.useQuery(undefined, {
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });

  const clearCache = React.useCallback(async () => {
    try {
      await clearCacheMutation.mutateAsync();
      return { success: true };
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return { success: false, error };
    }
  }, [clearCacheMutation]);

  return {
    cacheStats,
    clearCache,
    isClearing: clearCacheMutation.isPending,
  };
}
