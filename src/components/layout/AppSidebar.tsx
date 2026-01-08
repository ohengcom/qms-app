'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/language-provider';
import { Home, Package, BarChart3, Settings, Calendar, Github, Upload } from 'lucide-react';
import packageJson from '../../../package.json';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

const getNavigation = (t: (key: string) => string) => [
  {
    name: t('navigation.dashboard'),
    href: '/',
    icon: Home,
  },
  {
    name: t('navigation.quilts'),
    href: '/quilts',
    icon: Package,
  },
  {
    name: t('navigation.usage'),
    href: '/usage',
    icon: Calendar,
  },
  {
    name: t('navigation.analytics'),
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: t('navigation.reports'),
    href: '/reports',
    icon: Upload,
  },
  {
    name: t('navigation.settings'),
    href: '/settings',
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const navigation = getNavigation(t);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2 px-2 py-1">
          <Package className="h-6 w-6 text-blue-600 shrink-0" />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold leading-tight">QMS</span>
            <span className="text-xs text-muted-foreground">家庭被子管理系统</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map(item => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                      <Link href={item.href} prefetch={false}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex flex-col items-center gap-2 py-2">
          <span className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            {t('common.version')} {packageJson.version}
          </span>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/ohengcom/qms-app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors group-data-[collapsible=icon]:hidden"
              title="Deployed on Vercel"
            >
              <svg className="h-4 w-4" viewBox="0 0 76 65" fill="currentColor">
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
              </svg>
            </a>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
