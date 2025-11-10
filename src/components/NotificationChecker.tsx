/**
 * Notification Checker Component
 * 
 * Runs notification checks periodically:
 * - On app startup
 * - Every hour while app is open
 */

'use client';

import { useEffect, useRef } from 'react';
import { api } from '@/lib/trpc';

const CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

export function NotificationChecker() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasRunInitialCheck = useRef(false);

  // tRPC mutation to trigger notification checks
  const checkNotifications = api.notifications.checkAll.useMutation({
    onSuccess: (data: any) => {
      console.log('Notification check completed:', data);
      if (data.total > 0) {
        console.log(`Created ${data.total} new notifications`);
      }
    },
    onError: (error: any) => {
      console.error('Notification check failed:', error);
    },
  });

  useEffect(() => {
    // Run initial check on mount (only once)
    if (!hasRunInitialCheck.current) {
      console.log('Running initial notification check...');
      checkNotifications.mutate();
      hasRunInitialCheck.current = true;
    }

    // Set up periodic checks
    intervalRef.current = setInterval(() => {
      console.log('Running periodic notification check...');
      checkNotifications.mutate();
    }, CHECK_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Empty dependency array - only run once on mount

  // This component doesn't render anything
  return null;
}
