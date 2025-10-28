'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/language-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Database, Bell, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const { t } = useLanguage();

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
        <p className="text-gray-500">{t('settings.subtitle')}</p>
      </div>

      {/* Application Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>{t('settings.sections.app.title')}</span>
          </CardTitle>
          <CardDescription>{t('settings.sections.app.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="app-name">{t('settings.sections.app.applicationName')}</Label>
            <Input id="app-name" defaultValue="QMS - Quilt Management System" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">{t('settings.sections.app.language')}</Label>
            <Input id="language" defaultValue={t('language') === 'zh' ? '中文' : 'English'} disabled />
          </div>
        </CardContent>
      </Card>

      {/* Database Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>{t('settings.sections.database.title')}</span>
          </CardTitle>
          <CardDescription>{t('settings.sections.database.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('settings.sections.database.provider')}</Label>
            <Input value="Neon Serverless PostgreSQL" disabled />
          </div>
          <div className="space-y-2">
            <Label>{t('settings.sections.database.connectionStatus')}</Label>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600">{t('settings.sections.database.connected')}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('settings.sections.database.totalRecords')}</Label>
            <Input value="16 quilts" disabled />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>{t('settings.sections.notifications.title')}</span>
          </CardTitle>
          <CardDescription>{t('settings.sections.notifications.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('settings.sections.notifications.usageReminders')}</p>
              <p className="text-sm text-gray-500">{t('settings.sections.notifications.usageRemindersDesc')}</p>
            </div>
            <input type="checkbox" className="w-4 h-4" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('settings.sections.notifications.maintenanceAlerts')}</p>
              <p className="text-sm text-gray-500">{t('settings.sections.notifications.maintenanceAlertsDesc')}</p>
            </div>
            <input type="checkbox" className="w-4 h-4" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>{t('settings.sections.system.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">{t('settings.sections.system.version')}:</span>
            <span className="font-medium">2.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('settings.sections.system.framework')}:</span>
            <span className="font-medium">Next.js 16.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('settings.sections.system.deployment')}:</span>
            <span className="font-medium">Vercel</span>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="w-full sm:w-auto">
          {saved ? t('settings.actions.saved') : t('settings.actions.save')}
        </Button>
      </div>

      {saved && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {t('settings.actions.saveSuccess')}
        </div>
      )}
    </div>
  );
}
