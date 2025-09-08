'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNetworkStatus, useNetworkErrorHandler } from '@/hooks/useNetworkStatus';
import { errorTracker } from '@/lib/error-tracking';
import { ContactIcons } from '@/components/icons/hero-icons';
import { ClockIcon } from '@heroicons/react/24/outline';

interface NetworkErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onRetry?: () => void;
  showOfflineIndicator?: boolean;
  className?: string;
}

interface NetworkErrorState {
  hasNetworkError: boolean;
  errorType: 'offline' | 'slow_connection' | 'network_error' | 'timeout' | 'server_unavailable' | 'unknown';
  message: string;
  retryable: boolean;
}

export function NetworkErrorBoundary({
  children,
  fallback,
  onRetry,
  showOfflineIndicator = true,
  className,
}: NetworkErrorBoundaryProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { isOnline, isSlowConnection } = useNetworkStatus();
  const { handleNetworkError } = useNetworkErrorHandler();
  const router = useRouter();
  const [networkError, setNetworkError] = useState<NetworkErrorState>({
    hasNetworkError: false,
    errorType: 'unknown',
    message: '',
    retryable: false,
  });

  // Handle network status changes
  useEffect(() => {
    if (!isOnline) {
      errorTracker.trackError('network_offline', new Error('Network connection lost'), {
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      });

      setNetworkError({
        hasNetworkError: true,
        errorType: 'offline',
        message: 'No hay conexión a internet. Verifica tu conexión e intenta nuevamente.',
        retryable: true,
      });
    } else if (networkError.hasNetworkError && networkError.errorType === 'offline') {
      // Track when connection is restored
      errorTracker.trackUserFeedback('network_restored', {
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      });

      // Clear offline error when back online
      setNetworkError({
        hasNetworkError: false,
        errorType: 'unknown',
        message: '',
        retryable: false,
      });
    }
  }, [isOnline, networkError.hasNetworkError, networkError.errorType]);

  // Global error handler for network errors
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      if (event.error) {
        const networkErrorInfo = handleNetworkError(event.error);
        if (networkErrorInfo.type !== 'unknown') {
          errorTracker.trackError('network_error_detected', event.error, {
            errorType: networkErrorInfo.type,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            timestamp: new Date().toISOString(),
          });

          setNetworkError({
            hasNetworkError: true,
            errorType: networkErrorInfo.type as any,
            message: networkErrorInfo.message,
            retryable: networkErrorInfo.retryable,
          });
        }
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const networkErrorInfo = handleNetworkError(event.reason);
      if (networkErrorInfo.type !== 'unknown') {
        errorTracker.trackError('unhandled_promise_rejection', event.reason instanceof Error ? event.reason : new Error(String(event.reason)), {
          reason: event.reason,
          errorType: networkErrorInfo.type,
          timestamp: new Date().toISOString(),
        });

        setNetworkError({
          hasNetworkError: true,
          errorType: networkErrorInfo.type as any,
          message: networkErrorInfo.message,
          retryable: networkErrorInfo.retryable,
        });
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [handleNetworkError]);

  const handleRetry = () => {
    errorTracker.trackUserFeedback('network_error_retry', {
      errorType: networkError.errorType,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    });

    setNetworkError({
      hasNetworkError: false,
      errorType: 'unknown',
      message: '',
      retryable: false,
    });
    onRetry?.();
  };

  // Show offline indicator if enabled and offline (only after mounting)
  if (isMounted && showOfflineIndicator && !isOnline) {
    // For authentication pages, don't throw errors - just show a warning
    if (typeof window !== 'undefined' && window.location.pathname?.includes('/login')) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-yellow-600 mb-4">
              Sin Conexión
            </h1>
            <p className="text-gray-600 mb-4">
              No tienes conexión a internet. Verifica tu conexión e intenta nuevamente.
            </p>
            <p className="text-sm text-gray-500">
              Puedes intentar iniciar sesión sin conexión a internet.
            </p>
          </div>
        </div>
      );
    }
    // Redirect to unified error page instead of showing custom UI
    const offlineError = new Error('Sin conexión a internet. No tienes conexión a internet. Algunas funciones pueden no estar disponibles.');
    offlineError.name = 'NetworkError';
    throw offlineError;
  }

  // Show slow connection warning (only after mounting)
  if (isMounted && showOfflineIndicator && isSlowConnection && isOnline) {
    return (
      <div className="relative">
        {/* Slow connection banner */}
        <div className="bg-yellow-100 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2">
          <div className="flex items-center justify-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
            <ClockIcon className="w-4 h-4" />
            <span>Conexión lenta detectada - El rendimiento puede verse afectado</span>
          </div>
        </div>

        {/* Main content */}
        <div className={className}>
          {children}
        </div>
      </div>
    );
  }

  // Show network error if present
  if (networkError.hasNetworkError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // For authentication pages, don't throw errors - just show a warning
    if (typeof window !== 'undefined' && (window.location.pathname?.includes('/login') || window.location.pathname?.includes('/auth-success'))) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-orange-600 mb-4">
              Error de Conexión
            </h1>
            <p className="text-gray-600 mb-4">
              {networkError.message}
            </p>
            <p className="text-sm text-gray-500">
              Puedes intentar continuar con el proceso de autenticación.
            </p>
          </div>
        </div>
      );
    }

    // Redirect to unified error page instead of showing custom UI
    const networkErrorObj = new Error(networkError.message);
    networkErrorObj.name = 'NetworkError';
    throw networkErrorObj;
  }

  return <>{children}</>;
}

// Hook for manual network error handling in components
export function useNetworkError() {
  const [networkError, setNetworkError] = useState<NetworkErrorState>({
    hasNetworkError: false,
    errorType: 'unknown',
    message: '',
    retryable: false,
  });

  const { handleNetworkError } = useNetworkErrorHandler();

  const setNetworkErrorFromException = (error: any) => {
    const networkErrorInfo = handleNetworkError(error);
    setNetworkError({
      hasNetworkError: true,
      errorType: networkErrorInfo.type as any,
      message: networkErrorInfo.message,
      retryable: networkErrorInfo.retryable,
    });
  };

  const clearNetworkError = () => {
    setNetworkError({
      hasNetworkError: false,
      errorType: 'unknown',
      message: '',
      retryable: false,
    });
  };

  return {
    networkError,
    setNetworkError: setNetworkErrorFromException,
    clearNetworkError,
  };
}