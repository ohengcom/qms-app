'use client';

import { usePathname } from 'next/navigation';
import { AppLayout } from './AppLayout';

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
  
  return <AppLayout>{children}</AppLayout>;
}
