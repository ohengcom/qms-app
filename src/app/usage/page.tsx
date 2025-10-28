'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Package, BarChart3, ArrowLeft, Calendar, User } from 'lucide-react';

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

  // Load all usage history
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

  // Load usage history for a specific quilt
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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (days: number | null) => {
    if (days === null) return '-';
    if (days === 0) return t('language') === 'zh' ? '不到1天' : 'Less than 1 day';
    return t('language') === 'zh' ? `${days}天` : `${days} day${days !== 1 ? 's' : ''}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_USE': return 'bg-blue-100 text-blue-800';
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'STORAGE': return 'bg-gray-100 text-gray-800';
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            {view === 'detail' && (
              <Button variant="ghost" size="sm" onClick={handleBackToList}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.back')}
              </Button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {view === 'detail' && selectedQuilt 
                ? `${selectedQuilt.name} - ${t('usage.details.title')}`
                : t('usage.title')
              }
            </h1>
          </div>
          <p className="text-gray-500">
            {view === 'detail' && selectedQuilt
              ? `${t('quilts.table.itemNumber')} #${selectedQuilt.itemNumber} - ${t('usage.details.history')}`
              : t('usage.subtitle')
            }
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">
                  {t('language') === 'zh' ? '总使用记录' : 'Total Records'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-gray-600">
                  {t('language') === 'zh' ? '正在使用' : 'Currently Active'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-gray-600">
                  {t('language') === 'zh' ? '已完成' : 'Completed'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage History List or Detail View */}
      {view === 'list' ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {t('language') === 'zh' ? '使用历史记录' : 'Usage History'}
            </CardTitle>
            <CardDescription>
              {t('language') === 'zh' ? '点击记录查看详细使用历史' : 'Click on a record to view detailed usage history'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usageHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>{t('language') === 'zh' ? '暂无使用记录' : 'No usage records found'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {usageHistory.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleRecordClick(record)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium">
                            #{record.itemNumber} {record.quiltName}
                          </h3>
                          <Badge
                            variant={record.isActive ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {record.isActive 
                              ? (t('language') === 'zh' ? '使用中' : 'Active')
                              : (t('language') === 'zh' ? '已完成' : 'Completed')
                            }
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {t(`season.${record.season}`)}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(record.startedAt)}
                          </span>
                          {record.endedAt && (
                            <span>
                              → {formatDate(record.endedAt)}
                            </span>
                          )}
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDuration(record.duration)}
                          </span>
                        </div>
                        {record.notes && (
                          <p className="text-sm text-gray-500 mt-2">{record.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Quilt Detail View */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>{selectedQuilt?.name} {t('usage.details.history')}</span>
            </CardTitle>
            <CardDescription>
              {t('language') === 'zh' ? '该被子的完整使用历史' : 'Complete usage history for this quilt'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {detailLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">{t('common.loading')}</div>
              </div>
            ) : selectedQuiltUsage.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>{t('usage.details.noHistory')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedQuiltUsage.map((usage, index) => (
                  <div key={usage.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">
                        {t('usage.labels.usagePeriod')} #{selectedQuiltUsage.length - index}
                      </h4>
                      <Badge
                        variant={usage.isActive ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {usage.isActive ? t('usage.labels.active') : t('language') === 'zh' ? '已完成' : 'Completed'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">{t('usage.labels.started')}:</span>
                        <span className="ml-2">{formatDate(usage.startedAt)}</span>
                      </div>
                      {usage.endedAt && (
                        <div>
                          <span className="text-gray-600">{t('usage.labels.ended')}:</span>
                          <span className="ml-2">{formatDate(usage.endedAt)}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">{t('language') === 'zh' ? '持续时间' : 'Duration'}:</span>
                        <span className="ml-2">{formatDuration(usage.duration)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">{t('language') === 'zh' ? '使用类型' : 'Usage Type'}:</span>
                        <span className="ml-2">{usage.usageType}</span>
                      </div>
                    </div>
                    {usage.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <span className="text-gray-600 text-sm">{t('usage.labels.notes')}:</span>
                        <p className="text-sm mt-1">{usage.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}
