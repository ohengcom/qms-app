'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/language-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, Database, Bell, Shield, Download, Globe, MousePointerClick } from 'lucide-react';
import { toast } from '@/lib/toast';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ChangePasswordDialog } from '@/components/settings/ChangePasswordDialog';
import {
  useAppSettings,
  useUpdateAppSettings,
  useDatabaseStats,
  useSystemInfo,
} from '@/hooks/useSettings';

export default function SettingsPage() {
  const { t, language } = useLanguage();

  // Fetch data
  const { data: appSettings, isLoading: settingsLoading } = useAppSettings();
  const { data: dbStats, isLoading: dbLoading } = useDatabaseStats();
  const { data: systemInfo, isLoading: systemLoading } = useSystemInfo();

  // Mutations
  const updateSettings = useUpdateAppSettings();

  // Initialize app name from settings (use appSettings directly instead of state)
  const [appName, setAppName] = useState(appSettings?.appName || '');
  const [doubleClickAction, setDoubleClickAction] = useState<'none' | 'status' | 'edit'>(
    (appSettings?.doubleClickAction as 'none' | 'status' | 'edit') || 'status'
  );

  const handleSaveAppName = async () => {
    try {
      await updateSettings.mutateAsync({ appName });
      toast.success(
        t('language') === 'zh' ? '设置已保存' : 'Settings saved',
        t('language') === 'zh' ? '应用程序名称已更新' : 'Application name updated'
      );
    } catch (error) {
      toast.error(
        t('language') === 'zh' ? '保存失败' : 'Save failed',
        error instanceof Error
          ? error.message
          : t('language') === 'zh'
            ? '请重试'
            : 'Please try again'
      );
    }
  };

  const handleDoubleClickActionChange = async (value: 'none' | 'status' | 'edit') => {
    try {
      setDoubleClickAction(value);
      await updateSettings.mutateAsync({ doubleClickAction: value });
      toast.success(
        t('language') === 'zh' ? '设置已保存' : 'Settings saved',
        t('language') === 'zh' ? '双击行为已更新' : 'Double-click behavior updated'
      );
    } catch (error) {
      toast.error(
        t('language') === 'zh' ? '保存失败' : 'Save failed',
        error instanceof Error
          ? error.message
          : t('language') === 'zh'
            ? '请重试'
            : 'Please try again'
      );
    }
  };

  const handleExportData = () => {
    // This will be implemented with the export functionality
    toast.info(
      t('language') === 'zh' ? '导出功能' : 'Export Feature',
      t('language') === 'zh'
        ? '请使用导出页面导出数据'
        : 'Please use the Export page to export data'
    );
  };

  if (settingsLoading || dbLoading || systemLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

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
            <div className="flex gap-2">
              <Input
                id="app-name"
                value={appName}
                onChange={e => setAppName(e.target.value)}
                placeholder="QMS - Quilt Management System"
              />
              <Button
                onClick={handleSaveAppName}
                disabled={updateSettings.isPending || appName === appSettings?.appName}
              >
                {updateSettings.isPending
                  ? t('language') === 'zh'
                    ? '保存中...'
                    : 'Saving...'
                  : t('language') === 'zh'
                    ? '保存'
                    : 'Save'}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              {t('language') === 'zh'
                ? '更改应用程序名称（仅在当前会话中生效）'
                : 'Change application name (effective in current session only)'}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">
              <Globe className="w-4 h-4 inline mr-2" />
              {t('settings.sections.app.language')}
            </Label>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <span className="text-sm text-gray-500">
                {language === 'zh' ? '当前语言：中文' : 'Current language: English'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quilt Management Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MousePointerClick className="w-5 h-5" />
            <span>{t('language') === 'zh' ? '被子管理设置' : 'Quilt Management Settings'}</span>
          </CardTitle>
          <CardDescription>
            {t('language') === 'zh'
              ? '配置被子列表的交互行为'
              : 'Configure quilt list interaction behavior'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="double-click-action">
              {t('language') === 'zh' ? '双击行为' : 'Double-click Behavior'}
            </Label>
            <Select
              value={doubleClickAction}
              onValueChange={value =>
                handleDoubleClickActionChange(value as 'none' | 'status' | 'edit')
              }
            >
              <SelectTrigger id="double-click-action">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">
                      {t('language') === 'zh' ? '无动作' : 'No Action'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {t('language') === 'zh' ? '双击不执行任何操作' : 'Double-click does nothing'}
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="status">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">
                      {t('language') === 'zh' ? '修改状态' : 'Change Status'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {t('language') === 'zh'
                        ? '双击打开状态修改对话框'
                        : 'Double-click opens status dialog'}
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="edit">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">
                      {t('language') === 'zh' ? '编辑被子' : 'Edit Quilt'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {t('language') === 'zh' ? '双击打开编辑表单' : 'Double-click opens edit form'}
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {t('language') === 'zh'
                ? '设置在被子列表中双击行时的默认行为'
                : 'Set the default behavior when double-clicking a row in the quilt list'}
            </p>
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
            <Input value={dbStats?.provider || 'Neon Serverless PostgreSQL'} disabled />
          </div>
          <div className="space-y-2">
            <Label>{t('settings.sections.database.connectionStatus')}</Label>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${dbStats?.connected ? 'bg-green-500' : 'bg-red-500'}`}
              ></div>
              <span className={`text-sm ${dbStats?.connected ? 'text-green-600' : 'text-red-600'}`}>
                {dbStats?.connected
                  ? t('settings.sections.database.connected')
                  : t('language') === 'zh'
                    ? '未连接'
                    : 'Disconnected'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">
                {t('language') === 'zh' ? '被子总数' : 'Total Quilts'}
              </Label>
              <p className="text-2xl font-semibold">{dbStats?.totalQuilts || 0}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">
                {t('language') === 'zh' ? '使用记录' : 'Usage Records'}
              </Label>
              <p className="text-2xl font-semibold">{dbStats?.totalUsageRecords || 0}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">
                {t('language') === 'zh' ? '使用中' : 'Active Usage'}
              </Label>
              <p className="text-2xl font-semibold">{dbStats?.activeUsage || 0}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleExportData} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            {t('language') === 'zh' ? '导出所有数据' : 'Export All Data'}
          </Button>
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
              <p className="text-sm text-gray-500">
                {t('settings.sections.notifications.usageRemindersDesc')}
              </p>
            </div>
            <input type="checkbox" className="w-4 h-4" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {t('settings.sections.notifications.maintenanceAlerts')}
              </p>
              <p className="text-sm text-gray-500">
                {t('settings.sections.notifications.maintenanceAlertsDesc')}
              </p>
            </div>
            <input type="checkbox" className="w-4 h-4" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>{t('language') === 'zh' ? '安全设置' : 'Security Settings'}</span>
          </CardTitle>
          <CardDescription>
            {t('language') === 'zh'
              ? '管理您的账户安全和密码'
              : 'Manage your account security and password'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ChangePasswordDialog />
          <div className="text-xs text-gray-500 bg-blue-50 border border-blue-200 p-3 rounded">
            {t('language') === 'zh'
              ? '💡 提示：密码存储在数据库中，修改后立即生效，无需重新部署应用。'
              : '💡 Tip: Password is stored in the database and takes effect immediately after change, no redeployment needed.'}
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
            <span className="font-medium">{systemInfo?.version || '0.2.2'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('settings.sections.system.framework')}:</span>
            <span className="font-medium">{systemInfo?.framework || 'Next.js 15.0.3'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('settings.sections.system.deployment')}:</span>
            <span className="font-medium">{systemInfo?.deployment || 'Vercel'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">
              {t('language') === 'zh' ? '环境' : 'Environment'}:
            </span>
            <span className="font-medium capitalize">
              {systemInfo?.environment || 'production'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
