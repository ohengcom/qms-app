'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { CommandPalette } from '@/components/CommandPalette';

/**
 * Conditional Layout Wrapper
 *
 * Excludes AppLayout (and NotificationChecker) for public pages like login
 */
export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages that should not use AppLayout
  const publicPages = ['/login'];

  if (publicPages.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
      <CommandPalette />
    </SidebarProvider>
  );
}
