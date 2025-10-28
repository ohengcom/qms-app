'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Menu,
  Home,
  Package,
  Calendar,
  BarChart3,
  Upload,
  Download,
  X,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  description?: string;
}

const navigationItems: NavigationItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: Home,
    description: 'Overview and statistics',
  },
  {
    href: '/quilts',
    label: 'Quilts',
    icon: Package,
    description: 'Manage your collection',
  },
  {
    href: '/usage',
    label: 'Usage Tracking',
    icon: Calendar,
    description: 'Track quilt usage',
  },
  {
    href: '/seasonal',
    label: 'Seasonal Analysis',
    icon: BarChart3,
    description: 'Seasonal insights',
  },
  {
    href: '/import',
    label: 'Import Data',
    icon: Upload,
    description: 'Import from Excel',
  },
  {
    href: '/export',
    label: 'Export Data',
    icon: Download,
    description: 'Export to Excel',
  },
];

interface MobileNavigationProps {
  className?: string;
}

export function MobileNavigation({ className }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const closeSheet = () => setIsOpen(false);

  return (
    <div className={cn('lg:hidden', className)}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="h-12 w-12 p-0">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-lg font-semibold">QMS</h2>
                <p className="text-sm text-gray-600">Quilt Management System</p>
              </div>
              <Button variant="ghost" size="sm" onClick={closeSheet} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-2">
                {navigationItems.map(item => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href as any}
                      onClick={closeSheet}
                      className={cn(
                        'flex items-center justify-between p-4 rounded-lg transition-colors group hover:bg-gray-100 active:bg-gray-200',
                        isActive && 'bg-blue-50 border border-blue-200'
                      )}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={cn(
                            'p-2 rounded-md',
                            isActive
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p
                            className={cn(
                              'font-medium',
                              isActive ? 'text-blue-900' : 'text-gray-900'
                            )}
                          >
                            {item.label}
                          </p>
                          {item.description && (
                            <p className="text-sm text-gray-500">{item.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                        <ChevronRight
                          className={cn(
                            'h-4 w-4 transition-colors',
                            isActive ? 'text-blue-600' : 'text-gray-400'
                          )}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">All systems operational</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  v1.0.0
                </Badge>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Bottom navigation for mobile
export function MobileBottomNavigation() {
  const pathname = usePathname();

  const bottomNavItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/quilts', label: 'Quilts', icon: Package },
    { href: '/usage', label: 'Usage', icon: Calendar },
    { href: '/seasonal', label: 'Analysis', icon: BarChart3 },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <nav className="flex">
        {bottomNavItems.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href as any}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-3 px-2 text-xs transition-colors',
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100'
              )}
            >
              <Icon className={cn('h-5 w-5 mb-1', isActive ? 'text-blue-600' : 'text-gray-600')} />
              <span className={cn('font-medium', isActive ? 'text-blue-600' : 'text-gray-600')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

// Mobile-optimized header
interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function MobileHeader({
  title,
  subtitle,
  actions,
  showBackButton = false,
  onBack,
}: MobileHeaderProps) {
  return (
    <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <Button variant="ghost" size="sm" onClick={onBack} className="h-10 w-10 p-0">
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
          )}
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
        </div>

        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
    </header>
  );
}
