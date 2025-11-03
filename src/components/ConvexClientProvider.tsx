"use client";

import React, { ReactNode } from "react";
import { ConvexProviderWithAuth } from "convex/react";
import { ConvexReactClient } from "convex/react";
import { useAuth } from "@clerk/nextjs";

// Create a custom auth hook that matches Convex's expected interface
const useConvexAuth = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  // Cache the last token to avoid frequent refreshes
  const [cachedToken, setCachedToken] = React.useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = React.useState<number | null>(null);

  return () => ({
    isLoading: !isLoaded,
    isAuthenticated: !!isSignedIn,
    fetchAccessToken: async ({
      forceRefreshToken,
    }: {
      forceRefreshToken: boolean;
    }) => {
      try {
        // Only force refresh if explicitly requested OR if token is expired/expiring soon
        const shouldRefresh =
          forceRefreshToken ||
          !cachedToken ||
          !tokenExpiry ||
          Date.now() > tokenExpiry - 60000; // Refresh if expiring within 1 minute

        if (!shouldRefresh && cachedToken) {
          return cachedToken;
        }

        const token = await getToken({ skipCache: forceRefreshToken });

        if (token) {
          // Cache the token and estimate expiry (JWT tokens typically last 1 hour)
          setCachedToken(token);
          // Try to decode token to get actual expiry, fallback to 50 minutes from now
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setTokenExpiry(payload.exp * 1000); // Convert to milliseconds
          } catch {
            setTokenExpiry(Date.now() + 50 * 60 * 1000); // 50 minutes
          }
        }

        return token;
      } catch (error) {
        console.error("Error fetching access token:", error);
        setCachedToken(null);
        setTokenExpiry(null);
        return null;
      }
    },
  });
};

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_CONVEX_URL environment variable required for Convex client",
  );
}

const convex = new ConvexReactClient(convexUrl, {
  verbose: false,
  reportDebugInfoToConvex: false,
  logger: {
    log: (...args: any[]) => {
      // Filter out WebSocket reconnection logs that are too verbose
      const message = args.join(" ");
      if (
        message.includes("WebSocket reconnected at") ||
        message.includes("WebSocket connection") ||
        message.includes("WebSocket closed")
      ) {
        return; // Suppress connection-related logs
      }
      console.log(...args);
    },
    warn: (...args: any[]) => console.warn(...args),
    error: (...args: any[]) => console.error(...args),
    logVerbose: (...args: any[]) => {
      // Suppress verbose logs entirely
      return;
    },
  },
});

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useConvexAuth()}>
      {children}
    </ConvexProviderWithAuth>
  );
}

export default ConvexClientProvider;
