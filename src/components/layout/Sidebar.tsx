"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSession } from "next-auth/react";
import { signOut } from "@/lib/auth-client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  NavigationIcons,
  SolidIcons,
  ThemeIcons,
} from "@/components/icons/hero-icons";
import {
  SHARED_NAVIGATION_ITEMS,
  STANDARD_SECTION_ORDER,
  ROLE_SPECIFIC_SECTIONS,
  getNavigationGroupsForRole,
} from "./navigation";
import { useLanguage } from "@/components/language/LanguageContext";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

interface NavigationItem {
  readonly title: string;
  readonly href?: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly badge?: string;
  readonly shortcut?: string;
  readonly action?: string;
}

interface NavigationGroup {
  title: string;
  items: NavigationItem[];
  defaultOpen?: boolean;
}

// Navigation configuration is now imported from modular files

// Helper function to handle navigation item clicks
const handleNavigationItemClick = (
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
const renderNavigationItem = (
  item: NavigationItem,
  isActive: boolean,
  isCollapsed: boolean,
  pathname: string,
  t: (key: string) => string,
  onToggle?: () => void,
  handleLogout?: () => void,
) => {
  const handleClick = handleNavigationItemClick(
    item,
    pathname,
    onToggle,
    handleLogout,
  );

  if (item.action === "logout") {
    // Render as button for actions
    return (
      <button
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground ml-2 w-full text-left",
          "text-muted-foreground hover:text-foreground",
        )}
        aria-label={`${t(item.title)}${(item as any).shortcut ? ` (${(item as any).shortcut})` : ""}`}
        onClick={handleClick}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        <span className="flex-1">{t(item.title)}</span>
        {(item as any).shortcut && (
          <span className="ml-auto text-xs text-muted-foreground hidden lg:block">
            {(item as any).shortcut}
          </span>
        )}
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
      aria-label={`${t(item.title)}${(item as any).shortcut ? ` (${(item as any).shortcut})` : ""}`}
      onClick={handleClick}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{t(item.title)}</span>
      {(item as any).badge && (
        <span className="ml-auto bg-accent text-accent-foreground text-xs px-1.5 py-0.5 rounded">
          {(item as any).badge}
        </span>
      )}
      {(item as any).shortcut && (
        <span className="ml-auto text-xs text-muted-foreground hidden lg:block">
          {(item as any).shortcut}
        </span>
      )}
    </Link>
  );
};

export function Sidebar({
  className,
  isCollapsed = false,
  onToggle,
  ...props
}: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // Load navigation translations
  const { t } = useLanguage();

  // Pulsating icon effect state
  const [pulseCount, setPulseCount] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPulseCount((prev) => (prev + 1) % 3);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // ⚡ Performance: Memoize keyboard shortcuts to prevent recreation
  const keyboardShortcuts = React.useMemo(
    () => ({}), // Empty shortcuts for basic sidebar
    [],
  );

  // ⚡ Performance: Memoize logout handler
  const handleLogout = React.useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error during logout:", error);
      // Fallback navigation
      router.push("/");
    }
  }, [router]);

  // ⚡ Performance: Memoize keyboard handler
  const handleKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      if (!session) return;

      const shortcut = Object.keys(keyboardShortcuts).find((key) => {
        const [modifier, char] = key.split("+");
        if (modifier === "Alt") {
          return event.altKey && event.key.toLowerCase() === char.toLowerCase();
        }
        if (modifier === "Escape") {
          return event.key === "Escape";
        }
        return false;
      });

      if (shortcut) {
        event.preventDefault();
        const action =
          keyboardShortcuts[shortcut as keyof typeof keyboardShortcuts];

        if (action === "close-sidebar") {
          onToggle?.();
        } else if (action) {
          router.push(action);
        }
      }
    },
    [session, keyboardShortcuts, onToggle, router],
  );

  // Simplified keyboard navigation with debounce
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const debouncedHandler = (event: KeyboardEvent) => {
      // Debounce keyboard events to prevent rapid firing
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handleKeyDown(event), 100);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("keydown", debouncedHandler);
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("keydown", debouncedHandler);
      };
    }
  }, [handleKeyDown]);

  // ⚡ Performance: Memoize navigation groups calculation
  const navigationGroups = React.useMemo(
    () => getNavigationGroupsForRole(session?.user?.role, pathname),
    [session?.user?.role, pathname],
  );

  // ⚡ Performance: Memoize open groups state initialization
  const initialOpenGroups = React.useMemo(() => {
    const initialState: Record<string, boolean> = {};
    navigationGroups.forEach((group) => {
      initialState[group.title] = group.defaultOpen ?? false;
    });
    return initialState;
  }, [navigationGroups]);

  const [openGroups, setOpenGroups] =
    React.useState<Record<string, boolean>>(initialOpenGroups);

  // Update openGroups when navigationGroups changes to ensure new groups are properly initialized
  React.useEffect(() => {
    setOpenGroups((prev) => {
      const newState = { ...prev };
      navigationGroups.forEach((group) => {
        if (!(group.title in newState)) {
          newState[group.title] = group.defaultOpen ?? false;
        }
      });
      return newState;
    });
  }, [navigationGroups]);

  const toggleGroup = (groupTitle: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }));
  };

  return (
    <TooltipProvider
      delayDuration={0}
      key={isCollapsed ? "collapsed" : "expanded"}
    >
      <aside
        className={cn(
          "relative flex flex-col bg-background border-r border-border transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          className,
        )}
        aria-label="Navegación principal"
        role="navigation"
        {...props}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <NavigationIcons.Planning className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold text-sm">Plataforma Astral</span>
            </div>
          )}
          {isCollapsed && (
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <NavigationIcons.Planning className="h-4 w-4 text-primary" />
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 mb-1"
            onClick={onToggle}
            aria-label={
              isCollapsed ? t("nav.sidebar.expand") : t("nav.sidebar.collapse")
            }
            title={
              isCollapsed
                ? t("nav.sidebar.expand.shortcut")
                : t("nav.sidebar.collapse.shortcut")
            }
          >
            <NavigationIcons.ChevronRight
              className="h-4 w-4 transition-transform"
              aria-hidden="true"
            />
          </Button>
        </div>

        <ScrollArea
          className="flex-1 px-3 py-4"
          aria-label="Contenido de navegación"
        >
          <nav className="space-y-2" aria-label="Menú de navegación principal">
            {navigationGroups.map((group, groupIndex) => (
              <div
                key={group.title}
                className="space-y-1"
                role="group"
                aria-labelledby={`group-${group.title}`}
              >
                {/* Group Header */}
                {!isCollapsed && (
                  <Collapsible
                    open={openGroups[group.title]}
                    onOpenChange={() => toggleGroup(group.title)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between px-2 py-1 h-8 text-xs font-semibold text-muted-foreground hover:text-foreground"
                        aria-expanded={openGroups[group.title]}
                        aria-controls={`group-content-${group.title}`}
                        id={`group-${group.title}`}
                        aria-label={`${openGroups[group.title] ? "Contraer" : "Expandir"} grupo ${group.title}`}
                      >
                        <span>{t(group.title)}</span>
                        <NavigationIcons.ChevronDown
                          className={cn(
                            "h-3 w-3 transition-transform",
                            openGroups[group.title] && "rotate-180",
                          )}
                          aria-hidden="true"
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent
                      className="space-y-1"
                      id={`group-content-${group.title}`}
                    >
                      {group.items.map((item) => {
                        const isActive = item.href
                          ? pathname === item.href ||
                            pathname.startsWith(item.href + "/")
                          : false;

                        return (
                          <Tooltip key={item.href || item.title}>
                            <TooltipTrigger asChild>
                              {renderNavigationItem(
                                item,
                                isActive,
                                isCollapsed,
                                pathname,
                                t,
                                onToggle,
                                handleLogout,
                              )}
                            </TooltipTrigger>
                            {!isCollapsed && (
                              <TooltipContent side="right">
                                <div className="flex items-center gap-2">
                                  <span>{t(item.title)}</span>
                                  {(item as any).shortcut && (
                                    <span className="text-xs opacity-60">
                                      {(item as any).shortcut}
                                    </span>
                                  )}
                                </div>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Collapsed Mode - Show All Items Directly */}
                {isCollapsed &&
                  group.items.map((item) => {
                    const isActive = item.href
                      ? pathname === item.href ||
                        pathname.startsWith(item.href + "/")
                      : false;

                    return (
                      <Tooltip key={item.href || item.title}>
                        <TooltipTrigger asChild>
                          {(item as any).action === "logout" ? (
                            <button
                              className="flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                              aria-label={`${t(item.title)}${(item as any).shortcut ? ` (${(item as any).shortcut})` : ""}`}
                              onClick={handleNavigationItemClick(
                                item,
                                pathname,
                                onToggle,
                                handleLogout,
                              )}
                            >
                              <item.icon className="h-4 w-4 shrink-0" />
                            </button>
                          ) : (
                            <Link
                              href={item.href || "#"}
                              prefetch={false}
                              className={cn(
                                "flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                isActive
                                  ? "bg-accent text-accent-foreground"
                                  : "text-muted-foreground",
                              )}
                              aria-current={isActive ? "page" : undefined}
                              aria-label={`${t(item.title)}${(item as any).shortcut ? ` (${(item as any).shortcut})` : ""}`}
                              onClick={handleNavigationItemClick(
                                item,
                                pathname,
                                onToggle,
                                handleLogout,
                              )}
                            >
                              <item.icon className="h-4 w-4 shrink-0" />
                            </Link>
                          )}
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <div className="flex items-center gap-2">
                            <span>{t ? t(item.title) : item.title}</span>
                            {(item as any).shortcut && (
                              <span className="text-xs opacity-60">
                                {(item as any).shortcut}
                              </span>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}

                {/* Add separator between groups (except last one) */}
                {!isCollapsed && groupIndex < navigationGroups.length - 1 && (
                  <div className="border-t border-border/50 my-2" />
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>

        <div
          className="border-t border-border p-4"
          role="contentinfo"
          aria-label="Información del usuario"
        >
          <div className="flex items-center justify-between">
            <div
              className={cn(
                "flex items-center gap-3",
                isCollapsed && "justify-center",
              )}
              aria-label={`Usuario: ${session?.user?.name}`}
            >
              <div
                className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"
                aria-hidden="true"
              >
                <NavigationIcons.Profile className="h-4 w-4 text-primary" />
              </div>
              {!isCollapsed && (
                <div className="flex-1">
                  <p className="text-sm font-medium" id="user-name">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground" id="user-role">
                    {session?.user?.role === "ADMIN"
                      ? t("nav.roles.admin")
                      : session?.user?.role === "PROFESOR"
                        ? t("nav.roles.profesor")
                        : t("nav.roles.parent")}
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
                aria-label={t("nav.logout.button")}
                title={t("nav.logout.button")}
              >
                <ThemeIcons.Logout className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
          {isCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2"
                  onClick={handleLogout}
                  aria-label={t("nav.logout.button")}
                  title={t("nav.logout.button")}
                >
                  <ThemeIcons.Logout className="h-4 w-4" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{t("nav.logout.button")}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

export function SidebarTrigger({ onToggle }: { onToggle: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="fixed left-4 top-4 z-50 md:hidden h-11 w-11"
      onClick={onToggle}
      aria-label="Abrir menú de navegación"
      title="Abrir menú de navegación"
    >
      <NavigationIcons.Menu className="h-5 w-5" aria-hidden="true" />
    </Button>
  );
}
