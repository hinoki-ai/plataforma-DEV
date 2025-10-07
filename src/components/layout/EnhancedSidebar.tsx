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
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NavigationIcons, ThemeIcons } from "@/components/icons/hero-icons";
import {
  QuickSearch,
  SmartRecommendations,
  KeyboardShortcutsHelper,
  BreadcrumbNavigation,
  navigationUtils,
} from "./NavigationEnhancements";
import {
  Search,
  Command,
  HelpCircle,
  Zap,
  Star,
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
import { useLanguage } from "@/components/language/LanguageContext";
import { RoleSwitcher } from "@/components/auth/RoleSwitcher";

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

// Function to get translated navigation configuration
const getEnhancedNavigation = (
  t: (key: string, namespace?: string) => string,
) =>
  ({
    ADMIN: [
      {
        title: t("nav.admin.panel"),
        href: "/admin",
        icon: NavigationIcons.Analytics,
        shortcut: "Alt+H",
        category: t("nav.main.categories.principal"),
        description: t("nav.admin.panel"),
      },
      {
        title: t("nav.users"),
        href: "/admin/usuarios",
        icon: NavigationIcons.Profile,
        shortcut: "Alt+U",
        category: t("nav.main.categories.management"),
        description: t("nav.users"),
      },
      {
        title: t("nav.planning"),
        href: "/admin/planificaciones",
        icon: NavigationIcons.Planning,
        shortcut: "Alt+P",
        category: t("nav.main.categories.academic"),
        description: t("nav.planning"),
      },
      {
        title: t("nav.calendar"),
        href: "/admin/calendario-escolar",
        icon: NavigationIcons.Calendar,
        shortcut: "Alt+C",
        category: t("nav.main.categories.academic"),
        description: t("nav.calendar"),
      },
      {
        title: t("nav.team"),
        href: "/admin/equipo-multidisciplinario",
        icon: NavigationIcons.Team,
        shortcut: "Alt+E",
        category: t("nav.main.categories.team"),
        description: t("nav.team"),
      },
      {
        title: t("nav.meetings"),
        href: "/admin/reuniones",
        icon: NavigationIcons.Meeting,
        shortcut: "Alt+R",
        category: t("nav.main.categories.team"),
        description: t("nav.meetings"),
      },
      {
        title: t("nav.voting"),
        href: "/admin/votaciones",
        icon: NavigationIcons.Vote,
        shortcut: "Alt+V",
        category: t("nav.main.categories.team"),
        description: t("nav.voting"),
      },
      {
        title: t("nav.documents"),
        href: "/admin/documentos",
        icon: NavigationIcons.Documents,
        shortcut: "Alt+D",
        category: t("nav.main.categories.resources"),
        description: t("nav.documents"),
      },
      {
        title: t("nav.pme"),
        href: "/admin/pme",
        icon: NavigationIcons.Analytics,
        shortcut: "Alt+M",
        category: t("nav.main.categories.academic"),
        description: t("nav.pme"),
      },
      {
        title: t("nav.schedule"),
        href: "/admin/horarios",
        icon: NavigationIcons.Calendar,
        shortcut: "Alt+T",
        category: t("nav.main.categories.information"),
        description: t("nav.schedule"),
      },
      {
        title: t("nav.settings"),
        href: "/settings",
        icon: NavigationIcons.Settings,
        shortcut: "Alt+S",
        category: t("nav.main.categories.system"),
        description: t("nav.settings"),
      },
    ],
    PROFESOR: [
      {
        title: t("nav.home"),
        href: "/profesor",
        icon: NavigationIcons.Home,
        shortcut: "Alt+H",
        category: t("nav.main.categories.principal"),
        description: t("nav.dashboard"),
      },
      {
        title: t("nav.planning"),
        href: "/profesor/planificaciones",
        icon: NavigationIcons.Planning,
        shortcut: "Alt+P",
        category: t("nav.main.categories.academic"),
        description: t("nav.planning"),
      },
      {
        title: t("nav.calendar"),
        href: "/profesor/calendario-escolar",
        icon: NavigationIcons.Calendar,
        shortcut: "Alt+C",
        category: t("nav.main.categories.academic"),
        description: t("nav.calendar"),
      },
      {
        title: t("nav.pme"),
        href: "/profesor/pme",
        icon: NavigationIcons.Analytics,
        shortcut: "Alt+M",
        category: t("nav.main.categories.academic"),
        description: t("nav.pme"),
      },
      {
        title: t("nav.parent.meetings"),
        href: "/profesor/reuniones",
        icon: NavigationIcons.Team,
        shortcut: "Alt+R",
        category: t("nav.main.categories.communication"),
        description: t("nav.parent.meetings"),
      },
      {
        title: t("nav.schedule"),
        href: "/profesor/horarios",
        icon: NavigationIcons.Calendar,
        shortcut: "Alt+T",
        category: t("nav.main.categories.information"),
        description: t("nav.schedule"),
      },
      {
        title: t("nav.profile"),
        href: "/profesor/perfil",
        icon: NavigationIcons.Profile,
        shortcut: "Alt+F",
        category: t("nav.main.categories.personal"),
        description: t("nav.profile"),
      },
      {
        title: t("nav.settings"),
        href: "/settings",
        icon: NavigationIcons.Settings,
        shortcut: "Alt+S",
        category: t("nav.main.categories.personal"),
        description: t("nav.settings"),
      },
    ],
    PARENT: [
      {
        title: t("nav.home"),
        href: "/parent",
        icon: NavigationIcons.Home,
        shortcut: "Alt+H",
        category: t("nav.main.categories.principal"),
        description: t("nav.dashboard"),
      },
      {
        title: t("nav.students"),
        href: "/parent/estudiantes",
        icon: NavigationIcons.Profile,
        shortcut: "Alt+E",
        category: t("nav.main.categories.information"),
        description: t("nav.students"),
      },
      {
        title: t("nav.calendar"),
        href: "/parent/calendario-escolar",
        icon: NavigationIcons.Calendar,
        shortcut: "Alt+C",
        category: t("nav.main.categories.information"),
        description: t("nav.calendar"),
      },
      {
        title: t("nav.communication"),
        href: "/parent/comunicacion",
        icon: NavigationIcons.Notifications,
        shortcut: "Alt+M",
        category: t("nav.main.categories.communication"),
        description: t("nav.communication"),
      },
      {
        title: t("nav.meetings"),
        href: "/parent/reuniones",
        icon: NavigationIcons.Meeting,
        shortcut: "Alt+R",
        category: t("nav.main.categories.communication"),
        description: t("nav.meetings"),
      },
      {
        title: t("nav.resources"),
        href: "/parent/recursos",
        icon: NavigationIcons.Documents,
        shortcut: "Alt+D",
        category: t("nav.main.categories.resources"),
        description: t("nav.resources"),
      },
      {
        title: t("nav.voting"),
        href: "/parent/votaciones",
        icon: NavigationIcons.Vote,
        shortcut: "Alt+V",
        category: t("nav.main.categories.communication"),
        description: t("nav.voting"),
      },
      {
        title: t("nav.settings"),
        href: "/settings",
        icon: NavigationIcons.Settings,
        shortcut: "Alt+S",
        category: t("nav.main.categories.personal"),
        description: t("nav.settings"),
      },
    ],
  }) as const;

// Function to get keyboard shortcuts configuration
const getKeyboardShortcuts = (t: (key: string, namespace?: string) => string) =>
  ({
    BASE: {
      Escape: "close-sidebar",
      "Ctrl+K": "open-search",
      "?": "show-shortcuts",
    },
    ...Object.fromEntries(
      Object.entries(getEnhancedNavigation(t)).map(([role, items]) => [
        role,
        Object.fromEntries(
          items
            .filter((item) => item.shortcut)
            .map((item) => [item.shortcut!, item.href]),
        ),
      ]),
    ),
  }) as const;

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

  // State management
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [advancedOptionsExpanded, setAdvancedOptionsExpanded] = useState(false);
  const [usageData, setUsageData] = useState(() =>
    navigationUtils.getUsageData(),
  );

  // Get navigation items for current role
  const navigationItems = useMemo(() => {
    if (!session?.user?.role) return [];
    const navigation = getEnhancedNavigation(t);
    const items =
      navigation[session.user.role as keyof typeof navigation] || [];
    return items.map((item) => ({ ...item })) as NavigationItem[];
  }, [session?.user?.role, t]);

  // Get keyboard shortcuts for current role
  const keyboardShortcuts = useMemo(() => {
    const shortcuts = getKeyboardShortcuts(t);
    const roleShortcuts = session?.user?.role
      ? shortcuts[session.user.role as keyof typeof shortcuts] || {}
      : {};
    return { ...shortcuts.BASE, ...roleShortcuts };
  }, [session?.user?.role, t]);

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
      await signOut({
        callbackUrl: "/",
        redirect: true,
      });
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
        if (typeof action === "string" && action.startsWith("/")) {
          handleNavigate(action);
        }
      }
    },
    [
      session,
      keyboardShortcuts,
      quickSearchOpen,
      shortcutsHelpOpen,
      isMobile,
      isOpen,
      onClose,
      onToggle,
      handleNavigate,
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
              <span className="font-semibold text-sm">Manitos Pintadas</span>
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShortcutsHelpOpen(true)}
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Atajos de teclado (?)</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}

            {/* Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
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
                className={cn(
                  "h-4 w-4 transition-transform",
                  isCollapsed && !isMobile && "rotate-180",
                )}
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
                allItems={navigationItems}
                currentPath={pathname}
                onNavigate={handleNavigate}
              />
            )}

            {/* Regular Navigation */}
            <div className="space-y-1">
              {navigationItems.map((item) => {
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
                            "flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full",
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                          )}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <Icon className="h-4 w-4" />
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <div className="flex items-center gap-2">
                          <span>{item.title}</span>
                          {item.shortcut && (
                            <span className="text-xs opacity-60">
                              {item.shortcut}
                            </span>
                          )}
                        </div>
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
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all w-full text-left",
                      isActive
                        ? "bg-accent text-accent-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {item.shortcut && (
                      <span className="text-xs text-muted-foreground hidden lg:block">
                        {item.shortcut}
                      </span>
                    )}
                  </motion.button>
                );
              })}
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

          {/* 🏛️ MASTER CONTROL PANEL */}
          {session?.user?.role === "MASTER" && (
            <div className="space-y-4 border-t border-blue-200 dark:border-blue-800 pt-6">
              {/* Master Header */}
              <div className="px-3 py-3 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-950/30 dark:via-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-4 w-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                    🏛️ MASTER CONTROL
                  </h3>
                </div>
                <p className="text-[10px] text-purple-600 dark:text-purple-400 leading-tight">
                  Supreme System Administration
                </p>
              </div>

              {/* 📊 DASHBOARD OVERVIEW */}
              <div className="space-y-2">
                <div className="px-2 py-1">
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    📊 Overview
                  </span>
                </div>

                <Button
                  variant={pathname === "/master" ? "default" : "ghost"}
                  className={`w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/20 border ${
                    pathname === "/master"
                      ? "bg-slate-100 dark:bg-slate-900/30 border-slate-300 dark:border-slate-700"
                      : "border-transparent"
                  }`}
                  onClick={() => router.push("/master")}
                >
                  <Crown className="mr-3 h-4 w-4 text-slate-600" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Master Dashboard</span>
                    <span className="text-[10px] opacity-70">
                      System overview
                    </span>
                  </div>
                </Button>
              </div>

              {/* 🔧 SYSTEM MANAGEMENT */}
              <div className="space-y-2">
                <div className="px-2 py-1">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    🔧 System Management
                  </span>
                </div>

                <Button
                  variant={
                    pathname === "/master/system-monitor" ? "default" : "ghost"
                  }
                  className={`w-full justify-start text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20 border ${
                    pathname === "/master/system-monitor"
                      ? "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700"
                      : "border-transparent"
                  }`}
                  onClick={() => router.push("/master/system-monitor")}
                >
                  <Monitor className="mr-3 h-4 w-4 text-blue-600" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">System Monitor</span>
                    <span className="text-[10px] opacity-70">
                      Real-time monitoring
                    </span>
                  </div>
                </Button>

                <Button
                  variant={
                    pathname === "/master/database-tools" ? "default" : "ghost"
                  }
                  className={`w-full justify-start text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border ${
                    pathname === "/master/database-tools"
                      ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700"
                      : "border-transparent"
                  }`}
                  onClick={() => router.push("/master/database-tools")}
                >
                  <Database className="mr-3 h-4 w-4 text-emerald-600" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Database Tools</span>
                    <span className="text-[10px] opacity-70">
                      Database management
                    </span>
                  </div>
                </Button>

                <Button
                  variant={
                    pathname === "/master/global-settings" ? "default" : "ghost"
                  }
                  className={`w-full justify-start text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/20 border ${
                    pathname === "/master/global-settings"
                      ? "bg-teal-100 dark:bg-teal-900/30 border-teal-300 dark:border-teal-700"
                      : "border-transparent"
                  }`}
                  onClick={() => router.push("/master/global-settings")}
                >
                  <Settings className="mr-3 h-4 w-4 text-teal-600" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Global Settings</span>
                    <span className="text-[10px] opacity-70">
                      System configuration
                    </span>
                  </div>
                </Button>
              </div>

              {/* 🛡️ SECURITY & COMPLIANCE */}
              <div className="space-y-2">
                <div className="px-2 py-1">
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                    🛡️ Security & Compliance
                  </span>
                </div>

                <Button
                  variant={
                    pathname === "/master/security" ? "default" : "ghost"
                  }
                  className={`w-full justify-start text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 border ${
                    pathname === "/master/security"
                      ? "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                      : "border-transparent"
                  }`}
                  onClick={() => router.push("/master/security")}
                >
                  <Shield className="mr-3 h-4 w-4 text-red-600" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Security Center</span>
                    <span className="text-[10px] opacity-70">
                      Threat analysis
                    </span>
                  </div>
                </Button>

                <Button
                  variant={
                    pathname === "/master/audit-logs" ? "default" : "ghost"
                  }
                  className={`w-full justify-start text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 border ${
                    pathname === "/master/audit-logs"
                      ? "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700"
                      : "border-transparent"
                  }`}
                  onClick={() => router.push("/master/audit-logs")}
                >
                  <Eye className="mr-3 h-4 w-4 text-orange-600" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Audit Logs</span>
                    <span className="text-[10px] opacity-70">
                      Activity tracking
                    </span>
                  </div>
                </Button>

                <Button
                  variant={
                    pathname === "/master/audit-master" ? "default" : "ghost"
                  }
                  className={`w-full justify-start text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20 border ${
                    pathname === "/master/audit-master"
                      ? "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700"
                      : "border-transparent"
                  }`}
                  onClick={() => router.push("/master/audit-master")}
                >
                  <FileText className="mr-3 h-4 w-4 text-amber-600" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Audit Master</span>
                    <span className="text-[10px] opacity-70">
                      Advanced auditing
                    </span>
                  </div>
                </Button>
              </div>

              {/* 👥 USER MANAGEMENT */}
              <div className="space-y-2">
                <div className="px-2 py-1">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    👥 User Management
                  </span>
                </div>

                <Button
                  variant={
                    pathname === "/master/user-analytics" ? "default" : "ghost"
                  }
                  className={`w-full justify-start text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 border ${
                    pathname === "/master/user-analytics"
                      ? "bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700"
                      : "border-transparent"
                  }`}
                  onClick={() => router.push("/master/user-analytics")}
                >
                  <NavigationIcons.Analytics className="mr-3 h-4 w-4 text-indigo-600" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">User Analytics</span>
                    <span className="text-[10px] opacity-70">
                      User behavior analysis
                    </span>
                  </div>
                </Button>

                <Button
                  variant={
                    pathname === "/master/role-management" ? "default" : "ghost"
                  }
                  className={`w-full justify-start text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/20 border ${
                    pathname === "/master/role-management"
                      ? "bg-cyan-100 dark:bg-cyan-900/30 border-cyan-300 dark:border-cyan-700"
                      : "border-transparent"
                  }`}
                  onClick={() => router.push("/master/role-management")}
                >
                  <Shield className="mr-3 h-4 w-4 text-cyan-600" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Role Management</span>
                    <span className="text-[10px] opacity-70">
                      Access control
                    </span>
                  </div>
                </Button>
              </div>

              {/* ⚡ PERFORMANCE & DEBUGGING */}
              <div className="space-y-2">
                <div className="px-2 py-1">
                  <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">
                    ⚡ Performance & Debugging
                  </span>
                </div>

                <Button
                  variant={
                    pathname === "/master/performance" ? "default" : "ghost"
                  }
                  className={`w-full justify-start text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/20 border ${
                    pathname === "/master/performance"
                      ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                      : "border-transparent"
                  }`}
                  onClick={() => router.push("/master/performance")}
                >
                  <Zap className="mr-3 h-4 w-4 text-green-600" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Performance</span>
                    <span className="text-[10px] opacity-70">
                      System performance
                    </span>
                  </div>
                </Button>

                <Button
                  variant={
                    pathname === "/master/debug-console" ? "default" : "ghost"
                  }
                  className={`w-full justify-start text-lime-700 dark:text-lime-300 hover:bg-lime-50 dark:hover:bg-lime-950/20 border ${
                    pathname === "/master/debug-console"
                      ? "bg-lime-100 dark:bg-lime-900/30 border-lime-300 dark:border-lime-700"
                      : "border-transparent"
                  }`}
                  onClick={() => router.push("/master/debug-console")}
                >
                  <Terminal className="mr-3 h-4 w-4 text-lime-600" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Debug Console</span>
                    <span className="text-[10px] opacity-70">
                      Advanced debugging
                    </span>
                  </div>
                </Button>
              </div>

              {/* 🌐 GLOBAL OVERSIGHT */}
              <div className="space-y-2">
                <div className="px-2 py-1">
                  <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                    🌐 Global Oversight
                  </span>
                </div>

                <Button
                  variant={
                    pathname === "/master/global-oversight"
                      ? "default"
                      : "ghost"
                  }
                  className={`w-full justify-start text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/20 border ${
                    pathname === "/master/global-oversight"
                      ? "bg-violet-100 dark:bg-violet-900/30 border-violet-300 dark:border-violet-700"
                      : "border-transparent"
                  }`}
                  onClick={() => router.push("/master/global-oversight")}
                >
                  <Globe className="mr-3 h-4 w-4 text-violet-600" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Global Oversight</span>
                    <span className="text-[10px] opacity-70">
                      Cross-system control
                    </span>
                  </div>
                </Button>
              </div>

              {/* ⚠️ SUPREME OPERATIONS */}
              <div className="space-y-2">
                <div className="px-2 py-1">
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                    ⚠️ Supreme Operations
                  </span>
                </div>

                <Button
                  variant={
                    pathname === "/master/god-mode" ? "default" : "ghost"
                  }
                  className={`w-full justify-start text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/20 border ${
                    pathname === "/master/god-mode"
                      ? "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700"
                      : "border-transparent"
                  }`}
                  onClick={() => router.push("/master/god-mode")}
                >
                  <Crown className="mr-3 h-4 w-4 text-purple-600" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">God Mode</span>
                    <span className="text-[10px] opacity-70">
                      Supreme control
                    </span>
                  </div>
                </Button>

                <Button
                  variant={
                    pathname === "/master/advanced-operations"
                      ? "default"
                      : "destructive"
                  }
                  className={`w-full justify-start text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 border ${
                    pathname === "/master/advanced-operations"
                      ? "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                      : "border-transparent"
                  }`}
                  onClick={() => router.push("/master/advanced-operations")}
                >
                  <AlertTriangle className="mr-3 h-4 w-4 text-red-600" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Advanced Operations</span>
                    <span className="text-[10px] opacity-70">
                      Critical operations
                    </span>
                  </div>
                </Button>
              </div>
            </div>
          )}

          {/* Role Switcher for MASTER users */}
          <div className="mt-3">
            <RoleSwitcher isCollapsed={isCollapsed} />
          </div>

          {isCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2"
                  onClick={handleLogout}
                >
                  <ThemeIcons.Logout className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Cerrar Sesión</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </motion.aside>

      {/* Overlays */}
      <AnimatePresence>
        {quickSearchOpen && (
          <QuickSearch
            items={navigationItems}
            onNavigate={handleNavigate}
            isOpen={quickSearchOpen}
            onClose={() => setQuickSearchOpen(false)}
          />
        )}

        {shortcutsHelpOpen && (
          <KeyboardShortcutsHelper
            shortcuts={keyboardShortcuts}
            isOpen={shortcutsHelpOpen}
            onClose={() => setShortcutsHelpOpen(false)}
          />
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}

export function EnhancedSidebarTrigger({ onToggle }: { onToggle: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="fixed left-4 top-4 z-50 md:hidden"
      onClick={onToggle}
      aria-label="Abrir menú de navegación"
      title="Abrir menú de navegación"
    >
      <NavigationIcons.Menu className="h-4 w-4" aria-hidden="true" />
    </Button>
  );
}
