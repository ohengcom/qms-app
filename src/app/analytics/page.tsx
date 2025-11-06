'use client';

import { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/lib/language-provider';
import { useQuilts } from '@/hooks/useQuilts';
import { useUsageRecords } from '@/hooks/useUsage';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  PieChart,
  Activity,
  Package,
  Clock,
  Calendar,
  Award,
} from 'lucide-react';
import {
  calculateAllQuiltsUsageStats,
  sortByUsageFrequency,
  filterByRecommendation,
  type QuiltUsageStats,
} from '@/lib/usage-statistics';

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
  const { t, language } = useLanguage();
  const { data: quiltsData, isLoading: quiltsLoading } = useQuilts();
  const { data: usageData, isLoading: usageLoading } = useUsageRecords();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const [period, setPeriod] = useState<'30days' | '90days' | '365days' | 'all'>('365days');
  const [filter, setFilter] = useState<'all' | 'keep' | 'low_usage' | 'consider_removal'>('all');

  // Extract data
  const quilts = (quiltsData as any)?.json?.quilts || quiltsData?.quilts || [];
  const usageRecords = (usageData as any)?.json || usageData || [];

  // Calculate statistics
  const allStats = useMemo(() => {
    if (quilts.length === 0 || usageRecords.length === 0) return [];

    const stats = calculateAllQuiltsUsageStats(
      quilts.map((q: any) => ({
        id: q.id,
        name: q.name,
        itemNumber: q.itemNumber,
        season: q.season,
      })),
      usageRecords.map((r: any) => ({
        id: r.id,
        quiltId: r.quiltId,
        startDate: new Date(r.startedAt),
        endDate: r.endedAt ? new Date(r.endedAt) : null,
      }))
    );

    return stats;
  }, [quilts, usageRecords]);

  // Filter and sort
  const filteredStats = useMemo(() => {
    const filtered = filterByRecommendation(allStats, filter);
    return sortByUsageFrequency(filtered, period, 'desc');
  }, [allStats, filter, period]);

  // Count by recommendation
  const recommendationCounts = useMemo(() => {
    return {
      keep: allStats.filter(s => s.recommendation === 'keep').length,
      low_usage: allStats.filter(s => s.recommendation === 'low_usage').length,
      consider_removal: allStats.filter(s => s.recommendation === 'consider_removal').length,
    };
  }, [allStats]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
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
      setAnalyticsLoading(false);
    }
  };

  const isLoading = quiltsLoading || usageLoading || analyticsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const getPeriodLabel = () => {
    switch (period) {
      case '30days':
        return language === 'zh' ? '30天' : '30 Days';
      case '90days':
        return language === 'zh' ? '90天' : '90 Days';
      case '365days':
        return language === 'zh' ? '365天' : '365 Days';
      case 'all':
        return language === 'zh' ? '全部' : 'All Time';
    }
  };

  const getUsageCount = (stat: QuiltUsageStats) => {
    switch (period) {
      case '30days':
        return stat.usageCount30Days;
      case '90days':
        return stat.usageCount90Days;
      case '365days':
        return stat.usageCount365Days;
      case 'all':
        return stat.totalUsageCount;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t('navigation.analytics')}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {language === 'zh' ? '被子使用分析和统计' : 'Quilt usage analysis and statistics'}
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">
            <PieChart className="w-4 h-4 mr-2" />
            {language === 'zh' ? '数据概览' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="frequency">
            <BarChart3 className="w-4 h-4 mr-2" />
            {language === 'zh' ? '使用频率分析' : 'Usage Frequency'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {!analytics ? (
            <div className="text-center text-red-600">{t('common.error')}</div>
          ) : (
            <>
              {/* Overview Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <Card>
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
                          <span className="text-xl font-bold text-blue-600">
                            {quilt.usageCount}
                          </span>
                          <span className="text-sm text-gray-600 ml-1">{t('analytics.uses')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Usage by Year */}
              <Card>
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
                              {item.count} {language === 'zh' ? '次' : 'uses'}
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
                    <span>{language === 'zh' ? '各季节被子使用情况' : 'Usage by Season'}</span>
                  </CardTitle>
                  <CardDescription>
                    {language === 'zh'
                      ? '不同季节类型被子的使用次数'
                      : 'Usage count by quilt season'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(analytics.usageBySeason).map(([season, count]) => (
                      <div key={season} className="text-center p-6 bg-gray-50 rounded-lg">
                        <p className="text-3xl font-bold text-blue-600 mb-2">{count}</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {t(`season.${season}`)}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {language === 'zh' ? '次使用' : 'uses'}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="frequency" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  {language === 'zh' ? '正常使用' : 'Normal Usage'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{recommendationCounts.keep}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'zh' ? '使用频率正常的被子' : 'Quilts with normal usage'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-yellow-600" />
                  {language === 'zh' ? '低使用率' : 'Low Usage'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {recommendationCounts.low_usage}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'zh' ? '使用频率较低的被子' : 'Quilts with low usage'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  {language === 'zh' ? '建议淘汰' : 'Consider Removal'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {recommendationCounts.consider_removal}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'zh' ? '建议考虑淘汰的被子' : 'Quilts to consider removing'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {language === 'zh' ? '使用频率排行榜' : 'Usage Frequency Ranking'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'zh'
                      ? '按使用频率排序，显示被子使用情况'
                      : 'Sorted by usage frequency, showing quilt usage patterns'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30days">
                        {language === 'zh' ? '30天' : '30 Days'}
                      </SelectItem>
                      <SelectItem value="90days">
                        {language === 'zh' ? '90天' : '90 Days'}
                      </SelectItem>
                      <SelectItem value="365days">
                        {language === 'zh' ? '365天' : '365 Days'}
                      </SelectItem>
                      <SelectItem value="all">{language === 'zh' ? '全部' : 'All Time'}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === 'zh' ? '全部' : 'All'}</SelectItem>
                      <SelectItem value="keep">
                        {language === 'zh' ? '正常使用' : 'Normal Usage'}
                      </SelectItem>
                      <SelectItem value="low_usage">
                        {language === 'zh' ? '低使用率' : 'Low Usage'}
                      </SelectItem>
                      <SelectItem value="consider_removal">
                        {language === 'zh' ? '建议淘汰' : 'Consider Removal'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                        {language === 'zh' ? '排名' : 'Rank'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                        {language === 'zh' ? '编号' : 'Item #'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                        {language === 'zh' ? '名称' : 'Name'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                        {language === 'zh' ? '季节' : 'Season'}
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">
                        {language === 'zh'
                          ? `使用次数 (${getPeriodLabel()})`
                          : `Usage Count (${getPeriodLabel()})`}
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">
                        {language === 'zh' ? '最后使用' : 'Last Used'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                        {language === 'zh' ? '建议' : 'Recommendation'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStats.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          {language === 'zh' ? '暂无数据' : 'No data available'}
                        </td>
                      </tr>
                    ) : (
                      filteredStats.map((stat, index) => (
                        <tr
                          key={stat.quiltId}
                          className={`
                            hover:bg-gray-50 transition-colors
                            ${stat.recommendation === 'consider_removal' ? 'bg-red-50' : ''}
                            ${stat.recommendation === 'low_usage' ? 'bg-yellow-50' : ''}
                          `}
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            #{index + 1}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">#{stat.itemNumber}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {stat.quiltName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {t(`season.${stat.season}`)}
                          </td>
                          <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">
                            {getUsageCount(stat)}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-700">
                            {stat.daysSinceLastUse !== null
                              ? language === 'zh'
                                ? `${stat.daysSinceLastUse}天前`
                                : `${stat.daysSinceLastUse} days ago`
                              : language === 'zh'
                                ? '从未使用'
                                : 'Never used'}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                stat.recommendation === 'keep'
                                  ? 'bg-green-100 text-green-800'
                                  : stat.recommendation === 'low_usage'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {stat.recommendationReason}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
