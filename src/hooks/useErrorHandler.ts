'use client';

import { useCallback } from 'react';

export interface ErrorInfo {
  message: string;
  code?: string;
  statusCode?: number;
  details?: unknown;
}

interface ApiError extends Error {
  code?: string;
  statusCode?: number;
  data?: {
    code?: string;
    httpStatus?: number;
  };
}

export function useErrorHandler() {
  const handleError = useCallback((error: unknown): ErrorInfo => {
    // Handle API errors with code/status
    if (error && typeof error === 'object' && 'message' in error) {
      const apiError = error as ApiError;
      return {
        message: apiError.message,
        code: apiError.code || apiError.data?.code,
        statusCode: apiError.statusCode || apiError.data?.httpStatus,
        details: apiError,
      };
    }

    // Handle standard errors
    if (error instanceof Error) {
      return {
        message: error.message,
        details: error.stack,
      };
    }

    // Handle unknown errors
    return {
      message: 'An unexpected error occurred',
      details: error,
    };
  }, []);

  const getErrorMessage = useCallback(
    (error: unknown): string => {
      const errorInfo = handleError(error);

      // Provide user-friendly messages for common errors
      if (errorInfo.code === 'NOT_FOUND') {
        return 'The requested item was not found';
      }

      if (errorInfo.code === 'UNAUTHORIZED') {
        return 'You are not authorized to perform this action';
      }

      if (errorInfo.code === 'CONFLICT') {
        return 'This action conflicts with existing data';
      }

      if (errorInfo.statusCode === 500) {
        return 'A server error occurred. Please try again later';
      }

      return errorInfo.message || 'An unexpected error occurred';
    },
    [handleError]
  );

  const isNetworkError = useCallback((error: unknown): boolean => {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const apiError = error as ApiError;
      const status = apiError.statusCode || apiError.data?.httpStatus;
      return status === undefined || status >= 500;
    }
    return false;
  }, []);

  return {
    handleError,
    getErrorMessage,
    isNetworkError,
  };
}
