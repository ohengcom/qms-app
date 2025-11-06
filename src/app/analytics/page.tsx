'use client';

import { useState, useMemo } from 'react';
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
import { BarChart3, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import {
  calculateAllQuiltsUsageStats,
  sortByUsageFrequency,
  filterByRecommendation,
  type QuiltUsageStats,
} from '@/lib/usage-statistics';

export default function AnalyticsPage() {
  const { t, language } = useLanguage();
  const { data: quiltsData, isLoading: quiltsLoading } = useQuilts();
  const { data: usageData, isLoading: usageLoading } = useUsageRecords();

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

  const isLoading = quiltsLoading || usageLoading;

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

      <Tabs defaultValue="frequency" className="space-y-6">
        <TabsList>
          <TabsTrigger value="frequency">
            <BarChart3 className="w-4 h-4 mr-2" />
            {language === 'zh' ? '使用频率分析' : 'Usage Frequency'}
          </TabsTrigger>
        </TabsList>

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
