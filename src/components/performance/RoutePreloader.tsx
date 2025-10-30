'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RoutePreloaderProps {
  routes?: string[];
}

const DEFAULT_PRELOAD_ROUTES = ['/quilts', '/seasonal', '/usage', '/import', '/export'];

export function RoutePreloader({ routes = DEFAULT_PRELOAD_ROUTES }: RoutePreloaderProps) {
  const router = useRouter();

  useEffect(() => {
    // Preload critical routes after initial page load
    const preloadRoutes = () => {
      routes.forEach(route => {
        router.prefetch(route);
      });
    };

    // Delay preloading to avoid blocking initial page load
    const timer = setTimeout(preloadRoutes, 2000);

    return () => clearTimeout(timer);
  }, [router, routes]);

  // Also preload on user interaction hints
  useEffect(() => {
    const handleMouseEnter = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if target has closest method (is an HTML element)
      if (!target || typeof target.closest !== 'function') {
        return;
      }

      const link = target.closest('a[href]') as HTMLAnchorElement;

      if (link && link.href) {
        try {
          const url = new URL(link.href);
          if (url.origin === window.location.origin) {
            router.prefetch(url.pathname);
          }
        } catch (error) {
          // Invalid URL, ignore
        }
      }
    };

    // Add hover preloading for navigation links
    document.addEventListener('mouseenter', handleMouseEnter, true);

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true);
    };
  }, [router]);

  return null; // This component doesn't render anything
}
