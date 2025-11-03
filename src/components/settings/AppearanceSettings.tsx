"use client";

import { useState, useLayoutEffect } from "react";
import { useTheme } from "next-themes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

export function AppearanceSettings() {
  const { theme, setTheme, systemTheme } = useTheme();
  const { t } = useDivineParsing(["common"]);
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("appearance.title", "common")}</CardTitle>
          <CardDescription>
            {t("appearance.description", "common")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-loading" className="text-muted-foreground">
                {t("appearance.loading_preferences", "common")}
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
  };

  const getCurrentTheme = () => {
    if (theme === "system") {
      return systemTheme || "light";
    }
    return theme || "light";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("appearance.title", "common")}</CardTitle>
        <CardDescription>
          {t("appearance.description", "common")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Selection */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-3">
              {t("appearance.theme", "common")}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                className="justify-start"
                onClick={() => handleThemeChange("light")}
              >
                <Sun className="mr-2 h-4 w-4" />
                {t("appearance.theme_light", "common")}
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                className="justify-start"
                onClick={() => handleThemeChange("dark")}
              >
                <Moon className="mr-2 h-4 w-4" />
                {t("appearance.theme_dark", "common")}
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                className="justify-start"
                onClick={() => handleThemeChange("system")}
              >
                <Monitor className="mr-2 h-4 w-4" />
                {t("appearance.theme_system", "common")}
              </Button>
            </div>
          </div>

          {/* Current Theme Indicator */}
          <div className="text-sm text-muted-foreground">
            {t("appearance.current_theme", "common")}{" "}
            {theme === "system"
              ? `${t("appearance.system_theme", "common")} (${systemTheme === "dark" ? t("appearance.system_dark", "common") : t("appearance.system_light", "common")})`
              : theme === "light"
                ? t("appearance.theme_light", "common")
                : t("appearance.theme_dark", "common")}
          </div>
        </div>

        {/* Reduced Motion Option */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="reduce-motion" className="text-sm font-medium">
              {t("appearance.reduce_animations", "common")}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("appearance.reduce_animations_desc", "common")}
            </p>
          </div>
          <Switch
            id="reduce-motion"
            onCheckedChange={(checked) => {
              if (checked) {
                document.documentElement.style.setProperty(
                  "--animation-duration",
                  "0s",
                );
              } else {
                document.documentElement.style.removeProperty(
                  "--animation-duration",
                );
              }
            }}
          />
        </div>

        {/* High Contrast Option */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="high-contrast" className="text-sm font-medium">
              {t("appearance.high_contrast", "common")}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("appearance.high_contrast_desc", "common")}
            </p>
          </div>
          <Switch
            id="high-contrast"
            onCheckedChange={(checked) => {
              if (checked) {
                document.documentElement.classList.add("high-contrast");
              } else {
                document.documentElement.classList.remove("high-contrast");
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
