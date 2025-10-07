"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export type CardContext = "public" | "auth" | "auto";

export interface AdaptiveCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardContext;
  hover?: boolean;
  interactive?: boolean;
}

/**
 * Context-Aware Card Component
 *
 * Automatically detects context or accepts explicit variant prop:
 * - Public: Glass-morphism with backdrop blur and dark styling
 * - Auth: Clean professional styling with subtle shadows
 * - Auto: Detects based on route and session state
 */
const AdaptiveCard = forwardRef<HTMLDivElement, AdaptiveCardProps>(
  (
    {
      className,
      variant = "auto",
      hover = true,
      interactive = false,
      ...props
    },
    ref,
  ) => {
    const pathname = usePathname();
    const { data: session } = useSession();

    // Auto-detect context based on route and session
    const detectedContext: Exclude<CardContext, "auto"> =
      variant !== "auto"
        ? variant
        : session &&
            (pathname?.startsWith("/admin") ||
              pathname?.startsWith("/profesor") ||
              pathname?.startsWith("/parent"))
          ? "auth"
          : "public";

    const getContextStyles = (context: Exclude<CardContext, "auto">) => {
      switch (context) {
        case "public":
          return cn(
            // Glass-morphism base
            "backdrop-blur-xl bg-gray-900/80 border border-gray-700/50",
            "rounded-2xl shadow-2xl",
            // Hover effects for public context
            hover &&
              "hover:shadow-2xl hover:-translate-y-1 transition-all duration-300",
            // Interactive states
            interactive && "cursor-pointer hover:bg-gray-900/90",
          );

        case "auth":
          return cn(
            // Professional clean styling
            "bg-background border border-border shadow-sm",
            "rounded-lg",
            // Subtle hover effects for auth context
            hover && "hover:shadow-md transition-shadow duration-200",
            // Interactive states
            interactive && "cursor-pointer hover:bg-muted/50",
          );

        default:
          return "bg-background border border-border rounded-lg shadow-sm";
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base card styling
          "overflow-hidden",
          // Context-specific styling
          getContextStyles(detectedContext),
          // Custom className override
          className,
        )}
        {...props}
      />
    );
  },
);

AdaptiveCard.displayName = "AdaptiveCard";

/**
 * Card Header with context-aware styling
 */
const AdaptiveCardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isPublicContext =
    !session ||
    !(
      pathname?.startsWith("/admin") ||
      pathname?.startsWith("/profesor") ||
      pathname?.startsWith("/parent")
    );

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5 p-6",
        // Context-specific text colors
        isPublicContext ? "text-white" : "text-foreground",
        className,
      )}
      {...props}
    />
  );
});

AdaptiveCardHeader.displayName = "AdaptiveCardHeader";

/**
 * Card Title with context-aware typography
 */
const AdaptiveCardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isPublicContext =
    !session ||
    !(
      pathname?.startsWith("/admin") ||
      pathname?.startsWith("/profesor") ||
      pathname?.startsWith("/parent")
    );

  return (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        // Context-specific text colors
        isPublicContext ? "text-white" : "text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
});

AdaptiveCardTitle.displayName = "AdaptiveCardTitle";

/**
 * Card Description with context-aware styling
 */
const AdaptiveCardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isPublicContext =
    !session ||
    !(
      pathname?.startsWith("/admin") ||
      pathname?.startsWith("/profesor") ||
      pathname?.startsWith("/parent")
    );

  return (
    <p
      ref={ref}
      className={cn(
        "text-sm",
        // Context-specific text colors
        isPublicContext ? "text-gray-300" : "text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
});

AdaptiveCardDescription.displayName = "AdaptiveCardDescription";

/**
 * Card Content with context-aware padding
 */
const AdaptiveCardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />;
});

AdaptiveCardContent.displayName = "AdaptiveCardContent";

/**
 * Card Footer with context-aware styling
 */
const AdaptiveCardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  );
});

AdaptiveCardFooter.displayName = "AdaptiveCardFooter";

export {
  AdaptiveCard,
  AdaptiveCardHeader,
  AdaptiveCardTitle,
  AdaptiveCardDescription,
  AdaptiveCardContent,
  AdaptiveCardFooter,
};

// Export types for use in other components
export type { AdaptiveCardProps as CardProps };

/**
 * Utility function to get card styling based on context
 * For use in components that need conditional card styling
 */
export function getAdaptiveCardStyles(
  context: "public" | "auth" | "auto" = "auto",
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

  switch (detectedContext) {
    case "public":
      return "backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300";
    case "auth":
      return "bg-background border border-border shadow-sm hover:shadow-md transition-shadow rounded-lg";
    default:
      return "bg-background border border-border rounded-lg shadow-sm";
  }
}
