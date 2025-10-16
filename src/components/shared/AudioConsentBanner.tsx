"use client";

import { useEffect, useState } from "react";
import { useAudioConsent } from "@/hooks/use-audio-consent";
import { Button } from "@/components/ui/button";
import { Volume2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function AudioConsentBanner() {
  const { preferences, enableMusic, isLoaded } = useAudioConsent();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    const hasSeenBanner = localStorage.getItem("audio_banner_dismissed");
    if (!preferences.hasConsented && !hasSeenBanner) {
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, preferences.hasConsented]);

  const handleAccept = () => {
    enableMusic();
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem("audio_banner_dismissed", "true");

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("homepage-music-play"));
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem("audio_banner_dismissed", "true");
  };

  if (!showBanner || dismissed || preferences.hasConsented) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90",
        "border border-border rounded-lg shadow-lg p-4",
        "animate-in slide-in-from-bottom-5 duration-500",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <Volume2 className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">¿Activar música?</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Hemos preparado música de fondo para mejorar tu experiencia. Puedes
            controlarla en cualquier momento.
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAccept} className="flex-1">
              Activar
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              No, gracias
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
