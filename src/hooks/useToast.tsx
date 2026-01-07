'use client';

import { useState, useCallback, useRef, createContext, useContext } from 'react';
import { X } from 'lucide-react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${++toastIdRef.current}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback(
    (title: string, description?: string, options?: Partial<Toast>) => {
      return addToast({ ...options, title, description, type: 'success' });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, description?: string, options?: Partial<Toast>) => {
      return addToast({
        ...options,
        title,
        description,
        type: 'error',
        duration: options?.duration ?? 8000, // Errors stay longer
      });
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, description?: string, options?: Partial<Toast>) => {
      return addToast({ ...options, title, description, type: 'warning' });
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, description?: string, options?: Partial<Toast>) => {
      return addToast({ ...options, title, description, type: 'info' });
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  };
}

// Global toast context for use across the app
const ToastContext = createContext<ReturnType<typeof useToast> | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}

// Toast container component
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

// Individual toast component
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  }[toast.type];

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  }[toast.type];

  return (
    <div className={`max-w-sm w-full ${bgColor} border rounded-lg shadow-lg p-4 ${textColor}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium">{toast.title}</h4>
          {toast.description && <p className="mt-1 text-sm opacity-90">{toast.description}</p>}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-sm underline hover:no-underline"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="ml-4 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
