'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuiltCard } from './QuiltCard';
import { QuiltFilters } from './QuiltFilters';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import type { QuiltFiltersInput } from '@/lib/validations/quilt';
import { useQuilts } from '@/hooks/useQuilts';
import { cn } from '@/lib/utils';
import {
  Grid3X3,
  List,
  Plus,
  SortAsc,
  SortDesc,
  Package,
  Calendar,
  Weight,
  MapPin
} from 'lucide-react';

interface QuiltListProps {
  onCreateQuilt?: () => void;
  onEditQuilt?: (quilt: any) => void;
  onViewQuilt?: (quilt: any) => void;
}

type ViewMode = 'grid' | 'list';
type SortField = 'itemNumber' | 'name' | 'season' | 'weightGrams' | 'createdAt' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

const SORT_OPTIONS = [
  { value: 'itemNumber', label: 'Item Number', icon: Package },
  { value: 'name', label: 'Name', icon: Package },
  { value: 'season', label: 'Season', icon: Calendar },
  { value: 'weightGrams', label: 'Weight', icon: Weight },
  { value: 'createdAt', label: 'Date Added', icon: Calendar },
  { value: 'updatedAt', label: 'Last Updated', icon: Calendar },
];

export function QuiltList({ onCreateQuilt, onEditQuilt, onViewQuilt }: QuiltListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('itemNumber');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filters, setFilters] = useState<QuiltFiltersInput>({});
  
  // Temporarily use direct fetch like the working test page
  const [quiltsData, setQuiltsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchQuilts = async () => {
      try {
        console.log('QuiltList: Direct fetch starting...');
        const response = await fetch('/api/quilts');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('QuiltList: Direct fetch success:', result);
        setQuiltsData(result);
      } catch (err) {
        console.error('QuiltList: Direct fetch error:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuilts();
  }, []);
  
  const quilts: any[] = quiltsData?.quilts || [];
  const totalCount = quiltsData?.total || 0;
  
  console.log('QuiltList: Final quilts array:', quilts);
  console.log('QuiltList: Final quilts length:', quilts.length);
  
  const handleSortChange = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load quilts</p>
          <p className="text-gray-500 text-sm">{error.message}</p>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quilt Collection</h1>
          <p className="text-gray-500">Manage your quilts and track their usage</p>
        </div>
        
        {onCreateQuilt && (
          <Button onClick={onCreateQuilt} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Quilt
          </Button>
        )}
      </div>
      
      {/* Filters */}
      <QuiltFilters
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={totalCount}
        filteredCount={quilts.length}
      />
      
      {/* View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 px-3"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-3"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Sort Controls */}
        <div className="flex items-center space-x-2">
          <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 mr-2" />
                      {option.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortOrder}
            className="px-3"
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Debug Info */}
      <div className="bg-yellow-100 p-4 rounded mb-4">
        <p><strong>Debug Info:</strong></p>
        <p>isLoading: {isLoading.toString()}</p>
        <p>error: {error?.message || 'null'}</p>
        <p>quiltsData: {quiltsData ? 'exists' : 'null'}</p>
        <p>quilts.length: {quilts.length}</p>
        <p>totalCount: {totalCount}</p>
        <p>First quilt ID: {quilts[0]?.id || 'none'}</p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : quilts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No quilts found"
          description={
            Object.keys(filters).some(key => filters[key as keyof QuiltFiltersInput])
              ? "No quilts match your current filters. Try adjusting your search criteria."
              : "Start building your quilt collection by adding your first quilt."
          }
          action={
            onCreateQuilt ? (
              <Button onClick={onCreateQuilt}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Quilt
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          )}
        >
          {quilts.map((quilt) => (
            <QuiltCard
              key={quilt.id}
              quilt={quilt}
              variant={viewMode === 'list' ? 'compact' : 'card'}
              onEdit={onEditQuilt}
              onView={onViewQuilt}
            />
          ))}
        </div>
      )}
    </div>
  );
}