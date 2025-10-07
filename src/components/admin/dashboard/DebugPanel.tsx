"use client";

import React, { useState } from "react";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  Code2,
  Globe,
  Database,
  Clock,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function DebugPanel() {
  const divineOracle = useDivineParsing([
    "common",
    "navigation",
    "language",
    "admin",
  ]);
  const [isOpen, setIsOpen] = useState(false);

  const stats = divineOracle.getTranslationStats();

  // Only show in development mode
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <CardTitle className="text-lg">
                  🕊️ Divine Oracle Debug
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  Development
                </Badge>
              </div>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Core Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="text-sm font-medium">Language</div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {divineOracle.language.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-green-500" />
                <div>
                  <div className="text-sm font-medium">Namespaces</div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {divineOracle.getLoadedNamespaces().length}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <div>
                  <div className="text-sm font-medium">Load Time</div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {stats.loadTime.toFixed(1)}ms
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-500" />
                <div>
                  <div className="text-sm font-medium">Total Keys</div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {stats.totalKeys}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${divineOracle.isLoading ? "bg-yellow-500 animate-pulse" : "bg-green-500"}`}
                />
                <span className="text-sm">
                  {divineOracle.isLoading ? "Loading..." : "Ready"}
                </span>
              </div>

              {divineOracle.error && (
                <Badge variant="destructive" className="text-xs">
                  Error: {divineOracle.error}
                </Badge>
              )}
            </div>

            {/* Loaded Namespaces */}
            <div>
              <div className="text-sm font-medium mb-2">Loaded Namespaces:</div>
              <div className="flex flex-wrap gap-2">
                {divineOracle.getLoadedNamespaces().map((namespace) => (
                  <Badge key={namespace} variant="outline" className="text-xs">
                    {namespace}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Translation Tests */}
            <div>
              <div className="text-sm font-medium mb-2">Translation Tests:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="text-xs bg-muted p-2 rounded border">
                  <div className="font-medium text-muted-foreground">
                    Navigation:
                  </div>
                  <div>
                    {divineOracle.t("nav.center.council", "navigation")}
                  </div>
                </div>

                <div className="text-xs bg-muted p-2 rounded border">
                  <div className="font-medium text-muted-foreground">
                    Common:
                  </div>
                  <div>{divineOracle.t("common.save", "common")}</div>
                </div>

                <div className="text-xs bg-muted p-2 rounded border">
                  <div className="font-medium text-muted-foreground">
                    Language:
                  </div>
                  <div>{divineOracle.t("language.toggle", "language")}</div>
                </div>

                <div className="text-xs bg-muted p-2 rounded border">
                  <div className="font-medium text-muted-foreground">
                    Admin:
                  </div>
                  <div>
                    {divineOracle.t("admin.dashboard", "admin") ||
                      "admin.dashboard"}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  divineOracle.setLanguage(
                    divineOracle.language === "es" ? "en" : "es",
                  )
                }
              >
                Switch Language
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => divineOracle.invokeOracle("admin")}
              >
                Load Admin
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => divineOracle.invokeOracle("dashboard")}
              >
                Load Dashboard
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
