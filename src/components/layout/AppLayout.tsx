'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useLanguage } from '@/lib/language-provider';
import { useNotificationStore } from '@/lib/notification-store';
import { NotificationPanel } from '@/components/NotificationPanel';
import {
  Home,
  Package,
  BarChart3,
  Settings,
  Menu,
  Search,
  Bell,
  User,
  Calendar,
  FileText,
} from 'lucide-react';

const getNavigation = (t: (key: string) => string) => [
  {
    name: t('navigation.dashboard'),
    href: '/',
    icon: Home,
    description: t('dashboardSpecific.overviewAndStats'),
  },
  {
    name: t('navigation.quilts'),
    href: '/quilts',
    icon: Package,
    description: t('dashboardSpecific.manageCollection'),
  },
  {
    name: t('navigation.usage'),
    href: '/usage',
    icon: Calendar,
    description: t('dashboardSpecific.trackUsagePeriods'),
  },
  {
    name: t('navigation.analytics'),
    href: '/analytics',
    icon: BarChart3,
    description: t('dashboardSpecific.usageInsightsAndTrends'),
  },

  {
    name: t('navigation.reports'),
    href: '/reports',
    icon: FileText,
    description: t('dashboardSpecific.exportAndReporting'),
  },
  {
    name: t('navigation.settings'),
    href: '/settings',
    icon: Settings,
    description: t('dashboardSpecific.appConfiguration'),
  },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();
  const unreadCount = useNotificationStore(state => state.getUnreadCount());

  const navigation = getNavigation(t);

  return (
    <div>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">{t('common.openSidebar')}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center border-b px-6">
                <Link href="/" className="flex items-center space-x-2">
                  <Package className="h-6 w-6 text-blue-600" />
                  <span className="text-sm font-semibold leading-tight">
                    QMS
                    <br />
                    家庭被子管理系统
                  </span>
                </Link>
              </div>
              <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map(item => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'mr-3 h-5 w-5 flex-shrink-0',
                          isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        )}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              {/* Version display */}
              <div className="flex-shrink-0 border-t border-gray-200 p-4">
                <div className="text-center">
                  <p className="text-xs text-gray-400">
                    Version {process.env.NEXT_PUBLIC_APP_VERSION || '0.5.0'}
                  </p>
                  <p className="text-xs text-gray-300 mt-1">
                    {new Date().toISOString().split('T')[0]}
                  </p>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex flex-col flex-grow border-r border-gray-200 bg-white pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-6">
              <Link href="/" className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-base font-bold text-gray-900 leading-tight">
                    QMS
                    <br />
                    家庭被子管理系统
                  </h1>
                </div>
              </Link>
            </div>
            <nav className="mt-8 flex-1 space-y-1 px-3">
              {navigation.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      )}
                    />
                    <div>
                      <div>{item.name}</div>
                      <div className="text-xs text-gray-500 group-hover:text-gray-600">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>
            {/* Version display */}
            <div className="flex-shrink-0 border-t border-gray-200 p-4">
              <div className="text-center">
                <p className="text-xs text-gray-400">
                  {t('common.version')} {process.env.NEXT_PUBLIC_APP_VERSION || '0.5.0'}
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  {new Date().toISOString().split('T')[0]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top header */}
          <header className="sticky top-0 z-40 flex h-16 flex-shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">{t('common.openSidebar')}</span>
            </Button>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-200 lg:hidden" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              {/* Search */}
              <div className="relative flex flex-1 items-center">
                <div className="relative w-full max-w-md">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="search"
                    placeholder={t('quilts.actions.search')}
                    className="block w-full rounded-md border-0 bg-gray-50 py-1.5 pl-10 pr-3 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 sm:text-sm"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const searchTerm = (e.target as HTMLInputElement).value;
                        if (searchTerm.trim()) {
                          window.location.href = `/quilts?search=${encodeURIComponent(searchTerm)}`;
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative"
                  onClick={() => setNotificationPanelOpen(true)}
                  title={t('common.viewNotifications')}
                >
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">{t('common.viewNotifications')}</span>
                  {/* Notification badge - only show if there are unread notifications */}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>

                {/* Separator */}
                <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

                {/* Logout */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={async () => {
                    // eslint-disable-next-line no-alert
                    if (confirm(t('auth.logoutConfirm'))) {
                      try {
                        await fetch('/api/auth/logout', { method: 'POST' });
                        window.location.href = '/login';
                      } catch (error) {
                        console.error('Logout error:', error);
                        // eslint-disable-next-line no-alert
                        alert(t('common.failedToLogout'));
                      }
                    }
                  }}
                  title={t('auth.logout')}
                >
                  <User className="h-5 w-5" />
                  <span className="hidden lg:block text-sm font-medium">{t('auth.logout')}</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="py-6">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>

      {/* Notification Panel */}
      {notificationPanelOpen && (
        <NotificationPanel onClose={() => setNotificationPanelOpen(false)} />
      )}
    </div>
  );
}
