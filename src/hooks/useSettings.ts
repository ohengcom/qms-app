'use client';

import { api } from '@/lib/trpc';

export function useAppSettings() {
  return api.settings.getAppSettings.useQuery(undefined, {
    staleTime: 60000, // 1 minute
  });
}

export function useUpdateAppSettings() {
  const utils = api.useUtils();

  return api.settings.updateAppSettings.useMutation({
    onSuccess: () => {
      utils.settings.getAppSettings.invalidate();
    },
  });
}

export function useDatabaseStats() {
  return api.settings.getDatabaseStats.useQuery(undefined, {
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useChangePassword() {
  return api.settings.changePassword.useMutation();
}

export function useSystemInfo() {
  return api.settings.getSystemInfo.useQuery(undefined, {
    staleTime: 300000, // 5 minutes
  });
}

export function useExportData() {
  return api.settings.exportData.useQuery(undefined, {
    enabled: false, // Only fetch when explicitly requested
  });
}
