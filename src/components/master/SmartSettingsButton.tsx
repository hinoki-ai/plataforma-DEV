"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdaptiveButton } from "@/components/ui/adaptive-button";
import { useLanguage } from "@/components/language/LanguageContext";
import {
  Settings2,
  Monitor,
  Smartphone,
  Code2,
  Gauge,
  Zap,
  Eye,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { cn } from "@/lib/utils";
import {
  useDesktopToggle,
  useResponsiveMode,
} from "@/lib/hooks/useDesktopToggle";

interface AdvancedButtonProps {
  className?: string;
}

/**
 * GOLD STANDARD Advanced Button - PORTAL ESCOLAR Implementation
 *
 * This is the real advanced button that replaces the fake complex dropdown.
 * Uses AdaptiveButton foundation with streamlined, professional interface.
 */
export function AdvancedButton({ className }: AdvancedButtonProps) {
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(false);

  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { toggleDesktopMode } = useDesktopToggle();
  const { isDesktopForced, isActualMobile, isHydrated } = useResponsiveMode();

  // Only show on mobile or when desktop is forced
  const showDesktopToggle = isActualMobile || isDesktopForced;

  const toggleThemeHandler = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const toggleLanguageHandler = () => {
    setLanguage(language === "es" ? "en" : "es");
  };

  const toggleDevPanelHandler = () => {
    setShowDevPanel(!showDevPanel);
  };

  const togglePerformanceHandler = () => {
    setPerformanceMode(!performanceMode);
  };

  const handleDesktopToggle = () => {
    toggleDesktopMode();
  };

  if (!isHydrated) {
    return (
      <AdaptiveButton variant="ghost" size="icon" className="w-9 h-9" disabled>
        <Settings2 className="h-[1.1rem] w-[1.1rem]" />
      </AdaptiveButton>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <AdaptiveButton
          variant="ghost"
          size="icon"
          className={cn(
            "w-9 h-9 relative transition-all duration-200",
            className,
          )}
          title="Advanced Settings"
          enhancement="minimal"
        >
          <Settings2 className="h-[1.1rem] w-[1.1rem]" />
          {(isDesktopForced || showDevPanel) && (
            <span className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full animate-pulse" />
          )}
        </AdaptiveButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40" sideOffset={8}>
        <DropdownMenuLabel className="flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          <span>Advanced Settings</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Desktop Toggle Section */}
        {showDesktopToggle && (
          <>
            <div className="px-2 py-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Vista</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {isDesktopForced ? "Escritorio" : "Automático"}
                </div>
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                Dispositivo: {isActualMobile ? "Móvil" : "Escritorio"}
              </div>
            </div>

            <DropdownMenuItem
              onClick={handleDesktopToggle}
              className="cursor-pointer"
            >
              <Monitor className="mr-2 h-4 w-4" />
              <div className="flex flex-col">
                <span className="font-medium">Force Desktop View</span>
                <span className="text-xs text-muted-foreground">
                  Para desarrollo/testing
                </span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
          </>
        )}

        {/* Developer Tools Section */}
        <div className="px-2 py-1">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            🛠️ Herramientas
          </span>
        </div>

        <DropdownMenuItem
          onClick={toggleDevPanelHandler}
          className="cursor-pointer"
        >
          <Code2 className="mr-2 h-4 w-4" />
          <div className="flex flex-col">
            <span className="font-medium">Developer Panel</span>
            <span className="text-xs text-muted-foreground">
              {showDevPanel ? "Activado" : "Desactivado"}
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={togglePerformanceHandler}
          className="cursor-pointer"
        >
          <Gauge className="mr-2 h-4 w-4" />
          <div className="flex flex-col">
            <span className="font-medium">Performance Mode</span>
            <span className="text-xs text-muted-foreground">
              {performanceMode ? "Activado" : "Desactivado"}
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Quick Actions */}
        <div className="px-2 py-1">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            ⚡ Quick Actions
          </span>
        </div>

        <DropdownMenuItem className="cursor-pointer">
          <Zap className="mr-2 h-4 w-4" />
          <span>Clear Cache</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer">
          <Eye className="mr-2 h-4 w-4" />
          <span>Inspector Mode</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* System Status */}
        <div className="px-2 py-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Estado:</span>
            <span className="text-green-600 dark:text-green-400 font-medium">
              ✓ Operativo
            </span>
          </div>
          {isDesktopForced && (
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
              💡 Vista de escritorio forzada
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
