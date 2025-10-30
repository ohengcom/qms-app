'use client';

import Link from 'next/link';
import { useDashboardStats } from '@/hooks/useDashboard';
import { useWeather } from '@/hooks/useWeather';
import { useLanguage } from '@/lib/language-provider';
import { DashboardStatsSkeleton, CardSkeleton } from '@/components/ui/skeleton-layouts';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Activity, Archive, Calendar, Cloud, History } from 'lucide-react';

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats();
  const { data: weather, isLoading: weatherLoading } = useWeather();
  const { t } = useLanguage();

  // Format date
  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
  const dateStrEn = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        {/* Stats Cards Skeleton */}
        <DashboardStatsSkeleton cards={4} />
        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton className="h-80" />
          <CardSkeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            {t('common.error')}: {error.message}
          </p>
        </div>
      </div>
    );
  }

  const overview = stats?.overview || {
    totalQuilts: 0,
    inUseCount: 0,
    availableCount: 0,
    storageCount: 0,
    maintenanceCount: 0,
  };

  const inUseQuilts = stats?.inUseQuilts || [];
  const historicalUsage = stats?.historicalUsage || [];
  const lang = t('language') === 'zh' ? 'zh' : 'en';

  return (
    <div className="space-y-6">
      {/* Header with Date and Weather */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t('dashboard.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{lang === 'zh' ? dateStr : dateStrEn}</span>
          </div>
          {/* Weather */}
          {!weatherLoading && weather && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
              <Cloud className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {lang === 'zh' ? weather.location.city : weather.location.cityEn}
              </span>
              <span className="text-lg">{weather.current.weather.icon}</span>
              {weather.current.temperature !== null && (
                <span className="text-sm font-semibold text-blue-900">
                  {weather.current.temperature}°C
                </span>
              )}
              <span className="text-xs text-blue-700">
                {lang === 'zh' ? weather.current.weather.zh : weather.current.weather.en}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Quilts Card */}
        <div className="card-elevated bg-white rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('dashboard.stats.totalQuilts')}
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">{overview.totalQuilts}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        {/* In Use Card */}
        <div className="card-elevated bg-white rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('dashboard.stats.inUse')}
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">{overview.inUseCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        {/* Available Card */}
        <div className="card-elevated bg-white rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('dashboard.stats.available')}
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">{overview.availableCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
              <Package className="w-6 h-6 text-accent-foreground" />
            </div>
          </div>
        </div>

        {/* Storage Card */}
        <div className="card-elevated bg-white rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('dashboard.stats.storage')}
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">{overview.storageCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Archive className="w-6 h-6 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Currently In Use Quilts - List View */}
      <div className="card-elevated bg-white rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-success" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">{t('pages.currentlyInUse')}</h2>
            <span className="px-2 py-0.5 bg-success/10 text-success text-xs font-medium rounded-full">
              {inUseQuilts.length}
            </span>
          </div>
        </div>
        <div className="divide-y divide-border">
          {inUseQuilts.length === 0 ? (
            <div className="px-6 py-8 text-center text-muted-foreground">
              {t('pages.noQuiltsInUse')}
            </div>
          ) : (
            inUseQuilts.map((quilt: any) => (
              <div key={quilt.id} className="px-6 py-4 table-row-hover">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 bg-success/10 rounded-lg">
                      <Package className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{quilt.name}</span>
                        <span className="text-xs text-muted-foreground">#{quilt.itemNumber}</span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${
                            quilt.season === 'WINTER'
                              ? 'bg-info/10 text-info'
                              : quilt.season === 'SUMMER'
                                ? 'bg-warning/10 text-warning'
                                : 'bg-success/10 text-success'
                          }`}
                        >
                          {t(`season.${quilt.season}`)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>
                          {t('pages.fillMaterial')}: {quilt.fillMaterial}
                        </span>
                        <span>
                          {t('pages.weight')}: {quilt.weightGrams}g
                        </span>
                        <span>
                          {t('pages.location')}: {quilt.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/quilts?search=${quilt.name}`}
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    {t('pages.viewDetails')}
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Historical Usage - Same Day in Previous Years - List View */}
      <div className="card-elevated bg-white rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <History className="w-4 h-4 text-accent-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">{t('pages.historicalUsage')}</h2>
            <span className="text-sm text-muted-foreground">
              ({today.getMonth() + 1}/{today.getDate()})
            </span>
          </div>
        </div>
        <div className="divide-y divide-border">
          {historicalUsage.length === 0 ? (
            <div className="px-6 py-8 text-center text-muted-foreground">
              {t('pages.noHistoricalRecords')}
            </div>
          ) : (
            historicalUsage.map((record: any) => (
              <div key={record.id} className="px-6 py-4 table-row-hover">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 bg-accent rounded-lg">
                      <span className="text-sm font-semibold text-accent-foreground">
                        {record.year}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{record.quiltName}</span>
                        <span className="text-xs text-muted-foreground">#{record.itemNumber}</span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${
                            record.season === 'WINTER'
                              ? 'bg-info/10 text-info'
                              : record.season === 'SUMMER'
                                ? 'bg-warning/10 text-warning'
                                : 'bg-success/10 text-success'
                          }`}
                        >
                          {t(`season.${record.season}`)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(record.startDate).toLocaleDateString(
                          lang === 'zh' ? 'zh-CN' : 'en-US',
                          { year: 'numeric', month: 'long', day: 'numeric' }
                        )}
                        {record.endDate && (
                          <>
                            {' → '}
                            {new Date(record.endDate).toLocaleDateString(
                              lang === 'zh' ? 'zh-CN' : 'en-US',
                              { year: 'numeric', month: 'long', day: 'numeric' }
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
