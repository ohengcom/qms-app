'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/language-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Package } from 'lucide-react';
import { Loading } from '@/components/ui/loading';

export default function QuiltsPage() {
  const [quilts, setQuilts] = useState<any[]>([]);
  const [filteredQuilts, setFilteredQuilts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
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

    const filtered = quilts.filter(quilt => 
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
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {t('quilts.actions.add')}
          </Button>
        </div>

        {/* Search Bar */}
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

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mt-4 text-sm text-gray-600">
            {t('quilts.messages.showing')} {filteredQuilts.length} {t('quilts.messages.of')} {quilts.length} {t('quilts.messages.quilts')}
            {searchTerm && (
              <span className="ml-2">
                - {t('common.search')}: "{searchTerm}"
              </span>
            )}
          </div>
        )}
      </div>

      {/* Quilts Grid */}
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
                : '开始添加您的第一床被子来管理您的收藏'
              }
            </p>
            {!searchTerm && (
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t('quilts.actions.add')}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuilts.map((quilt) => (
            <Card key={quilt.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{quilt.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    quilt.currentStatus === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                    quilt.currentStatus === 'IN_USE' ? 'bg-blue-100 text-blue-800' :
                    quilt.currentStatus === 'STORAGE' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {t(`status.${quilt.currentStatus}`)}
                  </span>
                </CardTitle>
                <CardDescription>
                  {t('quilts.table.itemNumber')}{quilt.itemNumber}
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
                    <span>{quilt.lengthCm} x {quilt.widthCm} cm</span>
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
                  <Button variant="outline" size="sm" className="flex-1">
                    {t('common.view')}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    {t('common.edit')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
