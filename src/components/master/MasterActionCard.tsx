"use client";

import React, { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface ActionItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}

interface MasterActionCardProps {
  title: string;
  description?: string;
  actions: ActionItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

const gridCols = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

export function MasterActionCard({
  title,
  description,
  actions,
  columns = 3,
  className = "",
}: MasterActionCardProps) {
  return (
    <Card className={`border-slate-200 dark:border-slate-800 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-slate-600 dark:text-slate-400">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className={`grid ${gridCols[columns]} gap-4`}>
          {actions.map((action) => (
            <div
              key={action.id}
              className="group relative p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <action.icon className="h-5 w-5 text-slate-600 dark:text-slate-400 mt-0.5" />
                {action.badge && (
                  <Badge
                    variant={action.badgeVariant || "secondary"}
                    className="text-xs"
                  >
                    {action.badge}
                  </Badge>
                )}
              </div>

              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 text-sm">
                {action.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                {action.description}
              </p>

              <Button
                variant={action.variant || "outline"}
                size="sm"
                className="w-full text-xs h-8"
                onClick={action.onClick}
                disabled={action.disabled}
                asChild={!!action.href}
              >
                {action.href ? (
                  <a
                    href={action.href}
                    className="flex items-center justify-center"
                  >
                    <action.icon className="h-3 w-3 mr-2" />
                    Ejecutar
                  </a>
                ) : (
                  <>
                    <action.icon className="h-3 w-3 mr-2" />
                    Ejecutar
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
