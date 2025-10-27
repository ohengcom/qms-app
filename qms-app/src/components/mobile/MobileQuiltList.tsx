'use client';

import { useState } from 'react';
import { MobileLayout, MobileSection } from '@/components/layout/MobileLayout';
import { TouchButton, SwipeableCard, PullToRefresh } from '@/components/ui/touch-friendly';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useDebouncedSearch } from '@/hooks/useDebounce';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Plus,
  Package,
  MapPin,
  Ruler,
  Weight,
  Eye,
  Edit,
  Play,
  Square,
  Snowflake,
  Sun,
  Leaf
} from 'lucide-react';

// Mock data for demonstration
const mockQuilts = [
  {
    id: '1',
    itemNumber: 1,
    name: 'LOVO Winter Quilt #1',
    season: 'WINTER',
    color: '纯白',
    location: '壁柜右下层',
    currentStatus: 'AVAILABLE',
    lengthCm: 240,
    widthCm: 220,
    weightGrams: 3750,
    brand: 'LOVO',
    fillMaterial: '50%棉+50%聚酯纤维',
  },
  {
    id: '2',
    itemNumber: 2,
    name: 'LOVO Winter Quilt #2',
    season: 'WINTER',
    color: '纯白',
    location: '壁柜右下层',
    currentStatus: 'AVAILABLE',
    lengthCm: 230,
    widthCm: 200,
    weightGrams: 3450,
    brand: 'LOVO',
    fillMaterial: '纯棉',
  },
  // Add more mock data as needed
];

export function MobileQuiltList() {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const { searchValue, debouncedSearchValue, setSearchValue } = useDebouncedSearch();

  const handleRefresh = async () => {
    // Refresh quilt data
    console.log('Refreshing quilt data...');
  };

  const handleAddQuilt = () => {
    router.push('/quilts?action=add');
  };

  const handleViewQuilt = (quilt: any) => {
    router.push(`/quilts/${quilt.id}` as any);
  };

  const handleEditQuilt = (quilt: any) => {
    router.push(`/quilts/${quilt.id}/edit` as any);
  };

  const handleStartUsage = (quilt: any) => {
    console.log('Start usage for quilt:', quilt.id);
  };

  const handleEndUsage = (quilt: any) => {
    console.log('End usage for quilt:', quilt.id);
  };

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'WINTER':
        return <Snowflake className="h-4 w-4 text-blue-600" />;
      case 'SPRING_AUTUMN':
        return <Leaf className="h-4 w-4 text-green-600" />;
      case 'SUMMER':
        return <Sun className="h-4 w-4 text-orange-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'IN_USE':
        return 'bg-blue-100 text-blue-800';
      case 'STORAGE':
        return 'bg-gray-100 text-gray-800';
      case 'MAINTENANCE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter quilts based on search and filters
  const filteredQuilts = mockQuilts.filter(quilt => {
    const matchesSearch = !debouncedSearchValue || 
      quilt.name.toLowerCase().includes(debouncedSearchValue.toLowerCase()) ||
      quilt.brand?.toLowerCase().includes(debouncedSearchValue.toLowerCase()) ||
      quilt.location.toLowerCase().includes(debouncedSearchValue.toLowerCase());
    
    const matchesSeason = !selectedSeason || quilt.season === selectedSeason;
    const matchesStatus = !selectedStatus || quilt.currentStatus === selectedStatus;
    
    return matchesSearch && matchesSeason && matchesStatus;
  });

  return (
    <MobileLayout 
      title="Quilts" 
      subtitle={`${filteredQuilts.length} quilts`}
      showFAB={true}
      fabAction={handleAddQuilt}
      fabIcon={<Plus className="h-6 w-6" />}
    >
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="px-4 pt-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search quilts..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            
            <div className="flex space-x-2">
              <TouchButton
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex-shrink-0"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </TouchButton>
              
              {(selectedSeason || selectedStatus) && (
                <TouchButton
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedSeason('');
                    setSelectedStatus('');
                  }}
                  className="text-xs"
                >
                  Clear
                </TouchButton>
              )}
            </div>

            {/* Filter Options */}
            {showFilters && (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Season</label>
                    <div className="flex space-x-2">
                      {['WINTER', 'SPRING_AUTUMN', 'SUMMER'].map((season) => (
                        <TouchButton
                          key={season}
                          variant={selectedSeason === season ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedSeason(selectedSeason === season ? '' : season)}
                          className="flex-1 text-xs"
                        >
                          {season === 'WINTER' ? 'Winter' : 
                           season === 'SPRING_AUTUMN' ? 'Spring/Autumn' : 'Summer'}
                        </TouchButton>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['AVAILABLE', 'IN_USE', 'STORAGE', 'MAINTENANCE'].map((status) => (
                        <TouchButton
                          key={status}
                          variant={selectedStatus === status ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedStatus(selectedStatus === status ? '' : status)}
                          className="text-xs"
                        >
                          {status.replace('_', ' ').toLowerCase()}
                        </TouchButton>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quilt List */}
          <MobileSection>
            <div className="space-y-3 px-4">
              {filteredQuilts.map((quilt) => (
                <SwipeableCard
                  key={quilt.id}
                  onSwipeLeft={() => handleEditQuilt(quilt)}
                  onSwipeRight={() => handleViewQuilt(quilt)}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            {getSeasonIcon(quilt.season)}
                            <h3 className="font-medium text-gray-900 truncate">
                              {quilt.name}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              #{quilt.itemNumber}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{quilt.location}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <Ruler className="h-3 w-3" />
                                <span>{quilt.lengthCm}×{quilt.widthCm}cm</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Weight className="h-3 w-3" />
                                <span>{quilt.weightGrams}g</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            <Badge className={getStatusColor(quilt.currentStatus)}>
                              {quilt.currentStatus.replace('_', ' ').toLowerCase()}
                            </Badge>
                            <span className="text-xs text-gray-500">{quilt.brand}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-4">
                          <TouchButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewQuilt(quilt)}
                            className="h-10 w-10 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </TouchButton>
                          
                          {quilt.currentStatus === 'AVAILABLE' ? (
                            <TouchButton
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartUsage(quilt)}
                              className="h-10 w-10 p-0"
                            >
                              <Play className="h-4 w-4" />
                            </TouchButton>
                          ) : quilt.currentStatus === 'IN_USE' ? (
                            <TouchButton
                              variant="outline"
                              size="sm"
                              onClick={() => handleEndUsage(quilt)}
                              className="h-10 w-10 p-0"
                            >
                              <Square className="h-4 w-4" />
                            </TouchButton>
                          ) : (
                            <TouchButton
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditQuilt(quilt)}
                              className="h-10 w-10 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </TouchButton>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </SwipeableCard>
              ))}
              
              {filteredQuilts.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No quilts found</h3>
                    <p className="text-gray-600 mb-4">
                      {debouncedSearchValue 
                        ? 'Try adjusting your search or filters'
                        : 'Add your first quilt to get started'
                      }
                    </p>
                    <TouchButton onClick={handleAddQuilt}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Quilt
                    </TouchButton>
                  </CardContent>
                </Card>
              )}
            </div>
          </MobileSection>
          
          {/* Swipe Instructions */}
          {filteredQuilts.length > 0 && (
            <div className="px-4 pb-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <p className="text-xs text-blue-800 text-center">
                    💡 Swipe left to edit, swipe right to view details
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </PullToRefresh>
    </MobileLayout>
  );
}