'use client';

import { useEffect } from 'react';

export function GlobalErrorHandler() {
  useEffect(() => {
    // Setup global error handlers
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Unhandled promise rejection - handled by error boundary
    };

    const handleError = (event: ErrorEvent) => {
      // Global error - handled by error boundary
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
}
