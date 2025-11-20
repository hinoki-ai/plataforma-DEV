"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, Bug, Zap } from "lucide-react";
import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { Badge } from "./badge";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  enableRetry?: boolean;
  enableReport?: boolean;
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  errorId: string;
}

export class AdvancedErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: this.generateErrorId(),
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: Math.random().toString(36).substr(2, 9),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const enhancedErrorInfo = {
      ...errorInfo,
      context: this.props.context,
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : "SSR",
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
    };

    this.setState({ errorInfo: enhancedErrorInfo });

    // Report error to external service if configured
    if (this.props.onError) {
      this.props.onError(error, enhancedErrorInfo);
    }

    // Auto-report critical errors
    if (this.isCriticalError(error)) {
      this.reportError(error, enhancedErrorInfo);
    }
  }

  componentWillUnmount() {
    // Clear any pending retry timeouts
    this.retryTimeouts.forEach((timeout) => clearTimeout(timeout));
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isCriticalError(error: Error): boolean {
    const criticalPatterns = [
      /chunk.*failed/i,
      /loading.*chunk/i,
      /network.*error/i,
      /auth.*failed/i,
      /database.*error/i,
    ];

    return criticalPatterns.some((pattern) => pattern.test(error.message));
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const reportData = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        context: this.props.context,
        timestamp: new Date().toISOString(),
        userAgent: errorInfo.toString(),
        url: typeof window !== "undefined" ? window.location.href : "SSR",
      };

      // Send to error reporting service
      await fetch("/api/errors/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });
    } catch (reportError) {}
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState((prevState) => ({
        retryCount: prevState.retryCount + 1,
        hasError: false,
        error: null,
        errorInfo: null,
      }));

      // Progressive delay for retries
      const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000);
      const timeout = setTimeout(() => {
        this.forceUpdate();
      }, delay);

      this.retryTimeouts.push(timeout);
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: this.generateErrorId(),
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <AlertTriangle className="w-16 h-16 text-red-500" />
                  <div className="absolute -top-2 -right-2">
                    <Badge variant="destructive" className="text-xs">
                      <Bug className="w-3 h-3 mr-1" />
                      Error
                    </Badge>
                  </div>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Algo salió mal
              </CardTitle>
              <CardDescription className="text-lg">
                Ha ocurrido un error inesperado en la aplicación
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Summary */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 mb-1">
                      Error ID: {this.state.errorId}
                    </h4>
                    <p className="text-sm text-red-700">
                      {this.state.error?.message || "Error desconocido"}
                    </p>
                    {this.props.context && (
                      <p className="text-xs text-red-600 mt-1">
                        Contexto: {this.props.context}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {this.props.enableRetry !== false &&
                  this.state.retryCount < this.maxRetries && (
                    <Button
                      onClick={this.handleRetry}
                      variant="default"
                      className="flex items-center"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reintentar ({this.maxRetries - this.state.retryCount}{" "}
                      intentos restantes)
                    </Button>
                  )}

                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reiniciar Componente
                </Button>

                <Button
                  onClick={() => (window.location.href = "/")}
                  variant="outline"
                  className="flex items-center"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Ir al Inicio
                </Button>
              </div>

              {/* Technical Details */}
              {this.props.showDetails && this.state.errorInfo && (
                <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <summary className="font-semibold text-gray-900 cursor-pointer mb-2">
                    Detalles Técnicos (para desarrolladores)
                  </summary>
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong>Error:</strong>
                      <pre className="mt-1 p-2 bg-white border rounded text-xs overflow-auto">
                        {this.state.error?.stack}
                      </pre>
                    </div>
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 p-2 bg-white border rounded text-xs overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <strong>Intentos de reintento:</strong>{" "}
                        {this.state.retryCount}
                      </div>
                      <div>
                        <strong>Hora del error:</strong>{" "}
                        {new Date().toLocaleString()}
                      </div>
                    </div>
                  </div>
                </details>
              )}

              {/* Retry Progress */}
              {this.state.retryCount > 0 && (
                <div className="text-center text-sm text-gray-600">
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>
                      Reintentando... ({this.state.retryCount}/{this.maxRetries}
                      )
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export function withAdvancedErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">,
) {
  const WrappedComponent = (props: P) => (
    <AdvancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </AdvancedErrorBoundary>
  );

  WrappedComponent.displayName = `withAdvancedErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// React Hook for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    // Could integrate with error reporting service here
    if (typeof window !== "undefined") {
      // Store error in session storage for debugging
      const errors = JSON.parse(sessionStorage.getItem("app_errors") || "[]");
      errors.push({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      });
      sessionStorage.setItem("app_errors", JSON.stringify(errors.slice(-10))); // Keep last 10 errors
    }
  };
}
