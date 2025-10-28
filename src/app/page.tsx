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
          <p className="text-red-800">{t('common.error')}: {error.message}</p>
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
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('dashboard.title')}</h1>
      <p className="text-gray-600 mb-8">{t('dashboard.subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.stats.totalQuilts')}</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{overview.totalQuilts}</p>
          <p className="text-sm text-gray-500 mt-1">{t('quilts.messages.quilts')}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.stats.inUse')}</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{overview.inUseCount}</p>
          <p className="text-sm text-gray-500 mt-1">{t('status.IN_USE')}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.stats.available')}</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">{overview.availableCount}</p>
          <p className="text-sm text-gray-500 mt-1">{t('status.AVAILABLE')}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.stats.storage')}</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">{overview.storageCount}</p>
          <p className="text-sm text-gray-500 mt-1">{t('status.STORAGE')}</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('dashboard.actions.title')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/quilts" className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center transition-colors">
            <div className="text-2xl mb-2">📦</div>
            <div className="text-sm font-medium">{t('dashboard.actions.viewQuilts')}</div>
          </Link>
          <Link href="/usage" className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center transition-colors">
            <div className="text-2xl mb-2">⏰</div>
            <div className="text-sm font-medium">{t('dashboard.actions.usageTracking')}</div>
          </Link>
          <Link href="/import" className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center transition-colors">
            <div className="text-2xl mb-2">📥</div>
            <div className="text-sm font-medium">{t('dashboard.actions.importData')}</div>
          </Link>
          <Link href="/export" className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center transition-colors">
            <div className="text-2xl mb-2">📤</div>
            <div className="text-sm font-medium">{t('dashboard.actions.exportData')}</div>
          </Link>
        </div>
      </div>

      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800">
          ✅ <strong>{t('dashboard.success.title')}</strong> {t('dashboard.success.message')}
        </p>
      </div>


    </div>
  );
}
