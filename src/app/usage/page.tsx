'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UsageTracker } from '@/components/usage/UsageTracker';
import { UsageTimeline } from '@/components/usage/UsageTimeline';
import { UsageStatistics } from '@/components/usage/UsageStatistics';
import { UsageCalendar } from '@/components/usage/UsageCalendar';
import { useQuilts } from '@/hooks/useQuilts';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Search,
  Clock,
  BarChart3,
  Calendar,
  Package,
  Filter,
  TrendingUp,
  Users,
  MapPin,
} from 'lucide-react';

export default function UsageTrackingPage() {
  const [selectedQuiltId, setSelectedQuiltId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, isLoading, error } = useQuilts({
    filters: {
      search: searchQuery || undefined,
      status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
    },
    sortBy: 'name',
    sortOrder: 'asc',
    skip: 0,
    take: 100,
  });

  const quilts = Array.isArray(data) ? data : [];
  const selectedQuilt = quilts.find(q => q.id === selectedQuiltId);

  // Get usage statistics for all quilts
  const overallStats = {
    totalQuilts: quilts.length,
    quiltsInUse: quilts.filter(q => q.currentStatus === 'IN_USE').length,
    totalUsagePeriods: quilts.reduce((sum, q) => sum + (q.usagePeriods?.length || 0), 0),
    avgUsagePerQuilt:
      quilts.length > 0
        ? Math.round(
            (quilts.reduce((sum, q) => sum + (q.usagePeriods?.length || 0), 0) / quilts.length) * 10
          ) / 10
        : 0,
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-2">Failed to load quilts</p>
            <p className="text-gray-500 text-sm">{error.message}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usage Tracking</h1>
          <p className="text-gray-500">Monitor and analyze quilt usage patterns</p>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{overallStats.totalQuilts}</p>
                <p className="text-sm text-gray-600">Total Quilts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{overallStats.quiltsInUse}</p>
                <p className="text-sm text-gray-600">Currently In Use</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{overallStats.totalUsagePeriods}</p>
                <p className="text-sm text-gray-600">Total Usage Periods</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{overallStats.avgUsagePerQuilt}</p>
                <p className="text-sm text-gray-600">Avg Uses per Quilt</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quilt Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Select Quilt</span>
          </CardTitle>
          <CardDescription>
            Choose a quilt to track usage and view detailed analytics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search quilts by name, material, or location..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="IN_USE">In Use</SelectItem>
                <SelectItem value="STORAGE">Storage</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {quilts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No quilts found"
              description="No quilts match your current search criteria. Try adjusting your filters."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quilts.map(quilt => (
                <div
                  key={quilt.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedQuiltId === quilt.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedQuiltId(quilt.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">
                      #{quilt.itemNumber} {quilt.name}
                    </h3>
                    <Badge
                      variant={quilt.currentStatus === 'IN_USE' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {quilt.currentStatus === 'IN_USE' ? 'In Use' : quilt.currentStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {quilt.location}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {quilt.usagePeriods?.length || 0} uses
                    </span>
                  </div>
                  {quilt.currentUsage && (
                    <div className="mt-2 text-xs text-blue-600">
                      Started: {new Date(quilt.currentUsage.startedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Quilt Details */}
      {selectedQuilt ? (
        <Tabs defaultValue="tracker" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tracker" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Tracker</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Statistics</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Calendar</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tracker">
            <UsageTracker
              quilt={selectedQuilt}
              onUsageChange={() => {
                // Refresh data when usage changes
                window.location.reload();
              }}
            />
          </TabsContent>

          <TabsContent value="timeline">
            <UsageTimeline
              usagePeriods={selectedQuilt.usagePeriods || []}
              quiltName={selectedQuilt.name}
            />
          </TabsContent>

          <TabsContent value="statistics">
            <UsageStatistics
              usagePeriods={selectedQuilt.usagePeriods || []}
              quiltName={selectedQuilt.name}
            />
          </TabsContent>

          <TabsContent value="calendar">
            <UsageCalendar
              usagePeriods={selectedQuilt.usagePeriods || []}
              quiltName={selectedQuilt.name}
              onDateSelect={date => {
                console.log('Selected date:', date);
              }}
              onPeriodSelect={period => {
                console.log('Selected period:', period);
              }}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={Clock}
              title="Select a quilt to track usage"
              description="Choose a quilt from the list above to start tracking usage and view detailed analytics."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
