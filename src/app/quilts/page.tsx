'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-provider';
import { PackageOpen, SearchX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { QuiltDialog } from '@/components/quilts/QuiltDialog';
import { StatusChangeDialog } from '@/components/quilts/StatusChangeDialog';
import { QuiltImageDialog } from '@/components/quilts/QuiltImageDialog';
import { QuiltToolbar } from './components/QuiltToolbar';
import { QuiltListView } from './components/QuiltListView';
import { QuiltGridView } from './components/QuiltGridView';
import { toast } from '@/lib/toast';
import { useQuilts, useCreateQuilt, useUpdateQuilt, useDeleteQuilt } from '@/hooks/useQuilts';
import { useCreateUsageRecord, useEndUsageRecord } from '@/hooks/useUsage';
import { useAppSettings } from '@/hooks/useSettings';
import type { Quilt, FilterCriteria, SortField, SortDirection, ViewMode } from '@/types/quilt';

export default function QuiltsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlSearchTerm = searchParams.get('search') || '';

  // State
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm);
  const [filters, setFilters] = useState<FilterCriteria>({
    seasons: [],
    statuses: [],
    colors: [],
    materials: [],
  });
  const [quiltDialogOpen, setQuiltDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedQuilt, setSelectedQuilt] = useState<Quilt | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const { t } = useLanguage();

  // Data fetching
  const { data: quiltsData, isLoading } = useQuilts();
  const { data: appSettings } = useAppSettings();
  const createQuiltMutation = useCreateQuilt();
  const updateQuiltMutation = useUpdateQuilt();
  const deleteQuiltMutation = useDeleteQuilt();
  const createUsageRecordMutation = useCreateUsageRecord();
  const endUsageRecordMutation = useEndUsageRecord();

  const quilts: Quilt[] = (quiltsData as any)?.json?.quilts || quiltsData?.quilts || [];

  // Get unique colors and materials
  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    quilts.forEach(quilt => {
      if (quilt.color) colors.add(quilt.color);
    });
    return Array.from(colors).sort();
  }, [quilts]);

  const availableMaterials = useMemo(() => {
    const materials = new Set<string>();
    quilts.forEach(quilt => {
      if (quilt.fillMaterial) materials.add(quilt.fillMaterial);
    });
    return Array.from(materials).sort();
  }, [quilts]);

  // Filter and sort quilts
  const filteredQuilts = useMemo(() => {
    let result = [...quilts];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        quilt =>
          quilt.name?.toLowerCase().includes(term) ||
          quilt.itemNumber?.toString().includes(term) ||
          quilt.fillMaterial?.toLowerCase().includes(term) ||
          quilt.location?.toLowerCase().includes(term) ||
          quilt.season?.toLowerCase().includes(term) ||
          quilt.currentStatus?.toLowerCase().includes(term)
      );
    }

    // Advanced filters
    if (filters.seasons.length > 0) {
      result = result.filter(quilt => filters.seasons.includes(quilt.season));
    }
    if (filters.statuses.length > 0) {
      result = result.filter(quilt => filters.statuses.includes(quilt.currentStatus));
    }
    if (filters.colors.length > 0) {
      result = result.filter(quilt => filters.colors.includes(quilt.color));
    }
    if (filters.materials.length > 0) {
      result = result.filter(quilt => filters.materials.includes(quilt.fillMaterial));
    }
    if (filters.minWeight !== undefined) {
      result = result.filter(quilt => quilt.weightGrams >= filters.minWeight!);
    }
    if (filters.maxWeight !== undefined) {
      result = result.filter(quilt => quilt.weightGrams <= filters.maxWeight!);
    }

    // Sorting
    if (sortField) {
      result.sort((a, b) => {
        if (sortField === 'weight') {
          return sortDirection === 'asc'
            ? a.weightGrams - b.weightGrams
            : b.weightGrams - a.weightGrams;
        }

        if (sortField === 'size') {
          // Sort by area (length × width) if available, otherwise by size string
          const aArea = a.lengthCm && a.widthCm ? a.lengthCm * a.widthCm : 0;
          const bArea = b.lengthCm && b.widthCm ? b.lengthCm * b.widthCm : 0;

          if (aArea !== 0 && bArea !== 0) {
            return sortDirection === 'asc' ? aArea - bArea : bArea - aArea;
          }

          // Fallback to string comparison
          const aStr = String(a.size || '').toLowerCase();
          const bStr = String(b.size || '').toLowerCase();

          if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
          if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        }

        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue == null) return 1;
        if (bValue == null) return -1;

        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();

        if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [quilts, searchTerm, filters, sortField, sortDirection]);

  // Event handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectToggle = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredQuilts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredQuilts.map(q => q.id)));
    }
  };

  const handleAddQuilt = () => {
    setSelectedQuilt(null);
    setQuiltDialogOpen(true);
  };

  const handleEditQuilt = (quilt: Quilt) => {
    setSelectedQuilt(quilt);
    setQuiltDialogOpen(true);
  };

  const handleDeleteQuilt = async (quilt: Quilt) => {
    if (!confirm(t('quilts.confirmDelete'))) return;

    try {
      await deleteQuiltMutation.mutateAsync({ id: quilt.id });
      toast.success(t('toasts.quiltDeleted'));
    } catch (error: any) {
      toast.error(
        t('language') === 'zh' ? '删除失败' : 'Failed to delete',
        error?.message || (t('language') === 'zh' ? '请重试' : 'Please try again')
      );
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (
      !confirm(
        t('language') === 'zh'
          ? `确定要删除选中的 ${selectedIds.size} 个被子吗？`
          : `Delete ${selectedIds.size} selected quilts?`
      )
    )
      return;

    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteQuiltMutation.mutateAsync({ id })));
      setSelectedIds(new Set());
      setIsSelectMode(false);
      toast.success(t('toasts.quiltDeleted'));
    } catch (error: any) {
      toast.error(
        t('language') === 'zh' ? '删除失败' : 'Failed to delete',
        error?.message || (t('language') === 'zh' ? '请重试' : 'Please try again')
      );
    }
  };

  const handleStatusChange = (quilt: Quilt) => {
    setSelectedQuilt(quilt);
    setStatusDialogOpen(true);
  };

  const handleViewHistory = (quilt: Quilt) => {
    router.push(`/usage/${quilt.id}?from=quilts`);
  };

  const handleViewImages = (quilt: Quilt) => {
    setSelectedQuilt(quilt);
    setImageDialogOpen(true);
  };

  const handleQuiltDoubleClick = (quilt: Quilt) => {
    const doubleClickAction = (appSettings?.doubleClickAction as string) || 'status';

    switch (doubleClickAction) {
      case 'status':
        // Change status
        handleStatusChange(quilt);
        break;
      case 'edit':
        // Edit quilt
        handleEditQuilt(quilt);
        break;
      case 'view':
        // View usage history
        handleViewHistory(quilt);
        break;
      case 'none':
      default:
        // Do nothing
        break;
    }
  };

  const handleSaveQuilt = async (data: any) => {
    try {
      if (selectedQuilt) {
        await updateQuiltMutation.mutateAsync({ id: selectedQuilt.id, ...data });
        toast.success(t('toasts.quiltUpdated'));
      } else {
        await createQuiltMutation.mutateAsync(data);
        toast.success(t('toasts.quiltAdded'));
      }
      setQuiltDialogOpen(false);
    } catch (error: any) {
      // Extract error message from tRPC error
      const errorMessage = error?.message || (t('language') === 'zh' ? '未知错误' : 'Unknown error');
      toast.error(
        t('language') === 'zh' ? '保存失败' : 'Failed to save',
        errorMessage
      );
    }
  };

  const handleStatusChangeConfirm = async (
    quiltId: string,
    newStatus: string,
    options?: { startDate?: string; endDate?: string; notes?: string }
  ) => {
    if (!selectedQuilt) return;

    try {
      // Update quilt status
      await updateQuiltMutation.mutateAsync({
        id: quiltId,
        currentStatus: newStatus as any,
      });

      // Handle usage records
      if (newStatus === 'IN_USE' && selectedQuilt.currentStatus !== 'IN_USE') {
        // Starting usage - create new usage record
        await createUsageRecordMutation.mutateAsync({
          quiltId: quiltId,
          startDate: options?.startDate ? new Date(options.startDate) : new Date(),
          usageType: 'REGULAR',
          notes: options?.notes,
        });
      } else if (newStatus !== 'IN_USE' && selectedQuilt.currentStatus === 'IN_USE') {
        // Ending usage - end active usage record
        await endUsageRecordMutation.mutateAsync({
          quiltId: quiltId,
          endDate: options?.endDate ? new Date(options.endDate) : new Date(),
          notes: options?.notes,
        });
      }

      toast.success(t('toasts.statusUpdated'));
      setStatusDialogOpen(false);
    } catch (error: any) {
      console.error('Status change error:', error);
      toast.error(
        t('language') === 'zh' ? '状态更新失败' : 'Failed to update status',
        error?.message || (t('language') === 'zh' ? '请重试' : 'Please try again')
      );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Empty state
  if (quilts.length === 0) {
    return (
      <div className="space-y-6">
        <QuiltToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchClear={() => setSearchTerm('')}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isSelectMode={isSelectMode}
          onSelectModeToggle={() => setIsSelectMode(!isSelectMode)}
          selectedCount={selectedIds.size}
          onBatchDelete={handleBatchDelete}
          onAddQuilt={handleAddQuilt}
          filters={filters as any}
          onFiltersChange={setFilters as any}
          availableColors={availableColors}
          availableMaterials={availableMaterials}
        />
        <EmptyState
          icon={PackageOpen}
          title={t('pages.noQuilts')}
          description={t('pages.noQuiltsDescription')}
          action={{
            label: t('quilts.actions.add'),
            onClick: handleAddQuilt,
          }}
        />
      </div>
    );
  }

  // No results state
  if (filteredQuilts.length === 0) {
    return (
      <div className="space-y-6">
        <QuiltToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchClear={() => setSearchTerm('')}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isSelectMode={isSelectMode}
          onSelectModeToggle={() => setIsSelectMode(!isSelectMode)}
          selectedCount={selectedIds.size}
          onBatchDelete={handleBatchDelete}
          onAddQuilt={handleAddQuilt}
          filters={filters as any}
          onFiltersChange={setFilters as any}
          availableColors={availableColors}
          availableMaterials={availableMaterials}
        />
        <EmptyState
          icon={SearchX}
          title={t('pages.noResults')}
          description={t('pages.noResultsDescription')}
          action={{
            label: t('common.clearFilters'),
            onClick: () => {
              setSearchTerm('');
              setFilters({ seasons: [], statuses: [], colors: [], materials: [] });
            },
          }}
        />
      </div>
    );
  }

  // Main render
  return (
    <div className="space-y-6">
      <QuiltToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchClear={() => setSearchTerm('')}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isSelectMode={isSelectMode}
        onSelectModeToggle={() => setIsSelectMode(!isSelectMode)}
        selectedCount={selectedIds.size}
        onBatchDelete={handleBatchDelete}
        onAddQuilt={handleAddQuilt}
        filters={filters as any}
        onFiltersChange={setFilters as any}
        availableColors={availableColors}
        availableMaterials={availableMaterials}
      />

      {viewMode === 'list' ? (
        <QuiltListView
          quilts={filteredQuilts}
          searchTerm={searchTerm}
          isSelectMode={isSelectMode}
          selectedIds={selectedIds}
          onSelectToggle={handleSelectToggle}
          onSelectAll={handleSelectAll}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onEdit={handleEditQuilt}
          onDelete={handleDeleteQuilt}
          onStatusChange={handleStatusChange}
          onViewHistory={handleViewHistory}
          onViewImages={handleViewImages}
          onDoubleClick={handleQuiltDoubleClick}
        />
      ) : (
        <QuiltGridView
          quilts={filteredQuilts}
          searchTerm={searchTerm}
          isSelectMode={isSelectMode}
          selectedIds={selectedIds}
          onSelectToggle={handleSelectToggle}
          onEdit={handleEditQuilt}
          onDelete={handleDeleteQuilt}
          onStatusChange={handleStatusChange}
          onViewImages={handleViewImages}
          onDoubleClick={handleQuiltDoubleClick}
        />
      )}

      <QuiltDialog
        open={quiltDialogOpen}
        onOpenChange={setQuiltDialogOpen}
        quilt={selectedQuilt}
        onSave={handleSaveQuilt}
      />

      <StatusChangeDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        quilt={selectedQuilt}
        onStatusChange={handleStatusChangeConfirm}
      />

      <QuiltImageDialog
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        quilt={selectedQuilt}
      />
    </div>
  );
}
