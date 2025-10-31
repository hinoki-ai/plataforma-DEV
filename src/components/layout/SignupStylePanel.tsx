"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

// Signup-style Panel System - Based on UnifiedSignupForm design
// Provides consistent styling and behavior across all signup-style panels

export type SignupPanelVariant = "default" | "feature" | "info" | "action";
export type SignupGridColumns = 1 | 2 | 3 | 4;

interface SignupStylePanelProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  variant?: SignupPanelVariant;
  showHeader?: boolean;
  icon?: ReactNode;
}

export function SignupStylePanel({
  title,
  subtitle,
  children,
  className,
  headerClassName,
  contentClassName,
  variant = "default",
  showHeader = true,
  icon,
}: SignupStylePanelProps) {
  const headerStyles: Record<SignupPanelVariant, string> = {
    default:
      "bg-white/5 dark:bg-black/30 border-white/10 dark:border-white/10 text-foreground",
    feature: "bg-primary/10 border-primary/30 text-foreground",
    info: "bg-blue-500/10 border-blue-500/30 text-foreground",
    action: "bg-emerald-500/10 border-emerald-500/30 text-foreground",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "backdrop-blur-xl bg-card/85 border border-border/70 dark:border-border/40 rounded-2xl shadow-2xl overflow-hidden",
        className,
      )}
    >
      {showHeader && (title || subtitle || icon) && (
        <div
          className={cn(
            "px-6 py-5 border-b",
            headerStyles[variant],
            headerClassName,
          )}
        >
          {icon && <div className="flex items-center gap-3 mb-2">{icon}</div>}
          {title && (
            <h3 className="font-bold text-xl leading-tight text-foreground">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground/90 mt-1">{subtitle}</p>
          )}
        </div>
      )}

      <div className={cn("p-6", contentClassName)}>{children}</div>
    </motion.div>
  );
}

// Signup-style Card Component for content within panels
interface SignupStyleCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  variant?: SignupPanelVariant;
}

export function SignupStyleCard({
  title,
  description,
  children,
  className,
  icon,
  variant = "default",
}: SignupStyleCardProps) {
  const getCardClass = () => {
    switch (variant) {
      case "feature":
        return "border-primary/40 bg-card/95";
      case "info":
        return "border-blue-400/40 bg-blue-500/10";
      case "action":
        return "border-emerald-400/40 bg-emerald-500/10";
      default:
        return "border-border/60";
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card/90 p-6 text-foreground backdrop-blur-lg shadow-xl transition-all duration-300 hover:border-border hover:shadow-2xl",
        getCardClass(),
        className,
      )}
    >
      {(title || description || icon) && (
        <div className="mb-3">
          {icon && <div className="flex items-center gap-2 mb-2">{icon}</div>}
          {title && (
            <h4 className="font-semibold text-foreground text-lg mb-1">
              {title}
            </h4>
          )}
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// Signup-style Grid Layout
interface SignupStyleGridProps {
  children: ReactNode;
  columns?: SignupGridColumns;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function SignupStyleGrid({
  children,
  columns = 3,
  gap = "md",
  className,
}: SignupStyleGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  const gapClass = {
    sm: "gap-3",
    md: "gap-4",
    lg: "gap-6",
  };

  return (
    <div className={cn("grid", gridCols[columns], gapClass[gap], className)}>
      {children}
    </div>
  );
}

// Signup-style Section wrapper
interface SignupStyleSectionProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  variant?: SignupPanelVariant;
}

export function SignupStyleSection({
  title,
  subtitle,
  children,
  className,
  variant = "default",
}: SignupStyleSectionProps) {
  return (
    <section className={cn("space-y-6", className)}>
      {(title || subtitle) && (
        <div className="text-center">
          {title && (
            <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
          )}
          {subtitle && (
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
