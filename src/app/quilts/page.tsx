'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  PackageOpen,
  SearchX,
  Grid3x3,
  List,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  History,
  Package,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TableSkeleton } from '@/components/ui/skeleton-layouts';
import { EmptyState } from '@/components/ui/empty-state';
import { HighlightText } from '@/components/ui/highlight-text';
import { QuiltDialog } from '@/components/quilts/QuiltDialog';
import { StatusChangeDialog } from '@/components/quilts/StatusChangeDialog';
import { AdvancedFilters, type FilterCriteria } from '@/components/quilts/AdvancedFilters';
import { toast, getToastMessage } from '@/lib/toast';
import { useQuilts, useCreateQuilt, useUpdateQuilt, useDeleteQuilt } from '@/hooks/useQuilts';
import { useCreateUsageRecord, useEndUsageRecord } from '@/hooks/useUsage';
import { useAppSettings } from '@/hooks/useSettings';

export default function QuiltsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlSearchTerm = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm);
  const [filters, setFilters] = useState<FilterCriteria>({
    seasons: [],
    statuses: [],
    colors: [],
    materials: [],
  });

  // Dialog states
  const [quiltDialogOpen, setQuiltDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedQuilt, setSelectedQuilt] = useState<any>(null);

  // Batch operation states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  // View mode state
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Sorting state
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { t } = useLanguage();

  // React Query hooks
  const { data: quiltsData, isLoading, error } = useQuilts();
  const { data: appSettings } = useAppSettings();
  const createQuiltMutation = useCreateQuilt();
  const updateQuiltMutation = useUpdateQuilt();
  const deleteQuiltMutation = useDeleteQuilt();
  const createUsageRecordMutation = useCreateUsageRecord();
  const endUsageRecordMutation = useEndUsageRecord();

  // tRPC with superjson wraps data in json property
  const quilts = (quiltsData as any)?.json?.quilts || quiltsData?.quilts || [];

  // Sorting function
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get unique colors and materials for filter options
  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    quilts.forEach((quilt: any) => {
      if (quilt.color) colors.add(quilt.color);
    });
    return Array.from(colors).sort();
  }, [quilts]);

  const availableMaterials = useMemo(() => {
    const materials = new Set<string>();
    quilts.forEach((quilt: any) => {
      if (quilt.fillMaterial) materials.add(quilt.fillMaterial);
    });
    return Array.from(materials).sort();
  }, [quilts]);

  // Memoized filtered and sorted quilts
  const filteredQuilts = useMemo(() => {
    let result = quilts;

    // Apply search filter
    if (searchTerm.trim()) {
      result = result.filter(
        (quilt: any) =>
          quilt.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quilt.itemNumber?.toString().includes(searchTerm) ||
          quilt.fillMaterial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quilt.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quilt.season?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quilt.currentStatus?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply advanced filters
    // Season filter
    if (filters.seasons.length > 0) {
      result = result.filter((quilt: any) => filters.seasons.includes(quilt.season));
    }

    // Status filter
    if (filters.statuses.length > 0) {
      result = result.filter((quilt: any) => filters.statuses.includes(quilt.currentStatus));
    }

    // Weight filter
    if (filters.minWeight !== undefined) {
      result = result.filter((quilt: any) => parseFloat(quilt.weightGrams) >= filters.minWeight!);
    }
    if (filters.maxWeight !== undefined) {
      result = result.filter((quilt: any) => parseFloat(quilt.weightGrams) <= filters.maxWeight!);
    }

    // Length filter
    if (filters.minLength !== undefined) {
      result = result.filter((quilt: any) => parseFloat(quilt.lengthCm) >= filters.minLength!);
    }
    if (filters.maxLength !== undefined) {
      result = result.filter((quilt: any) => parseFloat(quilt.lengthCm) <= filters.maxLength!);
    }

    // Width filter
    if (filters.minWidth !== undefined) {
      result = result.filter((quilt: any) => parseFloat(quilt.widthCm) >= filters.minWidth!);
    }
    if (filters.maxWidth !== undefined) {
      result = result.filter((quilt: any) => parseFloat(quilt.widthCm) <= filters.maxWidth!);
    }

    // Color filter
    if (filters.colors.length > 0) {
      result = result.filter((quilt: any) => filters.colors.includes(quilt.color));
    }

    // Material filter
    if (filters.materials.length > 0) {
      result = result.filter((quilt: any) => filters.materials.includes(quilt.fillMaterial));
    }

    // Apply sorting
    if (sortField) {
      result = [...result].sort((a: any, b: any) => {
        // Special handling for size field - sort by lengthCm first, then widthCm
        if (sortField === 'size') {
          const aLength = parseFloat(a.lengthCm) || 0;
          const bLength = parseFloat(b.lengthCm) || 0;
          const aWidth = parseFloat(a.widthCm) || 0;
          const bWidth = parseFloat(b.widthCm) || 0;

          // First compare by length
          if (aLength !== bLength) {
            return sortDirection === 'asc' ? aLength - bLength : bLength - aLength;
          }
          // If length is the same, compare by width
          return sortDirection === 'asc' ? aWidth - bWidth : bWidth - aWidth;
        }

        // Special handling for weight field - sort by weightGrams
        if (sortField === 'weight') {
          const aWeight = parseFloat(a.weightGrams) || 0;
          const bWeight = parseFloat(b.weightGrams) || 0;

          return sortDirection === 'asc' ? aWeight - bWeight : bWeight - aWeight;
        }

        // Default sorting for other fields
        let aValue = a[sortField];
        let bValue = b[sortField];

        // Handle null/undefined values
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // Convert to string for comparison if needed
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        // Compare values
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [quilts, searchTerm, sortField, sortDirection, filters]);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Render sort icon
  const renderSortIcon = (field: string) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-50 transition-opacity" />
      );
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="w-3 h-3 ml-1 text-blue-600" />
    );
  };

  // CRUD operations
  const handleAddQuilt = () => {
    setSelectedQuilt(null);
    setQuiltDialogOpen(true);
  };

  const handleEditQuilt = (quilt: any) => {
    setSelectedQuilt(quilt);
    setQuiltDialogOpen(true);
  };

  const handleRowDoubleClick = (quilt: any) => {
    const doubleClickAction = appSettings?.doubleClickAction || 'status';

    switch (doubleClickAction) {
      case 'view':
        // View usage history - same as clicking the view button
        handleViewUsageHistory(quilt);
        break;
      case 'status':
        handleChangeStatus(quilt);
        break;
      case 'edit':
        handleEditQuilt(quilt);
        break;
      case 'none':
      default:
        // 不执行任何操作
        break;
    }
  };

  const handleChangeStatus = (quilt: any) => {
    setSelectedQuilt(quilt);
    setStatusDialogOpen(true);
  };

  const handleViewUsageHistory = (quilt: any) => {
    // Navigate to usage tracking page with quilt ID as query parameter
    router.push(`/usage?quiltId=${quilt.id}`);
  };

  const handleDeleteQuilt = async (quilt: any) => {
    if (
      !window.confirm(
        `确定要删除被子 "${quilt.name}" 吗？\nAre you sure you want to delete quilt "${quilt.name}"?`
      )
    ) {
      return;
    }

    const lang = t('language') === 'zh' ? 'zh' : 'en';
    const toastId = toast.loading(getToastMessage('deleting', lang));

    try {
      await deleteQuiltMutation.mutateAsync({ id: quilt.id });
      toast.dismiss(toastId);
      toast.success(getToastMessage('deleteSuccess', lang));
    } catch (error) {
      console.error('Error deleting quilt:', error);
      toast.dismiss(toastId);
      toast.error(getToastMessage('deleteError', lang));
    }
  };

  // Batch operations
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedIds(new Set());
  };

  const toggleSelectQuilt = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredQuilts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredQuilts.map((q: any) => q.id)));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) {
      const lang = t('language') === 'zh' ? 'zh' : 'en';
      toast.warning(getToastMessage('selectItems', lang));
      return;
    }

    if (
      !window.confirm(
        `确定要删除选中的 ${selectedIds.size} 个被子吗？\nAre you sure you want to delete ${selectedIds.size} selected quilts?`
      )
    ) {
      return;
    }

    const lang = t('language') === 'zh' ? 'zh' : 'en';
    const toastId = toast.loading(
      lang === 'zh'
        ? `正在删除 ${selectedIds.size} 个被子...`
        : `Deleting ${selectedIds.size} quilts...`
    );

    try {
      const deletePromises = Array.from(selectedIds).map(id =>
        deleteQuiltMutation.mutateAsync({ id })
      );

      await Promise.all(deletePromises);

      setSelectedIds(new Set());
      setIsSelectMode(false);

      toast.dismiss(toastId);
      toast.success(
        lang === 'zh'
          ? `成功删除 ${selectedIds.size} 个被子`
          : `Successfully deleted ${selectedIds.size} quilts`
      );
    } catch (error) {
      console.error('Error batch deleting quilts:', error);
      toast.dismiss(toastId);
      toast.error(getToastMessage('deleteError', lang));
    }
  };

  const handleSaveQuilt = async (data: any) => {
    const lang = t('language') === 'zh' ? 'zh' : 'en';
    const isUpdate = !!selectedQuilt;

    try {
      if (isUpdate) {
        await updateQuiltMutation.mutateAsync({ id: selectedQuilt.id, ...data });
        toast.success(getToastMessage('updateSuccess', lang));
      } else {
        await createQuiltMutation.mutateAsync(data);
        toast.success(getToastMessage('createSuccess', lang));
      }
    } catch (error) {
      console.error('Error saving quilt:', error);
      toast.error(getToastMessage(isUpdate ? 'updateError' : 'createError', lang));
      throw error;
    }
  };

  const handleStatusChange = async (
    quiltId: string,
    newStatus: string,
    options?: { startDate?: string; endDate?: string; notes?: string }
  ) => {
    const lang = t('language') === 'zh' ? 'zh' : 'en';

    try {
      // Validate status is one of the allowed values
      const validStatuses = ['IN_USE', 'MAINTENANCE', 'STORAGE'] as const;
      type ValidStatus = (typeof validStatuses)[number];

      if (!validStatuses.includes(newStatus as ValidStatus)) {
        throw new Error('Invalid status value');
      }

      // Get current quilt to check if it's currently in use
      const currentQuilt = quilts.find((q: any) => q.id === quiltId);
      const wasInUse = currentQuilt?.currentStatus === 'IN_USE';

      // Prepare update data
      const updateData: any = {
        id: quiltId,
        currentStatus: newStatus as ValidStatus,
      };

      // If changing to IN_USE, automatically set location to "在用"
      if (newStatus === 'IN_USE') {
        updateData.location = '在用';
      }

      // If changing FROM IN_USE to another status, end the active usage record
      if (wasInUse && newStatus !== 'IN_USE') {
        try {
          await endUsageRecordMutation.mutateAsync({
            quiltId,
            endDate: options?.endDate ? new Date(options.endDate) : new Date(),
            notes: options?.notes,
          });
        } catch (endError) {
          console.error('Error ending usage record:', endError);
          // Continue with status update even if ending usage fails
        }
      }

      // Update quilt status using tRPC
      await updateQuiltMutation.mutateAsync(updateData);

      // If changing to IN_USE, create a new usage record
      if (newStatus === 'IN_USE') {
        await createUsageRecordMutation.mutateAsync({
          quiltId,
          startDate: options?.startDate ? new Date(options.startDate) : new Date(),
          usageType: 'REGULAR',
          notes: options?.notes || undefined,
        });
      }

      toast.success(lang === 'zh' ? '状态更新成功' : 'Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(getToastMessage('updateError', lang));
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        {/* Search Skeleton */}
        <Skeleton className="h-10 w-full max-w-md" />
        {/* Table Skeleton */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm p-4">
          <TableSkeleton rows={8} columns={10} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800">{t('common.error')}</h2>
          <p className="text-red-600">{error instanceof Error ? error.message : String(error)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t('quilts.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isSelectMode && selectedIds.size > 0
              ? `${t('language') === 'zh' ? '已选择' : 'Selected'} ${selectedIds.size} ${t('quilts.messages.quilts')}`
              : `${t('quilts.messages.of')} ${quilts.length} ${t('quilts.messages.quilts')}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSelectMode ? (
            <>
              <Button onClick={selectAll} variant="outline" size="sm">
                {selectedIds.size === filteredQuilts.length
                  ? t('language') === 'zh'
                    ? '取消全选'
                    : 'Deselect All'
                  : t('language') === 'zh'
                    ? '全选'
                    : 'Select All'}
              </Button>
              <Button
                onClick={handleBatchDelete}
                variant="destructive"
                size="sm"
                disabled={selectedIds.size === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('language') === 'zh' ? '删除选中' : 'Delete Selected'} ({selectedIds.size})
              </Button>
              <Button onClick={toggleSelectMode} variant="outline" size="sm">
                {t('language') === 'zh' ? '取消' : 'Cancel'}
              </Button>
            </>
          ) : (
            <>
              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 text-sm transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  title={t('language') === 'zh' ? '列表视图' : 'List View'}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 text-sm transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  title={t('language') === 'zh' ? '网格视图' : 'Grid View'}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
              </div>
              {/* Batch Operations button removed - functionality preserved for future use */}
              <Button onClick={handleAddQuilt} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                {t('quilts.actions.add')}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder={t('quilts.actions.search')}
            value={searchTerm}
            onChange={onSearchChange}
            className="pl-9 h-9"
          />
        </div>
        <AdvancedFilters
          onFilterChange={setFilters}
          availableColors={availableColors}
          availableMaterials={availableMaterials}
        />
        {filteredQuilts.length !== quilts.length && (
          <span className="text-sm text-gray-600">
            {t('language') === 'zh' ? '显示' : 'Showing'} {filteredQuilts.length} / {quilts.length}
          </span>
        )}
      </div>

      {/* List View - Enhanced Professional Data Table */}
      {viewMode === 'list' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300">
                  {isSelectMode && (
                    <th className="px-4 py-3 w-12">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.size === filteredQuilts.length && filteredQuilts.length > 0
                        }
                        onChange={selectAll}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </th>
                  )}
                  <th
                    className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group select-none"
                    onClick={() => handleSort('itemNumber')}
                    title={t('language') === 'zh' ? '点击排序' : 'Click to sort'}
                  >
                    <div className="flex items-center justify-center">
                      {t('quilts.table.itemNumber')}
                      {renderSortIcon('itemNumber')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group select-none"
                    onClick={() => handleSort('name')}
                    title={t('language') === 'zh' ? '点击排序' : 'Click to sort'}
                  >
                    <div className="flex items-center justify-center">
                      {t('quilts.views.name')}
                      {renderSortIcon('name')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group select-none"
                    onClick={() => handleSort('season')}
                    title={t('language') === 'zh' ? '点击排序' : 'Click to sort'}
                  >
                    <div className="flex items-center justify-center">
                      {t('quilts.table.season')}
                      {renderSortIcon('season')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group select-none"
                    onClick={() => handleSort('size')}
                    title={t('language') === 'zh' ? '点击排序' : 'Click to sort'}
                  >
                    <div className="flex items-center justify-center">
                      {t('quilts.table.size')}
                      {renderSortIcon('size')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group select-none"
                    onClick={() => handleSort('weight')}
                    title={t('language') === 'zh' ? '点击排序' : 'Click to sort'}
                  >
                    <div className="flex items-center justify-center">
                      {t('quilts.table.weight')}
                      {renderSortIcon('weight')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group select-none"
                    onClick={() => handleSort('fillMaterial')}
                    title={t('language') === 'zh' ? '点击排序' : 'Click to sort'}
                  >
                    <div className="flex items-center justify-center">
                      填充材料
                      {renderSortIcon('fillMaterial')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group select-none"
                    onClick={() => handleSort('color')}
                    title={t('language') === 'zh' ? '点击排序' : 'Click to sort'}
                  >
                    <div className="flex items-center justify-center">
                      {t('quilts.table.color')}
                      {renderSortIcon('color')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group select-none"
                    onClick={() => handleSort('location')}
                    title={t('language') === 'zh' ? '点击排序' : 'Click to sort'}
                  >
                    <div className="flex items-center justify-center">
                      存放位置
                      {renderSortIcon('location')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group select-none"
                    onClick={() => handleSort('currentStatus')}
                    title={t('language') === 'zh' ? '点击排序' : 'Click to sort'}
                  >
                    <div className="flex items-center justify-center">
                      {t('quilts.table.status')}
                      {renderSortIcon('currentStatus')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t('quilts.views.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredQuilts.length === 0 ? (
                  <tr>
                    <td colSpan={isSelectMode ? 11 : 10} className="px-4">
                      <EmptyState
                        icon={searchTerm ? SearchX : PackageOpen}
                        title={
                          searchTerm
                            ? `${t('language') === 'zh' ? '没有找到匹配的被子' : 'No quilts found matching'} "${searchTerm}"`
                            : t('language') === 'zh'
                              ? '暂无被子数据'
                              : 'No quilts yet'
                        }
                        description={
                          searchTerm
                            ? t('language') === 'zh'
                              ? '尝试调整搜索条件或筛选器'
                              : 'Try adjusting your search or filters'
                            : t('language') === 'zh'
                              ? '点击"添加被子"按钮创建第一条记录'
                              : 'Click "Add Quilt" to create your first record'
                        }
                        action={
                          !searchTerm
                            ? {
                                label: t('language') === 'zh' ? '添加被子' : 'Add Quilt',
                                onClick: () => {
                                  setSelectedQuilt(null);
                                  setQuiltDialogOpen(true);
                                },
                              }
                            : undefined
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  filteredQuilts.map((quilt: any, index: number) => (
                    <tr
                      key={quilt.id}
                      onDoubleClick={() => handleRowDoubleClick(quilt)}
                      className={`
                      transition-all duration-150 ease-in-out
                      hover:bg-blue-50 hover:shadow-sm
                      cursor-pointer
                      ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                      border-b border-gray-100 last:border-b-0
                    `}
                    >
                      {isSelectMode && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(quilt.id)}
                            onChange={() => toggleSelectQuilt(quilt.id)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        <HighlightText text={`#${quilt.itemNumber}`} searchTerm={searchTerm} />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        <HighlightText text={quilt.name} searchTerm={searchTerm} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <HighlightText text={t(`season.${quilt.season}`)} searchTerm={searchTerm} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {quilt.lengthCm}×{quilt.widthCm}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{quilt.weightGrams}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <HighlightText text={quilt.fillMaterial} searchTerm={searchTerm} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <HighlightText text={quilt.color || '-'} searchTerm={searchTerm} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <HighlightText text={quilt.location} searchTerm={searchTerm} />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            quilt.currentStatus === 'IN_USE'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : quilt.currentStatus === 'STORAGE'
                                ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          }`}
                        >
                          {t(`status.${quilt.currentStatus}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewUsageHistory(quilt)}
                            className="h-8 w-8 p-0"
                            title={t('language') === 'zh' ? '查看使用历史' : 'View Usage History'}
                          >
                            <History className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleChangeStatus(quilt)}
                            className="h-8 w-8 p-0"
                            title={t('language') === 'zh' ? '更改状态' : 'Change Status'}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditQuilt(quilt)}
                            className="h-8 w-8 p-0"
                            title={t('common.edit')}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuilt(quilt)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title={t('common.delete')}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredQuilts.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon={searchTerm ? SearchX : PackageOpen}
                title={
                  searchTerm
                    ? `${t('language') === 'zh' ? '没有找到匹配的被子' : 'No quilts found matching'} "${searchTerm}"`
                    : t('language') === 'zh'
                      ? '暂无被子数据'
                      : 'No quilts yet'
                }
                description={
                  searchTerm
                    ? t('language') === 'zh'
                      ? '尝试调整搜索条件或筛选器'
                      : 'Try adjusting your search or filters'
                    : t('language') === 'zh'
                      ? '点击"添加被子"按钮创建第一条记录'
                      : 'Click "Add Quilt" to create your first record'
                }
                action={
                  !searchTerm
                    ? {
                        label: t('language') === 'zh' ? '添加被子' : 'Add Quilt',
                        onClick: () => {
                          setSelectedQuilt(null);
                          setQuiltDialogOpen(true);
                        },
                      }
                    : undefined
                }
              />
            </div>
          ) : (
            filteredQuilts.map((quilt: any) => (
              <div
                key={quilt.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1"
              >
                {/* Image Display */}
                <div className="aspect-square w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {quilt.imageUrl || quilt.mainImage ? (
                    <img
                      src={quilt.imageUrl || quilt.mainImage}
                      alt={quilt.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-16 h-16 text-gray-400" />
                  )}
                </div>

                <div className="p-4">
                  {/* Season Color Indicator */}
                  <div
                    className={`h-2 w-full rounded mb-3 ${
                      quilt.season === 'WINTER'
                        ? 'bg-blue-500'
                        : quilt.season === 'SUMMER'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                  />

                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        <HighlightText text={quilt.name} searchTerm={searchTerm} />
                      </h3>
                      <p className="text-sm text-gray-500">
                        <HighlightText text={`#${quilt.itemNumber}`} searchTerm={searchTerm} />
                      </p>
                    </div>
                    {/* Status Badge */}
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        quilt.currentStatus === 'IN_USE'
                          ? 'bg-green-100 text-green-800'
                          : quilt.currentStatus === 'STORAGE'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {t(`status.${quilt.currentStatus}`)}
                    </span>
                  </div>

                  {/* Card Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-20">{t('quilts.table.season')}:</span>
                      <span className="font-medium">
                        <HighlightText text={t(`season.${quilt.season}`)} searchTerm={searchTerm} />
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-20">{t('quilts.table.fillMaterial')}:</span>
                      <span className="font-medium">
                        <HighlightText text={quilt.fillMaterial} searchTerm={searchTerm} />
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-20">{t('quilts.table.weight')}:</span>
                      <span className="font-medium">{quilt.weightGrams}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-20">{t('quilts.table.location')}:</span>
                      <span className="font-medium">
                        <HighlightText text={quilt.location} searchTerm={searchTerm} />
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <Button
                      onClick={() => handleEditQuilt(quilt)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      {t('quilts.actions.edit')}
                    </Button>
                    <Button
                      onClick={() => handleChangeStatus(quilt)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      {t('language') === 'zh' ? '状态' : 'Status'}
                    </Button>
                    <Button
                      onClick={() => handleDeleteQuilt(quilt)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Dialogs */}
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
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
