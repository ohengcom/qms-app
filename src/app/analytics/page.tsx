'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Package,
  Clock,
  Calendar,
  Award,
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalQuilts: number;
    totalUsagePeriods: number;
    totalUsageDays: number;
    averageUsageDays: number;
    currentlyInUse: number;
  };
  statusDistribution: {
    AVAILABLE: number;
    IN_USE: number;
    STORAGE: number;
    MAINTENANCE: number;
  };
  seasonDistribution: {
    WINTER: number;
    SPRING_AUTUMN: number;
    SUMMER: number;
  };
  usageBySeason: {
    WINTER: number;
    SPRING_AUTUMN: number;
    SUMMER: number;
  };
  mostUsedQuilts: Array<{
    quiltId: string;
    name: string;
    usageCount: number;
    totalDays: number;
    averageDays: number;
  }>;
  usageByYear: Array<{ year: number; count: number }>;
  usageByMonth: Array<{ month: string; count: number }>;
}

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics');
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        console.error('Failed to load analytics:', data.error);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8">
        <div className="text-center text-red-600">{t('common.error')}</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('analytics.title')}</h1>
        <p className="text-gray-600">{t('analytics.subtitle')}</p>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Package className="w-10 h-10 text-blue-600" />
              <div>
                <p className="text-3xl font-bold">{analytics.overview.totalQuilts}</p>
                <p className="text-sm text-gray-600">{t('analytics.totalQuilts')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Activity className="w-10 h-10 text-green-600" />
              <div>
                <p className="text-3xl font-bold">{analytics.overview.totalUsagePeriods}</p>
                <p className="text-sm text-gray-600">{t('analytics.usageRecords')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Clock className="w-10 h-10 text-purple-600" />
              <div>
                <p className="text-3xl font-bold">{analytics.overview.totalUsageDays}</p>
                <p className="text-sm text-gray-600">{t('analytics.totalUsageDays')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Calendar className="w-10 h-10 text-orange-600" />
              <div>
                <p className="text-3xl font-bold">{analytics.overview.averageUsageDays}</p>
                <p className="text-sm text-gray-600">{t('analytics.avgUsageDays')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5" />
              <span>{t('analytics.statusDistribution')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.statusDistribution)
                .filter(([status]) => status !== 'AVAILABLE')
                .map(([status, count]) => {
                  const total = analytics.overview.totalQuilts;
                  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{t(`status.${status}`)}</span>
                        <span className="font-semibold">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            status === 'IN_USE'
                              ? 'bg-blue-500'
                              : status === 'STORAGE'
                                ? 'bg-gray-500'
                                : 'bg-yellow-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Season Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>{t('analytics.seasonDistribution')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.seasonDistribution).map(([season, count]) => {
                const total = analytics.overview.totalQuilts;
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={season} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t(`season.${season}`)}</span>
                      <span className="font-semibold">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          season === 'WINTER'
                            ? 'bg-blue-500'
                            : season === 'SUMMER'
                              ? 'bg-orange-500'
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Most Used Quilts */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>{t('analytics.mostUsedQuilts')}</span>
          </CardTitle>
          <CardDescription>{t('analytics.topByUsageCount')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.mostUsedQuilts.map((quilt, index) => (
              <div
                key={quilt.quiltId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <span className="font-semibold">{quilt.name}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      {t('analytics.avg')}: {quilt.averageDays} {t('analytics.days')}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-blue-600">{quilt.usageCount}</span>
                  <span className="text-sm text-gray-600 ml-1">{t('analytics.uses')}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage by Year */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>{t('analytics.usageTrendByYear')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.usageByYear.map(item => {
              const maxCount = Math.max(...analytics.usageByYear.map(y => y.count));
              const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              return (
                <div key={item.year} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{item.year}</span>
                    <span className="text-gray-600">
                      {item.count} {t('language') === 'zh' ? '次' : 'uses'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Usage by Season */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>{t('language') === 'zh' ? '季节使用统计' : 'Usage by Season'}</span>
          </CardTitle>
          <CardDescription>
            {t('language') === 'zh' ? '不同季节被子的使用次数' : 'Usage count by quilt season'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(analytics.usageBySeason).map(([season, count]) => (
              <div key={season} className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600 mb-2">{count}</p>
                <p className="text-sm font-semibold text-gray-900">{t(`season.${season}`)}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {t('language') === 'zh' ? '次使用' : 'uses'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
