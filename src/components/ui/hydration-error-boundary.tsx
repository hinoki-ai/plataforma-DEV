'use client';

import { Component, ErrorInfo, ReactNode, useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionLoader } from '@/components/ui/dashboard-loader';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onHydrationError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  isHydrationError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

const MAX_RETRIES = 3;

export class HydrationErrorBoundary extends Component<Props, State> {
  private retryTimeout: NodeJS.Timeout | null = null;

  public state: State = {
    hasError: false,
    isHydrationError: false,
    error: null,
    errorInfo: null,
    retryCount: 0,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    const isHydrationError = HydrationErrorBoundary.isHydrationError(error);

    return {
      hasError: true,
      isHydrationError,
      error,
    };
  }

  private static isHydrationError(error: Error): boolean {
    const hydrationErrorMessages = [
      'Text content does not match server-rendered HTML',
      'Hydration failed because the initial UI does not match',
      'There was an error while hydrating',
      'useLayoutEffect does nothing on the server',
      'Cannot read properties of null',
      'Cannot read property of null',
      'localStorage is not defined',
      'window is not defined',
      'document is not defined',
      'Expected server HTML to contain',
      'Hydration error',
      'hydration',
      'failed to find all',
      'server and client must match',
      'element with tag',
      'did not expect server HTML',
      'suppressHydrationWarning',
    ];

    const errorMessage = error.message.toLowerCase();
    const errorStack = error.stack?.toLowerCase() || '';

    return hydrationErrorMessages.some(
      msg =>
        errorMessage.includes(msg.toLowerCase()) ||
        errorStack.includes(msg.toLowerCase())
    );
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const isHydrationError = HydrationErrorBoundary.isHydrationError(error);

    // Enhanced logging for hydration errors
    if (isHydrationError) {
      console.warn('🚧 HYDRATION ERROR DETECTED:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        retryCount: this.state.retryCount,
      });
    } else {
      console.error('💥 COMPONENT ERROR:', error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
      isHydrationError,
    });

    // Call custom error handler
    this.props.onHydrationError?.(error, errorInfo);

    // Auto-retry hydration errors after a delay
    if (isHydrationError && this.state.retryCount < MAX_RETRIES) {
      this.retryTimeout = setTimeout(
        () => {
          this.handleRetry();
        },
        1000 + this.state.retryCount * 1000
      ); // Exponential backoff
    }
  }

  public componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  private handleHardRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      // Hydration error UI
      if (this.state.isHydrationError) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full text-center">
              <div className="bg-amber-100 dark:bg-amber-900/20 rounded-full p-3 w-fit mx-auto mb-4">
                <Zap className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>

              <h1 className="text-2xl font-bold text-foreground mb-2">
                Cargando página...
              </h1>

              <p className="text-muted-foreground mb-4">
                {this.state.retryCount > 0
                  ? `Reintentando... (${this.state.retryCount}/${MAX_RETRIES})`
                  : 'La página se está sincronizando. Esto debería tardar solo un momento.'}
              </p>

              {/* Loading animation */}
              <div className="flex justify-center mb-6">
                <ActionLoader size="md" />
              </div>

              {this.state.retryCount >= MAX_RETRIES && (
                <>
                  <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      ⚠️ La página no se ha cargado correctamente. Esto puede
                      deberse a una conexión lenta o un problema temporal.
                    </p>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button onClick={this.handleHardRefresh} className="w-full">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Recargar página
                    </Button>
                    <Button
                      variant="outline"
                      onClick={this.handleGoHome}
                      className="w-full"
                    >
                      Volver al inicio
                    </Button>
                  </div>
                </>
              )}

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    🐛 Detalles técnicos (desarrollo)
                  </summary>
                  <div className="mt-2 text-xs bg-amber-50 dark:bg-amber-900/10 p-3 rounded border">
                    <div className="font-mono mb-2">
                      <strong>Hydration Error:</strong>{' '}
                      {this.state.error?.message}
                    </div>
                    <div className="text-amber-700 dark:text-amber-300">
                      💡 Esto suele ser causado por diferencias entre el HTML
                      del servidor y el cliente.
                    </div>
                  </div>
                </details>
              )}

              <div className="text-xs text-muted-foreground mt-4">
                Sistema Escolar Manitos Pintadas
              </div>
            </div>
          </div>
        );
      }

      // Generic error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-3 w-fit mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              Error de aplicación
            </h1>

            <p className="text-muted-foreground mb-4">
              Ha ocurrido un error inesperado. Por favor, intenta nuevamente.
            </p>

            <div className="flex flex-col space-y-2">
              <Button onClick={this.handleRetry} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Intentar nuevamente
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="w-full"
              >
                Volver al inicio
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Ver detalles del error
                </summary>
                <div className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                  <div className="font-mono mb-2">
                    <strong>Error:</strong> {this.state.error?.message}
                  </div>
                  {this.state.error?.stack && (
                    <div className="font-mono text-muted-foreground">
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">
                        {this.state.error.stack.slice(0, 500)}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for client components to detect hydration
export function useHydrationSafe() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

// HOC for wrapping components that might have hydration issues
export function withHydrationErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <HydrationErrorBoundary fallbackComponent={fallback}>
        <Component {...props} />
      </HydrationErrorBoundary>
    );
  };
}

// Note: Using named export for proper hoisting and to avoid temporal dead zone issues
