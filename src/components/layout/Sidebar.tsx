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
import { useSession } from "@/lib/auth-client";
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
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  NavigationItem,
  handleNavigationItemClick,
  renderNavigationItem,
  renderCollapsedNavigationItem,
} from "./sidebar-utils";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

interface NavigationGroup {
  title: string;
  items: NavigationItem[];
  defaultOpen?: boolean;
}

// Navigation configuration is now imported from modular files

export function Sidebar({
  className,
  isCollapsed = false,
  onToggle,
  ...props
}: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const institutionId = session?.user?.currentInstitutionId as
    | Id<"institutionInfo">
    | undefined;
  const institution = useQuery(
    api.institutionInfo.getInstitutionById,
    institutionId ? { institutionId } : "skip",
  );

  // Load navigation translations - include navigation namespace for nav keys
  const { t } = useDivineParsing(["common", "navigation", "language"]);

  // Pulsating icon effect state
  const [pulseCount, setPulseCount] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPulseCount((prev) => (prev + 1) % 3);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // ⚡ Performance: Memoize logout handler
  const handleLogout = React.useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      // Fallback navigation
      router.push("/");
    }
  }, [router]);

  // ⚡ Performance: Memoize navigation groups calculation
  const navigationGroups = React.useMemo(
    () =>
      getNavigationGroupsForRole(
        session?.user?.role,
        pathname,
        institution?.institutionType,
        institution?.educationalConfig,
      ),
    [
      session?.user?.role,
      pathname,
      institution?.institutionType,
      institution?.educationalConfig,
    ],
  );

  // ⚡ Performance: Memoize open groups state initialization
  // Only allow the first group with defaultOpen: true to be open initially
  const initialOpenGroups = React.useMemo(() => {
    const initialState: Record<string, boolean> = {};
    let firstOpenGroupFound = false;
    navigationGroups.forEach((group) => {
      const shouldOpen = group.defaultOpen ?? false;
      if (shouldOpen && !firstOpenGroupFound) {
        initialState[group.title] = true;
        firstOpenGroupFound = true;
      } else {
        initialState[group.title] = false;
      }
    });
    return initialState;
  }, [navigationGroups]);

  const [openGroups, setOpenGroups] =
    React.useState<Record<string, boolean>>(initialOpenGroups);

  // Update openGroups when navigationGroups changes to ensure new groups are properly initialized
  React.useEffect(() => {
    setOpenGroups((prev) => {
      const newState = { ...prev };
      let hasNewDefaultOpenGroup = false;

      navigationGroups.forEach((group) => {
        if (!(group.title in newState)) {
          // Only set defaultOpen to true for the first new group that has defaultOpen: true
          const shouldBeOpen = group.defaultOpen && !hasNewDefaultOpenGroup;
          if (shouldBeOpen) {
            hasNewDefaultOpenGroup = true;
          }
          newState[group.title] = shouldBeOpen;
        }
      });
      return newState;
    });
  }, [navigationGroups]);

  const toggleGroup = (groupTitle: string) => {
    setOpenGroups((prev) => {
      const isCurrentlyOpen = prev[groupTitle];

      // If the group is currently open, close it
      if (isCurrentlyOpen) {
        return {
          ...prev,
          [groupTitle]: false,
        };
      }

      // If the group is closed, close all groups and open this one
      const newState = Object.keys(prev).reduce(
        (acc, key) => {
          acc[key] = false;
          return acc;
        },
        {} as Record<string, boolean>,
      );

      newState[groupTitle] = true;
      return newState;
    });
  };

  const flattenedNavigationItems = React.useMemo(
    () =>
      navigationGroups.flatMap((group) =>
        group.items.map((item) => ({ ...item })),
      ),
    [navigationGroups],
  );

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
        <div className="flex h-16 items-center justify-center border-b border-border px-4">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <NavigationIcons.Planning className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold text-sm">
                {institution?.name || "Plataforma Astral"}
              </span>
            </div>
          )}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 ml-auto"
              onClick={onToggle}
              aria-label={t("nav.sidebar.collapse", "navigation")}
              suppressHydrationWarning
            >
              <NavigationIcons.ChevronLeft
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Button>
          )}
          {isCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 hover:from-primary/25 hover:to-primary/10 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                  onClick={onToggle}
                  aria-label={t("nav.sidebar.expand", "navigation")}
                >
                  <svg
                    className="w-5 h-5 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M9 3.5v17M3 9.4c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C6.04 3 7.16 3 9.4 3h5.2c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748C21 6.04 21 7.16 21 9.4v5.2c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748C17.96 21 16.84 21 14.6 21H9.4c-2.24 0-3.36 0-4.216-.436a4 4 0 0 1-1.748-1.748C3 17.96 3 16.84 3 14.6z"
                    />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{t("nav.sidebar.expand", "navigation")}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <ScrollArea
          className={cn(
            "flex-1 py-4 max-h-[calc(100vh-10rem)] min-h-[200px]",
            isCollapsed ? "px-1" : "px-3",
          )}
          aria-label="Contenido de navegación"
        >
          <nav
            className={cn("space-y-2", isCollapsed && "space-y-0")}
            aria-label="Menú de navegación principal"
          >
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-2">
                {flattenedNavigationItems.map((item) => {
                  const isActive = item.href ? pathname === item.href : false;

                  return renderCollapsedNavigationItem(
                    item,
                    isActive,
                    pathname,
                    t,
                    onToggle,
                    handleLogout,
                  );
                })}
              </div>
            ) : (
              navigationGroups.map((group, groupIndex) => (
                <div
                  key={group.title}
                  className="space-y-1"
                  role="group"
                  aria-labelledby={`group-${group.title}`}
                >
                  <Collapsible
                    open={!!openGroups[group.title]}
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
                        aria-label={`${openGroups[group.title] ? t("nav.collapse", "Collapse") : t("nav.expand", "Expand")} ${t("nav.group", "group")} ${group.title}`}
                        suppressHydrationWarning
                      >
                        <span suppressHydrationWarning>
                          {t(group.title, "navigation")}
                        </span>
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
                          ? pathname === item.href
                          : false;

                        return (
                          <Tooltip key={item.href || item.title}>
                            <TooltipTrigger asChild>
                              {renderNavigationItem(
                                item,
                                isActive,
                                pathname,
                                t,
                                onToggle,
                                handleLogout,
                              )}
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <div>
                                <span>
                                  {t(
                                    item.title,
                                    item.title.startsWith("nav.")
                                      ? "navigation"
                                      : "common",
                                  )}
                                </span>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>

                  {groupIndex < navigationGroups.length - 1 && (
                    <div className="border-t border-border/50 my-2" />
                  )}
                </div>
              ))
            )}
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
                  <p
                    className="text-xs text-muted-foreground"
                    id="user-role"
                    suppressHydrationWarning
                  >
                    {session?.user?.role === "MASTER"
                      ? t("nav.roles.master", "navigation")
                      : session?.user?.role === "ADMIN"
                        ? t("nav.roles.admin", "navigation")
                        : session?.user?.role === "PROFESOR"
                          ? t("nav.roles.profesor", "navigation")
                          : t("nav.roles.parent", "navigation")}
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
                aria-label={t("nav.logout.button", "navigation")}
                title={t("nav.logout.button", "navigation")}
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
                  aria-label={t("nav.logout.button", "navigation")}
                  title={t("nav.logout.button", "navigation")}
                >
                  <ThemeIcons.Logout className="h-4 w-4" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{t("nav.logout.button", "navigation")}</p>
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
