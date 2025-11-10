'use client';

import { useCallback } from 'react';
import { TRPCClientError } from '@trpc/client';

export interface ErrorInfo {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

export function useErrorHandler() {
  const handleError = useCallback((error: unknown): ErrorInfo => {
    // Handle tRPC errors
    if (error instanceof TRPCClientError) {
      return {
        message: error.message,
        code: error.data?.code,
        statusCode: error.data?.httpStatus,
        details: error.data,
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
    if (error instanceof TRPCClientError) {
      return error.data?.httpStatus === undefined || error.data?.httpStatus >= 500;
    }
    return false;
  }, []);

  return {
    handleError,
    getErrorMessage,
    isNetworkError,
  };
}
