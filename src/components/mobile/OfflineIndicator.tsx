'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TouchButton } from '@/components/ui/touch-friendly';
import { WifiOff, Wifi, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);

      if (!online && !showOfflineMessage) {
        setShowOfflineMessage(true);
      } else if (online && showOfflineMessage) {
        // Show brief "back online" message
        setTimeout(() => {
          setShowOfflineMessage(false);
        }, 2000);
      }
    };

    // Set initial status
    updateOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [showOfflineMessage]);

  const handleRetry = async () => {
    setIsRetrying(true);

    try {
      // Try to fetch a small resource to test connectivity
      const response = await fetch('/manifest.json', {
        cache: 'no-cache',
        method: 'HEAD',
      });

      if (response.ok) {
        setIsOnline(true);
        setShowOfflineMessage(false);
      }
    } catch (error) {
      console.log('Still offline');
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDismiss = () => {
    setShowOfflineMessage(false);
  };

  // Persistent offline indicator (small)
  if (!isOnline && !showOfflineMessage) {
    return (
      <div className="fixed top-4 right-4 z-50 lg:hidden">
        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs flex items-center space-x-1 shadow-lg">
          <WifiOff className="h-3 w-3" />
          <span>Offline</span>
        </div>
      </div>
    );
  }

  // Full offline message
  if (showOfflineMessage) {
    return (
      <div className="fixed top-4 left-4 right-4 z-50 lg:hidden">
        <Card
          className={cn(
            'shadow-lg border-2',
            isOnline ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className={cn('p-2 rounded-lg', isOnline ? 'bg-green-100' : 'bg-red-100')}>
                {isOnline ? (
                  <Wifi className="h-5 w-5 text-green-600" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    'font-semibold text-sm',
                    isOnline ? 'text-green-900' : 'text-red-900'
                  )}
                >
                  {isOnline ? 'Back Online!' : "You're Offline"}
                </h3>

                <p className={cn('text-xs mt-1', isOnline ? 'text-green-700' : 'text-red-700')}>
                  {isOnline
                    ? 'Your connection has been restored. Data will sync automatically.'
                    : 'Some features may be limited. You can still view cached data.'}
                </p>

                {!isOnline && (
                  <div className="flex space-x-2 mt-3">
                    <TouchButton
                      size="sm"
                      onClick={handleRetry}
                      disabled={isRetrying}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-2 h-8"
                    >
                      {isRetrying ? (
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3 mr-1" />
                      )}
                      Retry
                    </TouchButton>

                    <TouchButton
                      variant="ghost"
                      size="sm"
                      onClick={handleDismiss}
                      className="text-red-600 text-xs px-3 py-2 h-8"
                    >
                      Dismiss
                    </TouchButton>
                  </div>
                )}

                {isOnline && (
                  <TouchButton
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="text-green-600 text-xs px-0 py-2 h-8 mt-2"
                  >
                    Dismiss
                  </TouchButton>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

// Data sync status indicator
interface SyncStatusProps {
  isSyncing?: boolean;
  lastSyncTime?: Date;
  pendingChanges?: number;
}

export function SyncStatusIndicator({
  isSyncing = false,
  lastSyncTime,
  pendingChanges = 0,
}: SyncStatusProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!isSyncing && pendingChanges === 0 && !lastSyncTime) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 z-40 lg:hidden">
      <TouchButton
        variant="ghost"
        size="sm"
        onClick={() => setShowDetails(!showDetails)}
        className={cn(
          'h-10 w-10 p-0 rounded-full shadow-lg',
          isSyncing
            ? 'bg-blue-100 text-blue-600'
            : pendingChanges > 0
              ? 'bg-amber-100 text-amber-600'
              : 'bg-green-100 text-green-600'
        )}
      >
        {isSyncing ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : pendingChanges > 0 ? (
          <AlertCircle className="h-4 w-4" />
        ) : (
          <Wifi className="h-4 w-4" />
        )}
      </TouchButton>

      {showDetails && (
        <Card className="absolute bottom-12 right-0 w-64 shadow-lg">
          <CardContent className="p-3">
            <div className="space-y-2 text-xs">
              {isSyncing && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>Syncing data...</span>
                </div>
              )}

              {pendingChanges > 0 && (
                <div className="flex items-center space-x-2 text-amber-600">
                  <AlertCircle className="h-3 w-3" />
                  <span>{pendingChanges} changes pending sync</span>
                </div>
              )}

              {lastSyncTime && (
                <div className="text-gray-600">Last sync: {lastSyncTime.toLocaleTimeString()}</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
