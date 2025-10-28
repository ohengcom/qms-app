'use client';

import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentMounts: number;
  rerenders: number;
  memoryUsage?: number;
}

/**
 * Hook to monitor component performance
 */
export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(Date.now());
  const mountCount = useRef<number>(0);
  const rerenderCount = useRef<number>(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentMounts: 0,
    rerenders: 0,
  });

  useEffect(() => {
    mountCount.current += 1;

    // Measure render time
    const renderTime = Date.now() - renderStartTime.current;

    // Get memory usage if available
    const memoryUsage = (performance as any).memory?.usedJSHeapSize;

    setMetrics({
      renderTime,
      componentMounts: mountCount.current,
      rerenders: rerenderCount.current,
      memoryUsage,
    });

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}:`, {
        renderTime: `${renderTime}ms`,
        mounts: mountCount.current,
        rerenders: rerenderCount.current,
        memory: memoryUsage ? `${Math.round(memoryUsage / 1024 / 1024)}MB` : 'N/A',
      });
    }
  });

  useEffect(() => {
    rerenderCount.current += 1;
    renderStartTime.current = Date.now();
  });

  return metrics;
}

/**
 * Hook to measure and log API call performance
 */
export function useApiPerformance() {
  const measureApiCall = async <T>(
    apiCall: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const startTime = performance.now();

    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API Performance] ${operationName}: ${duration.toFixed(2)}ms`);
      }

      // Send to analytics in production (if configured)
      if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
        // Example: Send to analytics service
        // analytics.track('api_performance', {
        //   operation: operationName,
        //   duration,
        //   timestamp: Date.now(),
        // });
      }

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.error(
        `[API Performance] ${operationName} failed after ${duration.toFixed(2)}ms:`,
        error
      );
      throw error;
    }
  };

  return { measureApiCall };
}

/**
 * Hook to monitor page load performance
 */
export function usePagePerformance(pageName: string) {
  const [metrics, setMetrics] = useState<{
    loadTime: number;
    domContentLoaded: number;
    firstContentfulPaint?: number;
    largestContentfulPaint?: number;
  } | null>(null);

  useEffect(() => {
    const measurePerformance = () => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        const domContentLoaded =
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;

        let firstContentfulPaint: number | undefined;
        let largestContentfulPaint: number | undefined;

        // Get paint metrics if available
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          firstContentfulPaint = fcpEntry.startTime;
        }

        // Get LCP if available
        if ('PerformanceObserver' in window) {
          try {
            const observer = new PerformanceObserver(list => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1];
              if (lastEntry) {
                largestContentfulPaint = lastEntry.startTime;
              }
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
          } catch (e) {
            // LCP not supported
          }
        }

        const pageMetrics = {
          loadTime,
          domContentLoaded,
          firstContentfulPaint,
          largestContentfulPaint,
        };

        setMetrics(pageMetrics);

        // Log in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Page Performance] ${pageName}:`, {
            loadTime: `${loadTime.toFixed(2)}ms`,
            domContentLoaded: `${domContentLoaded.toFixed(2)}ms`,
            fcp: firstContentfulPaint ? `${firstContentfulPaint.toFixed(2)}ms` : 'N/A',
            lcp: largestContentfulPaint ? `${largestContentfulPaint.toFixed(2)}ms` : 'N/A',
          });
        }
      }
    };

    // Measure after page load
    if (document.readyState === 'complete') {
      measurePerformance();
      return undefined;
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, [pageName]);

  return metrics;
}

/**
 * Hook to detect slow renders and memory leaks
 */
export function usePerformanceWarnings(
  componentName: string,
  thresholds = {
    slowRenderMs: 16, // 60fps = 16.67ms per frame
    memoryLeakMB: 50,
  }
) {
  const renderTimes = useRef<number[]>([]);
  const initialMemory = useRef<number | null>(null);

  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const renderTime = performance.now() - startTime;
      renderTimes.current.push(renderTime);

      // Keep only last 10 render times
      if (renderTimes.current.length > 10) {
        renderTimes.current = renderTimes.current.slice(-10);
      }

      // Check for slow renders
      if (renderTime > thresholds.slowRenderMs) {
        console.warn(
          `[Performance Warning] ${componentName} slow render: ${renderTime.toFixed(2)}ms`
        );
      }

      // Check memory usage
      const currentMemory = (performance as any).memory?.usedJSHeapSize;
      if (currentMemory) {
        if (initialMemory.current === null) {
          initialMemory.current = currentMemory;
        } else {
          const memoryIncrease = (currentMemory - initialMemory.current) / 1024 / 1024;
          if (memoryIncrease > thresholds.memoryLeakMB) {
            console.warn(
              `[Performance Warning] ${componentName} potential memory leak: +${memoryIncrease.toFixed(2)}MB`
            );
          }
        }
      }
    };
  });

  // Calculate average render time
  const averageRenderTime =
    renderTimes.current.length > 0
      ? renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length
      : 0;

  return {
    averageRenderTime,
    recentRenderTimes: renderTimes.current,
  };
}
