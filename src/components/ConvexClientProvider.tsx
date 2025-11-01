"use client";

import { ReactNode } from "react";
import { ConvexProviderWithAuth } from "convex/react";
import { ConvexReactClient } from "convex/react";
import { useAuth } from "@clerk/nextjs";

// Create a custom auth hook that matches Convex's expected interface
const useConvexAuth = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  return () => ({
    isLoading: !isLoaded,
    isAuthenticated: !!isSignedIn,
    fetchAccessToken: async ({
      forceRefreshToken,
    }: {
      forceRefreshToken: boolean;
    }) => {
      try {
        return await getToken({ skipCache: forceRefreshToken });
      } catch (error) {
        console.error("Error fetching access token:", error);
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

const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useConvexAuth()}>
      {children}
    </ConvexProviderWithAuth>
  );
}

export default ConvexClientProvider;
