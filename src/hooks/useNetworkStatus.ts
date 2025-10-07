import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string | null;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
}

export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isSlowConnection: false,
    connectionType: null,
    effectiveType: null,
    downlink: null,
    rtt: null,
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const isOnline = navigator.onLine;

      // Get connection information if available
      const connection =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;

      const connectionInfo = connection
        ? {
            connectionType: connection.type || null,
            effectiveType: connection.effectiveType || null,
            downlink: connection.downlink || null,
            rtt: connection.rtt || null,
          }
        : {
            connectionType: null,
            effectiveType: null,
            downlink: null,
            rtt: null,
          };

      // Determine if connection is slow
      const isSlowConnection =
        connectionInfo.effectiveType === "slow-2g" ||
        connectionInfo.effectiveType === "2g" ||
        (connectionInfo.downlink && connectionInfo.downlink < 1);

      const newStatus = {
        isOnline,
        isSlowConnection,
        ...connectionInfo,
      };

      setNetworkStatus(newStatus);

      // Log network status changes
      if (!isOnline) {
        logger.logClientError(new Error("Network connection lost"), {
          networkStatus: newStatus,
          timestamp: new Date().toISOString(),
        });
      } else if (isSlowConnection) {
        logger.logClientError(new Error("Slow network connection detected"), {
          networkStatus: newStatus,
          timestamp: new Date().toISOString(),
        });
      }
    };

    // Listen for online/offline events
    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);

    // Listen for connection changes if supported
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener("change", updateNetworkStatus);
    }

    // Initial status update
    updateNetworkStatus();

    return () => {
      window.removeEventListener("online", updateNetworkStatus);
      window.removeEventListener("offline", updateNetworkStatus);

      if (connection) {
        connection.removeEventListener("change", updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
}

// Hook for handling network errors in API calls
export function useNetworkErrorHandler() {
  const { isOnline, isSlowConnection } = useNetworkStatus();

  const handleNetworkError = (error: any, context?: string) => {
    if (!isOnline) {
      return {
        type: "offline",
        message:
          "No hay conexión a internet. Verifica tu conexión e intenta nuevamente.",
        retryable: true,
      };
    }

    if (isSlowConnection) {
      return {
        type: "slow_connection",
        message: "La conexión es lenta. Esto puede afectar el rendimiento.",
        retryable: true,
      };
    }

    // Check for specific network-related errors
    if (error?.name === "NetworkError" || error?.message?.includes("fetch")) {
      return {
        type: "network_error",
        message: "Error de conexión. Verifica tu conexión a internet.",
        retryable: true,
      };
    }

    if (
      error?.code === "NETWORK_TIMEOUT" ||
      error?.message?.includes("timeout")
    ) {
      return {
        type: "timeout",
        message: "La solicitud tardó demasiado. Intenta nuevamente.",
        retryable: true,
      };
    }

    if (
      error?.status === 503 ||
      error?.message?.includes("service unavailable")
    ) {
      return {
        type: "server_unavailable",
        message:
          "El servidor no está disponible temporalmente. Intenta más tarde.",
        retryable: true,
      };
    }

    // Generic error
    return {
      type: "unknown",
      message: error?.message || "Ha ocurrido un error inesperado.",
      retryable: false,
    };
  };

  return { handleNetworkError, isOnline, isSlowConnection };
}
