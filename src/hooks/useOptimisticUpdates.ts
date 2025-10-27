'use client';

import { useCallback } from 'react';
import { api } from '@/lib/trpc';
import type { Quilt as PrismaQuilt } from '@prisma/client';

type Quilt = PrismaQuilt;

export function useOptimisticQuiltUpdates() {
  const utils = api.useUtils();
  
  const optimisticUpdate = useCallback(
    (quiltId: string, updater: (quilt: Quilt) => Partial<Quilt>) => {
      // Update the specific quilt in cache optimistically
      utils.quilts.getById.setData({ id: quiltId }, (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, ...updater(oldData as any) };
      });
      
      // Update the quilt in the list cache
      utils.quilts.getAll.setData({ filters: {}, sortBy: 'itemNumber', sortOrder: 'asc', skip: 0, take: 50 }, (oldData: any) => {
        if (!oldData || !oldData.quilts || !Array.isArray(oldData.quilts)) return oldData;
        
        return {
          ...oldData,
          quilts: oldData.quilts.map((quilt: any) =>
            quilt.id === quiltId ? { ...quilt, ...updater(quilt) } : quilt
          )
        };
      });
    },
    [utils]
  );
  
  const optimisticStatusUpdate = useCallback(
    (quiltId: string, newStatus: string) => {
      optimisticUpdate(quiltId, () => ({
        currentStatus: newStatus as any,
        updatedAt: new Date(),
      }));
    },
    [optimisticUpdate]
  );
  
  const optimisticUsageStart = useCallback(
    (quiltId: string) => {
      optimisticStatusUpdate(quiltId, 'IN_USE');
      
      // Update current usage cache
      utils.quilts.getCurrentUsage.setData(undefined, (oldData) => {
        if (!oldData) return [];
        
        // Add optimistic current usage (we don't have all the data, so this is minimal)
        return [
          ...oldData,
          {
            id: `temp-${quiltId}`,
            quiltId,
            startedAt: new Date(),
            usageType: 'REGULAR' as any,
            createdAt: new Date(),
            updatedAt: new Date(),
            quilt: {
              id: quiltId,
              name: 'Loading...',
              itemNumber: 0,
              season: 'SPRING_AUTUMN' as any,
              color: '',
              location: '',
            },
          } as any,
        ];
      });
    },
    [optimisticStatusUpdate, utils]
  );
  
  const optimisticUsageEnd = useCallback(
    (quiltId: string, usageId: string) => {
      optimisticStatusUpdate(quiltId, 'AVAILABLE');
      
      // Remove from current usage cache
      utils.quilts.getCurrentUsage.setData(undefined, (oldData: any) => {
        if (!oldData) return [];
        return oldData.filter((usage: any) => usage.id !== usageId);
      });
    },
    [optimisticStatusUpdate, utils]
  );
  
  const revertOptimisticUpdates = useCallback(() => {
    // Invalidate all caches to revert optimistic updates
    utils.quilts.invalidate();
    utils.dashboard.invalidate();
  }, [utils]);
  
  return {
    optimisticUpdate,
    optimisticStatusUpdate,
    optimisticUsageStart,
    optimisticUsageEnd,
    revertOptimisticUpdates,
  };
}