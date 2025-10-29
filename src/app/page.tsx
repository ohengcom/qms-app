'use client';

import Link from 'next/link';
import { useDashboardStats } from '@/hooks/useDashboard';
import { useLanguage } from '@/lib/language-provider';
import { Loading } from '@/components/ui/loading';

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-blue-800">{t('common.loading')}</p>
        </div>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            {t('common.error')}: {error.message}
          </p>
          <pre className="mt-2 text-xs text-red-600">{JSON.stringify(error, null, 2)}</pre>
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

  return (
    <div className="p-8">
      {/* Modern Header with gradient */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          {t('dashboard.title')}
        </h1>
        <p className="text-gray-600 text-lg">{t('dashboard.subtitle')}</p>
      </div>

      {/* Modern Stats Cards with hover effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-white p-6 rounded-xl shadow-md hover-lift border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600">
                {t('dashboard.stats.totalQuilts')}
              </h3>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">📦</span>
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1 animate-count">
              {overview.totalQuilts}
            </p>
            <p className="text-sm text-gray-500">{t('quilts.messages.quilts')}</p>
          </div>
        </div>

        <div className="group bg-white p-6 rounded-xl shadow-md hover-lift border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600">{t('dashboard.stats.inUse')}</h3>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">✓</span>
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1 animate-count">
              {overview.inUseCount}
            </p>
            <p className="text-sm text-gray-500">{t('status.IN_USE')}</p>
          </div>
        </div>

        <div className="group bg-white p-6 rounded-xl shadow-md hover-lift border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600">
                {t('dashboard.stats.available')}
              </h3>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">★</span>
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1 animate-count">
              {overview.availableCount}
            </p>
            <p className="text-sm text-gray-500">{t('status.AVAILABLE')}</p>
          </div>
        </div>

        <div className="group bg-white p-6 rounded-xl shadow-md hover-lift border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600">{t('dashboard.stats.storage')}</h3>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">📁</span>
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1 animate-count">
              {overview.storageCount}
            </p>
            <p className="text-sm text-gray-500">{t('status.STORAGE')}</p>
          </div>
        </div>
      </div>

      {/* Modern Quick Actions */}
      <div className="mt-8 bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('dashboard.actions.title')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/quilts"
            className="group relative p-6 border-2 border-gray-200 rounded-xl hover:border-indigo-500 text-center transition-all hover-lift bg-gradient-to-br from-white to-gray-50/50"
          >
            <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <span className="text-2xl">📦</span>
            </div>
            <div className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
              {t('dashboard.actions.viewQuilts')}
            </div>
          </Link>
          <Link
            href="/usage"
            className="group relative p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 text-center transition-all hover-lift bg-gradient-to-br from-white to-gray-50/50"
          >
            <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <span className="text-2xl">⏰</span>
            </div>
            <div className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
              {t('dashboard.actions.usageTracking')}
            </div>
          </Link>
          <Link
            href="/import"
            className="group relative p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 text-center transition-all hover-lift bg-gradient-to-br from-white to-gray-50/50"
          >
            <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <span className="text-2xl">📥</span>
            </div>
            <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {t('dashboard.actions.importData')}
            </div>
          </Link>
          <Link
            href="/export"
            className="group relative p-6 border-2 border-gray-200 rounded-xl hover:border-orange-500 text-center transition-all hover-lift bg-gradient-to-br from-white to-gray-50/50"
          >
            <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <span className="text-2xl">📤</span>
            </div>
            <div className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
              {t('dashboard.actions.exportData')}
            </div>
          </Link>
        </div>
      </div>

      {/* Modern Success Banner */}
      <div className="mt-8 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-md">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">✓</span>
          </div>
          <div className="ml-4">
            <p className="text-green-900 font-semibold">{t('dashboard.success.title')}</p>
            <p className="text-green-700 text-sm">{t('dashboard.success.message')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
