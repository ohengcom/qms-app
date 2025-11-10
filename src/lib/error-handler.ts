import { toast } from './toast';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

/**
 * Parse error from various sources
 */
export function parseError(error: unknown): ApiError {
  // Network error
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
      status: 0,
    };
  }

  // HTTP error
  if (error instanceof Response) {
    return {
      message: `HTTP ${error.status}: ${error.statusText}`,
      code: 'HTTP_ERROR',
      status: error.status,
    };
  }

  // Standard Error
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'ERROR',
    };
  }

  // Unknown error
  return {
    message: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
  };
}

/**
 * Handle API errors with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    onRetry?: (attempt: number) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 2, retryDelay = 1000, onRetry } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx)
      const parsedError = parseError(error);
      if (parsedError.status && parsedError.status >= 400 && parsedError.status < 500) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Notify about retry
      if (onRetry) {
        onRetry(attempt + 1);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }

  throw lastError;
}

/**
 * Fetch with error handling and retry
 */
export async function fetchWithErrorHandling<T = any>(
  url: string,
  options?: RequestInit,
  lang: 'zh' | 'en' = 'zh'
): Promise<T> {
  try {
    const response = await withRetry(
      async () => {
        const res = await fetch(url, options);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res;
      },
      {
        maxRetries: 1,
        retryDelay: 1000,
      }
    );

    return await response.json();
  } catch (error) {
    const parsedError = parseError(error);

    // Show user-friendly error message
    const errorMessage =
      lang === 'zh'
        ? parsedError.code === 'NETWORK_ERROR'
          ? '网络连接失败，请检查网络'
          : '操作失败，请重试'
        : parsedError.code === 'NETWORK_ERROR'
          ? 'Network connection failed'
          : 'Operation failed, please try again';

    toast.error(errorMessage, parsedError.message);
    throw error;
  }
}

/**
 * Global error handler for unhandled errors
 */
export function setupGlobalErrorHandler() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', event => {
    const error = parseError(event.reason);
    toast.error('Unexpected error occurred', error.message);
  });

  // Handle global errors
  window.addEventListener('error', event => {
    const error = parseError(event.error);
    toast.error('Unexpected error occurred', error.message);
  });
}

/**
 * Error logging utility (can be extended to send to error tracking service)
 */
export function logError(error: unknown, context?: Record<string, any>) {
  const parsedError = parseError(error);

  // TODO: Send to error tracking service (e.g., Sentry)
  // Sentry.captureException(error, { extra: context });
}
