"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Use enhanced structured logging
    import("@/lib/logger").then(({ logger }) =>
      logger.logErrorBoundary(error, errorInfo, "ErrorBoundary"),
    );

    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-3 w-fit mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              ¡Ups! Algo salió mal
            </h1>
            <p className="text-muted-foreground mb-4">
              Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta
              nuevamente.
            </p>
            {process.env.NODE_ENV === "development" && (
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
                        {this.state.error.stack.length > 500 ? "..." : ""}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div className="font-mono text-muted-foreground mt-2">
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack.slice(0, 300)}
                        {this.state.errorInfo.componentStack.length > 300
                          ? "..."
                          : ""}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
            <div className="flex flex-col space-y-2 mt-6">
              <Button onClick={this.handleReset} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Intenta nuevamente
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="w-full"
              >
                Volver al inicio
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-4 pt-4 border-t">
              <p>¿El problema persiste?</p>
              <p>
                Escríbenos a:{" "}
                <a
                  href="mailto:soporte@manitospintadas.cl"
                  className="text-primary hover:underline"
                >
                  soporte@manitospintadas.cl
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-3 w-fit mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          ¡Ups! Algo salió mal
        </h1>
        <p className="text-muted-foreground mb-4">
          Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta
          nuevamente.
        </p>
        <Button onClick={resetErrorBoundary}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Intenta nuevamente
        </Button>
      </div>
    </div>
  );
}
