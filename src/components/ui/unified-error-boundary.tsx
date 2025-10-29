"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
  Zap,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

interface UnifiedErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  context?: string;
  showDetails?: boolean;
  enableRetry?: boolean;
  enableHome?: boolean;
  variant?: "compact" | "full" | "minimal";
}

interface UnifiedErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  errorId: string;
  lastErrorTime: number;
}

// Unified error categorization (same as main error page)
const categorizeError = (error: Error) => {
  const message = error.message.toLowerCase();
  const stack = error.stack?.toLowerCase() || "";

  if (
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("connection") ||
    message.includes("timeout") ||
    message.includes("cors") ||
    message.includes("aborted")
  ) {
    return "network";
  }

  if (
    message.includes("database") ||
    message.includes("prisma") ||
    message.includes("sql") ||
    (message.includes("connection") && message.includes("database")) ||
    message.includes("query")
  ) {
    return "database";
  }

  if (
    message.includes("auth") ||
    message.includes("unauthorized") ||
    message.includes("forbidden") ||
    message.includes("permission") ||
    message.includes("access denied") ||
    message.includes("jwt")
  ) {
    return "auth";
  }

  if (
    message.includes("validation") ||
    message.includes("invalid") ||
    message.includes("required") ||
    message.includes("format") ||
    stack.includes("zod") ||
    stack.includes("validation")
  ) {
    return "validation";
  }

  if (
    message.includes("referenceerror") ||
    message.includes("typeerror") ||
    message.includes("syntaxerror") ||
    message.includes("cannot read") ||
    message.includes("undefined")
  ) {
    return "client";
  }

  if (
    message.includes("500") ||
    message.includes("502") ||
    message.includes("503") ||
    message.includes("504") ||
    message.includes("internal server")
  ) {
    return "server";
  }

  return "generic";
};

// Unified error theming (same as main error page)
const getErrorTheme = (errorType: string) => {
  switch (errorType) {
    case "network":
      return {
        gradient: "from-blue-500 to-cyan-500",
        bgGradient: "from-blue-50 to-cyan-50",
        borderColor: "border-blue-200 dark:border-blue-700",
        textColor: "text-blue-800 dark:text-blue-200",
        icon: Wifi,
        iconColor: "text-blue-600 dark:text-blue-400",
      };
    case "auth":
      return {
        gradient: "from-purple-500 to-pink-500",
        bgGradient: "from-purple-50 to-pink-50",
        borderColor: "border-purple-200 dark:border-purple-700",
        textColor: "text-purple-800 dark:text-purple-200",
        icon: Zap,
        iconColor: "text-purple-600 dark:text-purple-400",
      };
    case "database":
      return {
        gradient: "from-orange-500 to-red-500",
        bgGradient: "from-orange-50 to-red-50",
        borderColor: "border-orange-200 dark:border-orange-700",
        textColor: "text-orange-800 dark:text-orange-200",
        icon: AlertTriangle,
        iconColor: "text-orange-600 dark:text-orange-400",
      };
    case "validation":
      return {
        gradient: "from-yellow-500 to-orange-500",
        bgGradient: "from-yellow-50 to-orange-50",
        borderColor: "border-yellow-200 dark:border-yellow-700",
        textColor: "text-yellow-800 dark:text-yellow-200",
        icon: AlertTriangle,
        iconColor: "text-yellow-600 dark:text-yellow-400",
      };
    default:
      return {
        gradient: "from-gray-500 to-gray-600",
        bgGradient: "from-gray-50 to-gray-50",
        borderColor: "border-gray-200 dark:border-gray-700",
        textColor: "text-gray-800 dark:text-gray-200",
        icon: Bug,
        iconColor: "text-gray-600 dark:text-gray-400",
      };
  }
};

// Unified error messages (same as main error page)
const getErrorMessage = (errorType: string, isOnline: boolean, t: any) => {
  switch (errorType) {
    case "network":
      return isOnline
        ? t(
            "error.network_error",
            "Error de conexión. Verifica tu conexión a internet.",
          )
        : t(
            "error.offline_message",
            "No tienes conexión a internet. Algunas funciones pueden no estar disponibles.",
          );
    case "database":
      return t(
        "error.search_problem",
        "Tuvimos un problema al buscar la información. Ya estamos trabajando para solucionarlo.",
      );
    case "auth":
      return t(
        "error.session_expired",
        "Tu sesión terminó o no tienes permiso para entrar aquí. Vuelve a iniciar sesión si es necesario.",
      );
    case "validation":
      return t(
        "error.general",
        "Los datos proporcionados no son válidos. Por favor, verifica e intenta nuevamente.",
      );
    case "client":
      return t(
        "error.general",
        "Ha ocurrido un error en la aplicación. Estamos trabajando para solucionarlo.",
      );
    case "server":
      return t(
        "error.general",
        "El servidor está experimentando dificultades. Por favor, intenta más tarde.",
      );
    default:
      return t(
        "error.general",
        "Algo no funcionó como esperábamos. Intenta nuevamente o cuéntanos si el problema sigue.",
      );
  }
};

// Main unified error boundary component
export class UnifiedErrorBoundary extends Component<
  UnifiedErrorBoundaryProps,
  UnifiedErrorBoundaryState
> {
  private maxRetries = 3;
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: UnifiedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: this.generateErrorId(),
      lastErrorTime: 0,
    };
  }

  static getDerivedStateFromError(
    error: Error,
  ): Partial<UnifiedErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorType = categorizeError(error);

    // Enhanced logging with context
    console.error("🚨 Unified Error Boundary:", {
      error: error.message,
      type: errorType,
      context: this.props.context,
      errorId: this.state.errorId,
      stack: error.stack?.slice(0, 500),
      timestamp: new Date().toISOString(),
    });

    this.setState({ errorInfo });

    // Report to analytics if available
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "exception", {
        description: `${errorType}: ${error.message}`,
        fatal: errorType === "server" || errorType === "database",
        custom_map: {
          error_id: this.state.errorId,
          error_type: errorType,
          context: this.props.context,
          retry_count: this.state.retryCount,
        },
      });
    }
  }

  componentWillUnmount() {
    this.retryTimeouts.forEach((timeout) => clearTimeout(timeout));
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) return;

    this.setState((prev) => ({
      retryCount: prev.retryCount + 1,
      hasError: false,
      error: null,
      errorInfo: null,
    }));

    // Reset error state after retry
    const timeout = setTimeout(() => {
      this.setState({ hasError: false });
    }, 100);

    this.retryTimeouts.push(timeout);
  };

  private handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Render unified error UI
      return (
        <UnifiedErrorUI
          error={this.state.error!}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          retryCount={this.state.retryCount}
          context={this.props.context}
          variant={this.props.variant || "compact"}
          enableRetry={this.props.enableRetry !== false}
          enableHome={this.props.enableHome !== false}
          showDetails={
            this.props.showDetails !== false &&
            process.env.NODE_ENV === "development"
          }
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

// Unified error UI component (extracted for reusability)
class UnifiedErrorUI extends React.Component<{
  error: Error;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
  context?: string;
  variant: "compact" | "full" | "minimal";
  enableRetry: boolean;
  enableHome: boolean;
  showDetails: boolean;
  onRetry: () => void;
  onGoHome: () => void;
}> {
  render() {
    const {
      error,
      errorId,
      retryCount,
      context,
      variant,
      enableRetry,
      enableHome,
      showDetails,
      onRetry,
      onGoHome,
    } = this.props;

    const errorType = categorizeError(error);
    const theme = getErrorTheme(errorType);
    const IconComponent = theme.icon;

    // Get error title based on type - using simple fallback for class component compatibility
    const getErrorTitle = () => {
      switch (errorType) {
        case "network":
          return "Sin conexión a internet";
        case "database":
          return "Problema con la información";
        case "auth":
          return "Acceso restringido";
        case "validation":
          return "Datos de entrada inválidos";
        case "client":
          return "Error del navegador";
        case "server":
          return "Servidor no disponible";
        default:
          return "¡Uy! Algo salió mal";
      }
    };

    const errorTitle = getErrorTitle();
    const errorMessage = getErrorMessage(errorType, true, (key: string) => key); // Simple fallback

    // Minimal variant - just icon and message
    if (variant === "minimal") {
      return (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div
            className={`w-8 h-8 bg-linear-to-br ${theme.bgGradient} rounded-full flex items-center justify-center mb-2`}
          >
            <IconComponent className={`w-4 h-4 ${theme.iconColor}`} />
          </div>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </div>
      );
    }

    // Compact variant - icon, title, message, actions
    if (variant === "compact") {
      return (
        <Card
          className={`shadow-lg backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-2 ${theme.borderColor}`}
        >
          <CardContent className="text-center p-6">
            {/* Icon */}
            <div
              className={`w-12 h-12 bg-linear-to-br ${theme.bgGradient} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}
            >
              <IconComponent className={`w-6 h-6 ${theme.iconColor}`} />
            </div>

            {/* Title */}
            <h3
              className={`text-lg font-bold bg-linear-to-r ${theme.gradient} bg-clip-text text-transparent mb-2`}
            >
              {errorTitle}
            </h3>

            {/* Message */}
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">
              {errorMessage}
            </p>

            {/* Actions */}
            <div className="flex gap-2 justify-center">
              {enableRetry && retryCount < 3 && (
                <Button
                  onClick={onRetry}
                  size="sm"
                  className={`bg-linear-to-r ${theme.gradient} hover:opacity-90`}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reintentar
                </Button>
              )}
              {enableHome && (
                <Button onClick={onGoHome} variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Inicio
                </Button>
              )}
            </div>

            {/* Technical details (development only) */}
            {showDetails && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 font-medium">
                  <Bug className="w-4 h-4 mr-2 inline" />
                  Technical Details ({errorType.toUpperCase()})
                </summary>
                <div className="mt-2 space-y-1 text-xs">
                  <div>
                    <strong>ID:</strong>{" "}
                    <code className="text-xs">{errorId}</code>
                  </div>
                  <div>
                    <strong>Message:</strong>{" "}
                    <code className="text-red-600 dark:text-red-400">
                      {error.message}
                    </code>
                  </div>
                  {error.stack && (
                    <div>
                      <strong>Stack:</strong>{" "}
                      <pre className="text-xs overflow-auto max-h-20 bg-gray-100 dark:bg-gray-800 p-1 rounded mt-1">
                        {error.stack.slice(0, 400)}...
                      </pre>
                    </div>
                  )}
                  {context && (
                    <div>
                      <strong>Context:</strong> {context}
                    </div>
                  )}
                  <div>
                    <strong>Network:</strong> 🟢 Online | Retries: {retryCount}
                  </div>
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    // Full variant - complete error page experience
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card
          className={`shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-2 ${theme.borderColor} max-w-2xl w-full`}
        >
          <CardHeader className="text-center pb-4">
            {/* Icon */}
            <div
              className={`w-20 h-20 bg-linear-to-br ${theme.bgGradient} rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl`}
            >
              <IconComponent className={`w-10 h-10 ${theme.iconColor}`} />
            </div>

            {/* Title */}
            <CardTitle
              className={`text-2xl font-bold bg-linear-to-r ${theme.gradient} bg-clip-text text-transparent mb-2`}
            >
              {errorTitle}
            </CardTitle>

            {/* Error ID */}
            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              Error ID: {errorId}
            </div>
          </CardHeader>

          <CardContent className="text-center space-y-6">
            {/* Message */}
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              {errorMessage}
            </p>

            {/* Network status */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <div className="flex items-center justify-center">
                <WifiOff className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                  Sin conexión a internet
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              {enableRetry && retryCount < 3 && (
                <Button
                  onClick={onRetry}
                  className={`bg-linear-to-r ${theme.gradient} hover:opacity-90`}
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Reintentar
                </Button>
              )}
              {enableHome && (
                <Button onClick={onGoHome} variant="outline">
                  <Home className="w-5 h-5 mr-2" />
                  Inicio
                </Button>
              )}
            </div>

            {/* Technical details */}
            {showDetails && (
              <details className="text-left bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                <summary className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 font-medium">
                  <Bug className="w-5 h-5 mr-3" />
                  Technical Details ({errorType.toUpperCase()})
                </summary>
                <div className="mt-3 space-y-3">
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Error ID
                    </div>
                    <div className="font-mono text-sm text-gray-800 dark:text-gray-200 break-all">
                      {errorId}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Message
                    </div>
                    <div className="font-mono text-sm text-red-600 dark:text-red-400 wrap-break-word">
                      {error.message}
                    </div>
                  </div>
                  {error.stack && (
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        Stack Trace
                      </div>
                      <pre className="font-mono text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-40 bg-gray-50 dark:bg-gray-800 p-2 rounded border">
                        {error.stack.slice(0, 800)}...
                      </pre>
                    </div>
                  )}
                  {context && (
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        Context
                      </div>
                      <div className="text-sm text-gray-800 dark:text-gray-200">
                        {context}
                      </div>
                    </div>
                  )}
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Network Status
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-green-600">🟢 Online</span>
                      <span className="text-gray-600">
                        Retries: {retryCount}
                      </span>
                    </div>
                  </div>
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
}

// Hook for using the unified error boundary
export function useUnifiedErrorBoundary() {
  return { UnifiedErrorBoundary };
}
