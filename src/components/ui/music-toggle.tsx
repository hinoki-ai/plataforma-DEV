"use client";

import { useAudioConsent } from "@/hooks/use-audio-consent";
import { Volume2, VolumeX } from "lucide-react";
import * as React from "react";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface MusicToggleProps {
  variant?: "default" | "compact";
  showLabel?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function MusicToggle({
  variant = "default",
  showLabel = false,
  className,
  size = "md",
}: MusicToggleProps) {
  const { preferences, isLoaded, toggleMute } = useAudioConsent();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded || !preferences.hasConsented) {
    return null;
  }

  const isMuted = preferences.isMuted;

  const sizeClasses = {
    sm: "h-5 w-9",
    md: "h-6 w-11",
    lg: "h-7 w-13",
  };

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {showLabel && (
          <span className="text-sm font-medium text-foreground">
            {!isMuted ? "On" : "Off"}
          </span>
        )}
        <div className="relative group">
          <Switch
            checked={!isMuted}
            onCheckedChange={toggleMute}
            className={cn(
              sizeClasses[size],
              "transition-all duration-500 ease-out",
              "hover:scale-110 active:scale-95",
            )}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Switch
        checked={!isMuted}
        onCheckedChange={toggleMute}
        className={cn(
          "h-6 w-12 transition-all duration-300 ease-in-out",
          "hover:scale-105 active:scale-95",
        )}
      />
    </div>
  );
}
