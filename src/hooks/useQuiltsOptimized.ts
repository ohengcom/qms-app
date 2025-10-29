import { useQueryClient } from '@tanstack/react-query';
import { toast, getToastMessage } from '@/lib/toast';
import { useLanguage } from '@/lib/language-provider';

/**
 * Optimized quilts data management with caching and optimistic updates
 */
export function useQuiltsOptimized() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const lang = t('language') === 'zh' ? 'zh' : 'en';

  /**
   * Optimistically update quilt in cache
   */
  const optimisticUpdate = (quiltId: string, updates: any) => {
    queryClient.setQueryData(['quilts'], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        quilts: old.quilts.map((q: any) => (q.id === quiltId ? { ...q, ...updates } : q)),
      };
    });
  };

  /**
   * Optimistically add quilt to cache
   */
  const optimisticAdd = (newQuilt: any) => {
    queryClient.setQueryData(['quilts'], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        quilts: [newQuilt, ...old.quilts],
        total: old.total + 1,
      };
    });
  };

  /**
   * Optimistically remove quilt from cache
   */
  const optimisticRemove = (quiltId: string) => {
    queryClient.setQueryData(['quilts'], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        quilts: old.quilts.filter((q: any) => q.id !== quiltId),
        total: old.total - 1,
      };
    });
  };

  /**
   * Invalidate and refetch quilts data
   */
  const invalidateQuilts = () => {
    queryClient.invalidateQueries({ queryKey: ['quilts'] });
  };

  /**
   * Prefetch quilt details
   */
  const prefetchQuilt = async (quiltId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ['quilt', quiltId],
      staleTime: 5 * 60 * 1000,
    });
  };

  /**
   * Update quilt with optimistic update
   */
  const updateQuiltOptimistic = async (
    quiltId: string,
    updates: any,
    updateFn: () => Promise<any>
  ) => {
    // Store previous data for rollback
    const previousData = queryClient.getQueryData(['quilts']);

    // Optimistically update
    optimisticUpdate(quiltId, updates);

    try {
      // Perform actual update
      await updateFn();
      toast.success(getToastMessage('updateSuccess', lang));
    } catch (error) {
      // Rollback on error
      queryClient.setQueryData(['quilts'], previousData);
      toast.error(getToastMessage('updateError', lang));
      throw error;
    }
  };

  /**
   * Delete quilt with optimistic update
   */
  const deleteQuiltOptimistic = async (quiltId: string, deleteFn: () => Promise<any>) => {
    // Store previous data for rollback
    const previousData = queryClient.getQueryData(['quilts']);

    // Optimistically remove
    optimisticRemove(quiltId);

    try {
      // Perform actual delete
      await deleteFn();
      toast.success(getToastMessage('deleteSuccess', lang));
    } catch (error) {
      // Rollback on error
      queryClient.setQueryData(['quilts'], previousData);
      toast.error(getToastMessage('deleteError', lang));
      throw error;
    }
  };

  return {
    optimisticUpdate,
    optimisticAdd,
    optimisticRemove,
    invalidateQuilts,
    prefetchQuilt,
    updateQuiltOptimistic,
    deleteQuiltOptimistic,
  };
}
