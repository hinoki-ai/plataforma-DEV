"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Clock } from "lucide-react";
import { Monitor } from "lucide-react";

interface SystemComponent {
  name: string;
  status: string;
  icon: React.ComponentType<{ className?: string }>;
  statusColor: "green" | "yellow" | "red";
}

export function SystemOverviewCard() {
  const systemComponents: SystemComponent[] = [
    {
      name: "Base de Datos",
      status: "Online - 99.9% uptime",
      icon: CheckCircle,
      statusColor: "green",
    },
    {
      name: "API Gateway",
      status: "45ms respuesta",
      icon: CheckCircle,
      statusColor: "green",
    },
    {
      name: "Cache Layer",
      status: "Próximo purge: 2h",
      icon: Clock,
      statusColor: "yellow",
    },
    {
      name: "CDN Global",
      status: "12 nodos activos",
      icon: CheckCircle,
      statusColor: "green",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "green":
        return "text-green-600 bg-green-50 dark:bg-green-950/20";
      case "yellow":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20";
      case "red":
        return "text-red-600 bg-red-50 dark:bg-red-950/20";
      default:
        return "text-slate-600 bg-slate-50 dark:bg-slate-950/20";
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {systemComponents.map((component, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-4 rounded-lg border ${getStatusColor(component.statusColor)}`}
            >
              <component.icon
                className={`h-5 w-5 ${
                  component.statusColor === "green"
                    ? "text-green-600"
                    : component.statusColor === "yellow"
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              />
              <div>
                <div className="font-medium text-sm text-slate-900 dark:text-slate-100">
                  {component.name}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {component.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
