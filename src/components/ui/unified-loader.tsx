"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2, MoreHorizontal, Circle as Pulse } from "lucide-react";

// =====================================================
// 🎯 UNIFIED LOADING SYSTEM - REPLACES 15+ LOADERS
// =====================================================
// Only 3 loaders needed for entire application:
// 1. SkeletonLoader - Content areas (most common)
// 2. ActionLoader - Buttons/forms (micro-interactions)
// 3. PageLoader - Full-page transitions (minimal)

// ===== 1. SKELETON LOADER (Content Areas) =====
interface SkeletonLoaderProps {
  lines?: number;
  variant?: "default" | "card" | "list" | "table";
  className?: string;
  showAvatar?: boolean;
}

export function SkeletonLoader({
  lines = 3,
  variant = "default",
  className,
  showAvatar = false,
}: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case "card":
        return (
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
            <div className="space-y-2">
              {Array.from({ length: lines }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-3 bg-muted rounded animate-pulse",
                    i === lines - 1 ? "w-1/2" : "w-full",
                  )}
                />
              ))}
            </div>
          </div>
        );

      case "list":
        return (
          <div className="space-y-3">
            {Array.from({ length: lines }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                {showAvatar && (
                  <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                )}
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                  <div className="h-2 bg-muted rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        );

      case "table":
        return (
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-muted rounded flex-1 animate-pulse" />
                <div className="h-4 bg-muted rounded flex-1 animate-pulse" />
                <div className="h-4 bg-muted rounded w-20 animate-pulse" />
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-4 bg-muted rounded animate-pulse",
                  i === 0 ? "w-3/4" : i === lines - 1 ? "w-1/2" : "w-full",
                )}
              />
            ))}
          </div>
        );
    }
  };

  return (
    <div className={cn("animate-pulse", className)}>{renderSkeleton()}</div>
  );
}

// ===== 2. ACTION LOADER (Buttons/Forms) =====
interface ActionLoaderProps {
  variant?: "spinner" | "dots" | "pulse";
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: "default" | "primary" | "white";
}

export function ActionLoader({
  variant = "spinner",
  size = "md",
  className,
  color = "default",
}: ActionLoaderProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const colorClasses = {
    default: "text-muted-foreground",
    primary: "text-primary",
    white: "text-white",
  };

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return (
          <div className="flex items-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "rounded-full bg-current animate-pulse",
                  size === "sm"
                    ? "w-1 h-1"
                    : size === "lg"
                      ? "w-1.5 h-1.5"
                      : "w-1 h-1",
                )}
                data-delay={i}
              />
            ))}
          </div>
        );

      case "pulse":
        return (
          <Pulse
            className={cn(
              sizeClasses[size],
              colorClasses[color],
              "animate-pulse",
            )}
          />
        );

      default:
        return (
          <Loader2
            className={cn(
              sizeClasses[size],
              colorClasses[color],
              "animate-spin",
            )}
          />
        );
    }
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      {renderLoader()}
    </div>
  );
}

// ===== 3. PAGE LOADER (Full-page transitions) =====
interface PageLoaderProps {
  text?: string;
  variant?: "minimal" | "centered" | "fullscreen";
  className?: string;
}

export function PageLoader({
  text = "Cargando...",
  variant = "minimal",
  className,
}: PageLoaderProps) {
  const variants = {
    minimal: "p-8",
    centered: "min-h-[50vh] p-12",
    fullscreen: "min-h-screen p-16",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        variants[variant],
        className,
      )}
    >
      <ActionLoader size="lg" className="mb-4" />
      <p className="text-sm text-muted-foreground font-medium">{text}</p>
    </div>
  );
}

// ===== MIGRATION HELPERS (Backward Compatibility) =====
// These help migrate from old loader components

/**
 * @deprecated Use SkeletonLoader instead
 */
export const DashboardLoader = ({ className }: { className?: string }) => (
  <SkeletonLoader variant="card" lines={4} className={className} />
);

/**
 * @deprecated Use PageLoader instead
 */
export const DataTransferLoader = ({ text }: { text?: string }) => (
  <PageLoader text={text} variant="centered" />
);

/**
 * @deprecated Use ActionLoader instead
 */
export const LoadingSpinner = ({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) => <ActionLoader variant="spinner" size={size} />;

// Export all for easy imports
export {
  SkeletonLoader as Skeleton,
  ActionLoader as Action,
  PageLoader as Page,
};

// Default export for main component
export default SkeletonLoader;
