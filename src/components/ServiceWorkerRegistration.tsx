'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', {
            updateViaCache: 'none',
          })
          .then(registration => {
            // Check for updates every 60 seconds
            setInterval(() => {
              registration.update();
            }, 60000);

            // Handle updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New version available, skip waiting and reload
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                });
              }
            });
          })
          .catch(() => {
            // SW registration failed
          });
      });
    }
  }, []);

  return null;
}
