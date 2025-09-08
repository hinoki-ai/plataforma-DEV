'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  AdaptiveCard,
  AdaptiveCardContent,
  AdaptiveCardHeader,
  AdaptiveCardTitle,
} from './adaptive-card';
import { AdaptiveButton } from './adaptive-button';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  XCircle,
  RefreshCw,
  Home,
  ArrowLeft,
  Bug,
  Wifi,
  Server,
  ShieldAlert,
  FileX,
  Clock,
} from 'lucide-react';

export type ErrorContext = 'public' | 'auth' | 'auto';
export type ErrorType =
  | 'network'
  | 'server'
  | 'client'
  | 'security'
  | 'notfound'
  | 'timeout'
  | 'generic';
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AdaptiveErrorProps {
  /**
   * Context override - auto-detects by default
   */
  context?: ErrorContext;

  /**
   * Error type for specific styling and messaging
   */
  type?: ErrorType;

  /**
   * Error severity level
   */
  severity?: ErrorSeverity;

  /**
   * Error title
   */
  title?: string;

  /**
   * Error message
   */
  message?: string;

  /**
   * Technical error details (shown in auth context)
   */
  technicalDetails?: string;

  /**
   * Show retry button
   */
  showRetry?: boolean;

  /**
   * Show home/back navigation
   */
  showNavigation?: boolean;

  /**
   * Retry callback
   */
  onRetry?: () => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Context-aware error display component
 */
export function AdaptiveError({
  context = 'auto',
  type = 'generic',
  severity = 'medium',
  title,
  message,
  technicalDetails,
  showRetry = true,
  showNavigation = true,
  onRetry,
  className,
}: AdaptiveErrorProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Auto-detect context
  const detectedContext: Exclude<ErrorContext, 'auto'> =
    context !== 'auto'
      ? context
      : session &&
          (pathname?.startsWith('/admin') ||
            pathname?.startsWith('/profesor') ||
            pathname?.startsWith('/parent'))
        ? 'auth'
        : 'public';

  // Error configurations
  const getErrorConfig = () => {
    const baseConfig = {
      network: {
        icon: Wifi,
        defaultTitle: 'Problema de Conexión',
        publicMessage:
          'No podemos conectarnos en este momento. Revisa tu conexión a internet e intenta nuevamente.',
        authMessage:
          'Error de conexión de red. Verifica tu conectividad y reinténtalo.',
        color: 'orange',
      },
      server: {
        icon: Server,
        defaultTitle: 'Error del Servidor',
        publicMessage:
          'Algo salió mal en nuestros servidores. Estamos trabajando para solucionarlo.',
        authMessage:
          'Error interno del servidor. El equipo técnico ha sido notificado.',
        color: 'red',
      },
      client: {
        icon: Bug,
        defaultTitle: 'Error de Aplicación',
        publicMessage:
          'Ocurrió un problema inesperado. Intenta recargar la página.',
        authMessage:
          'Error de aplicación. Revisa la consola para más detalles.',
        color: 'yellow',
      },
      security: {
        icon: ShieldAlert,
        defaultTitle: 'Error de Seguridad',
        publicMessage: 'Por tu seguridad, no pudimos procesar esta solicitud.',
        authMessage: 'Violación de seguridad detectada. Acceso denegado.',
        color: 'red',
      },
      notfound: {
        icon: FileX,
        defaultTitle: 'No Encontrado',
        publicMessage: 'La página que buscas no existe o fue movida.',
        authMessage: 'Recurso no encontrado. Verifica la URL o permisos.',
        color: 'gray',
      },
      timeout: {
        icon: Clock,
        defaultTitle: 'Tiempo Agotado',
        publicMessage: 'La operación tardó demasiado. Intenta nuevamente.',
        authMessage: 'Timeout de operación. Considera optimizar la consulta.',
        color: 'blue',
      },
      generic: {
        icon: AlertTriangle,
        defaultTitle: 'Error',
        publicMessage: 'Algo no salió como esperábamos. Intenta nuevamente.',
        authMessage: 'Ha ocurrido un error. Revisa los detalles técnicos.',
        color: 'gray',
      },
    };

    return baseConfig[type];
  };

  const errorConfig = getErrorConfig();
  const ErrorIcon = errorConfig.icon;

  // Severity-based styling
  const getSeverityStyles = () => {
    const severityConfig = {
      low: {
        border:
          detectedContext === 'public'
            ? 'border-yellow-500/30'
            : 'border-yellow-200',
        bg: detectedContext === 'public' ? 'bg-yellow-500/10' : 'bg-yellow-50',
        icon:
          detectedContext === 'public' ? 'text-yellow-300' : 'text-yellow-600',
        text:
          detectedContext === 'public' ? 'text-yellow-200' : 'text-yellow-800',
      },
      medium: {
        border:
          detectedContext === 'public'
            ? 'border-orange-500/30'
            : 'border-orange-200',
        bg: detectedContext === 'public' ? 'bg-orange-500/10' : 'bg-orange-50',
        icon:
          detectedContext === 'public' ? 'text-orange-300' : 'text-orange-600',
        text:
          detectedContext === 'public' ? 'text-orange-200' : 'text-orange-800',
      },
      high: {
        border:
          detectedContext === 'public' ? 'border-red-500/30' : 'border-red-200',
        bg: detectedContext === 'public' ? 'bg-red-500/10' : 'bg-red-50',
        icon: detectedContext === 'public' ? 'text-red-300' : 'text-red-600',
        text: detectedContext === 'public' ? 'text-red-200' : 'text-red-800',
      },
      critical: {
        border:
          detectedContext === 'public' ? 'border-red-600/50' : 'border-red-300',
        bg: detectedContext === 'public' ? 'bg-red-600/20' : 'bg-red-100',
        icon: detectedContext === 'public' ? 'text-red-200' : 'text-red-700',
        text: detectedContext === 'public' ? 'text-red-100' : 'text-red-900',
      },
    };

    return severityConfig[severity];
  };

  const severityStyles = getSeverityStyles();

  // Default messages
  const displayTitle = title || errorConfig.defaultTitle;
  const displayMessage =
    message ||
    (detectedContext === 'public'
      ? errorConfig.publicMessage
      : errorConfig.authMessage);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = detectedContext === 'public' ? '/' : '/dashboard';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <AdaptiveCard
      variant={detectedContext}
      className={cn(
        'border-l-4',
        severityStyles.border,
        severityStyles.bg,
        className
      )}
    >
      <AdaptiveCardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Error icon */}
          <div
            className={cn(
              'p-3 rounded-lg',
              detectedContext === 'public'
                ? 'bg-white/10 backdrop-blur-sm'
                : 'bg-background border border-border'
            )}
          >
            <ErrorIcon className={cn('w-6 h-6', severityStyles.icon)} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3
              className={cn(
                'text-lg font-semibold mb-2',
                detectedContext === 'public' ? 'text-white' : 'text-foreground'
              )}
            >
              {displayTitle}
            </h3>

            {/* Message */}
            <p
              className={cn(
                'text-sm leading-relaxed mb-4',
                detectedContext === 'public'
                  ? 'text-gray-200'
                  : 'text-muted-foreground'
              )}
            >
              {displayMessage}
            </p>

            {/* Technical details (auth context only) */}
            {detectedContext === 'auth' && technicalDetails && (
              <details className="mb-4">
                <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground mb-2">
                  Detalles técnicos
                </summary>
                <pre
                  className={cn(
                    'text-xs p-3 rounded bg-muted overflow-x-auto',
                    'border border-border font-mono'
                  )}
                >
                  {technicalDetails}
                </pre>
              </details>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {showRetry && (
                <AdaptiveButton
                  variant="default"
                  size="sm"
                  onClick={handleRetry}
                  enhancement={
                    detectedContext === 'public' ? 'gradient' : 'minimal'
                  }
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reintentar
                </AdaptiveButton>
              )}

              {showNavigation && (
                <>
                  <AdaptiveButton
                    variant="outline"
                    size="sm"
                    onClick={handleGoBack}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver
                  </AdaptiveButton>

                  <AdaptiveButton
                    variant="ghost"
                    size="sm"
                    onClick={handleGoHome}
                    className="flex items-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    Inicio
                  </AdaptiveButton>
                </>
              )}
            </div>
          </div>
        </div>
      </AdaptiveCardContent>
    </AdaptiveCard>
  );
}

/**
 * Network error component
 */
export function NetworkError(props: Omit<AdaptiveErrorProps, 'type'>) {
  return <AdaptiveError {...props} type="network" />;
}

/**
 * Server error component
 */
export function ServerError(props: Omit<AdaptiveErrorProps, 'type'>) {
  return <AdaptiveError {...props} type="server" severity="high" />;
}

/**
 * Not found error component
 */
export function NotFoundError(props: Omit<AdaptiveErrorProps, 'type'>) {
  return <AdaptiveError {...props} type="notfound" />;
}

/**
 * Generic error boundary fallback
 */
export function ErrorBoundaryFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
  return (
    <AdaptiveError
      type="client"
      severity="high"
      title="Error de Aplicación"
      message="La aplicación encontró un error inesperado."
      technicalDetails={error.message}
      onRetry={resetError}
      showRetry
      showNavigation
    />
  );
}

export default AdaptiveError;
