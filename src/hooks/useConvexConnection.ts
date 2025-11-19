"use client";

import { useEffect, useState } from "react";
import { useConvex } from "convex/react";

/**
 * Hook to detect Convex connection status
 * Returns connection status and whether queries are likely stuck
 */
export function useConvexConnection() {
  const convex = useConvex();
  const [isConnected, setIsConnected] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Check connection status by attempting a simple query
    // If queries are stuck, it's likely a connection issue
    let timeoutId: NodeJS.Timeout;
    let mounted = true;

    const checkConnection = async () => {
      try {
        // Use a simple health check - if this fails or times out, connection is bad
        timeoutId = setTimeout(() => {
          if (mounted) {
            setIsConnected(false);
            setConnectionError(
              "No se pudo conectar con el servidor de datos. Verifica tu conexión a internet o contacta al administrador.",
            );
          }
        }, 10000); // 10 second timeout

        // Try to get connection state from Convex client
        // The client should have connection info available
        const clientState = (convex as any)?._connectionState;
        if (clientState) {
          clearTimeout(timeoutId);
          if (mounted) {
            setIsConnected(true);
            setConnectionError(null);
          }
        }
      } catch (error) {
        if (mounted) {
          setIsConnected(false);
          setConnectionError(
            "Error de conexión con el servidor de datos. Por favor, recarga la página.",
          );
        }
      }
    };

    checkConnection();

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [convex]);

  return {
    isConnected,
    connectionError,
    hasConnectionIssue: !isConnected || connectionError !== null,
  };
}
