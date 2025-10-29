'use client';

import Link from 'next/link';
import { useDashboardStats } from '@/hooks/useDashboard';
import { useLanguage } from '@/lib/language-provider';
import { Loading } from '@/components/ui/loading';
import { Package, Activity, Archive, Wrench, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats();
  const { t } = useLanguage();

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t('dashboard.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('dashboard.subtitle')}</p>
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

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.actions.title')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href="/quilts"
            className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-gray-600" />
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
            <div className="text-sm font-medium text-gray-900">
              {t('dashboard.actions.viewQuilts')}
            </div>
          </Link>

          <Link
            href="/usage"
            className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-gray-600" />
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
            <div className="text-sm font-medium text-gray-900">
              {t('dashboard.actions.usageTracking')}
            </div>
          </Link>

          <Link
            href="/import"
            className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <Archive className="w-5 h-5 text-gray-600" />
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
            <div className="text-sm font-medium text-gray-900">
              {t('dashboard.actions.importData')}
            </div>
          </Link>

          <Link
            href="/export"
            className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <Wrench className="w-5 h-5 text-gray-600" />
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
            <div className="text-sm font-medium text-gray-900">
              {t('dashboard.actions.exportData')}
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
