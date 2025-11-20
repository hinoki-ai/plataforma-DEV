"use client";

import React, { createContext, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export type AppContext = "public" | "auth";

export interface ContextProviderValue {
  /**
   * Current application context - automatically detected
   */
  context: AppContext;

  /**
   * Whether the current route is a public page
   */
  isPublicRoute: boolean;

  /**
   * Whether the current route is an authenticated page
   */
  isAuthRoute: boolean;

  /**
   * Whether the user is authenticated
   */
  isAuthenticated: boolean;

  /**
   * Current user role if authenticated
   */
  userRole?: string;

  /**
   * Helper functions for component styling
   */
  getCardStyles: () => string;
  getButtonStyles: (variant?: "primary" | "secondary" | "ghost") => string;
  getTextStyles: (type?: "heading" | "body" | "muted") => string;
}

const ContextProviderContext = createContext<ContextProviderValue | undefined>(
  undefined,
);

export interface ContextProviderProps {
  children: React.ReactNode;
  /**
   * Force a specific context (useful for testing or special cases)
   */
  forceContext?: AppContext;
}

/**
 * Context Provider for automatic theme detection
 *
 * Automatically detects whether components should use public or auth styling
 * based on route patterns and authentication state
 */
export function ContextProvider({
  children,
  forceContext,
}: ContextProviderProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const contextValue = useMemo<ContextProviderValue>(() => {
    // Determine if current route is authenticated
    const isAuthRoute = Boolean(
      pathname &&
        (pathname.startsWith("/admin") ||
          pathname.startsWith("/profesor") ||
          pathname.startsWith("/parent")),
    );

    const isPublicRoute = !isAuthRoute;
    // Only consider authenticated when status is explicitly "authenticated"
    // During loading, treat as not authenticated to prevent hydration issues
    const isAuthenticated = status === "authenticated" && Boolean(session);

    // Auto-detect context based on route and auth state
    // During loading state, default to public context to match server render
    const detectedContext: AppContext =
      forceContext ||
      (status !== "loading" && isAuthRoute && isAuthenticated
        ? "auth"
        : "public");

    /**
     * Get adaptive card styles based on current context
     */
    const getCardStyles = (): string => {
      switch (detectedContext) {
        case "public":
          return "backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300";
        case "auth":
          return "bg-background border border-border shadow-sm hover:shadow-md transition-shadow rounded-lg";
        default:
          return "bg-background border border-border rounded-lg shadow-sm";
      }
    };

    /**
     * Get adaptive button styles based on current context
     */
    const getButtonStyles = (
      variant: "primary" | "secondary" | "ghost" = "primary",
    ): string => {
      const baseClasses =
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50";

      switch (detectedContext) {
        case "public":
          switch (variant) {
            case "primary":
              return `${baseClasses} bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-300`;
            case "secondary":
              return `${baseClasses} backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 text-white shadow-2xl hover:shadow-white/10`;
            case "ghost":
              return `${baseClasses} hover:bg-white/10 text-white/90 hover:text-white`;
            default:
              return baseClasses;
          }
        case "auth":
          switch (variant) {
            case "primary":
              return `${baseClasses} bg-primary text-primary-foreground shadow-xs hover:bg-primary/90`;
            case "secondary":
              return `${baseClasses} border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground`;
            case "ghost":
              return `${baseClasses} hover:bg-accent hover:text-accent-foreground`;
            default:
              return baseClasses;
          }
        default:
          return baseClasses;
      }
    };

    /**
     * Get adaptive text styles based on current context
     */
    const getTextStyles = (
      type: "heading" | "body" | "muted" = "body",
    ): string => {
      switch (detectedContext) {
        case "public":
          switch (type) {
            case "heading":
              return "text-white font-bold text-2xl md:text-3xl lg:text-4xl";
            case "body":
              return "text-white text-base md:text-lg leading-relaxed";
            case "muted":
              return "text-gray-300 text-sm md:text-base";
            default:
              return "text-white";
          }
        case "auth":
          switch (type) {
            case "heading":
              return "text-foreground font-semibold text-xl md:text-2xl lg:text-3xl";
            case "body":
              return "text-foreground text-sm md:text-base";
            case "muted":
              return "text-muted-foreground text-xs md:text-sm";
            default:
              return "text-foreground";
          }
        default:
          return "";
      }
    };

    return {
      context: detectedContext,
      isPublicRoute,
      isAuthRoute,
      isAuthenticated,
      userRole: session?.user?.role,
      getCardStyles,
      getButtonStyles,
      getTextStyles,
    };
  }, [pathname, session, status, forceContext]);

  return (
    <ContextProviderContext.Provider value={contextValue}>
      {children}
    </ContextProviderContext.Provider>
  );
}

/**
 * Hook to access the current application context
 */
export function useAppContext(): ContextProviderValue {
  const context = useContext(ContextProviderContext);

  if (context === undefined) {
    throw new Error("useAppContext must be used within a ContextProvider");
  }

  return context;
}

/**
 * Hook to check if current context is public
 */
export function useIsPublicContext(): boolean {
  const { context } = useAppContext();
  return context === "public";
}

/**
 * Hook to check if current context is authenticated
 */
export function useIsAuthContext(): boolean {
  const { context } = useAppContext();
  return context === "auth";
}

/**
 * Hook to get context-aware styles
 */
export function useContextStyles() {
  const { getCardStyles, getButtonStyles, getTextStyles } = useAppContext();

  return {
    cardStyles: getCardStyles(),
    buttonStyles: {
      primary: getButtonStyles("primary"),
      secondary: getButtonStyles("secondary"),
      ghost: getButtonStyles("ghost"),
    },
    textStyles: {
      heading: getTextStyles("heading"),
      body: getTextStyles("body"),
      muted: getTextStyles("muted"),
    },
  };
}
