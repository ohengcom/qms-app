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
    // Optimistic update
    onMutate: async newQuilt => {
      // Cancel outgoing refetches
      await utils.quilts.getAll.cancel();

      // Snapshot previous value
      const previousQuilts = utils.quilts.getAll.getData();

      // Optimistically update to the new value
      if (previousQuilts) {
        utils.quilts.getAll.setData(undefined, old => {
          if (!old) return old;
          return [
            ...old,
            {
              ...newQuilt,
              id: `temp-${Date.now()}`,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
        });
      }

      return { previousQuilts };
    },
    onError: (_err, _newQuilt, context) => {
      // Rollback on error
      if (context?.previousQuilts) {
        utils.quilts.getAll.setData(undefined, context.previousQuilts);
      }
    },
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
    // Optimistic update
    onMutate: async updatedQuilt => {
      // Cancel outgoing refetches
      await utils.quilts.getAll.cancel();
      await utils.quilts.getById.cancel({ id: updatedQuilt.id });

      // Snapshot previous values
      const previousQuilts = utils.quilts.getAll.getData();
      const previousQuilt = utils.quilts.getById.getData({ id: updatedQuilt.id });

      // Optimistically update list
      if (previousQuilts) {
        utils.quilts.getAll.setData(undefined, old => {
          if (!old) return old;
          return old.map(quilt =>
            quilt.id === updatedQuilt.id ? { ...quilt, ...updatedQuilt } : quilt
          );
        });
      }

      // Optimistically update single quilt
      if (previousQuilt) {
        utils.quilts.getById.setData({ id: updatedQuilt.id }, old => {
          if (!old) return old;
          return { ...old, ...updatedQuilt };
        });
      }

      return { previousQuilts, previousQuilt };
    },
    onError: (_err, updatedQuilt, context) => {
      // Rollback on error
      if (context?.previousQuilts) {
        utils.quilts.getAll.setData(undefined, context.previousQuilts);
      }
      if (context?.previousQuilt) {
        utils.quilts.getById.setData({ id: updatedQuilt.id }, context.previousQuilt);
      }
    },
    onSuccess: () => {
      utils.quilts.getAll.invalidate();
      utils.quilts.getById.invalidate();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteQuilt() {
  const queryClient = useQueryClient();
  const utils = api.useUtils();

  return api.quilts.delete.useMutation({
    // Optimistic update
    onMutate: async ({ id }) => {
      // Cancel outgoing refetches
      await utils.quilts.getAll.cancel();

      // Snapshot previous value
      const previousQuilts = utils.quilts.getAll.getData();

      // Optimistically remove from list
      if (previousQuilts) {
        utils.quilts.getAll.setData(undefined, old => {
          if (!old) return old;
          return old.filter(quilt => quilt.id !== id);
        });
      }

      return { previousQuilts };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousQuilts) {
        utils.quilts.getAll.setData(undefined, context.previousQuilts);
      }
    },
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
