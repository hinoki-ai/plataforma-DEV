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
  const getVariantHeaderClass = () => {
    switch (variant) {
      case "feature":
        return "bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-pink-600/90";
      case "info":
        return "bg-gradient-to-r from-purple-600/90 via-pink-600/90 to-blue-600/90";
      case "action":
        return "bg-gradient-to-r from-green-600/90 via-blue-600/90 to-purple-600/90";
      default:
        return "bg-gradient-to-r from-gray-700/90 via-gray-600/90 to-gray-800/90";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "bg-gray-900/80 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden",
        className,
      )}
    >
      {showHeader && (title || subtitle || icon) && (
        <div
          className={cn(
            getVariantHeaderClass(),
            "p-6 text-white",
            headerClassName,
          )}
        >
          {icon && <div className="flex items-center gap-3 mb-2">{icon}</div>}
          {title && <h3 className="font-bold text-xl mb-1">{title}</h3>}
          {subtitle && <p className="text-gray-200 text-sm">{subtitle}</p>}
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
        return "bg-gradient-to-r from-blue-50/10 to-purple-50/10 border-blue-500/20";
      case "info":
        return "bg-gradient-to-r from-purple-50/10 to-pink-50/10 border-purple-500/20";
      case "action":
        return "bg-gradient-to-r from-green-50/10 to-blue-50/10 border-green-500/20";
      default:
        return "bg-gray-800/50 border-gray-700/50";
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-all duration-300 hover:shadow-lg",
        getCardClass(),
        className,
      )}
    >
      {(title || description || icon) && (
        <div className="mb-3">
          {icon && <div className="flex items-center gap-2 mb-2">{icon}</div>}
          {title && (
            <h4 className="font-semibold text-white text-lg mb-1">{title}</h4>
          )}
          {description && (
            <p className="text-gray-300 text-sm">{description}</p>
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
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          )}
          {subtitle && <p className="text-gray-300 text-sm">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
