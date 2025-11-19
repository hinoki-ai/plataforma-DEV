"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useDragControls } from "motion/react";
import type { PanInfo } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSession } from "next-auth/react";
import { signOut } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import { NavigationIcons, ThemeIcons } from "@/components/icons/hero-icons";
import {
  QuickSearch,
  SmartRecommendations,
  BreadcrumbNavigation,
  navigationUtils,
} from "./NavigationEnhancements";
import {
  Search,
  HelpCircle,
  Zap,
  Crown,
  Globe,
  Settings,
  Eye,
  AlertTriangle,
  Monitor,
  Database,
  Shield,
  Terminal,
  FileText,
} from "lucide-react";
import { useLanguage } from "@/components/language/useDivineLanguage";
import { AdvancedSettingsDropdown } from "@/components/master/AdvancedSettingsDropdown";
import { getNavigationGroupsForRole, NAVIGATION_CONFIGS } from "./navigation";

interface EnhancedSidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavigationItem {
  readonly title: string;
  readonly href: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly badge?: string;
  readonly shortcut?: string;
  readonly category: string;
  readonly description?: string;
}

// Helper function to get shortcuts for specific role
const getKeyboardShortcuts = (
  role: string | undefined,
  pathname: string
): Record<string, string> => {
  const shortcuts: Record<string, string> = {
    Escape: "close-sidebar",
    "Ctrl+K": "open-search",
    "?": "show-shortcuts",
  };

  if (!role) return shortcuts;

  const groups = getNavigationGroupsForRole(role, pathname);
  groups.forEach((group) => {
    group.items.forEach((item: any) => {
      if (item.shortcut) {
        shortcuts[item.shortcut] = item.href;
      }
    });
  });

  return shortcuts;
};

export function EnhancedSidebar({
  className,
  isCollapsed = false,
  onToggle,
  isMobile = false,
  isOpen = true,
  onClose,
}: EnhancedSidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const dragControls = useDragControls();
  const { t } = useLanguage();

  const userRole = session?.user?.role ?? null;

  // State management
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  const [usageData, setUsageData] = useState(() =>
    navigationUtils.getUsageData(),
  );

  // Get navigation items for current role
  const navigationGroups = useMemo(() => {
    if (!userRole) return [];
    return getNavigationGroupsForRole(userRole, pathname);
  }, [userRole, pathname]);

  // Flatten items for search and recommendations
  const allNavigationItems = useMemo(() => {
    return navigationGroups.flatMap((group) => 
      group.items.map((item: any) => ({
        ...item,
        category: t(group.title), // Ensure category is translated for search
        title: item.title,
      }))
    );
  }, [navigationGroups, t]);

  // Handle navigation with usage tracking
  const handleNavigate = useCallback(
    (href: string) => {
      navigationUtils.trackNavigation(href);
      setUsageData(navigationUtils.getUsageData());
      router.push(href);
      if (isMobile) {
        onClose?.();
      }
    },
    [router, isMobile, onClose],
  );

  // Logout handler
  const handleLogout = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error during logout:", error);
      router.push("/");
    }
  }, [router]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!session) return;

      // Handle Ctrl+K for search
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setQuickSearchOpen(true);
        return;
      }

      // Handle ? for shortcuts help
      if (
        event.key === "?" &&
        !event.shiftKey &&
        !event.ctrlKey &&
        !event.metaKey
      ) {
        event.preventDefault();
        setShortcutsHelpOpen(true);
        return;
      }

      // Handle Escape
      if (event.key === "Escape") {
        event.preventDefault();
        if (quickSearchOpen) {
          setQuickSearchOpen(false);
        } else if (shortcutsHelpOpen) {
          setShortcutsHelpOpen(false);
        } else if (isMobile && isOpen) {
          onClose?.();
        } else {
          onToggle?.();
        }
        return;
      }

      // Handle Alt+ shortcuts
      const keyboardShortcuts = getKeyboardShortcuts(userRole || undefined, pathname);
      const shortcut = Object.keys(keyboardShortcuts).find((key) => {
        const [modifier, char] = key.split("+");
        if (modifier === "Alt") {
          return event.altKey && event.key.toLowerCase() === char.toLowerCase();
        }
        return false;
      });

      if (shortcut && shortcut !== "Escape") {
        event.preventDefault();
        const action =
          keyboardShortcuts[shortcut as keyof typeof keyboardShortcuts];
        if (action && typeof action === "string") {
          if ((action as string).startsWith("/")) {
            handleNavigate(action);
          }
        }
      }
    },
    [
      session,
      quickSearchOpen,
      shortcutsHelpOpen,
      isMobile,
      isOpen,
      onClose,
      onToggle,
      handleNavigate,
      t,
      userRole,
      pathname,
    ],
  );

  // Set up keyboard listeners
  useEffect(() => {
    const debouncedHandler = (event: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      handleKeyDown(event);
    };

    window.addEventListener("keydown", debouncedHandler);
    return () => window.removeEventListener("keydown", debouncedHandler);
  }, [handleKeyDown]);

  // Mobile drag to close functionality
  const handleDragEnd = useCallback(
    (_: TouchEvent | MouseEvent | PointerEvent, info: PanInfo) => {
      if (isMobile && info.offset.x < -100) {
        onClose?.();
      }
    },
    [isMobile, onClose],
  );

  // Generate breadcrumbs
  const breadcrumbs = useMemo(
    () => navigationUtils.generateBreadcrumbs(pathname, session?.user?.role),
    [pathname, session?.user?.role],
  );

  const sidebarVariants = {
    open: {
      x: 0,
      transition: { type: "spring" as const, damping: 30, stiffness: 300 },
    },
    closed: {
      x: isMobile ? -320 : 0,
      transition: { type: "spring" as const, damping: 30, stiffness: 300 },
    },
  };

  const overlayVariants = {
    open: { opacity: 1, pointerEvents: "auto" as const },
    closed: { opacity: 0, pointerEvents: "none" as const },
  };

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile overlay */}
      {isMobile && (
        <motion.div
          variants={overlayVariants}
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <motion.aside
        variants={sidebarVariants}
        initial={isMobile ? "closed" : "open"}
        animate={isOpen ? "open" : "closed"}
        drag={isMobile ? "x" : undefined}
        dragConstraints={isMobile ? { left: -100, right: 0 } : undefined}
        dragElastic={isMobile ? { left: 0.1, right: 0 } : undefined}
        dragControls={dragControls}
        onDragEnd={handleDragEnd as any}
        className={cn(
          "relative flex flex-col bg-background border-r border-border transition-all duration-300",
          isMobile ? "fixed left-0 top-0 z-50 h-full w-80" : "",
          isCollapsed ? "w-16" : "w-64",
          className,
        )}
        aria-label="Navegación principal"
        role="navigation"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <NavigationIcons.Planning className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold text-sm">Plataforma Astral</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            {!isCollapsed && !isMobile && (
              <>
                {/* Quick Search Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQuickSearchOpen(true)}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Búsqueda rápida (Ctrl+K)</p>
                  </TooltipContent>
                </Tooltip>

                {/* Shortcuts Help Button */}
              </>
            )}

            {/* Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 mb-1"
              onClick={isMobile ? onClose : onToggle}
              aria-label={
                isMobile
                  ? "Cerrar menú"
                  : isCollapsed
                    ? "Expandir barra lateral"
                    : "Contraer barra lateral"
              }
            >
              <NavigationIcons.ChevronRight
                className="h-4 w-4 transition-transform"
                aria-hidden="true"
              />
            </Button>
          </div>
        </div>

        {/* Breadcrumbs */}
        {!isCollapsed && breadcrumbs.length > 1 && (
          <div className="border-b border-border px-4 py-2">
            <BreadcrumbNavigation
              items={breadcrumbs}
              onNavigate={handleNavigate}
            />
          </div>
        )}

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-4">
            {/* Smart Recommendations */}
            {!isCollapsed && usageData.length > 0 && showRecommendations && (
              <SmartRecommendations
                usageData={usageData}
                allItems={allNavigationItems}
                currentPath={pathname}
                onNavigate={handleNavigate}
              />
            )}

            {/* Regular Navigation */}
            <div className="space-y-6">
              {navigationGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-1">
                  {!isCollapsed && group.title && (
                    <div className="px-2 py-1 mb-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {t(group.title)}
                      </span>
                    </div>
                  )}
                  {group.items.map((item: any) => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/");
                    const Icon = item.icon;

                    if (isCollapsed) {
                      return (
                        <Tooltip key={item.href}>
                          <TooltipTrigger asChild>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleNavigate(item.href)}
                              className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-lg transition-colors mb-1 mx-auto",
                                isActive
                                  ? "bg-primary text-primary-foreground shadow-md"
                                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                              )}
                            >
                              <Icon className="h-5 w-5" />
                            </motion.button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="flex items-center gap-2">
                            <span>{t(item.title)}</span>
                            {item.shortcut && (
                              <span className="text-xs opacity-60 bg-background/20 px-1 rounded">
                                {item.shortcut}
                              </span>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return (
                      <motion.button
                        key={item.href}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleNavigate(item.href)}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                            isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground",
                          )}
                        />
                        <span className="flex-1 text-left truncate">
                          {t(item.title)}
                        </span>
                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <Badge
                              variant="secondary"
                              className="h-5 px-1.5 text-[10px] font-normal"
                            >
                              {item.badge}
                            </Badge>
                          )}
                          {item.shortcut && (
                            <kbd className="hidden pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity lg:inline-flex">
                              {item.shortcut}
                            </kbd>
                          )}
                        </div>
                        {isActive && (
                          <motion.div
                            layoutId="active-indicator"
                            className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Toggle Recommendations */}
            {!isCollapsed && usageData.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => setShowRecommendations(!showRecommendations)}
              >
                <Zap className="h-3 w-3 mr-2" />
                {showRecommendations
                  ? "Ocultar recomendaciones"
                  : "Mostrar recomendaciones"}
              </Button>
            )}
          </nav>
        </ScrollArea>

        {/* User Section */}
        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between">
            <div
              className={cn(
                "flex items-center gap-3",
                isCollapsed && "justify-center",
              )}
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <NavigationIcons.Profile className="h-4 w-4 text-primary" />
              </div>
              {!isCollapsed && (
                <div className="flex-1">
                  <p className="text-sm font-medium">{session?.user?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {session?.user?.role === "ADMIN"
                      ? "Administrador"
                      : session?.user?.role === "PROFESOR"
                        ? "Profesor"
                        : session?.user?.role === "MASTER"
                          ? "🏛️ SUPREMO MASTER"
                          : "Padre/Apoderado"}
                  </p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-xs"
              >
                <ThemeIcons.Logout className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Quick Search Dialog */}
        <AnimatePresence>
          {quickSearchOpen && (
            <QuickSearch
              items={allNavigationItems}
              onNavigate={handleNavigate}
              isOpen={quickSearchOpen}
              onClose={() => setQuickSearchOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Shortcuts Help Dialog */}
        <AnimatePresence>
          {shortcutsHelpOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={() => setShortcutsHelpOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-xl bg-background p-6 shadow-2xl border"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <NavigationIcons.Planning className="h-5 w-5" />
                    {t("nav.shortcuts", "Atajos de Teclado")}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => setShortcutsHelpOpen(false)}>
                    <NavigationIcons.Close className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-2 max-h-[60vh] overflow-y-auto">
                  {Object.entries(getKeyboardShortcuts(userRole || undefined, pathname)).map(([key, href]) => {
                    const item = allNavigationItems.find(i => i.href === href);
                    // Handle special static shortcuts
                    let label = href;
                    if (key === "Escape") label = "Cerrar / Volver";
                    else if (key === "Ctrl+K") label = "Búsqueda Rápida";
                    else if (key === "?") label = "Ver Atajos";
                    else if (item) label = t(item.title);
                    
                    return (
                      <div key={key} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                         <span className="font-medium text-muted-foreground">
                           {label}
                         </span>
                         <kbd className="rounded bg-muted px-2 py-1 font-mono text-xs font-bold">
                           {key}
                         </kbd>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </TooltipProvider>
  );
}
