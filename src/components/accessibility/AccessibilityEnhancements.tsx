"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accessibility,
  Eye,
  Ear,
  Move,
  Type,
  Contrast,
  Volume2,
  Play,
  Pause,
  Settings,
  Keyboard,
  MousePointer,
  Focus,
  Zap,
  Palette,
  Globe,
  Coffee,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AccessibilitySettings {
  fontSize: number;
  contrast: "normal" | "high" | "higher";
  colorBlindMode: "none" | "protanopia" | "deuteranopia" | "tritanopia";
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  tooltips: boolean;
  animations: boolean;
  soundEnabled: boolean;
  voiceCommands: boolean;
  magnification: number;
  cursorSize: "normal" | "large" | "extra-large";
  dyslexiaFont: boolean;
  readingGuide: boolean;
  pauseAnimations: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSize: 16,
  contrast: "normal",
  colorBlindMode: "none",
  reducedMotion: false,
  screenReader: false,
  keyboardNavigation: true,
  focusIndicators: true,
  tooltips: true,
  animations: true,
  soundEnabled: false,
  voiceCommands: false,
  magnification: 1,
  cursorSize: "normal",
  dyslexiaFont: false,
  readingGuide: false,
  pauseAnimations: false,
};

export function useAccessibilitySettings() {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Load settings from localStorage during initialization
    try {
      const saved = localStorage.getItem("accessibility-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error("Failed to load accessibility settings:", error);
    }
    return DEFAULT_SETTINGS;
  });
  const [isLoaded, setIsLoaded] = useState(true);

  // Save settings to localStorage
  const saveSettings = useCallback(
    (newSettings: Partial<AccessibilitySettings>) => {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      try {
        localStorage.setItem(
          "accessibility-settings",
          JSON.stringify(updatedSettings),
        );
      } catch (error) {
        console.error("Failed to save accessibility settings:", error);
      }
    },
    [settings],
  );

  // Apply settings to document
  useEffect(() => {
    if (!isLoaded) return;

    const root = document.documentElement;
    const body = document.body;

    // Font size
    root.style.setProperty("--base-font-size", `${settings.fontSize}px`);

    // Contrast
    body.classList.remove("high-contrast", "higher-contrast");
    if (settings.contrast === "high") {
      body.classList.add("high-contrast");
    } else if (settings.contrast === "higher") {
      body.classList.add("higher-contrast");
    }

    // Color blind mode
    body.classList.remove("protanopia", "deuteranopia", "tritanopia");
    if (settings.colorBlindMode !== "none") {
      body.classList.add(settings.colorBlindMode);
    }

    // Reduced motion
    if (settings.reducedMotion) {
      body.classList.add("reduce-motion");
    } else {
      body.classList.remove("reduce-motion");
    }

    // Focus indicators
    if (settings.focusIndicators) {
      body.classList.add("enhanced-focus");
    } else {
      body.classList.remove("enhanced-focus");
    }

    // Magnification
    root.style.setProperty("--magnification", `${settings.magnification}`);

    // Cursor size
    body.classList.remove("large-cursor", "extra-large-cursor");
    if (settings.cursorSize === "large") {
      body.classList.add("large-cursor");
    } else if (settings.cursorSize === "extra-large") {
      body.classList.add("extra-large-cursor");
    }

    // Dyslexia font
    if (settings.dyslexiaFont) {
      body.classList.add("dyslexia-font");
    } else {
      body.classList.remove("dyslexia-font");
    }

    // Pause animations
    if (settings.pauseAnimations) {
      body.classList.add("pause-animations");
    } else {
      body.classList.remove("pause-animations");
    }
  }, [settings, isLoaded]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem("accessibility-settings");
  }, []);

  return {
    settings,
    saveSettings,
    resetSettings,
    isLoaded,
  };
}

interface AccessibilityPanelProps {
  className?: string;
}

export function AccessibilityPanel({ className }: AccessibilityPanelProps) {
  const { settings, saveSettings, resetSettings } = useAccessibilitySettings();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useDivineParsing(["common"]);

  const contrastOptions = [
    {
      value: "normal",
      label: t("accessibility.normal", "common"),
      description: t("accessibility.standard_contrast", "common"),
    },
    {
      value: "high",
      label: t("accessibility.high", "common"),
      description: t("accessibility.enhanced_contrast", "common"),
    },
    {
      value: "higher",
      label: t("accessibility.higher", "common"),
      description: t("accessibility.maximum_contrast", "common"),
    },
  ] as const;

  const colorBlindOptions = [
    { value: "none", label: "Ninguno", description: "Colores normales" },
    {
      value: "protanopia",
      label: "Protanopía",
      description: "Dificultad con rojos",
    },
    {
      value: "deuteranopia",
      label: "Deuteranopía",
      description: "Dificultad con verdes",
    },
    {
      value: "tritanopia",
      label: "Tritanopía",
      description: "Dificultad con azules",
    },
  ] as const;

  const cursorOptions = [
    { value: "normal", label: "Normal", description: "Tamaño estándar" },
    { value: "large", label: "Grande", description: "Cursor más visible" },
    {
      value: "extra-large",
      label: "Extra Grande",
      description: "Máxima visibilidad",
    },
  ] as const;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn("relative", className)}
          aria-label="Abrir panel de accesibilidad"
        >
          <Accessibility className="h-4 w-4" />
          {Object.values(settings).some(
            (value) =>
              value !==
              DEFAULT_SETTINGS[
                Object.keys(settings).find(
                  (key) =>
                    settings[key as keyof AccessibilitySettings] === value,
                ) as keyof AccessibilitySettings
              ],
          ) && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5" />
            Configuración de Accesibilidad
          </DialogTitle>
          <DialogDescription>
            Personaliza las opciones de accesibilidad para mejorar tu
            experiencia en la plataforma
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vision Settings */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-4 w-4" />
                <h3 className="font-semibold">Configuración Visual</h3>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Tamaño de fuente
                  </label>
                  <Badge variant="outline">{settings.fontSize}px</Badge>
                </div>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]) => saveSettings({ fontSize: value })}
                  min={12}
                  max={24}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Pequeño</span>
                  <span>Grande</span>
                </div>
              </div>

              {/* Magnification */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Ampliación</label>
                  <Badge variant="outline">
                    {Math.round(settings.magnification * 100)}%
                  </Badge>
                </div>
                <Slider
                  value={[settings.magnification]}
                  onValueChange={([value]) =>
                    saveSettings({ magnification: value })
                  }
                  min={1}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>100%</span>
                  <span>200%</span>
                </div>
              </div>

              {/* Contrast */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Contraste</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {
                        contrastOptions.find(
                          (o) => o.value === settings.contrast,
                        )?.label
                      }
                      <Contrast className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {contrastOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => saveSettings({ contrast: option.value })}
                      >
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Color Blind Mode */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Modo daltónico</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {
                        colorBlindOptions.find(
                          (o) => o.value === settings.colorBlindMode,
                        )?.label
                      }
                      <Palette className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {colorBlindOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() =>
                          saveSettings({ colorBlindMode: option.value })
                        }
                      >
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>

          {/* Motor Settings */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Move className="h-4 w-4" />
                <h3 className="font-semibold">Configuración Motora</h3>
              </div>

              {/* Cursor Size */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tamaño del cursor</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {
                        cursorOptions.find(
                          (o) => o.value === settings.cursorSize,
                        )?.label
                      }
                      <MousePointer className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {cursorOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() =>
                          saveSettings({ cursorSize: option.value })
                        }
                      >
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Keyboard Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Keyboard className="h-4 w-4" />
                  <label className="text-sm font-medium">
                    Navegación por teclado
                  </label>
                </div>
                <Switch
                  checked={settings.keyboardNavigation}
                  onCheckedChange={(checked) =>
                    saveSettings({ keyboardNavigation: checked })
                  }
                />
              </div>

              {/* Focus Indicators */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Focus className="h-4 w-4" />
                  <label className="text-sm font-medium">
                    Indicadores de foco mejorados
                  </label>
                </div>
                <Switch
                  checked={settings.focusIndicators}
                  onCheckedChange={(checked) =>
                    saveSettings({ focusIndicators: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Cognitive Settings */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Coffee className="h-4 w-4" />
                <h3 className="font-semibold">Configuración Cognitiva</h3>
              </div>

              {/* Dyslexia Font */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  <label className="text-sm font-medium">
                    Fuente para dislexia
                  </label>
                </div>
                <Switch
                  checked={settings.dyslexiaFont}
                  onCheckedChange={(checked) =>
                    saveSettings({ dyslexiaFont: checked })
                  }
                />
              </div>

              {/* Reading Guide */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <label className="text-sm font-medium">Guía de lectura</label>
                </div>
                <Switch
                  checked={settings.readingGuide}
                  onCheckedChange={(checked) =>
                    saveSettings({ readingGuide: checked })
                  }
                />
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <label className="text-sm font-medium">
                    Reducir movimiento
                  </label>
                </div>
                <Switch
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) =>
                    saveSettings({ reducedMotion: checked })
                  }
                />
              </div>

              {/* Pause Animations */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pause className="h-4 w-4" />
                  <label className="text-sm font-medium">
                    Pausar animaciones
                  </label>
                </div>
                <Switch
                  checked={settings.pauseAnimations}
                  onCheckedChange={(checked) =>
                    saveSettings({ pauseAnimations: checked })
                  }
                />
              </div>

              {/* Tooltips */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <label className="text-sm font-medium">
                    Mostrar tooltips
                  </label>
                </div>
                <Switch
                  checked={settings.tooltips}
                  onCheckedChange={(checked) =>
                    saveSettings({ tooltips: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Audio Settings */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Ear className="h-4 w-4" />
                <h3 className="font-semibold">Configuración de Audio</h3>
              </div>

              {/* Sound Enabled */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  <label className="text-sm font-medium">
                    Sonidos de interfaz
                  </label>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) =>
                    saveSettings({ soundEnabled: checked })
                  }
                />
              </div>

              {/* Screen Reader */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  <label className="text-sm font-medium">
                    Lector de pantalla
                  </label>
                </div>
                <Switch
                  checked={settings.screenReader}
                  onCheckedChange={(checked) =>
                    saveSettings({ screenReader: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={resetSettings}>
              Restablecer configuración
            </Button>
            <Button onClick={() => setIsOpen(false)}>Aplicar cambios</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Skip Links Component
export function SkipLinks() {
  return (
    <div className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50">
      <div className="flex gap-2">
        <a
          href="#main-content"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
        >
          Ir al contenido principal
        </a>
        <a
          href="#navigation"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
        >
          Ir a la navegación
        </a>
      </div>
    </div>
  );
}

// Live Announcer for screen readers
export function LiveAnnouncer() {
  const [announcements, setAnnouncements] = useState<string[]>([]);

  useEffect(() => {
    const handleAnnouncement = (event: CustomEvent) => {
      const message = event.detail.message;
      setAnnouncements((prev) => [...prev, message].slice(-5)); // Keep last 5

      // Remove after a delay
      setTimeout(() => {
        setAnnouncements((prev) => prev.slice(1));
      }, 5000);
    };

    document.addEventListener("announce" as any, handleAnnouncement);

    return () => {
      document.removeEventListener("announce" as any, handleAnnouncement);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {announcements.map((announcement, index) => (
        <div key={index}>{announcement}</div>
      ))}
    </div>
  );
}

// Function to announce messages to screen readers
export function announceToScreenReader(message: string) {
  const event = new CustomEvent("announce", {
    detail: { message },
  });
  document.dispatchEvent(event);
}
