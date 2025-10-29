'use client';

import Link from 'next/link';
import { useDashboardStats } from '@/hooks/useDashboard';
import { useWeather } from '@/hooks/useWeather';
import { useLanguage } from '@/lib/language-provider';
import { Loading } from '@/components/ui/loading';
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
      <div className="flex items-center justify-center h-96">
        <Loading />
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
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('dashboard.stats.totalQuilts')}</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">{overview.totalQuilts}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('dashboard.stats.inUse')}</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">{overview.inUseCount}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('dashboard.stats.available')}</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">{overview.availableCount}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('dashboard.stats.storage')}</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">{overview.storageCount}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <Archive className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Currently In Use Quilts - List View */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {lang === 'zh' ? '当前在用被子' : 'Currently In Use'}
            </h2>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              {inUseQuilts.length}
            </span>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {inUseQuilts.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              {lang === 'zh' ? '暂无在用被子' : 'No quilts currently in use'}
            </div>
          ) : (
            inUseQuilts.map((quilt: any) => (
              <div key={quilt.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-lg">
                      <Package className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{quilt.name}</span>
                        <span className="text-xs text-gray-500">#{quilt.itemNumber}</span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${
                            quilt.season === 'WINTER'
                              ? 'bg-blue-100 text-blue-700'
                              : quilt.season === 'SUMMER'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {t(`season.${quilt.season}`)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                        <span>
                          {lang === 'zh' ? '填充物' : 'Fill'}: {quilt.fillMaterial}
                        </span>
                        <span>
                          {lang === 'zh' ? '重量' : 'Weight'}: {quilt.weightGrams}g
                        </span>
                        <span>
                          {lang === 'zh' ? '位置' : 'Location'}: {quilt.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/quilts?search=${quilt.name}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {lang === 'zh' ? '查看详情' : 'View Details'}
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Historical Usage - Same Day in Previous Years - List View */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {lang === 'zh' ? '往年今日在用被子' : 'Historical Usage - Same Day'}
            </h2>
            <span className="text-sm text-gray-500">
              ({today.getMonth() + 1}/{today.getDate()})
            </span>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {historicalUsage.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              {lang === 'zh' ? '暂无历史使用记录' : 'No historical usage records'}
            </div>
          ) : (
            historicalUsage.map((record: any) => (
              <div key={record.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-50 rounded-lg">
                      <span className="text-sm font-semibold text-purple-700">{record.year}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{record.quiltName}</span>
                        <span className="text-xs text-gray-500">#{record.itemNumber}</span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${
                            record.season === 'WINTER'
                              ? 'bg-blue-100 text-blue-700'
                              : record.season === 'SUMMER'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {t(`season.${record.season}`)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
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
