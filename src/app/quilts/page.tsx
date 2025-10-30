'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/language-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  Filter,
  PackageOpen,
  SearchX,
  Grid3x3,
  List,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TableSkeleton } from '@/components/ui/skeleton-layouts';
import { EmptyState } from '@/components/ui/empty-state';
import { QuiltDialog } from '@/components/quilts/QuiltDialog';
import { StatusChangeDialog } from '@/components/quilts/StatusChangeDialog';
import { toast, getToastMessage } from '@/lib/toast';
import { useQuilts, useCreateQuilt, useUpdateQuilt, useDeleteQuilt } from '@/hooks/useQuilts';

export default function QuiltsPage() {
  const searchParams = useSearchParams();
  const urlSearchTerm = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm);

  // Dialog states
  const [quiltDialogOpen, setQuiltDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedQuilt, setSelectedQuilt] = useState<any>(null);

  // Batch operation states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  // View mode state
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const { t } = useLanguage();

  // React Query hooks
  const { data: quiltsData, isLoading, error } = useQuilts();
  const createQuiltMutation = useCreateQuilt();
  const updateQuiltMutation = useUpdateQuilt();
  const deleteQuiltMutation = useDeleteQuilt();

  const quilts = quiltsData?.quilts || [];

  // Memoized filtered quilts
  const filteredQuilts = useMemo(() => {
    if (!searchTerm.trim()) {
      return quilts;
    }

    return quilts.filter(
      (quilt: any) =>
        quilt.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quilt.itemNumber?.toString().includes(searchTerm) ||
        quilt.fillMaterial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quilt.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quilt.season?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quilt.currentStatus?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [quilts, searchTerm]);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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

  const handleChangeStatus = (quilt: any) => {
    setSelectedQuilt(quilt);
    setStatusDialogOpen(true);
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
      await deleteQuiltMutation.mutateAsync(quilt.id);
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
      const deletePromises = Array.from(selectedIds).map(id => deleteQuiltMutation.mutateAsync(id));

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
        await updateQuiltMutation.mutateAsync({ id: selectedQuilt.id, data });
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
      // Use smart status update API
      const response = await fetch(`/api/quilts/${quiltId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStatus,
          startDate: options?.startDate,
          endDate: options?.endDate,
          notes: options?.notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const result = await response.json();

      // Invalidate queries to refresh data
      await updateQuiltMutation.mutateAsync({
        id: quiltId,
        data: { currentStatus: newStatus },
      });

      toast.success(
        result.message ||
          (lang === 'zh' ? '状态更新成功' : 'Status updated successfully')
      );
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
              {filteredQuilts.length > 0 && (
                <Button onClick={toggleSelectMode} variant="outline" size="sm">
                  {t('language') === 'zh' ? '批量操作' : 'Batch Operations'}
                </Button>
              )}
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
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          {t('language') === 'zh' ? '筛选' : 'Filter'}
        </Button>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('quilts.table.itemNumber')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('quilts.views.name')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('quilts.table.season')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('quilts.table.size')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('quilts.table.weight')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('quilts.table.material')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('quilts.table.color')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('quilts.table.location')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('quilts.table.status')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      className={`
                      transition-all duration-150 ease-in-out
                      hover:bg-blue-50 hover:shadow-sm
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
                        #{quilt.itemNumber}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{quilt.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {t(`season.${quilt.season}`)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {quilt.lengthCm}×{quilt.widthCm}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{quilt.weightGrams}g</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{quilt.fillMaterial}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{quilt.color || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{quilt.location}</td>
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
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
              >
                {/* Season Color Indicator */}
                <div
                  className={`h-2 w-full rounded-t-lg mb-3 ${
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
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{quilt.name}</h3>
                    <p className="text-sm text-gray-500">#{quilt.itemNumber}</p>
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
                    <span className="font-medium">{t(`season.${quilt.season}`)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-20">{t('quilts.table.fillMaterial')}:</span>
                    <span className="font-medium">{quilt.fillMaterial}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-20">{t('quilts.table.weight')}:</span>
                    <span className="font-medium">{quilt.weightGrams}g</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-20">{t('quilts.table.location')}:</span>
                    <span className="font-medium">{quilt.location}</span>
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
