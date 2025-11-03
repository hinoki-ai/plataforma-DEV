"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  Star,
  Clock,
  TrendingUp,
  Command,
  ArrowRight,
  Filter,
  Zap,
} from "lucide-react";
import { NavigationIcons } from "@/components/icons/hero-icons";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDivineParsing } from "@/components/language/useDivineLanguage";

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  category: string;
  description?: string;
  badge?: string;
}

interface UsageData {
  href: string;
  visits: number;
  lastVisit: Date;
  timeSpent: number;
  frequency: "daily" | "weekly" | "monthly" | "rare";
}

interface QuickSearchProps {
  items: NavigationItem[];
  onNavigate: (href: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickSearch({
  items,
  onNavigate,
  isOpen,
  onClose,
}: QuickSearchProps) {
  const [searchState, setSearchState] = useState({
    query: "",
    selectedIndex: 0,
  });
  const { t } = useDivineParsing(["common", "navigation"]);

  const setSelectedIndex = useCallback(
    (value: number | ((prev: number) => number)) => {
      setSearchState((prev) => ({
        query: prev.query,
        selectedIndex:
          typeof value === "function"
            ? (value as (prev: number) => number)(prev.selectedIndex)
            : value,
      }));
    },
    [],
  );

  const setQuery = useCallback((value: string) => {
    setSearchState({ query: value, selectedIndex: 0 });
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchState.query) return items.slice(0, 8);

    return items
      .filter(
        (item) =>
          item.title.toLowerCase().includes(searchState.query.toLowerCase()) ||
          item.description
            ?.toLowerCase()
            .includes(searchState.query.toLowerCase()) ||
          item.category.toLowerCase().includes(searchState.query.toLowerCase()),
      )
      .slice(0, 8);
  }, [items, searchState.query]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (filteredItems.length === 0) {
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(
            (prev) => (prev - 1 + filteredItems.length) % filteredItems.length,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredItems[searchState.selectedIndex]) {
            onNavigate(filteredItems[searchState.selectedIndex].href);
            onClose();
          }
          break;
        case "Escape":
          onClose();
          break;
      }
    },
    [
      isOpen,
      filteredItems,
      searchState.selectedIndex,
      onNavigate,
      onClose,
      setSelectedIndex,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="relative w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="border shadow-2xl">
          <CardContent className="p-0">
            <div className="flex items-center border-b px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground mr-2" />
              <Input
                placeholder={t("search.placeholder", "common")}
                value={searchState.query}
                onChange={(e) => setQuery(e.target.value)}
                className="border-0 focus-visible:ring-0 shadow-none"
                autoFocus
              />
              <div className="flex items-center gap-1 ml-2 text-xs text-muted-foreground">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  ESC
                </kbd>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  {t("search.no_results", "common")}
                </div>
              ) : (
                <div className="p-2">
                  {filteredItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.href}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                          searchState.selectedIndex === index
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-muted",
                        )}
                        onClick={() => {
                          onNavigate(item.href);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {t(item.title, "navigation")}
                          </div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground">
                              {item.description}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge
                            variant="secondary"
                            className="text-xs px-1.5 py-0.5"
                          >
                            {item.category}
                          </Badge>
                          {item.shortcut && (
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                              {item.shortcut}
                            </kbd>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t px-4 py-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>
                  {filteredItems.length > 0 &&
                    `${filteredItems.length} ${t("search.results", "common")}${filteredItems.length === 1 ? "" : "s"}`}
                </span>
                <div className="flex items-center gap-1">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    ↑↓
                  </kbd>
                  <span>{t("search.navigate", "common")}</span>
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    ↵
                  </kbd>
                  <span>{t("search.select", "common")}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

interface SmartRecommendationsProps {
  usageData: UsageData[];
  allItems: NavigationItem[];
  currentPath: string;
  onNavigate: (href: string) => void;
}

export function SmartRecommendations({
  usageData,
  allItems,
  currentPath,
  onNavigate,
}: SmartRecommendationsProps) {
  const { t } = useDivineParsing(["common", "navigation"]);

  const recommendations = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();

    // Create weighted scores based on usage patterns
    const scoredItems = allItems
      .filter((item) => item.href !== currentPath)
      .map((item) => {
        const usage = usageData.find((u) => u.href === item.href);
        let score = 0;

        if (usage) {
          // Base score from visit count
          score += Math.log(usage.visits + 1) * 10;

          // Recency bonus (more recent = higher score)
          const daysSinceLastVisit =
            (now.getTime() - usage.lastVisit.getTime()) / (1000 * 60 * 60 * 24);
          score += Math.max(0, 10 - daysSinceLastVisit);

          // Frequency pattern bonus
          switch (usage.frequency) {
            case "daily":
              score += 15;
              break;
            case "weekly":
              score += 10;
              break;
            case "monthly":
              score += 5;
              break;
            default:
              score += 1;
          }

          // Time-based patterns (mock - could be learned from actual usage)
          if (
            item.category === "Gestión Académica" &&
            hour >= 8 &&
            hour <= 17
          ) {
            score += 5; // Work hours bonus for academic content
          }

          if (item.category === "Comunicación" && hour >= 16 && hour <= 20) {
            score += 5; // After-school communication bonus
          }
        }

        return { item, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    return scoredItems;
  }, [usageData, allItems, currentPath]);

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-2">
        <Zap className="h-3 w-3 text-amber-500" />
        <span className="text-xs font-medium text-muted-foreground">
          {t("navigation.recommended", "common")}
        </span>
      </div>

      <div className="space-y-1">
        {recommendations.map(({ item, score }, index) => {
          const Icon = item.icon;
          const usage = usageData.find((u) => u.href === item.href);

          return (
            <motion.button
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onNavigate(item.href)}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-all duration-200 hover:bg-accent hover:text-accent-foreground group"
            >
              <div className="relative">
                <Icon className="h-4 w-4 shrink-0" />
                {usage?.frequency === "daily" && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {t(item.title, "navigation")}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span>{item.category}</span>
                  {usage && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{Math.round(score)} pts</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

interface BreadcrumbNavigationProps {
  items: Array<{
    title: string;
    href?: string;
  }>;
  onNavigate?: (href: string) => void;
}

export function BreadcrumbNavigation({
  items,
  onNavigate,
}: BreadcrumbNavigationProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center space-x-1 text-sm text-muted-foreground"
    >
      {items.map((item, index) => (
        <React.Fragment key={item.title}>
          {index > 0 && <ArrowRight className="h-3 w-3 shrink-0" />}
          {item.href && onNavigate ? (
            <button
              onClick={() => onNavigate(item.href!)}
              className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              {item.title}
            </button>
          ) : (
            <span
              className={
                index === items.length - 1 ? "text-foreground font-medium" : ""
              }
            >
              {item.title}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export const navigationUtils = {
  // Track navigation usage for smart recommendations
  trackNavigation: (href: string) => {
    const storageKey = "navigation-usage";
    const existingData = localStorage.getItem(storageKey);
    const usageData: UsageData[] = existingData ? JSON.parse(existingData) : [];

    const existingIndex = usageData.findIndex((item) => item.href === href);

    if (existingIndex >= 0) {
      usageData[existingIndex].visits += 1;
      usageData[existingIndex].lastVisit = new Date();
      // Update frequency based on visit patterns
      const daysSinceFirst =
        (Date.now() - new Date(usageData[existingIndex].lastVisit).getTime()) /
        (1000 * 60 * 60 * 24);
      const visitsPerDay =
        usageData[existingIndex].visits / Math.max(daysSinceFirst, 1);

      if (visitsPerDay > 0.8) usageData[existingIndex].frequency = "daily";
      else if (visitsPerDay > 0.3)
        usageData[existingIndex].frequency = "weekly";
      else if (visitsPerDay > 0.1)
        usageData[existingIndex].frequency = "monthly";
      else usageData[existingIndex].frequency = "rare";
    } else {
      usageData.push({
        href,
        visits: 1,
        lastVisit: new Date(),
        timeSpent: 0,
        frequency: "rare",
      });
    }

    // Keep only the most recent 50 items
    const sortedData = usageData
      .sort((a, b) => b.lastVisit.getTime() - a.lastVisit.getTime())
      .slice(0, 50);

    localStorage.setItem(storageKey, JSON.stringify(sortedData));
  },

  // Get usage data for smart recommendations
  getUsageData: (): UsageData[] => {
    const storageKey = "navigation-usage";
    const existingData = localStorage.getItem(storageKey);
    return existingData ? JSON.parse(existingData) : [];
  },

  // Generate breadcrumbs from pathname
  generateBreadcrumbs: (pathname: string, userRole?: string) => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: Array<{ title: string; href?: string }> = [];

    // Add home based on role
    if (userRole === "ADMIN") {
      breadcrumbs.push({ title: "Admin", href: "/admin" });
    } else if (userRole === "PROFESOR") {
      breadcrumbs.push({ title: "Profesor", href: "/profesor" });
    } else if (userRole === "PARENT") {
      breadcrumbs.push({ title: "Padre", href: "/parent" });
    }

    // Build breadcrumbs from segments
    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Skip the root role segment as it's already added
      if (index === 0 && ["admin", "profesor", "parent"].includes(segment)) {
        return;
      }

      let title = segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      // Custom titles for known routes
      const customTitles: Record<string, string> = {
        planificaciones: "Planificaciones",
        "calendario-escolar": "Calendario Escolar",
        "equipo-multidisciplinario": "Equipo Multidisciplinario",
        reuniones: "Reuniones",
        votaciones: "Votaciones",
        documentos: "Documentos",
        usuarios: "Usuarios",
        pme: "PME",
        estudiantes: "Estudiantes",
        comunicacion: "Comunicación",
        recursos: "Recursos",
        perfil: "Perfil",
      };

      title = customTitles[segment] || title;

      breadcrumbs.push({
        title,
        href: index === segments.length - 1 ? undefined : currentPath,
      });
    });

    return breadcrumbs;
  },
};
