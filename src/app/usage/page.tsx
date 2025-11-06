'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/language-provider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TableSkeleton } from '@/components/ui/skeleton-layouts';
import {
  Clock,
  Package,
  BarChart3,
  ArrowLeft,
  Eye,
  PackageOpen,
  Edit,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { EditUsageRecordDialog } from '@/components/usage/EditUsageRecordDialog';
import { TemperatureDisplay } from '@/components/usage/TemperatureDisplay';
import { useUsageRecords, useOverallUsageStats, useQuiltUsageRecords } from '@/hooks/useUsage';
import { useQuilts } from '@/hooks/useQuilts';
import { useAppSettings } from '@/hooks/useSettings';

interface QuiltUsageDetail {
  id: string;
  name: string;
  itemNumber: number;
  color: string;
  season: string;
  currentStatus: string;
}

function UsageTrackingContent() {
  const searchParams = useSearchParams();
  const quiltIdParam = searchParams.get('quiltId');

  const [selectedQuilt, setSelectedQuilt] = useState<QuiltUsageDetail | null>(null);
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { t, language } = useLanguage();

  // Use tRPC hooks
  const { data: usageData, isLoading: loading } = useUsageRecords();
  const { data: statsData } = useOverallUsageStats();
  const { data: quiltsData } = useQuilts();
  const { data: appSettings } = useAppSettings();
  const { data: quiltUsageData, isLoading: detailLoading } = useQuiltUsageRecords(
    selectedQuilt?.id || ''
  );

  // Extract data with superjson wrapper handling
  const usageHistory = (usageData as any)?.json || usageData || [];
  const stats = (statsData as any)?.json || statsData || { total: 0, active: 0, completed: 0 };
  const quilts = (quiltsData as any)?.json?.quilts || quiltsData?.quilts || [];
  const selectedQuiltUsage = (quiltUsageData as any)?.json || quiltUsageData || [];

  // Handle quiltId from URL parameter
  useEffect(() => {
    if (quiltIdParam && quilts.length > 0 && !selectedQuilt) {
      const quilt = quilts.find((q: any) => q.id === quiltIdParam);
      if (quilt) {
        // Use setTimeout to avoid setState in effect warning
        setTimeout(() => {
          setSelectedQuilt({
            id: quilt.id,
            name: quilt.name,
            itemNumber: quilt.itemNumber,
            color: quilt.color,
            season: quilt.season,
            currentStatus: quilt.currentStatus,
          });
          setView('detail');
        }, 0);
      }
    }
  }, [quiltIdParam, quilts, selectedQuilt]);

  const loadUsageHistory = () => {
    // Refetch is handled by tRPC automatically
  };

  const handleRecordClick = (record: any) => {
    // Set selected quilt info and switch to detail view
    setSelectedQuilt({
      id: record.quiltId,
      name: record.quiltName || 'Unknown',
      itemNumber: record.itemNumber || 0,
      color: record.color || '',
      season: record.season || '',
      currentStatus: record.currentStatus || '',
    });
    setView('detail');
  };

  const handleRecordDoubleClick = (record: any) => {
    const usageDoubleClickAction = (appSettings?.usageDoubleClickAction as string) || 'view';

    switch (usageDoubleClickAction) {
      case 'view':
        // View quilt details
        handleRecordClick(record);
        break;
      case 'edit':
        // Edit functionality would require opening the edit dialog programmatically
        // For now, user can click the edit button
        break;
      case 'none':
      default:
        // Do nothing
        break;
    }
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedQuilt(null);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDuration = (days: number | null | undefined) => {
    if (days === null || days === undefined) return '-';
    if (days === 0) return language === 'zh' ? '不到1天' : '<1 day';
    return language === 'zh' ? `${days}天` : `${days} days`;
  };

  // Sorting function
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
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

  // Sort usage history
  const sortedUsageHistory = [...usageHistory].sort((a: any, b: any) => {
    if (!sortField) return 0;

    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle null/undefined
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    // Special handling for dates
    if (sortField === 'startedAt' || sortField === 'endedAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    // Special handling for duration
    if (sortField === 'duration') {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    }

    // Compare
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
        </div>
        {/* Stats Skeleton */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Table Skeleton */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm p-4">
          <TableSkeleton rows={6} columns={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {view === 'detail' && (
            <Button variant="ghost" size="sm" onClick={handleBackToList}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {view === 'detail' && selectedQuilt
                ? `${selectedQuilt.name} - ${t('usage.details.title')}`
                : t('usage.title')}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {view === 'detail' && selectedQuilt
                ? `${t('quilts.table.itemNumber')} #${selectedQuilt.itemNumber}`
                : t('usage.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">{t('usage.stats.totalRecords')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
              <p className="text-xs text-gray-500">{t('usage.status.active')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Package className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
              <p className="text-xs text-gray-500">{t('usage.status.completed')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage History Table */}
      {view === 'list' ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300">
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group select-none"
                    onClick={() => handleSort('itemNumber')}
                  >
                    <div className="flex items-center">
                      {t('quilts.table.itemNumber')}
                      {renderSortIcon('itemNumber')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group select-none"
                    onClick={() => handleSort('quiltName')}
                  >
                    <div className="flex items-center">
                      {t('quilts.views.name')}
                      {renderSortIcon('quiltName')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group select-none"
                    onClick={() => handleSort('startedAt')}
                  >
                    <div className="flex items-center">
                      {t('usage.labels.started')}
                      {renderSortIcon('startedAt')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group select-none"
                    onClick={() => handleSort('endedAt')}
                  >
                    <div className="flex items-center">
                      {t('usage.labels.ended')}
                      {renderSortIcon('endedAt')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group select-none"
                    onClick={() => handleSort('duration')}
                  >
                    <div className="flex items-center">
                      {t('usage.labels.duration')}
                      {renderSortIcon('duration')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group select-none"
                    onClick={() => handleSort('isActive')}
                  >
                    <div className="flex items-center">
                      {t('quilts.table.status')}
                      {renderSortIcon('isActive')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('quilts.views.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedUsageHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4">
                      <EmptyState
                        icon={PackageOpen}
                        title={t('usage.empty.title')}
                        description={t('usage.empty.description')}
                      />
                    </td>
                  </tr>
                ) : (
                  sortedUsageHistory.map((record: any, index: number) => (
                    <tr
                      key={record.id}
                      onDoubleClick={() => handleRecordDoubleClick(record)}
                      className={`
                      transition-all duration-150 ease-in-out
                      hover:bg-blue-50 hover:shadow-sm
                      cursor-pointer
                      ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                      border-b border-gray-100 last:border-b-0
                    `}
                      title={language === 'zh' ? '双击执行操作' : 'Double-click to perform action'}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        #{record.itemNumber}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {record.quiltName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDate(record.startedAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {record.endedAt ? formatDate(record.endedAt) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDuration(record.duration)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            record.isActive
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-gray-50 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {record.isActive ? t('usage.status.active') : t('usage.status.completed')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRecordClick(record)}
                            className="h-8 px-3"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            {language === 'zh' ? '查看' : 'View'}
                          </Button>
                          <EditUsageRecordDialog
                            record={{
                              id: record.id,
                              quiltId: record.quiltId,
                              startedAt: record.startedAt,
                              endedAt: record.endedAt,
                              usageType: record.usageType,
                              notes: record.notes,
                              quiltName: record.quiltName,
                              itemNumber: record.itemNumber,
                              color: record.color,
                              isActive: record.isActive,
                            }}
                            onUpdate={loadUsageHistory}
                            onDelete={loadUsageHistory}
                            trigger={
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Quilt Detail View */
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {detailLoading ? (
            <div className="p-12 text-center text-gray-500">{t('common.loading')}</div>
          ) : selectedQuiltUsage.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>{t('usage.details.noHistory')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('usage.labels.started')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'zh' ? '开始温度' : 'Start Temp'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('usage.labels.ended')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'zh' ? '结束温度' : 'End Temp'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'zh' ? '持续时间' : 'Duration'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('usage.labels.notes')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('quilts.table.status')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedQuiltUsage.map((usage: any, index: number) => (
                    <tr
                      key={usage.id}
                      className={`
                      transition-all duration-150 ease-in-out
                      hover:bg-blue-50 hover:shadow-sm
                      ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                      border-b border-gray-100 last:border-b-0
                    `}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {selectedQuiltUsage.length - index}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDate(usage.startDate?.toString())}
                      </td>
                      <td className="px-4 py-3">
                        <TemperatureDisplay date={usage.startDate} compact />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {usage.endDate ? formatDate(usage.endDate.toString()) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {usage.endDate ? <TemperatureDisplay date={usage.endDate} compact /> : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {usage.endDate
                          ? formatDuration(
                              Math.floor(
                                (new Date(usage.endDate).getTime() -
                                  new Date(usage.startDate).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )
                            )
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{usage.notes || '-'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            !usage.endDate
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-gray-50 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {!usage.endDate
                            ? t('usage.labels.active')
                            : language === 'zh'
                              ? '已完成'
                              : 'Completed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function UsageTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <TableSkeleton rows={8} columns={6} />
        </div>
      }
    >
      <UsageTrackingContent />
    </Suspense>
  );
}
