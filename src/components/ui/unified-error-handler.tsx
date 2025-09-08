'use client';

// =====================================================
// 🛡️ UNIFIED ERROR HANDLING SYSTEM
// =====================================================
// Replaces inconsistent error handling patterns with
// standardized error display and recovery mechanisms

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  RefreshCw, 
  Home, 
  Wifi, 
  Database, 
  Shield, 
  Zap,
  Bug,
  Clock,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Error type classification
export type ErrorType = 
  | 'network' 
  | 'database' 
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'server'
  | 'client'
  | 'unknown';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorInfo {
  type?: ErrorType;
  severity?: ErrorSeverity;
  code?: string | number;
  message: string;
  details?: string;
  context?: string;
  timestamp?: Date;
  canRetry?: boolean;
  canGoHome?: boolean;
  showDetails?: boolean;
  customActions?: ErrorAction[];
}

export interface ErrorAction {
  label: string;
  action: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  icon?: React.ComponentType<{ className?: string }>;
}

// Error configuration map
const ERROR_CONFIGS: Record<ErrorType, {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  title: string;
  defaultMessage: string;
  suggestions: string[];
}> = {
  network: {
    icon: Wifi,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    title: 'Problema de Conexión',
    defaultMessage: 'No se pudo conectar al servidor',
    suggestions: [
      'Verifica tu conexión a internet',
      'Intenta recargar la página',
      'Comprueba si el servidor está disponible',
    ],
  },
  database: {
    icon: Database,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    title: 'Error de Base de Datos',
    defaultMessage: 'Problema al acceder a los datos',
    suggestions: [
      'Los datos temporalmente no están disponibles',
      'Intenta nuevamente en unos momentos',
      'Contacta soporte si persiste',
    ],
  },
  authentication: {
    icon: Shield,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    title: 'Sesión Expirada',
    defaultMessage: 'Necesitas iniciar sesión nuevamente',
    suggestions: [
      'Tu sesión ha expirado por seguridad',
      'Inicia sesión para continuar',
      'Los datos se conservarán',
    ],
  },
  authorization: {
    icon: Shield,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    title: 'Acceso Denegado',
    defaultMessage: 'No tienes permisos para esta acción',
    suggestions: [
      'Tu rol no permite esta operación',
      'Contacta al administrador si necesitas acceso',
      'Regresa a tu panel principal',
    ],
  },
  validation: {
    icon: AlertCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    title: 'Datos Inválidos',
    defaultMessage: 'Los datos ingresados no son válidos',
    suggestions: [
      'Revisa los campos marcados en rojo',
      'Asegúrate de completar todos los campos requeridos',
      'Verifica el formato de los datos',
    ],
  },
  server: {
    icon: Zap,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    title: 'Error del Servidor',
    defaultMessage: 'El servidor no puede procesar la solicitud',
    suggestions: [
      'Problema temporal en el servidor',
      'Intenta nuevamente en unos minutos',
      'Si persiste, contacta soporte técnico',
    ],
  },
  client: {
    icon: Bug,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    title: 'Error del Navegador',
    defaultMessage: 'Problema en la aplicación',
    suggestions: [
      'Intenta recargar la página',
      'Limpia la caché del navegador',
      'Actualiza tu navegador',
    ],
  },
  unknown: {
    icon: AlertCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    title: 'Error Inesperado',
    defaultMessage: 'Ha ocurrido un error inesperado',
    suggestions: [
      'Intenta recargar la página',
      'Si el problema persiste, contacta soporte',
      'Anota lo que estabas haciendo cuando ocurrió',
    ],
  },
};

// Automatic error type detection
export function detectErrorType(error: any): ErrorType {
  if (!error) return 'unknown';

  const message = (error.message || error.toString()).toLowerCase();
  const status = error.status || error.statusCode;

  // Network errors
  if (message.includes('network') || message.includes('fetch') || status === 0) {
    return 'network';
  }

  // Authentication errors
  if (status === 401 || message.includes('unauthorized') || message.includes('authentication')) {
    return 'authentication';
  }

  // Authorization errors
  if (status === 403 || message.includes('forbidden') || message.includes('permission')) {
    return 'authorization';
  }

  // Validation errors
  if (status === 400 || message.includes('validation') || message.includes('invalid')) {
    return 'validation';
  }

  // Database errors
  if (message.includes('database') || message.includes('prisma') || message.includes('sql')) {
    return 'database';
  }

  // Server errors
  if (status >= 500 || message.includes('server') || message.includes('internal')) {
    return 'server';
  }

  // Client errors
  if (status >= 400 && status < 500) {
    return 'client';
  }

  return 'unknown';
}

// Automatic severity detection
export function detectErrorSeverity(error: any, type: ErrorType): ErrorSeverity {
  const status = error?.status || error?.statusCode;
  
  if (type === 'database' || type === 'server' || status >= 500) {
    return 'critical';
  }
  
  if (type === 'authentication' || type === 'authorization' || status === 403 || status === 401) {
    return 'high';
  }
  
  if (type === 'validation' || type === 'client' || (status >= 400 && status < 500)) {
    return 'medium';
  }
  
  return 'low';
}

// Main error handler component
interface UnifiedErrorHandlerProps {
  error?: any;
  errorInfo?: Partial<ErrorInfo>;
  onRetry?: () => void;
  onGoHome?: () => void;
  onClose?: () => void;
  className?: string;
  variant?: 'inline' | 'card' | 'toast' | 'fullscreen';
  compact?: boolean;
}

export function UnifiedErrorHandler({
  error,
  errorInfo,
  onRetry,
  onGoHome,
  onClose,
  className,
  variant = 'card',
  compact = false,
}: UnifiedErrorHandlerProps) {
  const processedErrorInfo = useMemo(() => {
    if (!error && !errorInfo?.message) {
      return {
        type: 'unknown' as ErrorType,
        severity: 'low' as ErrorSeverity,
        message: 'Error desconocido',
        timestamp: new Date(),
        canRetry: true,
        canGoHome: true,
        showDetails: false,
      };
    }

    const autoType = error ? detectErrorType(error) : 'unknown';
    const autoSeverity = error ? detectErrorSeverity(error, autoType) : 'medium';

    return {
      type: errorInfo?.type || autoType,
      severity: errorInfo?.severity || autoSeverity,
      message: errorInfo?.message || error?.message || 'Error desconocido',
      details: errorInfo?.details || (error?.stack ? error.stack.substring(0, 200) : undefined),
      context: errorInfo?.context,
      timestamp: errorInfo?.timestamp || new Date(),
      canRetry: errorInfo?.canRetry !== false,
      canGoHome: errorInfo?.canGoHome !== false,
      showDetails: errorInfo?.showDetails || process.env.NODE_ENV === 'development',
      customActions: errorInfo?.customActions || [],
      code: errorInfo?.code || error?.status || error?.statusCode,
    };
  }, [error, errorInfo]);

  const config = ERROR_CONFIGS[processedErrorInfo.type];
  const IconComponent = config.icon;

  // Toast variant for non-critical errors
  if (variant === 'toast') {
    return (
      <div className={cn(
        'fixed top-4 right-4 z-50 w-96 p-4 rounded-lg shadow-lg border',
        config.bgColor,
        config.borderColor,
        'animate-in slide-in-from-top-2',
        className
      )}>
        <div className="flex items-start gap-3">
          <IconComponent className={cn('h-5 w-5 mt-0.5 flex-shrink-0', config.color)} />
          <div className="flex-1">
            <h4 className="font-medium text-sm">{config.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{processedErrorInfo.message}</p>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {(onRetry || processedErrorInfo.customActions?.length) && (
          <div className="flex gap-2 mt-3">
            {onRetry && (
              <Button size="sm" variant="outline" onClick={onRetry}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Reintentar
              </Button>
            )}
            {processedErrorInfo.customActions?.map((action, index) => (
              <Button
                key={index}
                size="sm"
                variant={action.variant || 'outline'}
                onClick={action.action}
              >
                {action.icon && <action.icon className="h-3 w-3 mr-1" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Fullscreen variant for critical errors
  if (variant === 'fullscreen') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className={cn('w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center', config.bgColor)}>
              <IconComponent className={cn('h-8 w-8', config.color)} />
            </div>
            <h2 className="text-xl font-semibold mb-2">{config.title}</h2>
            <p className="text-muted-foreground mb-6">{processedErrorInfo.message}</p>
            
            <div className="space-y-3">
              {onRetry && (
                <Button onClick={onRetry} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar
                </Button>
              )}
              {onGoHome && (
                <Button variant="outline" onClick={onGoHome} className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Ir al Inicio
                </Button>
              )}
            </div>

            {processedErrorInfo.showDetails && processedErrorInfo.details && (
              <details className="mt-6 text-left">
                <summary className="text-sm cursor-pointer text-muted-foreground">
                  Detalles técnicos
                </summary>
                <pre className="text-xs bg-gray-100 p-3 rounded mt-2 overflow-auto">
                  {processedErrorInfo.details}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Inline variant for form errors
  if (variant === 'inline') {
    return (
      <div className={cn(
        'flex items-center gap-2 p-3 rounded-md text-sm',
        config.bgColor,
        config.borderColor,
        'border',
        className
      )}>
        <IconComponent className={cn('h-4 w-4 flex-shrink-0', config.color)} />
        <span>{processedErrorInfo.message}</span>
        {onRetry && (
          <Button size="sm" variant="ghost" onClick={onRetry} className="ml-auto">
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  // Default card variant
  return (
    <Card className={cn(config.borderColor, 'border', className)}>
      <CardHeader className={cn('pb-3', compact && 'pb-2')}>
        <CardTitle className="flex items-center gap-3 text-base">
          <div className={cn('p-2 rounded-lg', config.bgColor)}>
            <IconComponent className={cn('h-5 w-5', config.color)} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span>{config.title}</span>
              {processedErrorInfo.severity && (
                <Badge variant={getSeverityVariant(processedErrorInfo.severity)}>
                  {getSeverityLabel(processedErrorInfo.severity)}
                </Badge>
              )}
            </div>
            {!compact && processedErrorInfo.code && (
              <div className="text-sm text-muted-foreground font-normal">
                Código: {processedErrorInfo.code}
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4">
          {processedErrorInfo.message}
        </p>

        {!compact && config.suggestions.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Sugerencias:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {config.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          {onRetry && processedErrorInfo.canRetry && (
            <Button size="sm" onClick={onRetry}>
              <RefreshCw className="h-3 w-3 mr-2" />
              Reintentar
            </Button>
          )}
          
          {onGoHome && processedErrorInfo.canGoHome && (
            <Button size="sm" variant="outline" onClick={onGoHome}>
              <Home className="h-3 w-3 mr-2" />
              Inicio
            </Button>
          )}

          {processedErrorInfo.customActions?.map((action, index) => (
            <Button
              key={index}
              size="sm"
              variant={action.variant || 'outline'}
              onClick={action.action}
            >
              {action.icon && <action.icon className="h-3 w-3 mr-2" />}
              {action.label}
            </Button>
          ))}
        </div>

        {/* Technical details */}
        {processedErrorInfo.showDetails && (processedErrorInfo.details || processedErrorInfo.context) && (
          <details className="mt-4">
            <summary className="text-xs cursor-pointer text-muted-foreground mb-2">
              Información técnica
            </summary>
            <div className="text-xs bg-muted p-3 rounded space-y-1">
              {processedErrorInfo.context && (
                <div><strong>Contexto:</strong> {processedErrorInfo.context}</div>
              )}
              {processedErrorInfo.details && (
                <div><strong>Detalles:</strong> <pre className="inline">{processedErrorInfo.details}</pre></div>
              )}
              {processedErrorInfo.timestamp && (
                <div><strong>Ocurrió:</strong> {processedErrorInfo.timestamp.toLocaleString()}</div>
              )}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

// Helper functions
function getSeverityVariant(severity: ErrorSeverity): 'default' | 'destructive' | 'outline' | 'secondary' {
  switch (severity) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'destructive';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'default';
  }
}

function getSeverityLabel(severity: ErrorSeverity): string {
  switch (severity) {
    case 'critical':
      return 'Crítico';
    case 'high':
      return 'Alto';
    case 'medium':
      return 'Medio';
    case 'low':
      return 'Bajo';
    default:
      return 'Desconocido';
  }
}

// Export convenience functions
export function showError(error: any, options?: Partial<ErrorInfo>) {
  // This would integrate with your toast/notification system
  console.error('Unified Error:', error, options);
}

export function createErrorHandler(defaultOptions?: Partial<ErrorInfo>) {
  return (error: any, additionalOptions?: Partial<ErrorInfo>) => {
    const mergedOptions = { ...defaultOptions, ...additionalOptions };
    return <UnifiedErrorHandler error={error} errorInfo={mergedOptions} />;
  };
}

export default UnifiedErrorHandler;