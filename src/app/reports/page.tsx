'use client';

import { useLanguage } from '@/lib/language-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, FileSpreadsheet, FileImage, Database, Calendar } from 'lucide-react';

export default function ReportsPage() {
  const { t } = useLanguage();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('reports.title')}</h1>
        <p className="text-gray-600">{t('reports.subtitle')}</p>
      </div>

      {/* Coming Soon Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>{t('reports.comingSoon')}</span>
          </CardTitle>
          <CardDescription>
            {t('reports.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <FileSpreadsheet className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Excel 导出</h3>
                <p className="text-sm text-gray-600">Excel Export</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <FileImage className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">图表报告</h3>
                <p className="text-sm text-gray-600">Chart Reports</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
              <Database className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">数据备份</h3>
                <p className="text-sm text-gray-600">Data Backup</p>
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
            <CardDescription>被子收藏和状态报告 / Quilt collection and status reports</CardDescription>
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
              <Button variant="outline" size="sm" disabled>
                <Download className="w-4 h-4 mr-2" />
                {t('reports.comingSoon')}
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
              <Button variant="outline" size="sm" disabled>
                <Download className="w-4 h-4 mr-2" />
                {t('reports.comingSoon')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>使用报告 / Usage Reports</CardTitle>
            <CardDescription>使用情况和趋势分析 / Usage patterns and trend analysis</CardDescription>
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
              <Button variant="outline" size="sm" disabled>
                <Download className="w-4 h-4 mr-2" />
                {t('reports.comingSoon')}
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileImage className="w-5 h-5 text-gray-600" />
                <div>
                  <h4 className="font-medium">使用趋势图表</h4>
                  <p className="text-sm text-gray-600">Usage Trend Charts</p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                <Download className="w-4 h-4 mr-2" />
                {t('reports.comingSoon')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Reports */}
      <Card>
        <CardHeader>
          <CardTitle>自定义报告 / Custom Reports</CardTitle>
          <CardDescription>创建个性化的报告和导出 / Create personalized reports and exports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">{t('reports.comingSoon')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}