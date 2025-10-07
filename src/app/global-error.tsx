"use client";

import { useEffect } from "react";
import { UnifiedErrorBoundary } from "@/components/ui/unified-error-boundary";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Simple fallback translations for global errors
  const t = (key: string, namespace?: string) => {
    const fallbacks: Record<string, string> = {
      "error.global_title": "¡Ups! Algo salió mal",
      "error.global_message":
        "Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta nuevamente.",
      "common.retry": "Intenta nuevamente",
      "error.dev_info": "Información adicional (desarrollo)",
    };
    return fallbacks[key] || key;
  };

  useEffect(() => {
    console.error("Global Error:", error);

    // Report to error monitoring service if available
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "exception", {
        description: error.message,
        fatal: true,
      });
    }
  }, [error]);

  return (
    <html lang="es-CL">
      <head>
        <title>Global Error - Manitos Pintadas</title>
        <meta
          name="description"
          content="Ha ocurrido un error crítico en la aplicación"
        />
        <style>{`
          body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            background-attachment: fixed;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        `}</style>
      </head>
      <body className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Unified Error Boundary for global errors */}
          <UnifiedErrorBoundary
            context="global_error"
            variant="full"
            enableRetry={true}
            enableHome={true}
            showDetails={process.env.NODE_ENV === "development"}
          >
            {/* Force error to trigger the boundary */}
            <div>Global error occurred: {error.message}</div>
          </UnifiedErrorBoundary>
        </div>
      </body>
    </html>
  );
}
