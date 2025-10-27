'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TouchButton } from '@/components/ui/touch-friendly';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      
      // Check for iOS standalone mode
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    checkInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay if not dismissed before
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed && !isInstalled) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installation accepted');
      } else {
        console.log('PWA installation dismissed');
      }
    } catch (error) {
      console.error('PWA installation failed:', error);
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 lg:hidden">
      <Card className="border-blue-200 bg-blue-50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Smartphone className="h-6 w-6 text-blue-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-blue-900 text-sm">
                Install QMS App
              </h3>
              <p className="text-blue-700 text-xs mt-1">
                Add to your home screen for quick access and offline use
              </p>
              
              <div className="flex space-x-2 mt-3">
                <TouchButton
                  size="sm"
                  onClick={handleInstall}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 h-8"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Install
                </TouchButton>
                
                <TouchButton
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-blue-600 text-xs px-3 py-2 h-8"
                >
                  Not now
                </TouchButton>
              </div>
            </div>
            
            <TouchButton
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0 text-blue-600"
            >
              <X className="h-4 w-4" />
            </TouchButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// iOS-specific install instructions
export function IOSInstallPrompt() {
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = (window.navigator as any).standalone;
    const hasBeenDismissed = localStorage.getItem('ios-install-dismissed');

    if (isIOS && !isInStandaloneMode && !hasBeenDismissed) {
      // Show iOS prompt after a delay
      setTimeout(() => {
        setShowIOSPrompt(true);
      }, 5000);
    }
  }, []);

  const handleDismiss = () => {
    setShowIOSPrompt(false);
    localStorage.setItem('ios-install-dismissed', 'true');
  };

  if (!showIOSPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 lg:hidden">
      <Card className="border-blue-200 bg-blue-50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Smartphone className="h-6 w-6 text-blue-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-blue-900 text-sm">
                Add to Home Screen
              </h3>
              <p className="text-blue-700 text-xs mt-1">
                Tap the share button <span className="font-mono">⬆️</span> and select "Add to Home Screen"
              </p>
              
              <TouchButton
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-blue-600 text-xs px-0 py-2 h-8 mt-2"
              >
                Got it
              </TouchButton>
            </div>
            
            <TouchButton
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0 text-blue-600"
            >
              <X className="h-4 w-4" />
            </TouchButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}