'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/language-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Download,
  FileSpreadsheet,
  Database,
  Calendar,
  BarChart3,
  Loader2,
} from 'lucide-react';

export default function ReportsPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);

  const downloadReport = async (reportType: string, format: 'json' | 'csv' = 'csv') => {
    try {
      setLoading(reportType);

      const response = await fetch(`/api/reports?type=${reportType}&format=${format}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download report error:', error);
      // TODO: Replace with toast notification
      window.alert(t('language') === 'zh' ? '下载报告失败' : 'Failed to download report');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-8">
      {/* Modern Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          {t('reports.title')}
        </h1>
        <p className="text-gray-600 text-lg">{t('reports.subtitle')}</p>
      </div>

      {/* Modern Export Options */}
      <Card className="mb-8 shadow-soft border-gray-100 hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span>导出选项 / Export Options</span>
          </CardTitle>
          <CardDescription className="text-base">
            选择报告格式并下载数据 / Choose report format and download data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group flex items-center space-x-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100 hover:border-blue-300 transition-all hover-lift">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">CSV 导出</h3>
                <p className="text-sm text-gray-600">CSV Export</p>
              </div>
            </div>
            <div className="group flex items-center space-x-4 p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-100 hover:border-green-300 transition-all hover-lift">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">JSON 数据</h3>
                <p className="text-sm text-gray-600">JSON Data</p>
              </div>
            </div>
            <div className="group flex items-center space-x-4 p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100 hover:border-purple-300 transition-all hover-lift">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Database className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">完整备份</h3>
                <p className="text-sm text-gray-600">Complete Backup</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modern Report Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-soft border-gray-100 hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span>库存报告 / Inventory Reports</span>
            </CardTitle>
            <CardDescription className="text-base">
              被子收藏和状态报告 / Quilt collection and status reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <div>
                  <h4 className="font-medium">完整库存清单</h4>
                  <p className="text-sm text-gray-600">Complete Inventory List</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadReport('inventory', 'csv')}
                  disabled={loading === 'inventory'}
                >
                  {loading === 'inventory' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadReport('inventory', 'json')}
                  disabled={loading === 'inventory'}
                >
                  {loading === 'inventory' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  JSON
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="w-5 h-5 text-gray-600" />
                <div>
                  <h4 className="font-medium">按状态分类</h4>
                  <p className="text-sm text-gray-600">By Status Category</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadReport('status', 'csv')}
                  disabled={loading === 'status'}
                >
                  {loading === 'status' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadReport('status', 'json')}
                  disabled={loading === 'status'}
                >
                  {loading === 'status' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  JSON
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-gray-100 hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span>使用报告 / Usage Reports</span>
            </CardTitle>
            <CardDescription className="text-base">
              使用情况和趋势分析 / Usage patterns and trend analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div>
                  <h4 className="font-medium">使用历史报告</h4>
                  <p className="text-sm text-gray-600">Usage History Report</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadReport('usage', 'csv')}
                  disabled={loading === 'usage'}
                >
                  {loading === 'usage' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadReport('usage', 'json')}
                  disabled={loading === 'usage'}
                >
                  {loading === 'usage' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  JSON
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5 text-gray-600" />
                <div>
                  <h4 className="font-medium">分析报告</h4>
                  <p className="text-sm text-gray-600">Analytics Report</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadReport('analytics', 'csv')}
                  disabled={loading === 'analytics'}
                >
                  {loading === 'analytics' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadReport('analytics', 'json')}
                  disabled={loading === 'analytics'}
                >
                  {loading === 'analytics' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  JSON
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modern Quick Actions */}
      <Card className="shadow-soft border-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <span>快速操作 / Quick Actions</span>
          </CardTitle>
          <CardDescription className="text-base">
            一键下载常用报告 / One-click download for common reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              className="h-24 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 hover:border-blue-400 text-gray-900 hover:text-blue-900 transition-all hover-lift"
              variant="outline"
              onClick={() => downloadReport('inventory', 'csv')}
              disabled={loading === 'inventory'}
            >
              {loading === 'inventory' ? (
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-white" />
                </div>
              )}
              <span className="text-sm font-semibold">库存 CSV</span>
            </Button>
            <Button
              className="h-24 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-2 border-green-200 hover:border-green-400 text-gray-900 hover:text-green-900 transition-all hover-lift"
              variant="outline"
              onClick={() => downloadReport('usage', 'csv')}
              disabled={loading === 'usage'}
            >
              {loading === 'usage' ? (
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              )}
              <span className="text-sm font-semibold">使用 CSV</span>
            </Button>
            <Button
              className="h-24 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-2 border-purple-200 hover:border-purple-400 text-gray-900 hover:text-purple-900 transition-all hover-lift"
              variant="outline"
              onClick={() => downloadReport('analytics', 'json')}
              disabled={loading === 'analytics'}
            >
              {loading === 'analytics' ? (
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              )}
              <span className="text-sm font-semibold">分析 JSON</span>
            </Button>
            <Button
              className="h-24 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border-2 border-orange-200 hover:border-orange-400 text-gray-900 hover:text-orange-900 transition-all hover-lift"
              variant="outline"
              onClick={() => downloadReport('status', 'csv')}
              disabled={loading === 'status'}
            >
              {loading === 'status' ? (
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" />
                </div>
              )}
              <span className="text-sm font-semibold">状态 CSV</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
