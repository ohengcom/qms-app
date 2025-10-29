'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-provider';
import { Button } from '@/components/ui/button';
import { Clock, Package, BarChart3, ArrowLeft, Eye } from 'lucide-react';

interface UsageRecord {
  id: string;
  quiltId: string;
  quiltName: string;
  itemNumber: number;
  color: string;
  season: string;
  currentStatus: string;
  startedAt: string;
  endedAt: string | null;
  usageType: string;
  notes: string | null;
  isActive: boolean;
  duration: number | null;
}

interface QuiltUsageDetail {
  id: string;
  name: string;
  itemNumber: number;
  color: string;
  season: string;
  currentStatus: string;
}

export default function UsageTrackingPage() {
  const [usageHistory, setUsageHistory] = useState<UsageRecord[]>([]);
  const [selectedQuiltUsage, setSelectedQuiltUsage] = useState<UsageRecord[]>([]);
  const [selectedQuilt, setSelectedQuilt] = useState<QuiltUsageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });
  const [view, setView] = useState<'list' | 'detail'>('list');
  const { t } = useLanguage();

  useEffect(() => {
    loadUsageHistory();
  }, []);

  const loadUsageHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/usage');
      const data = await response.json();

      if (data.success) {
        setUsageHistory(data.usage || []);
        setStats(data.stats || { total: 0, active: 0, completed: 0 });
      } else {
        console.error('Failed to load usage history:', data.error);
      }
    } catch (error) {
      console.error('Error loading usage history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuiltUsageHistory = async (quiltId: string) => {
    try {
      setDetailLoading(true);
      const response = await fetch(`/api/usage/${quiltId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedQuiltUsage(data.usage || []);
        setSelectedQuilt(data.quilt);
        setView('detail');
      } else {
        console.error('Failed to load quilt usage history:', data.error);
      }
    } catch (error) {
      console.error('Error loading quilt usage history:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRecordClick = (record: UsageRecord) => {
    loadQuiltUsageHistory(record.quiltId);
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedQuilt(null);
    setSelectedQuiltUsage([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(t('language') === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (days: number | null) => {
    if (days === null) return '-';
    if (days === 0) return t('language') === 'zh' ? '不到1天' : '<1 day';
    return t('language') === 'zh' ? `${days}天` : `${days}d`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-gray-500">{t('common.loading')}</div>
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
              <p className="text-xs text-gray-500">
                {t('language') === 'zh' ? '总记录' : 'Total Records'}
              </p>
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
              <p className="text-xs text-gray-500">
                {t('language') === 'zh' ? '使用中' : 'Active'}
              </p>
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
              <p className="text-xs text-gray-500">
                {t('language') === 'zh' ? '已完成' : 'Completed'}
              </p>
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
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('quilts.table.itemNumber')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('quilts.views.name')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('quilts.table.season')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('usage.labels.started')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('usage.labels.ended')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('language') === 'zh' ? '持续时间' : 'Duration'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('quilts.table.status')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('quilts.views.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usageHistory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>{t('language') === 'zh' ? '暂无使用记录' : 'No usage records'}</p>
                    </td>
                  </tr>
                ) : (
                  usageHistory.map(record => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        #{record.itemNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{record.quiltName}</div>
                        <div className="text-xs text-gray-500">{record.color}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {t(`season.${record.season}`)}
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
                          {record.isActive
                            ? t('language') === 'zh'
                              ? '使用中'
                              : 'Active'
                            : t('language') === 'zh'
                              ? '已完成'
                              : 'Completed'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRecordClick(record)}
                          className="h-8 px-3"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          {t('language') === 'zh' ? '查看' : 'View'}
                        </Button>
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
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('usage.labels.started')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('usage.labels.ended')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('language') === 'zh' ? '持续时间' : 'Duration'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('language') === 'zh' ? '类型' : 'Type'}
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
                  {selectedQuiltUsage.map((usage, index) => (
                    <tr key={usage.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {selectedQuiltUsage.length - index}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDate(usage.startedAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {usage.endedAt ? formatDate(usage.endedAt) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDuration(usage.duration)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{usage.usageType}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{usage.notes || '-'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            usage.isActive
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-gray-50 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {usage.isActive
                            ? t('usage.labels.active')
                            : t('language') === 'zh'
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
