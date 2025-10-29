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
      alert(t('language') === 'zh' ? '下载报告失败' : 'Failed to download report');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('reports.title')}</h1>
        <p className="text-gray-600">{t('reports.subtitle')}</p>
      </div>

      {/* Export Options */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>导出选项 / Export Options</span>
          </CardTitle>
          <CardDescription>
            选择报告格式并下载数据 / Choose report format and download data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <FileSpreadsheet className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">CSV 导出</h3>
                <p className="text-sm text-gray-600">CSV Export</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <BarChart3 className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">JSON 数据</h3>
                <p className="text-sm text-gray-600">JSON Data</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
              <Database className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">完整备份</h3>
                <p className="text-sm text-gray-600">Complete Backup</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>库存报告 / Inventory Reports</CardTitle>
            <CardDescription>
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

        <Card>
          <CardHeader>
            <CardTitle>使用报告 / Usage Reports</CardTitle>
            <CardDescription>
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作 / Quick Actions</CardTitle>
          <CardDescription>
            一键下载常用报告 / One-click download for common reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              className="h-20 flex flex-col items-center justify-center space-y-2"
              variant="outline"
              onClick={() => downloadReport('inventory', 'csv')}
              disabled={loading === 'inventory'}
            >
              {loading === 'inventory' ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-6 h-6" />
              )}
              <span className="text-sm">库存 CSV</span>
            </Button>
            <Button
              className="h-20 flex flex-col items-center justify-center space-y-2"
              variant="outline"
              onClick={() => downloadReport('usage', 'csv')}
              disabled={loading === 'usage'}
            >
              {loading === 'usage' ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Calendar className="w-6 h-6" />
              )}
              <span className="text-sm">使用 CSV</span>
            </Button>
            <Button
              className="h-20 flex flex-col items-center justify-center space-y-2"
              variant="outline"
              onClick={() => downloadReport('analytics', 'json')}
              disabled={loading === 'analytics'}
            >
              {loading === 'analytics' ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <BarChart3 className="w-6 h-6" />
              )}
              <span className="text-sm">分析 JSON</span>
            </Button>
            <Button
              className="h-20 flex flex-col items-center justify-center space-y-2"
              variant="outline"
              onClick={() => downloadReport('status', 'csv')}
              disabled={loading === 'status'}
            >
              {loading === 'status' ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Database className="w-6 h-6" />
              )}
              <span className="text-sm">状态 CSV</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
