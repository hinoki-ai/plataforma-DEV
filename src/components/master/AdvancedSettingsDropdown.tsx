"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings2,
  Monitor,
  Smartphone,
  Code2,
  Zap,
  Eye,
  EyeOff,
  Gauge,
} from "lucide-react";
import { ThemeIcons } from "@/components/icons/hero-icons";
import {
  useDesktopToggle,
  useResponsiveMode,
} from "@/lib/hooks/useDesktopToggle";
import { cn } from "@/lib/utils";

interface AdvancedSettingsDropdownProps {
  isCollapsed?: boolean;
}

export function AdvancedSettingsDropdown({
  isCollapsed = false,
}: AdvancedSettingsDropdownProps) {
  const { toggleDesktopMode } = useDesktopToggle();
  const { isDesktopForced, isActualMobile, isHydrated } = useResponsiveMode();

  const [showDevPanel, setShowDevPanel] = React.useState(false);
  const [performanceMode, setPerformanceMode] = React.useState(false);

  // Only show on mobile or when desktop is forced
  const showDesktopToggle = isActualMobile || isDesktopForced;

  if (!isHydrated) {
    return null;
  }

  const handleToggleDesktop = () => {
    toggleDesktopMode();
  };

  const handleToggleDevPanel = () => {
    setShowDevPanel(!showDevPanel);
    // You can add logic here to show/hide a dev panel
  };

  const handleTogglePerformance = () => {
    setPerformanceMode(!performanceMode);
    // You can add logic here to enable performance mode
  };

  if (isCollapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 relative"
            title="Advanced Settings"
          >
            <Settings2 className="h-4 w-4" />
            {(isDesktopForced || showDevPanel) && (
              <span className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
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
                    <span className="text-sm font-medium">View</span>
                  </div>
                  <Badge
                    variant={isDesktopForced ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {isDesktopForced ? "Desktop" : "Auto"}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  Device:{" "}
                  {isActualMobile ? (
                    <span className="inline-flex items-center gap-1">
                      <Smartphone className="h-3 w-3" /> Mobile
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Monitor className="h-3 w-3" /> Desktop
                    </span>
                  )}
                </div>
              </div>

              <DropdownMenuCheckboxItem
                checked={isDesktopForced}
                onCheckedChange={handleToggleDesktop}
                className="cursor-pointer"
              >
                <ThemeIcons.Desktop className="h-4 w-4 mr-2" />
                <div className="flex flex-col">
                  <span className="font-medium">Force Desktop View</span>
                  <span className="text-xs text-muted-foreground">
                    Use desktop interface on mobile
                  </span>
                </div>
              </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator />
            </>
          )}

          {/* Developer Tools Section */}
          <div className="px-2 py-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              🛠️ Tools
            </span>
          </div>

          <DropdownMenuCheckboxItem
            checked={showDevPanel}
            onCheckedChange={handleToggleDevPanel}
            className="cursor-pointer"
          >
            <Code2 className="h-4 w-4 mr-2" />
            <div className="flex flex-col">
              <span className="font-medium">Developer Panel</span>
              <span className="text-xs text-muted-foreground">
                Show debug information
              </span>
            </div>
          </DropdownMenuCheckboxItem>

          <DropdownMenuCheckboxItem
            checked={performanceMode}
            onCheckedChange={handleTogglePerformance}
            className="cursor-pointer"
          >
            <Gauge className="h-4 w-4 mr-2" />
            <div className="flex flex-col">
              <span className="font-medium">Performance Mode</span>
              <span className="text-xs text-muted-foreground">
                Optimize for speed
              </span>
            </div>
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          {/* Quick Actions */}
          <div className="px-2 py-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              ⚡ Quick Actions
            </span>
          </div>

          <DropdownMenuItem className="cursor-pointer">
            <Zap className="h-4 w-4 mr-2" />
            <span>Clear Cache</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer">
            <Eye className="h-4 w-4 mr-2" />
            <span>Inspector Mode</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Status Info */}
          <div className="px-2 py-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="outline" className="text-xs">
                Active
              </Badge>
            </div>
            {isDesktopForced && (
              <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                💡 Desktop view forced - For dev/testing
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/20 border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
          >
            <Settings2 className="mr-3 h-4 w-4 text-slate-600" />
            <div className="flex flex-col items-start flex-1">
              <span className="font-medium text-sm">Advanced Settings</span>
              <span className="text-[10px] opacity-70">
                View, dev tools & more
              </span>
            </div>
            {(isDesktopForced || showDevPanel) && (
              <Badge variant="default" className="text-xs ml-2">
                Active
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            <span>Advanced Settings</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Desktop Toggle Section */}
          {showDesktopToggle && (
            <>
              <div className="px-2 py-2 bg-muted/30 rounded-md mx-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">
                      Dashboard View
                    </span>
                  </div>
                  <Badge
                    variant={isDesktopForced ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {isDesktopForced ? "Desktop" : "Auto"}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Current Device:</span>
                    {isActualMobile ? (
                      <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <Smartphone className="h-3 w-3" /> Mobile
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                        <Monitor className="h-3 w-3" /> Desktop
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Rendered View:</span>
                    <span className="text-primary font-medium">
                      {isDesktopForced ? "Forced Desktop" : "Responsive"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-2 py-2">
                <DropdownMenuCheckboxItem
                  checked={isDesktopForced}
                  onCheckedChange={handleToggleDesktop}
                  className="cursor-pointer border border-transparent hover:border-primary/20 rounded-md"
                >
                  <ThemeIcons.Desktop className="h-4 w-4 mr-2 text-primary" />
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">Force Desktop View</span>
                    <span className="text-xs text-muted-foreground">
                      {isDesktopForced
                        ? "Dashboard optimized for admin & dev"
                        : "Enable to use full desktop interface on mobile"}
                    </span>
                  </div>
                </DropdownMenuCheckboxItem>
              </div>

              <DropdownMenuSeparator />
            </>
          )}

          {/* Developer Tools Section */}
          <div className="px-2 py-1">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              🛠️ Developer Tools
            </span>
          </div>

          <DropdownMenuCheckboxItem
            checked={showDevPanel}
            onCheckedChange={handleToggleDevPanel}
            className="cursor-pointer"
          >
            <Code2 className="h-4 w-4 mr-2 text-purple-600" />
            <div className="flex flex-col flex-1">
              <span className="font-medium">Developer Panel</span>
              <span className="text-xs text-muted-foreground">
                Show debug info in real-time
              </span>
            </div>
          </DropdownMenuCheckboxItem>

          <DropdownMenuCheckboxItem
            checked={performanceMode}
            onCheckedChange={handleTogglePerformance}
            className="cursor-pointer"
          >
            <Gauge className="h-4 w-4 mr-2 text-green-600" />
            <div className="flex flex-col flex-1">
              <span className="font-medium">High Performance Mode</span>
              <span className="text-xs text-muted-foreground">
                Reduce animations and optimize speed
              </span>
            </div>
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          {/* Quick Actions */}
          <div className="px-2 py-1">
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              ⚡ Quick Actions
            </span>
          </div>

          <DropdownMenuItem className="cursor-pointer">
            <Zap className="h-4 w-4 mr-2 text-yellow-600" />
            <div className="flex flex-col">
              <span className="font-medium">Clear Local Cache</span>
              <span className="text-xs text-muted-foreground">
                Remove temporary data
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer">
            <Eye className="h-4 w-4 mr-2 text-cyan-600" />
            <div className="flex flex-col">
              <span className="font-medium">Inspector Mode</span>
              <span className="text-xs text-muted-foreground">
                Analyze components in real-time
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Status Info */}
          <div className="px-2 py-2 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">
                System Status:
              </span>
              <Badge
                variant="outline"
                className="text-xs bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
              >
                ✓ Operational
              </Badge>
            </div>
            {isDesktopForced && (
              <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 p-2 rounded border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Monitor className="h-3 w-3 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold mb-1">
                      Desktop View Active
                    </div>
                    <div className="opacity-80">
                      Dashboard optimized for administration and development.
                      Perfect for advanced work.
                    </div>
                  </div>
                </div>
              </div>
            )}
            {showDevPanel && (
              <div className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20 p-2 rounded border border-purple-200 dark:border-purple-800">
                <Code2 className="h-3 w-3 inline mr-1" />
                Developer panel enabled
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
