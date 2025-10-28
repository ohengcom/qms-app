'use client';

import { useLanguage } from '@/lib/language-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';

export default function AnalyticsPage() {
  const { t } = useLanguage();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('analytics.title')}</h1>
        <p className="text-gray-600">{t('analytics.subtitle')}</p>
      </div>

      {/* Coming Soon Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>{t('analytics.comingSoon')}</span>
          </CardTitle>
          <CardDescription>
            {t('analytics.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">使用统计</h3>
                <p className="text-sm text-gray-600">Usage Statistics</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">趋势分析</h3>
                <p className="text-sm text-gray-600">Trend Analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
              <PieChart className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">分布图表</h3>
                <p className="text-sm text-gray-600">Distribution Charts</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for future analytics content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>使用频率分析 / Usage Frequency Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">{t('analytics.comingSoon')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>季节性趋势 / Seasonal Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">{t('analytics.comingSoon')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}