'use client';

import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/trpc';

export function useUsageRecords(filters?: { quiltId?: string; limit?: number; offset?: number }) {
  return api.usage.getAll.useQuery(filters, {
    staleTime: 30000, // 30 seconds
  });
}

export function useUsageRecord(id: string) {
  return api.usage.getById.useQuery(
    { id },
    {
      enabled: !!id,
    }
  );
}

export function useQuiltUsageRecords(quiltId: string) {
  return api.usage.getByQuiltId.useQuery(
    { quiltId },
    {
      enabled: !!quiltId,
    }
  );
}

export function useActiveUsageRecord(quiltId: string) {
  return api.usage.getActive.useQuery(
    { quiltId },
    {
      enabled: !!quiltId,
    }
  );
}

export function useAllActiveUsageRecords() {
  return api.usage.getAllActive.useQuery(undefined, {
    staleTime: 30000,
  });
}

export function useCreateUsageRecord() {
  const queryClient = useQueryClient();
  const utils = api.useUtils();

  return api.usage.create.useMutation({
    onSuccess: () => {
      utils.usage.getAll.invalidate();
      utils.usage.getAllActive.invalidate();
      utils.quilts.getAll.invalidate();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateUsageRecord() {
  const queryClient = useQueryClient();
  const utils = api.useUtils();

  return api.usage.update.useMutation({
    onSuccess: () => {
      utils.usage.getAll.invalidate();
      utils.usage.getAllActive.invalidate();
      utils.usage.getById.invalidate();
      utils.usage.getByQuiltId.invalidate();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useEndUsageRecord() {
  const queryClient = useQueryClient();
  const utils = api.useUtils();

  return api.usage.end.useMutation({
    onSuccess: () => {
      utils.usage.getAll.invalidate();
      utils.usage.getAllActive.invalidate();
      utils.quilts.getAll.invalidate();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteUsageRecord() {
  const queryClient = useQueryClient();
  const utils = api.useUtils();

  return api.usage.delete.useMutation({
    onSuccess: () => {
      utils.usage.getAll.invalidate();
      utils.usage.getAllActive.invalidate();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUsageStats(quiltId: string) {
  return api.usage.getStats.useQuery(
    { quiltId },
    {
      enabled: !!quiltId,
    }
  );
}

export function useOverallUsageStats() {
  return api.usage.getOverallStats.useQuery(undefined, {
    staleTime: 30000,
  });
}
