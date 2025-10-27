'use client';

import { api } from '@/lib/trpc';
import type { QuiltSearchInput } from '@/lib/validations/quilt';

export function useQuilts(searchParams?: QuiltSearchInput) {
  return api.quilts.getAll.useQuery(searchParams || {
    filters: {},
    sortBy: 'itemNumber',
    sortOrder: 'asc',
    skip: 0,
    take: 20,
  });
}

export function useQuilt(id: string) {
  return api.quilts.getById.useQuery({ id }, {
    enabled: !!id,
  });
}

export function useCreateQuilt() {
  const utils = api.useUtils();
  
  return api.quilts.create.useMutation({
    onSuccess: () => {
      // Invalidate and refetch quilts list
      utils.quilts.getAll.invalidate();
      utils.dashboard.getStats.invalidate();
    },
  });
}

export function useUpdateQuilt() {
  const utils = api.useUtils();
  
  return api.quilts.update.useMutation({
    onSuccess: () => {
      // Invalidate all related queries to ensure consistency
      utils.quilts.getAll.invalidate();
      utils.quilts.getById.invalidate();
      utils.dashboard.getStats.invalidate();
    },
  });
}

export function useDeleteQuilt() {
  const utils = api.useUtils();
  
  return api.quilts.delete.useMutation({
    onSuccess: () => {
      // Invalidate all quilt-related queries
      utils.quilts.invalidate();
      utils.dashboard.getStats.invalidate();
    },
  });
}

export function useStartUsage() {
  const utils = api.useUtils();
  
  return api.quilts.startUsage.useMutation({
    onSuccess: () => {
      // Invalidate relevant queries
      utils.quilts.getAll.invalidate();
      utils.quilts.getCurrentUsage.invalidate();
      utils.dashboard.getStats.invalidate();
    },
  });
}

export function useEndUsage() {
  const utils = api.useUtils();
  
  return api.quilts.endUsage.useMutation({
    onSuccess: () => {
      // Invalidate relevant queries
      utils.quilts.getAll.invalidate();
      utils.quilts.getCurrentUsage.invalidate();
      utils.dashboard.getStats.invalidate();
    },
  });
}

export function useCurrentUsage() {
  return api.quilts.getCurrentUsage.useQuery();
}

export function useSeasonalRecommendations(season?: any, availableOnly = true) {
  return api.quilts.getSeasonalRecommendations.useQuery({
    season,
    availableOnly,
  });
}