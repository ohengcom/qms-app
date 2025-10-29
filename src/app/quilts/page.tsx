'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/language-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Package, Edit, Trash2, RotateCcw, Grid3X3, List } from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { QuiltDialog } from '@/components/quilts/QuiltDialog';
import { StatusChangeDialog } from '@/components/quilts/StatusChangeDialog';

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

  // View mode state - list is default
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');

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
      !confirm(
        `确定要删除被子 "${quilt.name}" 吗？\nAre you sure you want to delete quilt "${quilt.name}"?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/quilts/${quilt.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state
        const updatedQuilts = quilts.filter(q => q.id !== quilt.id);
        setQuilts(updatedQuilts);
        handleSearch(searchTerm); // Re-apply search filter
        // TODO: Show success toast
      } else {
        throw new Error('Failed to delete quilt');
      }
    } catch (error) {
      console.error('Error deleting quilt:', error);
      // TODO: Show error toast
    }
  };

  const handleSaveQuilt = async (data: any) => {
    try {
      if (selectedQuilt) {
        // Update existing quilt
        const response = await fetch(`/api/quilts/${selectedQuilt.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const updatedQuilt = await response.json();
          const updatedQuilts = quilts.map(q => (q.id === selectedQuilt.id ? updatedQuilt : q));
          setQuilts(updatedQuilts);
          handleSearch(searchTerm); // Re-apply search filter
          // TODO: Show success toast
        } else {
          throw new Error('Failed to update quilt');
        }
      } else {
        // Create new quilt
        const response = await fetch('/api/quilts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const newQuilt = await response.json();
          const updatedQuilts = [newQuilt, ...quilts];
          setQuilts(updatedQuilts);
          handleSearch(searchTerm); // Re-apply search filter
          // TODO: Show success toast
        } else {
          throw new Error('Failed to create quilt');
        }
      }
    } catch (error) {
      console.error('Error saving quilt:', error);
      throw error; // Re-throw to be handled by the dialog
    }
  };

  const handleStatusChange = async (quiltId: string, newStatus: string) => {
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
        handleSearch(searchTerm); // Re-apply search filter
        // TODO: Show success toast
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      throw error; // Re-throw to be handled by the dialog
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <Loading text={t('common.loading')} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800">{t('common.error')}</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('quilts.title')}</h1>
            <p className="text-gray-600">{t('quilts.subtitle')}</p>
          </div>
          <Button onClick={handleAddQuilt}>
            <Plus className="w-4 h-4 mr-2" />
            {t('quilts.actions.add')}
          </Button>
        </div>

        {/* Search Bar and View Toggle */}
        <div className="flex items-center justify-between">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="search"
              placeholder={t('quilts.actions.search')}
              value={searchTerm}
              onChange={onSearchChange}
              className="pl-10"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('card')}
              className="h-8 px-3"
            >
              <Grid3X3 className="w-4 h-4 mr-1" />
              {t('quilts.views.card')}
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-3"
            >
              <List className="w-4 h-4 mr-1" />
              {t('quilts.views.list')}
            </Button>
          </div>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mt-4 text-sm text-gray-600">
            {t('quilts.messages.showing')} {filteredQuilts.length} {t('quilts.messages.of')}{' '}
            {quilts.length} {t('quilts.messages.quilts')}
            {searchTerm && (
              <span className="ml-2">
                - {t('common.search')}: &ldquo;{searchTerm}&rdquo;
              </span>
            )}
          </div>
        )}
      </div>

      {/* Quilts Display */}
      {filteredQuilts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? t('quilts.messages.noQuiltsFound') : t('quilts.actions.addFirst')}
            </h3>
            <p className="text-gray-600 text-center mb-4">
              {searchTerm
                ? `没有找到包含 "${searchTerm}" 的被子`
                : '开始添加您的第一床被子来管理您的收藏'}
            </p>
            {!searchTerm && (
              <Button onClick={handleAddQuilt}>
                <Plus className="w-4 h-4 mr-2" />
                {t('quilts.actions.add')}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'card' ? (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuilts.map(quilt => (
            <Card key={quilt.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{quilt.name}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      quilt.currentStatus === 'AVAILABLE'
                        ? 'bg-green-100 text-green-800'
                        : quilt.currentStatus === 'IN_USE'
                          ? 'bg-blue-100 text-blue-800'
                          : quilt.currentStatus === 'STORAGE'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {t(`status.${quilt.currentStatus}`)}
                  </span>
                </CardTitle>
                <CardDescription>
                  {t('quilts.table.itemNumber')}
                  {quilt.itemNumber}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('quilts.table.season')}:</span>
                    <span>{t(`season.${quilt.season}`)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('quilts.table.size')}:</span>
                    <span>
                      {quilt.lengthCm} x {quilt.widthCm} cm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('quilts.table.weight')}:</span>
                    <span>{quilt.weightGrams}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('quilts.table.material')}:</span>
                    <span>{quilt.fillMaterial}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('quilts.table.location')}:</span>
                    <span>{quilt.location}</span>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleChangeStatus(quilt)}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    {t('quilts.table.status')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditQuilt(quilt)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    {t('common.edit')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteQuilt(quilt)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <Card>
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b font-medium text-sm text-gray-700">
              <div className="col-span-2">{t('quilts.table.itemNumber')}</div>
              <div className="col-span-2">{t('quilts.views.name')}</div>
              <div className="col-span-1">{t('quilts.table.season')}</div>
              <div className="col-span-1">{t('quilts.table.size')}</div>
              <div className="col-span-1">{t('quilts.table.weight')}</div>
              <div className="col-span-2">{t('quilts.table.material')}</div>
              <div className="col-span-1">{t('quilts.table.status')}</div>
              <div className="col-span-2">{t('quilts.views.actions')}</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y">
              {filteredQuilts.map(quilt => (
                <div
                  key={quilt.id}
                  className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="col-span-2 font-medium">#{quilt.itemNumber}</div>
                  <div className="col-span-2">
                    <div className="font-medium">{quilt.name}</div>
                    <div className="text-sm text-gray-500">{quilt.location}</div>
                  </div>
                  <div className="col-span-1 text-sm">{t(`season.${quilt.season}`)}</div>
                  <div className="col-span-1 text-sm">
                    {quilt.lengthCm}×{quilt.widthCm}
                  </div>
                  <div className="col-span-1 text-sm">{quilt.weightGrams}g</div>
                  <div className="col-span-2 text-sm">
                    <div>{quilt.fillMaterial}</div>
                    <div className="text-gray-500">{quilt.color}</div>
                  </div>
                  <div className="col-span-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        quilt.currentStatus === 'AVAILABLE'
                          ? 'bg-green-100 text-green-800'
                          : quilt.currentStatus === 'IN_USE'
                            ? 'bg-blue-100 text-blue-800'
                            : quilt.currentStatus === 'STORAGE'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {t(`status.${quilt.currentStatus}`)}
                    </span>
                  </div>
                  <div className="col-span-2 flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleChangeStatus(quilt)}
                      title={t('language') === 'zh' ? '更改状态' : 'Change Status'}
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditQuilt(quilt)}
                      title={t('common.edit')}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteQuilt(quilt)}
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
