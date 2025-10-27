'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePerformanceMonitor, usePagePerformance } from '@/hooks/usePerformance';
import { api } from '@/lib/trpc';
import { 
  Activity, 
  Zap, 
  Clock, 
  Database, 
  Wifi,
  RefreshCw,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface PerformanceMonitorProps {
  showDetails?: boolean;
}

export function PerformanceMonitor({ showDetails = false }: PerformanceMonitorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [apiMetrics, setApiMetrics] = useState<{
    averageResponseTime: number;
    slowQueries: number;
    cacheHitRate: number;
    activeConnections: number;
  }>({
    averageResponseTime: 0,
    slowQueries: 0,
    cacheHitRate: 0,
    activeConnections: 0,
  });

  // Monitor component performance
  const componentMetrics = usePerformanceMonitor('PerformanceMonitor');
  const pageMetrics = usePagePerformance('Dashboard');

  // Get cache statistics
  const { data: cacheStats } = api.dashboard.getCacheStats.useQuery(undefined, {
    enabled: showDetails,
    refetchInterval: 5000, // Update every 5 seconds
  });

  // Simulate API performance metrics (in a real app, these would come from monitoring service)
  useEffect(() => {
    const interval = setInterval(() => {
      setApiMetrics({
        averageResponseTime: Math.random() * 200 + 50, // 50-250ms
        slowQueries: Math.floor(Math.random() * 5),
        cacheHitRate: Math.random() * 0.3 + 0.7, // 70-100%
        activeConnections: Math.floor(Math.random() * 10) + 5,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Only show in development or when explicitly requested
  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === 'development' || showDetails);
  }, [showDetails]);

  if (!isVisible) return null;

  const getPerformanceStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return { status: 'good', color: 'bg-green-100 text-green-800' };
    if (value <= thresholds.warning) return { status: 'warning', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'poor', color: 'bg-red-100 text-red-800' };
  };

  const renderTimeStatus = getPerformanceStatus(componentMetrics.renderTime, { good: 16, warning: 50 });
  const apiTimeStatus = getPerformanceStatus(apiMetrics.averageResponseTime, { good: 100, warning: 300 });

  return (
    <Card className="border-dashed border-2 border-gray-300">
      <CardHeader>
        <CardTitle className="flex items-center text-sm">
          <Activity className="mr-2 h-4 w-4" />
          Performance Monitor
          <Badge variant="outline" className="ml-2 text-xs">
            DEV
          </Badge>
        </CardTitle>
        <CardDescription className="text-xs">
          Real-time performance metrics and diagnostics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Render Performance */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Zap className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium">Render Time</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold">{componentMetrics.renderTime}ms</span>
              <Badge className={`text-xs ${renderTimeStatus.color}`}>
                {renderTimeStatus.status}
              </Badge>
            </div>
            <div className="text-xs text-gray-500">
              Mounts: {componentMetrics.componentMounts} | Rerenders: {componentMetrics.rerenders}
            </div>
          </div>

          {/* API Performance */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Database className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium">API Response</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold">{Math.round(apiMetrics.averageResponseTime)}ms</span>
              <Badge className={`text-xs ${apiTimeStatus.color}`}>
                {apiTimeStatus.status}
              </Badge>
            </div>
            <div className="text-xs text-gray-500">
              Slow queries: {apiMetrics.slowQueries}
            </div>
          </div>

          {/* Cache Performance */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3 text-purple-600" />
              <span className="text-xs font-medium">Cache</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold">
                {Math.round((cacheStats?.hitRate || apiMetrics.cacheHitRate) * 100)}%
              </span>
              <Badge className="text-xs bg-purple-100 text-purple-800">
                hit rate
              </Badge>
            </div>
            <div className="text-xs text-gray-500">
              Entries: {cacheStats?.activeEntries || 'N/A'}
            </div>
          </div>

          {/* Page Performance */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-3 w-3 text-orange-600" />
              <span className="text-xs font-medium">Page Load</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold">
                {pageMetrics?.loadTime ? Math.round(pageMetrics.loadTime) : 'N/A'}ms
              </span>
              <Badge className="text-xs bg-orange-100 text-orange-800">
                load
              </Badge>
            </div>
            <div className="text-xs text-gray-500">
              FCP: {pageMetrics?.firstContentfulPaint ? Math.round(pageMetrics.firstContentfulPaint) : 'N/A'}ms
            </div>
          </div>
        </div>

        {/* Performance Warnings */}
        {(componentMetrics.renderTime > 50 || apiMetrics.averageResponseTime > 300 || apiMetrics.slowQueries > 2) && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">Performance Warnings</p>
                <div className="text-xs text-yellow-700 mt-1 space-y-1">
                  {componentMetrics.renderTime > 50 && (
                    <p>• Slow render detected ({componentMetrics.renderTime}ms)</p>
                  )}
                  {apiMetrics.averageResponseTime > 300 && (
                    <p>• High API response time ({Math.round(apiMetrics.averageResponseTime)}ms)</p>
                  )}
                  {apiMetrics.slowQueries > 2 && (
                    <p>• Multiple slow queries detected ({apiMetrics.slowQueries})</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Memory Usage (if available) */}
        {componentMetrics.memoryUsage && (
          <div className="mt-4 text-xs text-gray-500">
            Memory: {Math.round(componentMetrics.memoryUsage / 1024 / 1024)}MB
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-4 flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
            className="text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              if ('performance' in window && 'clearMarks' in performance) {
                performance.clearMarks();
                performance.clearMeasures();
              }
            }}
            className="text-xs"
          >
            Clear Metrics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}