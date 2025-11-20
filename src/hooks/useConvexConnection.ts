"use client";

import { useEffect, useState, useRef } from "react";
import { useConvex } from "convex/react";

/**
 * Hook to detect Convex connection status
 * Returns connection status and whether queries are likely stuck
 */
export function useConvexConnection() {
  const convex = useConvex();
  const [isConnected, setIsConnected] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // First, check if NEXT_PUBLIC_CONVEX_URL is configured
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      if (mountedRef.current) {
        setIsConnected(false);
        setConnectionError(
          "Error de configuración: NEXT_PUBLIC_CONVEX_URL no está configurado. Contacta al administrador.",
        );
      }
      return;
    }

    // Check connection status periodically
    const checkConnection = () => {
      if (!mountedRef.current) return;

      try {
        // Access the connection state from the Convex client
        // The ConvexReactClient exposes connectionState as a getter
        const client = convex as any;

        // Check if client has connectionState method or property
        let connectionState: string | undefined;

        if (typeof client.connectionState === "function") {
          connectionState = client.connectionState();
        } else if (client.connectionState !== undefined) {
          connectionState = client.connectionState;
        } else if (client._connectionState !== undefined) {
          // Fallback to private property if public API not available
          connectionState = client._connectionState;
        }

        // Connection states in Convex: "Connecting" | "Connected" | "Disconnected"
        // Or an object with isWebSocketConnected property
        if (
          typeof connectionState === "object" &&
          connectionState !== null &&
          "isWebSocketConnected" in connectionState
        ) {
          const isConnected = (connectionState as any).isWebSocketConnected;
          if (mountedRef.current) {
            setIsConnected(isConnected);
            if (isConnected) {
              setConnectionError(null);
            } else {
              setConnectionError(
                "Conexión perdida con el servidor. Intentando reconectar...",
              );
            }
          }
        } else if (connectionState === "Connected") {
          if (mountedRef.current) {
            setIsConnected(true);
            setConnectionError(null);
          }
        } else if (connectionState === "Disconnected") {
          if (mountedRef.current) {
            setIsConnected(false);
            setConnectionError(
              "No se pudo conectar con el servidor de datos. Verifica tu conexión a internet o contacta al administrador.",
            );
          }
        } else if (connectionState === "Connecting") {
          // Still connecting, keep current state
          // But set a timeout to detect if it's stuck connecting
          setTimeout(() => {
            if (mountedRef.current && connectionState === "Connecting") {
              setIsConnected(false);
              setConnectionError(
                "La conexión está tardando demasiado. Verifica tu conexión a internet.",
              );
            }
          }, 15000); // 15 second timeout for connecting state
        } else {
          // Unknown state, assume connected but log warning
        }
      } catch (error) {
        if (mountedRef.current) {
          setIsConnected(false);
          setConnectionError(
            "Error de conexión con el servidor de datos. Por favor, recarga la página.",
          );
        }
      }
    };

    // Check immediately
    checkConnection();

    // Check periodically (every 5 seconds)
    checkIntervalRef.current = setInterval(checkConnection, 5000);

    // Also listen for online/offline events
    const handleOnline = () => {
      if (mountedRef.current) {
        setIsConnected(true);
        setConnectionError(null);
        checkConnection(); // Re-check immediately when coming online
      }
    };

    const handleOffline = () => {
      if (mountedRef.current) {
        setIsConnected(false);
        setConnectionError(
          "No tienes conexión a internet. Algunas funciones pueden no estar disponibles.",
        );
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    return () => {
      mountedRef.current = false;
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, [convex]);

  return {
    isConnected,
    connectionError,
    hasConnectionIssue: !isConnected || connectionError !== null,
  };
}
