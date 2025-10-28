'use client';

import { useLanguage } from '@/lib/language-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function MaintenancePage() {
  const { t } = useLanguage();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('maintenance.title')}</h1>
        <p className="text-gray-600">{t('maintenance.subtitle')}</p>
      </div>

      {/* Coming Soon Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wrench className="w-5 h-5" />
            <span>{t('maintenance.comingSoon')}</span>
          </CardTitle>
          <CardDescription>
            {t('maintenance.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">护理计划</h3>
                <p className="text-sm text-gray-600">Care Schedule</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-gray-900">维护提醒</h3>
                <p className="text-sm text-gray-600">Maintenance Alerts</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">完成记录</h3>
                <p className="text-sm text-gray-600">Completed Records</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
              <Clock className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">历史记录</h3>
                <p className="text-sm text-gray-600">History</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for future maintenance content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>即将到期的维护 / Upcoming Maintenance</CardTitle>
            <CardDescription>需要护理的被子列表 / Quilts requiring care</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">示例被子 #001</h4>
                    <p className="text-sm text-gray-600">上次清洗：3个月前</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    {t('maintenance.comingSoon')}
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-500">{t('maintenance.comingSoon')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>维护历史 / Maintenance History</CardTitle>
            <CardDescription>最近的护理记录 / Recent care records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">{t('maintenance.comingSoon')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}