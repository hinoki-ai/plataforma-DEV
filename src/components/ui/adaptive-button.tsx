"use client";

import React, { forwardRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button, buttonVariants } from "./button";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

export type ButtonContext = "public" | "auth" | "auto";

/**
 * Enhanced button variants for context-aware styling
 * Extends the base button with public/auth context enhancements
 */
const adaptiveButtonVariants = cva("transition-all duration-200 ease-out", {
  variants: {
    context: {
      public: "",
      auth: "",
      auto: "",
    },
    enhancement: {
      none: "",
      gradient:
        "bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]",
      glow: "shadow-lg hover:shadow-2xl ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-200",
      minimal: "hover:bg-muted/30 transition-colors duration-200",
    },
    loading: {
      true: "cursor-wait opacity-80 scale-[0.98]",
      false: "",
    },
    success: {
      true: "bg-green-500 hover:bg-green-600 text-white scale-[1.02]",
      false: "",
    },
  },
  compoundVariants: [
    // Public context enhancements
    {
      context: "public",
      enhancement: "gradient",
      class:
        "backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 text-white shadow-2xl hover:shadow-white/10",
    },
    {
      context: "public",
      enhancement: "glow",
      class: "ring-white/30 hover:ring-white/50 shadow-2xl",
    },
    // Auth context enhancements
    {
      context: "auth",
      enhancement: "minimal",
      class: "hover:bg-muted/50",
    },
  ],
});

export interface AdaptiveButtonProps
  extends React.ComponentProps<typeof Button>,
    VariantProps<typeof adaptiveButtonVariants> {
  /**
   * Context override - auto-detects by default
   */
  context?: ButtonContext;
  /**
   * Visual enhancement level for the context
   */
  enhancement?: "none" | "gradient" | "glow" | "minimal";
  /**
   * Enable dramatic hover effects for public context
   */
  dramatic?: boolean;
  /**
   * Loading state with spinner
   */
  loading?: boolean;
  /**
   * Success state with checkmark
   */
  success?: boolean;
  /**
   * Enable touch feedback for mobile
   */
  touchFeedback?: boolean;
}

/**
 * Adaptive Button Component
 *
 * Extends the base Button component with context-aware enhancements:
 * - Public: More dramatic effects, gradients, glows, glass-morphism
 * - Auth: Subtle, professional interactions
 * - Auto: Detects context based on route and session
 */
const AdaptiveButton = forwardRef<HTMLButtonElement, AdaptiveButtonProps>(
  (
    {
      className,
      context = "auto",
      enhancement = "none",
      dramatic = false,
      variant = "default",
      loading = false,
      success = false,
      touchFeedback = true,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const pathname = usePathname();
    const { data: session } = useSession();

    // Auto-detect context based on route and session
    const detectedContext: Exclude<ButtonContext, "auto"> =
      context !== "auto"
        ? context
        : session &&
            (pathname?.startsWith("/admin") ||
              pathname?.startsWith("/profesor") ||
              pathname?.startsWith("/parent"))
          ? "auth"
          : "public";

    // Auto-select enhancement based on context if none specified
    const contextEnhancement =
      enhancement !== "none"
        ? enhancement
        : detectedContext === "public"
          ? dramatic
            ? "gradient"
            : "glow"
          : "minimal";

    // Apply context-specific variant adjustments
    const contextVariant =
      detectedContext === "public" && variant === "default"
        ? "outline" // Public context prefers outline with enhancements
        : variant;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || success) return;

      // Add touch feedback for mobile
      if (touchFeedback && "vibrate" in navigator) {
        navigator.vibrate(10);
      }

      onClick?.(e);
    };

    return (
      <Button
        ref={ref}
        variant={contextVariant}
        disabled={loading || props.disabled}
        onClick={handleClick}
        className={cn(
          // Apply adaptive enhancements
          adaptiveButtonVariants({
            context: detectedContext,
            enhancement: contextEnhancement,
            loading,
            success,
          }),
          // Public context dramatic effects
          detectedContext === "public" &&
            dramatic && [
              "transform hover:scale-105 transition-all duration-300",
              "hover:-translate-y-0.5 hover:shadow-2xl",
            ],
          // Touch feedback styles
          touchFeedback && "active:scale-95",
          // Custom className
          className,
        )}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Cargando...</span>
          </div>
        ) : success ? (
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Completado</span>
          </div>
        ) : (
          children
        )}
      </Button>
    );
  },
);

AdaptiveButton.displayName = "AdaptiveButton";

/**
 * Utility function to get button styling based on context
 */
export function getAdaptiveButtonStyles(
  context: ButtonContext = "auto",
  enhancement: "none" | "gradient" | "glow" | "minimal" = "none",
  pathname?: string,
  session?: any,
): string {
  const detectedContext =
    context !== "auto"
      ? context
      : session &&
          (pathname?.startsWith("/admin") ||
            pathname?.startsWith("/profesor") ||
            pathname?.startsWith("/parent"))
        ? "auth"
        : "public";

  return adaptiveButtonVariants({ context: detectedContext, enhancement });
}

/**
 * Pre-configured button variants for common use cases
 */

/**
 * Primary action button with context-aware styling
 */
export const AdaptivePrimaryButton = forwardRef<
  HTMLButtonElement,
  Omit<AdaptiveButtonProps, "variant">
>((props, ref) => (
  <AdaptiveButton
    ref={ref}
    variant="default"
    enhancement="gradient"
    dramatic
    {...props}
  />
));
AdaptivePrimaryButton.displayName = "AdaptivePrimaryButton";

/**
 * Secondary action button with context-aware styling
 */
export const AdaptiveSecondaryButton = forwardRef<
  HTMLButtonElement,
  Omit<AdaptiveButtonProps, "variant">
>((props, ref) => (
  <AdaptiveButton ref={ref} variant="outline" enhancement="glow" {...props} />
));
AdaptiveSecondaryButton.displayName = "AdaptiveSecondaryButton";

/**
 * Ghost button with context-aware styling
 */
export const AdaptiveGhostButton = forwardRef<
  HTMLButtonElement,
  Omit<AdaptiveButtonProps, "variant">
>((props, ref) => (
  <AdaptiveButton ref={ref} variant="ghost" enhancement="minimal" {...props} />
));
AdaptiveGhostButton.displayName = "AdaptiveGhostButton";

export { AdaptiveButton };
