'use client';

import { api } from '@/lib/trpc';
import type { QuiltSearchInput } from '@/lib/validations/quilt';

export function useQuilts(searchParams?: QuiltSearchInput) {
  // For now, ignore search params since we simplified the API
  return api.quilts.getAll.useQuery();
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
  // Simplified to not pass parameters for now
  return api.quilts.getSeasonalRecommendations.useQuery();
}