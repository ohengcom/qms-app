'use client';

import { useEffect } from 'react';
import { PWAInstallPrompt, IOSInstallPrompt } from './PWAInstallPrompt';
import { OfflineIndicator, SyncStatusIndicator } from './OfflineIndicator';
import { useServiceWorker } from '@/lib/serviceWorker';
import { useHapticFeedback } from '@/hooks/useMobileGestures';

interface MobileAppWrapperProps {
  children: React.ReactNode;
}

export function MobileAppWrapper({ children }: MobileAppWrapperProps) {
  const { isRegistered, isOnline, updateAvailable, updateServiceWorker } = useServiceWorker();
  const { success, error } = useHapticFeedback();

  // Handle service worker updates
  useEffect(() => {
    if (updateAvailable) {
      // Show update notification with haptic feedback
      success();

      // Auto-update after a delay (optional)
      const timer = setTimeout(() => {
        updateServiceWorker();
      }, 5000);

      return () => clearTimeout(timer);
    }
    // Return undefined when condition is not met
    return undefined;
  }, [updateAvailable, updateServiceWorker, success]);

  // Handle online/offline status changes with haptic feedback
  useEffect(() => {
    const handleOnline = () => success();
    const handleOffline = () => error();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [success, error]);

  // Prevent zoom on double tap for better UX
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    let lastTouchEnd = 0;
    const preventZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchstart', preventDefault, { passive: false });
    document.addEventListener('touchend', preventZoom, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventDefault);
      document.removeEventListener('touchend', preventZoom);
    };
  }, []);

  // Set viewport height for mobile browsers
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  return (
    <>
      {children}

      {/* Mobile-specific overlays */}
      <div className="lg:hidden">
        <OfflineIndicator />
        <PWAInstallPrompt />
        <IOSInstallPrompt />
        <SyncStatusIndicator isSyncing={false} lastSyncTime={new Date()} pendingChanges={0} />
      </div>

      {/* Update notification */}
      {updateAvailable && (
        <div className="fixed top-4 left-4 right-4 z-50 lg:hidden">
          <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">Update Available</h3>
                <p className="text-blue-100 text-xs mt-1">A new version is ready to install</p>
              </div>
              <button
                onClick={updateServiceWorker}
                className="bg-blue-500 hover:bg-blue-400 px-3 py-1 rounded text-xs font-medium"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
