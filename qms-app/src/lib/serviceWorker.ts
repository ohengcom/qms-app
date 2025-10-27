'use client';

interface ServiceWorkerMessage {
  type: string;
  data?: any;
  timestamp?: string;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isOnline = true;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      this.setupOnlineOfflineListeners();
    }
  }

  // Register service worker
  async register(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service Worker registered successfully');

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', this.handleMessage.bind(this));

      // Handle service worker updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is available
              this.emit('update-available', { newWorker });
            }
          });
        }
      });

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  // Unregister service worker
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      this.registration = null;
      console.log('Service Worker unregistered');
      return result;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  // Update service worker
  async update(): Promise<void> {
    if (!this.registration) {
      return;
    }

    try {
      await this.registration.update();
      console.log('Service Worker update check completed');
    } catch (error) {
      console.error('Service Worker update failed:', error);
    }
  }

  // Skip waiting for new service worker
  skipWaiting(): void {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  // Send message to service worker
  postMessage(message: ServiceWorkerMessage): void {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  }

  // Cache dashboard data proactively
  cacheDashboardData(data: any): void {
    this.postMessage({
      type: 'CACHE_DASHBOARD',
      data,
      timestamp: new Date().toISOString(),
    });
  }

  // Clear all caches
  clearCache(): void {
    this.postMessage({
      type: 'CLEAR_CACHE',
      timestamp: new Date().toISOString(),
    });
  }

  // Check if app is online
  isAppOnline(): boolean {
    return this.isOnline;
  }

  // Get service worker registration
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  // Event listener management
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  private handleMessage(event: MessageEvent<ServiceWorkerMessage>): void {
    const { type, data, timestamp } = event.data;

    switch (type) {
      case 'DASHBOARD_SYNCED':
        this.emit('dashboard-synced', { timestamp });
        break;
      
      case 'CACHE_UPDATED':
        this.emit('cache-updated', data);
        break;
      
      default:
        console.log('Unknown service worker message:', type);
    }
  }

  private setupOnlineOfflineListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.emit('online');
      
      // Trigger background sync when back online
      if (this.registration && 'sync' in this.registration) {
        (this.registration as any).sync.register('dashboard-sync');
      }
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('offline');
    });
  }
}

// Singleton instance
const serviceWorkerManager = new ServiceWorkerManager();

export { serviceWorkerManager };

// React hook for service worker functionality
export function useServiceWorker() {
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(true);
  const [updateAvailable, setUpdateAvailable] = React.useState(false);

  React.useEffect(() => {
    // Register service worker
    serviceWorkerManager.register().then(setIsRegistered);

    // Set up event listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleUpdateAvailable = () => setUpdateAvailable(true);

    serviceWorkerManager.on('online', handleOnline);
    serviceWorkerManager.on('offline', handleOffline);
    serviceWorkerManager.on('update-available', handleUpdateAvailable);

    // Initial online status
    setIsOnline(serviceWorkerManager.isAppOnline());

    return () => {
      serviceWorkerManager.off('online', handleOnline);
      serviceWorkerManager.off('offline', handleOffline);
      serviceWorkerManager.off('update-available', handleUpdateAvailable);
    };
  }, []);

  const updateServiceWorker = React.useCallback(() => {
    serviceWorkerManager.skipWaiting();
    setUpdateAvailable(false);
    // Reload page to use new service worker
    window.location.reload();
  }, []);

  const clearCache = React.useCallback(() => {
    serviceWorkerManager.clearCache();
  }, []);

  return {
    isRegistered,
    isOnline,
    updateAvailable,
    updateServiceWorker,
    clearCache,
    cacheDashboardData: serviceWorkerManager.cacheDashboardData.bind(serviceWorkerManager),
  };
}

// Import React for the hook
import React from 'react';