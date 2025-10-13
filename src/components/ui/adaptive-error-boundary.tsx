"use client";

/**
 * Adaptive Error Boundary Component
 * Context-aware error handling with appropriate UI per context
 * Part of Stage 4: Quality & Performance
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  context?: "public" | "auth" | "admin";
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showRetry?: boolean;
  showHome?: boolean;
  className?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class AdaptiveErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log error with enhanced structured logging
    import("@/lib/logger").then(({ logger }) =>
      logger.logErrorBoundary(error, errorInfo, "AdaptiveErrorBoundary"),
    );

    // Report to error monitoring service if available
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "exception", {
        description: error.message,
        fatal: true,
        custom_map: {
          context: this.props.context || "unknown",
        },
      });
    }

    // Enhanced error tracking
    import("@/lib/error-tracking").then(({ errorTracker }) => {
      errorTracker.trackError("error_boundary_caught", error, {
        context: this.props.context,
        componentName: "AdaptiveErrorBoundary",
        componentStack: errorInfo.componentStack,
        retryCount: this.state.retryCount,
      });
    });
  }

  handleRetry = () => {
    // Track retry attempts
    import("@/lib/error-tracking").then(({ errorTracker }) => {
      errorTracker.trackUserFeedback("error_boundary_retry", {
        context: this.props.context,
        retryCount: this.state.retryCount + 1,
        componentName: "AdaptiveErrorBoundary",
      });
    });

    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  handleGoHome = () => {
    const { context } = this.props;
    const homeUrl =
      context === "admin" ? "/admin" : context === "auth" ? "/profesor" : "/";

    window.location.href = homeUrl;
  };

  handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.handleGoHome();
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const {
        context = "public",
        showRetry = true,
        showHome = true,
        className,
      } = this.props;
      const { error, retryCount } = this.state;

      // Context-aware styling
      const isPublicContext = context === "public";
      const containerClass = cn(
        "min-h-[400px] flex items-center justify-center p-6",
        isPublicContext
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-background",
        className,
      );

      const cardClass = cn(
        "w-full max-w-lg mx-auto",
        isPublicContext
          ? "backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 shadow-2xl"
          : "bg-background border border-border shadow-sm",
      );

      const iconClass = cn(
        "w-16 h-16 mx-auto mb-4",
        isPublicContext ? "text-red-400" : "text-destructive",
      );

      const titleClass = cn(
        "text-center mb-2",
        isPublicContext
          ? "text-white text-2xl font-bold"
          : "text-foreground text-xl font-semibold",
      );

      const messageClass = cn(
        "text-center mb-6",
        isPublicContext ? "text-gray-300" : "text-muted-foreground",
      );

      // Error messages by context
      const getErrorMessage = () => {
        if (isPublicContext) {
          return {
            title: "¡Oops! Algo salió mal",
            message:
              "Estamos experimentando dificultades técnicas. Te invitamos a intentar nuevamente en unos momentos.",
            technical:
              "Si el problema persiste, puedes contactarnos o volver a la página principal.",
          };
        } else {
          return {
            title: "Error en la aplicación",
            message:
              "Ha ocurrido un error inesperado. Puedes intentar recargar la página o volver al inicio.",
            technical: error?.message
              ? `Error técnico: ${error.message}`
              : "Error técnico no especificado.",
          };
        }
      };

      const errorMessage = getErrorMessage();

      return (
        <div className={containerClass}>
          <Card className={cardClass}>
            <CardHeader className="text-center">
              <AlertTriangle className={iconClass} />
              <CardTitle className={titleClass}>{errorMessage.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className={messageClass}>{errorMessage.message}</p>

              {/* Technical details for auth context */}
              {!isPublicContext && error && (
                <details className="text-xs text-muted-foreground bg-muted p-3 rounded">
                  <summary className="cursor-pointer font-medium mb-2">
                    Detalles técnicos
                  </summary>
                  <code className="block whitespace-pre-wrap break-all">
                    {error.stack || error.message}
                  </code>
                  {retryCount > 0 && (
                    <p className="mt-2">
                      Intentos de recuperación: {retryCount}
                    </p>
                  )}
                </details>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {showRetry && (
                  <Button
                    onClick={this.handleRetry}
                    variant={isPublicContext ? "default" : "default"}
                    className={cn(
                      "flex-1",
                      isPublicContext &&
                        "bg-white/10 hover:bg-white/20 text-white border-white/20",
                    )}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Intentar nuevamente
                  </Button>
                )}

                <Button
                  onClick={this.handleGoBack}
                  variant={isPublicContext ? "outline" : "outline"}
                  className={cn(
                    "flex-1",
                    isPublicContext &&
                      "border-white/20 text-white hover:bg-white/10",
                  )}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>

                {showHome && (
                  <Button
                    onClick={this.handleGoHome}
                    variant={isPublicContext ? "outline" : "outline"}
                    className={cn(
                      "flex-1",
                      isPublicContext &&
                        "border-white/20 text-white hover:bg-white/10",
                    )}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Inicio
                  </Button>
                )}
              </div>

              {/* Contact info for public context */}
              {isPublicContext && (
                <p className="text-center text-sm text-gray-400 pt-4 border-t border-gray-700/50">
                  Si necesitas ayuda, puedes contactarnos en{" "}
                  <a
                    href="mailto:contacto@plataforma-astral.com"
                    className="text-white hover:underline"
                  >
                    contacto@plataforma-astral.com
                  </a>
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for functional components to trigger error boundaries
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    // This will trigger the nearest error boundary
    throw error;
  };
}

/**
 * Higher-order component for automatic error boundary wrapping
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">,
) {
  const WithErrorBoundaryComponent = (props: P) => (
    <AdaptiveErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </AdaptiveErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
}

// Type augmentation for global gtag function
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
