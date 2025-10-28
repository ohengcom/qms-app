'use client';

import { useLanguage } from '@/lib/language-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileSpreadsheet, Calendar, Settings, Database } from 'lucide-react';
import Link from 'next/link';

export default function ExportPage() {
  const { t } = useLanguage();

  const handleExport = (type: string) => {
    // TODO: Implement actual export functionality
    alert(`${t('common.comingSoon')} - ${type} export`);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('reports.title')} - {t('dashboard.actions.exportData')}</h1>
            <p className="text-gray-600">{t('reports.subtitle')}</p>
          </div>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.back')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>{t('dashboard.actions.exportData')}</span>
          </CardTitle>
          <CardDescription>
            {t('reports.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <FileSpreadsheet className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Excel 导出</h3>
                <p className="text-sm text-gray-600">Excel Export</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <Calendar className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">使用报告</h3>
                <p className="text-sm text-gray-600">Usage Reports</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
              <Settings className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">维护记录</h3>
                <p className="text-sm text-gray-600">Maintenance Records</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg">
              <Database className="w-8 h-8 text-orange-600" />
              <div>
                <h3 className="font-semibold text-gray-900">数据备份</h3>
                <p className="text-sm text-gray-600">Data Backup</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>被子收藏导出 / Quilt Collection Export</CardTitle>
            <CardDescription>导出完整的被子库存清单 / Export complete quilt inventory</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="w-5 h-5 text-gray-600" />
                <div>
                  <h4 className="font-medium">完整库存清单</h4>
                  <p className="text-sm text-gray-600">Complete Inventory List</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleExport('quilts-full')}>
                <Download className="w-4 h-4 mr-2" />
                {t('dashboard.actions.exportData')}
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="w-5 h-5 text-gray-600" />
                <div>
                  <h4 className="font-medium">按状态分类</h4>
                  <p className="text-sm text-gray-600">By Status Category</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleExport('quilts-status')}>
                <Download className="w-4 h-4 mr-2" />
                {t('dashboard.actions.exportData')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>使用报告导出 / Usage Reports Export</CardTitle>
            <CardDescription>导出使用情况和趋势分析 / Export usage patterns and trend analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div>
                  <h4 className="font-medium">月度使用报告</h4>
                  <p className="text-sm text-gray-600">Monthly Usage Report</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleExport('usage-monthly')}>
                <Download className="w-4 h-4 mr-2" />
                {t('dashboard.actions.exportData')}
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-gray-600" />
                <div>
                  <h4 className="font-medium">维护历史</h4>
                  <p className="text-sm text-gray-600">Maintenance History</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleExport('maintenance-history')}>
                <Download className="w-4 h-4 mr-2" />
                {t('dashboard.actions.exportData')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
