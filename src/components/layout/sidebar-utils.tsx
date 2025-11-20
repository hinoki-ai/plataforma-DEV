import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NavigationIcons } from "@/components/icons/hero-icons";

export interface NavigationItem {
  readonly title: string;
  readonly href?: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly badge?: string;
  readonly action?: string;
}

// Helper function to handle navigation item clicks
export const handleNavigationItemClick = (
  item: NavigationItem,
  pathname: string,
  onToggle?: () => void,
  handleLogout?: () => void,
) => {
  return (e: React.MouseEvent) => {
    // Handle action items (like logout)
    if (item.action === "logout") {
      e.preventDefault();
      handleLogout?.();
      return;
    }

    // Handle link items
    if (item.href) {
      // Prevent double navigation if already on the same route
      if (pathname === item.href) {
        e.preventDefault();
        return;
      }
      // Close mobile sidebar on navigation - hydration-safe
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        onToggle?.();
      }
    }
  };
};

// Helper function to render navigation item content
export const renderNavigationItem = (
  item: NavigationItem,
  isActive: boolean,
  pathname: string,
  t: (key: string, namespace?: string) => string,
  onToggle?: () => void,
  handleLogout?: () => void,
): React.ReactElement => {
  const handleClick = handleNavigationItemClick(
    item,
    pathname,
    onToggle,
    handleLogout,
  );

  // Determine namespace based on key prefix
  const getNamespace = (key: string): string => {
    if (key.startsWith("nav.")) return "navigation";
    return "common";
  };

  const namespace = getNamespace(item.title);
  const translatedTitle = t(item.title, namespace);

  if (item.action === "logout") {
    // Render as button for actions
    return (
      <button
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground ml-2 w-full text-left",
          "text-muted-foreground hover:text-foreground",
        )}
        aria-label={translatedTitle}
        onClick={handleClick}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        <span className="flex-1">{translatedTitle}</span>
      </button>
    );
  }

  // Render as link for navigation items
  return (
    <Link
      href={item.href || "#"}
      prefetch={false}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground ml-2",
        isActive
          ? "bg-accent text-accent-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
      aria-current={isActive ? "page" : undefined}
      aria-label={`${translatedTitle}${(item as any).shortcut ? ` (${(item as any).shortcut})` : ""}`}
      onClick={handleClick}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{translatedTitle}</span>
      {(item as any).badge && (
        <span className="ml-auto bg-accent text-accent-foreground text-xs px-1.5 py-0.5 rounded">
          {(item as any).badge}
        </span>
      )}
    </Link>
  );
};

export const renderCollapsedNavigationItem = (
  item: NavigationItem,
  isActive: boolean,
  pathname: string,
  t: (key: string, namespace?: string) => string,
  onToggle?: () => void,
  handleLogout?: () => void,
): React.ReactElement => {
  const handleClick = handleNavigationItemClick(
    item,
    pathname,
    onToggle,
    handleLogout,
  );

  const baseClasses =
    "flex h-10 w-10 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  const stateClasses = isActive
    ? "bg-accent text-accent-foreground shadow-sm"
    : "text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground";

  // Determine namespace based on key prefix
  const getNamespace = (key: string): string => {
    if (key.startsWith("nav.")) return "navigation";
    return "common";
  };

  const namespace = getNamespace(item.title);
  const label = t ? t(item.title, namespace) : item.title;

  if (item.action === "logout") {
    return (
      <Tooltip key={`collapsed-${item.title}`}>
        <TooltipTrigger asChild>
          <button
            className={cn(baseClasses, stateClasses, "mx-auto")}
            aria-label={`${label}${(item as any).shortcut ? ` (${(item as any).shortcut})` : ""}`}
            onClick={handleClick}
          >
            <item.icon className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <div className="flex items-center gap-2">
            <span>{label}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip key={`collapsed-${item.href || item.title}`}>
      <TooltipTrigger asChild>
        <Link
          href={item.href || "#"}
          prefetch={false}
          className={cn(baseClasses, stateClasses, "mx-auto")}
          aria-current={isActive ? "page" : undefined}
          aria-label={`${label}${(item as any).shortcut ? ` (${(item as any).shortcut})` : ""}`}
          onClick={handleClick}
        >
          <item.icon className="h-4 w-4" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">
        <div className="flex items-center gap-2">
          <span>{label}</span>
          {(item as any).shortcut && (
            <span className="text-xs opacity-60">{(item as any).shortcut}</span>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
