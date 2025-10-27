'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  Bell,
  Clock,
  Zap
} from 'lucide-react';

interface Alert {
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp?: Date;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

interface DashboardAlertsProps {
  alerts: Alert[];
  isLoading?: boolean;
  onDismissAll?: () => void;
}

export function DashboardAlerts({ alerts, isLoading = false, onDismissAll }: DashboardAlertsProps) {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
            System Status
          </CardTitle>
          <CardDescription>
            All systems are running smoothly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No alerts or notifications</p>
            <p className="text-xs text-gray-400 mt-1">Your quilt management system is operating normally</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getPriorityBadge = (priority: Alert['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High</Badge>;
      case 'medium':
        return <Badge variant="default" className="text-xs">Medium</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Low</Badge>;
    }
  };

  const formatTimestamp = (timestamp?: Date) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return timestamp.toLocaleDateString();
  };

  // Sort alerts by priority and timestamp
  const sortedAlerts = [...alerts].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    
    if (priorityDiff !== 0) return priorityDiff;
    
    const aTime = a.timestamp?.getTime() || 0;
    const bTime = b.timestamp?.getTime() || 0;
    return bTime - aTime;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Alerts & Notifications
            {alerts.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {alerts.length}
              </Badge>
            )}
          </div>
          {alerts.length > 1 && (
            <Button variant="ghost" size="sm" onClick={onDismissAll}>
              <X className="h-4 w-4 mr-1" />
              Dismiss All
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Important notifications and system alerts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedAlerts.slice(0, 5).map((alert, index) => (
            <div
              key={index}
              className={cn(
                "p-4 rounded-lg border-2 transition-all duration-200",
                getAlertStyles(alert.type)
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {alert.message}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getPriorityBadge(alert.priority)}
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimestamp(alert.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {alert.actionLabel && alert.onAction && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={alert.onAction}
                    >
                      {alert.actionLabel}
                    </Button>
                  )}
                  {alert.onDismiss && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={alert.onDismiss}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {alerts.length > 5 && (
            <div className="text-center pt-2 border-t border-gray-100">
              <Button variant="ghost" size="sm" className="text-xs">
                View All {alerts.length} Alerts
                <Zap className="ml-2 h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}