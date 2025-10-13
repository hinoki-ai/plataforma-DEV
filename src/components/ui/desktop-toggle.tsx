"use client";

import {
  useDesktopToggle,
  useResponsiveMode,
} from "@/lib/hooks/useDesktopToggle";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ThemeIcons } from "@/components/icons/hero-icons";
import { useSession } from "next-auth/react";

export function DesktopToggle() {
  const { data: session } = useSession();
  const { toggleDesktopMode } = useDesktopToggle();
  const { isDesktopForced, isActualMobile } = useResponsiveMode();
  const [isVisible, setIsVisible] = useState(false);

  // Only show the toggle if we're on a mobile device
  // Don't show for MASTER users as they have the advanced dropdown
  if (!isActualMobile || session?.user?.role === "MASTER") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <Button
        onClick={() => setIsVisible(!isVisible)}
        variant="ghost"
        size="sm"
        className="text-sm font-medium transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        title="Vista de desarrollador"
      >
        <ThemeIcons.Desktop className="w-4 h-4" />
      </Button>

      {/* Toggle Panel */}
      {isVisible && (
        <div className="bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border border-border p-4 min-w-[200px]">
          <h3 className="font-semibold text-sm mb-3 text-foreground">
            Vista de Desarrollador
          </h3>

          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              Dispositivo: {isActualMobile ? "Móvil" : "Escritorio"}
            </div>

            <div className="text-xs text-muted-foreground">
              Vista actual:{" "}
              {isDesktopForced ? "Escritorio forzado" : "Automática"}
            </div>

            <Button
              onClick={toggleDesktopMode}
              variant={isDesktopForced ? "default" : "ghost"}
              size="sm"
              className="w-full text-sm font-medium transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {isDesktopForced ? (
                <>
                  <ThemeIcons.Desktop className="w-4 h-4 mr-2" />
                  Vista Escritorio ON
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  Vista Automática
                </>
              )}
            </Button>

            <div className="text-xs text-muted-foreground pt-2 border-t">
              💡 Fuerza vista de escritorio para desarrollo/admin
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
