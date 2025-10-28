'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/trpc';
import type { QuiltSearchInput } from '@/lib/validations/quilt';

export function useQuilts(searchParams?: QuiltSearchInput) {
  // Temporarily use direct API instead of tRPC to bypass tRPC issues
  return useQuery({
    queryKey: ['quilts', 'getAll'],
    queryFn: async () => {
      console.log('useQuilts: Fetching from direct API...');
      try {
        const response = await fetch('/api/quilts');
        console.log('useQuilts: Response status:', response.status);
        console.log('useQuilts: Response ok:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('useQuilts: Error response:', errorText);
          throw new Error(`Failed to fetch quilts: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('useQuilts: Received data:', data);
        console.log('useQuilts: Quilts count:', data?.quilts?.length || 0);
        console.log('useQuilts: First quilt:', data?.quilts?.[0]);
        
        return data;
      } catch (error) {
        console.error('useQuilts: Fetch error:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 0, // Always fetch fresh data for debugging
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
  // Simplified to not pass parameters for now
  return api.quilts.getSeasonalRecommendations.useQuery();
}