'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/language-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash2, RotateCcw, Filter } from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { QuiltDialog } from '@/components/quilts/QuiltDialog';
import { StatusChangeDialog } from '@/components/quilts/StatusChangeDialog';
import { toast, getToastMessage } from '@/lib/toast';

export default function QuiltsPage() {
  const [quilts, setQuilts] = useState<any[]>([]);
  const [filteredQuilts, setFilteredQuilts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog states
  const [quiltDialogOpen, setQuiltDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedQuilt, setSelectedQuilt] = useState<any>(null);

  // Batch operation states - TODO: Implement batch operations UI
  // const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // const [isSelectMode, setIsSelectMode] = useState(false);

  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const urlSearchTerm = searchParams.get('search') || '';

  // Load quilts data
  useEffect(() => {
    fetch('/api/quilts')
      .then(res => res.json())
      .then(data => {
        const quiltsData = data.quilts || [];
        setQuilts(quiltsData);
        setFilteredQuilts(quiltsData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Handle URL search parameter
  useEffect(() => {
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
      handleSearch(urlSearchTerm);
    }
  }, [urlSearchTerm, quilts]);

  // Search functionality
  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setFilteredQuilts(quilts);
      return;
    }

    const filtered = quilts.filter(
      quilt =>
        quilt.name?.toLowerCase().includes(term.toLowerCase()) ||
        quilt.itemNumber?.toString().includes(term) ||
        quilt.fillMaterial?.toLowerCase().includes(term.toLowerCase()) ||
        quilt.location?.toLowerCase().includes(term.toLowerCase()) ||
        quilt.season?.toLowerCase().includes(term.toLowerCase()) ||
        quilt.currentStatus?.toLowerCase().includes(term.toLowerCase())
    );

    setFilteredQuilts(filtered);
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value);
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
      const response = await fetch(`/api/quilts/${quilt.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedQuilts = quilts.filter(q => q.id !== quilt.id);
        setQuilts(updatedQuilts);
        handleSearch(searchTerm);
        toast.dismiss(toastId);
        toast.success(getToastMessage('deleteSuccess', lang));
      } else {
        throw new Error('Failed to delete quilt');
      }
    } catch (error) {
      console.error('Error deleting quilt:', error);
      toast.dismiss(toastId);
      toast.error(getToastMessage('deleteError', lang));
    }
  };

  // Batch operations - TODO: Implement UI for these functions
  // const toggleSelectMode = () => {
  //   setIsSelectMode(!isSelectMode);
  //   setSelectedIds(new Set());
  // };

  // const toggleSelectQuilt = (id: string) => {
  //   const newSelected = new Set(selectedIds);
  //   if (newSelected.has(id)) {
  //     newSelected.delete(id);
  //   } else {
  //     newSelected.add(id);
  //   }
  //   setSelectedIds(newSelected);
  // };

  // const selectAll = () => {
  //   if (selectedIds.size === filteredQuilts.length) {
  //     setSelectedIds(new Set());
  //   } else {
  //     setSelectedIds(new Set(filteredQuilts.map(q => q.id)));
  //   }
  // };

  // const handleBatchDelete = async () => {
  //   if (selectedIds.size === 0) {
  //     const lang = t('language') === 'zh' ? 'zh' : 'en';
  //     toast.warning(getToastMessage('selectItems', lang));
  //     return;
  //   }

  //   if (
  //     !window.confirm(
  //       `确定要删除选中的 ${selectedIds.size} 个被子吗？\nAre you sure you want to delete ${selectedIds.size} selected quilts?`
  //     )
  //   ) {
  //     return;
  //   }

  //   const lang = t('language') === 'zh' ? 'zh' : 'en';
  //   const toastId = toast.loading(
  //     lang === 'zh' ? `正在删除 ${selectedIds.size} 个被子...` : `Deleting ${selectedIds.size} quilts...`
  //   );

  //   try {
  //     const deletePromises = Array.from(selectedIds).map(id =>
  //       fetch(`/api/quilts/${id}`, { method: 'DELETE' })
  //     );

  //     const results = await Promise.all(deletePromises);
  //     const successCount = results.filter(r => r.ok).length;

  //     const updatedQuilts = quilts.filter(q => !selectedIds.has(q.id));
  //     setQuilts(updatedQuilts);
  //     handleSearch(searchTerm);
  //     setSelectedIds(new Set());
  //     setIsSelectMode(false);

  //     toast.dismiss(toastId);
  //     toast.success(
  //       lang === 'zh' ? `成功删除 ${successCount} 个被子` : `Successfully deleted ${successCount} quilts`
  //     );
  //   } catch (error) {
  //     console.error('Error batch deleting quilts:', error);
  //     toast.dismiss(toastId);
  //     toast.error(getToastMessage('deleteError', lang));
  //   }
  // };

  const handleSaveQuilt = async (data: any) => {
    const lang = t('language') === 'zh' ? 'zh' : 'en';
    const isUpdate = !!selectedQuilt;

    try {
      if (isUpdate) {
        const response = await fetch(`/api/quilts/${selectedQuilt.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const updatedQuilt = await response.json();
          const updatedQuilts = quilts.map(q => (q.id === selectedQuilt.id ? updatedQuilt : q));
          setQuilts(updatedQuilts);
          handleSearch(searchTerm);
          toast.success(getToastMessage('updateSuccess', lang));
        } else {
          throw new Error('Failed to update quilt');
        }
      } else {
        const response = await fetch('/api/quilts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const newQuilt = await response.json();
          const updatedQuilts = [newQuilt, ...quilts];
          setQuilts(updatedQuilts);
          handleSearch(searchTerm);
          toast.success(getToastMessage('createSuccess', lang));
        } else {
          throw new Error('Failed to create quilt');
        }
      }
    } catch (error) {
      console.error('Error saving quilt:', error);
      toast.error(getToastMessage(isUpdate ? 'updateError' : 'createError', lang));
      throw error;
    }
  };

  const handleStatusChange = async (quiltId: string, newStatus: string) => {
    const lang = t('language') === 'zh' ? 'zh' : 'en';

    try {
      const response = await fetch(`/api/quilts/${quiltId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedQuilt = await response.json();
        const updatedQuilts = quilts.map(q => (q.id === quiltId ? updatedQuilt : q));
        setQuilts(updatedQuilts);
        handleSearch(searchTerm);
        toast.success(getToastMessage('updateSuccess', lang));
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(getToastMessage('updateError', lang));
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading text={t('common.loading')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800">{t('common.error')}</h2>
          <p className="text-red-600">{error}</p>
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
            {filteredQuilts.length} {t('quilts.messages.of')} {quilts.length}{' '}
            {t('quilts.messages.quilts')}
          </p>
        </div>
        <Button onClick={handleAddQuilt} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          {t('quilts.actions.add')}
        </Button>
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

      {/* Professional Data Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
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
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    {searchTerm
                      ? `${t('language') === 'zh' ? '没有找到匹配的被子' : 'No quilts found matching'} "${searchTerm}"`
                      : t('language') === 'zh'
                        ? '暂无被子数据'
                        : 'No quilts yet'}
                  </td>
                </tr>
              ) : (
                filteredQuilts.map(quilt => (
                  <tr key={quilt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      #{quilt.itemNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{quilt.name}</div>
                      <div className="text-xs text-gray-500">{quilt.brand || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {t(`season.${quilt.season}`)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {quilt.lengthCm}×{quilt.widthCm}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{quilt.weightGrams}g</td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{quilt.fillMaterial}</div>
                      <div className="text-xs text-gray-500">{quilt.color}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{quilt.location}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          quilt.currentStatus === 'AVAILABLE'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : quilt.currentStatus === 'IN_USE'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : quilt.currentStatus === 'STORAGE'
                                ? 'bg-gray-50 text-gray-700 border border-gray-200'
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
