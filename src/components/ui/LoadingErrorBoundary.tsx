"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface LoadingErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

interface LoadingErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
  showHomeButton?: boolean;
  title?: string;
  description?: string;
}

/**
 * Specialized error boundary for loading states and async operations
 * Provides graceful error handling with retry functionality
 */
export class LoadingErrorBoundary extends Component<
  LoadingErrorBoundaryProps,
  LoadingErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: LoadingErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(
    error: Error,
  ): Partial<LoadingErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for monitoring
    console.error("LoadingErrorBoundary caught an error:", error, errorInfo);

    // Call error handler if provided
    this.props.onError?.(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  componentWillUnmount() {
    // Clear any pending retry timeouts
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;

    if (this.state.retryCount < maxRetries) {
      this.setState((prevState) => ({
        retryCount: prevState.retryCount + 1,
        hasError: false,
        error: null,
        errorInfo: null,
      }));

      // Add exponential backoff for retries
      const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 5000);
      this.retryTimeoutId = setTimeout(() => {
        // Force re-render by resetting error state
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
        });
      }, delay);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
  };

  render() {
    const {
      fallback,
      children,
      maxRetries = 3,
      showHomeButton = true,
      title = "Error de carga",
      description = "Ocurrió un error al cargar el contenido. Por favor, inténtelo de nuevo.",
    } = this.props;

    if (this.state.hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-red-800">{title}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{description}</p>

            {this.state.retryCount < maxRetries && (
              <Button
                onClick={this.handleRetry}
                variant="default"
                className="w-full"
                disabled={!!this.retryTimeoutId}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {this.retryTimeoutId ? "Reintentando..." : "Reintentar"}
              </Button>
            )}

            {this.state.retryCount >= maxRetries && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Se agotaron los intentos de recuperación automática.
                </p>
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="w-full"
                >
                  Restablecer y reintentar
                </Button>
              </div>
            )}

            {showHomeButton && (
              <Button
                onClick={() => (window.location.href = "/")}
                variant="ghost"
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Ir al inicio
              </Button>
            )}

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                  Detalles técnicos (desarrollo)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return children;
  }
}

/**
 * Hook for wrapping async operations with error boundary protection
 */
export function useAsyncErrorBoundary() {
  return (error: Error) => {
    // This will trigger the nearest error boundary
    throw error;
  };
}

/**
 * Higher-order component for wrapping components with loading error boundary
 */
export function withLoadingErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<LoadingErrorBoundaryProps, "children">,
) {
  const WrappedComponent = (props: P) => (
    <LoadingErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </LoadingErrorBoundary>
  );

  WrappedComponent.displayName = `withLoadingErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Specialized error boundary for data fetching operations
 */
export function DataLoadingErrorBoundary({
  children,
  onRetry,
  ...props
}: LoadingErrorBoundaryProps & {
  onRetry?: () => void;
}) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior
      window.location.reload();
    }
  };

  return (
    <LoadingErrorBoundary
      {...props}
      fallback={
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <CardTitle className="text-orange-800">
              Error al cargar datos
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              No se pudieron cargar los datos solicitados. Esto puede deberse a
              problemas de conectividad.
            </p>
            <Button onClick={handleRetry} variant="default" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Recargar datos
            </Button>
          </CardContent>
        </Card>
      }
    >
      {children}
    </LoadingErrorBoundary>
  );
}

export default LoadingErrorBoundary;
