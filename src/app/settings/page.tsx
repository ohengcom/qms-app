'use client';

import { useLanguage } from '@/lib/language-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Database, Shield, MousePointerClick, Info, Globe } from 'lucide-react';
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

  // Use double click action directly from settings
  const doubleClickAction =
    (appSettings?.doubleClickAction as 'none' | 'status' | 'edit' | 'view') || 'status';

  const handleDoubleClickActionChange = async (value: 'none' | 'status' | 'edit' | 'view') => {
    try {
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

      {/* Two-column layout: 2/3 for settings, 1/3 for info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Settings (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>{language === 'zh' ? '语言设置' : 'Language Settings'}</span>
              </CardTitle>
              <CardDescription>
                {language === 'zh' ? '选择应用程序显示语言' : 'Choose application display language'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">
                  {language === 'zh' ? '语言' : t('settings.sections.app.language')}
                </Label>
                <div className="flex items-center gap-3">
                  <LanguageSwitcher />
                  <span className="text-sm text-gray-500">
                    {language === 'zh' ? '当前语言：中文' : 'Current language: English'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {language === 'zh'
                    ? '更改语言后立即生效，无需刷新页面'
                    : 'Language changes take effect immediately without page refresh'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quilt Management Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MousePointerClick className="w-5 h-5" />
                <span>{language === 'zh' ? '被子管理设置' : 'Quilt Management Settings'}</span>
              </CardTitle>
              <CardDescription>
                {language === 'zh'
                  ? '配置被子列表的交互行为'
                  : 'Configure quilt list interaction behavior'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="double-click-action">
                  {language === 'zh' ? '被子列表双击行为' : 'Quilt List Double-click Behavior'}
                </Label>
                <Select
                  value={doubleClickAction}
                  onValueChange={value =>
                    handleDoubleClickActionChange(value as 'none' | 'status' | 'edit' | 'view')
                  }
                >
                  <SelectTrigger id="double-click-action">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">
                          {language === 'zh' ? '无动作' : 'No Action'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {language === 'zh' ? '双击不执行任何操作' : 'Double-click does nothing'}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="view">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">
                          {language === 'zh' ? '查看详情' : 'View Details'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {language === 'zh'
                            ? '双击查看被子详情'
                            : 'Double-click to view quilt details'}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="status">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">
                          {language === 'zh' ? '修改状态' : 'Change Status'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {language === 'zh'
                            ? '双击打开状态修改对话框'
                            : 'Double-click opens status dialog'}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="edit">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">
                          {language === 'zh' ? '编辑被子' : 'Edit Quilt'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {language === 'zh' ? '双击打开编辑表单' : 'Double-click opens edit form'}
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {language === 'zh'
                    ? '设置在被子列表中双击行时的默认行为'
                    : 'Set the default behavior when double-clicking a row in the quilt list'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usage-double-click-action">
                  {language === 'zh' ? '使用记录双击行为' : 'Usage Record Double-click Behavior'}
                </Label>
                <Select
                  value={(appSettings?.usageDoubleClickAction as string) || 'view'}
                  onValueChange={async value => {
                    try {
                      await updateSettings.mutateAsync({
                        usageDoubleClickAction: value as 'none' | 'view' | 'edit',
                      });
                      toast.success(
                        language === 'zh' ? '设置已保存' : 'Settings saved',
                        language === 'zh'
                          ? '使用记录双击行为已更新'
                          : 'Usage record double-click behavior updated'
                      );
                    } catch (error) {
                      toast.error(
                        language === 'zh' ? '保存失败' : 'Save failed',
                        error instanceof Error
                          ? error.message
                          : language === 'zh'
                            ? '请重试'
                            : 'Please try again'
                      );
                    }
                  }}
                >
                  <SelectTrigger id="usage-double-click-action">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">
                          {language === 'zh' ? '无动作' : 'No Action'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {language === 'zh' ? '双击不执行任何操作' : 'Double-click does nothing'}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="view">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">
                          {language === 'zh' ? '查看详情' : 'View Details'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {language === 'zh'
                            ? '双击查看被子详情'
                            : 'Double-click to view quilt details'}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="edit">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">
                          {language === 'zh' ? '编辑记录' : 'Edit Record'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {language === 'zh'
                            ? '双击编辑使用记录'
                            : 'Double-click to edit usage record'}
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {language === 'zh'
                    ? '设置在使用记录列表中双击行时的默认行为'
                    : 'Set the default behavior when double-clicking a row in the usage record list'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>{language === 'zh' ? '安全设置' : 'Security Settings'}</span>
              </CardTitle>
              <CardDescription>
                {language === 'zh'
                  ? '管理您的账户安全和密码'
                  : 'Manage your account security and password'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordDialog />
            </CardContent>
          </Card>
        </div>

        {/* Right column - System Info (1/3 width) */}
        <div className="space-y-6">
          {/* Database Connection Status */}
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
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      dbStats?.connected
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {dbStats?.connected
                      ? t('settings.sections.database.connected')
                      : language === 'zh'
                        ? '未连接'
                        : 'Disconnected'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="w-5 h-5" />
                <span>{t('settings.sections.system.title')}</span>
              </CardTitle>
              <CardDescription>
                {language === 'zh'
                  ? '系统版本和部署信息'
                  : 'System version and deployment information'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {t('settings.sections.system.version')}
                  </span>
                </div>
                <span className="text-sm font-medium">{systemInfo?.version || '0.5.0'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {t('settings.sections.system.deployment')}
                  </span>
                </div>
                <span className="text-sm font-medium">{systemInfo?.deployment || 'Vercel'}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {language === 'zh' ? '环境' : 'Environment'}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium capitalize ${
                    systemInfo?.environment === 'production'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  }`}
                >
                  {systemInfo?.environment || 'production'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
