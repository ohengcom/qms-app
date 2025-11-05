'use client';

import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/trpc';
import type { QuiltSearchInput } from '@/lib/validations/quilt';

export function useQuilts(searchParams?: QuiltSearchInput) {
  return api.quilts.getAll.useQuery(searchParams, {
    staleTime: 60000, // 1 minute
  });
}

export function useQuilt(id: string) {
  return api.quilts.getById.useQuery(
    { id },
    {
      enabled: !!id,
    }
  );
}

export function useCreateQuilt() {
  const queryClient = useQueryClient();
  const utils = api.useUtils();

  return api.quilts.create.useMutation({
    onSuccess: () => {
      utils.quilts.getAll.invalidate();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateQuilt() {
  const queryClient = useQueryClient();
  const utils = api.useUtils();

  return api.quilts.update.useMutation({
    onSuccess: () => {
      // Invalidate quilt queries
      utils.quilts.getAll.invalidate();
      utils.quilts.getById.invalidate();

      // Invalidate usage queries (status changes affect usage records)
      utils.usage.getAll.invalidate();
      utils.usage.getAllActive.invalidate();
      utils.usage.getActive.invalidate();
      utils.usage.getByQuiltId.invalidate();

      // Invalidate dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteQuilt() {
  const queryClient = useQueryClient();
  const utils = api.useUtils();

  return api.quilts.delete.useMutation({
    onSuccess: () => {
      utils.quilts.getAll.invalidate();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Usage tracking hooks
export function useStartUsage() {
  const queryClient = useQueryClient();
  const utils = api.useUtils();

  return api.usage.create.useMutation({
    onSuccess: () => {
      utils.quilts.getAll.invalidate();
      utils.usage.getAllActive.invalidate();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useEndUsage() {
  const queryClient = useQueryClient();
  const utils = api.useUtils();

  return api.usage.end.useMutation({
    onSuccess: () => {
      utils.quilts.getAll.invalidate();
      utils.usage.getAllActive.invalidate();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
