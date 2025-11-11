'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/language-provider';
import { PackageOpen, SearchX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { QuiltDialog } from '@/components/quilts/QuiltDialog';
import { StatusChangeDialog } from '@/components/quilts/StatusChangeDialog';
import { QuiltToolbar } from './components/QuiltToolbar';
import { QuiltListView } from './components/QuiltListView';
import { QuiltGridView } from './components/QuiltGridView';
import { toast } from '@/lib/toast';
import { useQuilts, useCreateQuilt, useUpdateQuilt, useDeleteQuilt } from '@/hooks/useQuilts';
import { useCreateUsageRecord, useEndUsageRecord } from '@/hooks/useUsage';
import type {
  Quilt,
  FilterCriteria,
  SortField,
  SortDirection,
  ViewMode,
  QuiltStatus,
} from '@/types/quilt';

export default function QuiltsPage() {
  const searchParams = useSearchParams();
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
  const [selectedQuilt, setSelectedQuilt] = useState<Quilt | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const { t } = useLanguage();

  // Data fetching
  const { data: quiltsData, isLoading } = useQuilts();
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
    } catch {
      toast.error(t('toasts.failedToDeleteQuilt'));
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
    } catch {
      toast.error(t('toasts.failedToDeleteQuilt'));
    }
  };

  const handleStatusChange = (quilt: Quilt) => {
    setSelectedQuilt(quilt);
    setStatusDialogOpen(true);
  };

  const handleViewHistory = (_quilt: Quilt) => {
    // TODO: Implement history view
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
    } catch {
      toast.error(t('toasts.failedToSaveQuilt'));
    }
  };

  const handleStatusChangeConfirm = async (status: QuiltStatus, date?: Date, notes?: string) => {
    if (!selectedQuilt) return;

    try {
      // Update quilt status
      await updateQuiltMutation.mutateAsync({
        id: selectedQuilt.id,
        currentStatus: status as any,
      });

      // Handle usage records
      if (status === 'IN_USE' && selectedQuilt.currentStatus !== 'IN_USE') {
        await createUsageRecordMutation.mutateAsync({
          quiltId: selectedQuilt.id,
          startDate: date || new Date(),
          usageType: 'REGULAR',
          notes,
        });
      } else if (status !== 'IN_USE' && selectedQuilt.currentStatus === 'IN_USE') {
        await endUsageRecordMutation.mutateAsync({
          quiltId: selectedQuilt.id,
          endDate: date || new Date(),
          notes,
        });
      }

      toast.success(t('toasts.statusUpdated'));
      setStatusDialogOpen(false);
    } catch {
      toast.error(t('toasts.failedToUpdateStatus'));
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Empty state
  if (quilts.length === 0) {
    return (
      <div className="space-y-4">
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
      <div className="space-y-4">
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
    <div className="space-y-4">
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
        onStatusChange={handleStatusChangeConfirm as any}
      />
    </div>
  );
}
