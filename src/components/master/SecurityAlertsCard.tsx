"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Eye, Zap, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface SecurityAlert {
  id: string;
  level: "critical" | "high" | "medium" | "low";
  type: "intrusion" | "suspicious" | "policy" | "system";
  title: string;
  description: string;
  source: string;
  timestamp: string;
  status: "active" | "investigating" | "resolved";
  actions: string[];
}

export function SecurityAlertsCard() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "critical" | "active">("all");

  // Mock security alerts data
  useEffect(() => {
    const mockAlerts: SecurityAlert[] = [
      {
        id: "1",
        level: "critical",
        type: "intrusion",
        title: "Multiple Failed Login Attempts",
        description:
          "Detected 15+ failed login attempts from IP 192.168.1.100 in the last 5 minutes",
        source: "Authentication System",
        timestamp: "2 minutes ago",
        status: "active",
        actions: ["Block IP", "Investigate", "Alert Admin"],
      },
      {
        id: "2",
        level: "high",
        type: "suspicious",
        title: "Unusual Database Query Pattern",
        description:
          "Large number of SELECT queries on user data from non-standard source",
        source: "Database Monitor",
        timestamp: "8 minutes ago",
        status: "investigating",
        actions: ["Review Query", "Monitor User"],
      },
      {
        id: "3",
        level: "medium",
        type: "policy",
        title: "Password Policy Violation",
        description: "User account with weak password detected",
        source: "Security Scanner",
        timestamp: "1 hour ago",
        status: "resolved",
        actions: ["Notify User", "Force Reset"],
      },
    ];

    setTimeout(() => {
      setAlerts(mockAlerts);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredAlerts = useMemo(() => {
    if (filter === "all") return alerts;
    if (filter === "critical")
      return alerts.filter((alert) => alert.level === "critical");
    if (filter === "active")
      return alerts.filter((alert) => alert.status === "active");
    return alerts;
  }, [alerts, filter]);

  const getLevelColor = (level: SecurityAlert["level"]) => {
    switch (level) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-black";
      case "low":
        return "bg-blue-500 text-white";
    }
  };

  const getStatusColor = (status: SecurityAlert["status"]) => {
    switch (status) {
      case "active":
        return "bg-red-100 text-red-800 border-red-200";
      case "investigating":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getTypeIcon = (type: SecurityAlert["type"]) => {
    switch (type) {
      case "intrusion":
        return AlertTriangle;
      case "suspicious":
        return Eye;
      case "policy":
        return Shield;
      case "system":
        return Zap;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 w-48 bg-muted rounded mb-2" />
            <div className="h-4 w-96 bg-muted rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <Shield className="h-6 w-6" />
            Security Alert Center
          </CardTitle>
          <CardDescription>
            Real-time monitoring of security threats and system vulnerabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All ({alerts.length})
              </Button>
              <Button
                variant={filter === "critical" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("critical")}
              >
                Critical ({alerts.filter((a) => a.level === "critical").length})
              </Button>
              <Button
                variant={filter === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("active")}
              >
                Active ({alerts.filter((a) => a.status === "active").length})
              </Button>
            </div>
            <Button variant="outline" size="sm" className="ml-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Alerts List */}
          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const Icon = getTypeIcon(alert.type);
              return (
                <Card
                  key={alert.id}
                  className={cn(
                    "border-l-4 transition-all hover:shadow-md",
                    alert.level === "critical" && "border-l-red-500",
                    alert.level === "high" && "border-l-orange-500",
                    alert.level === "medium" && "border-l-yellow-500",
                    alert.level === "low" && "border-l-blue-500",
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Icon
                          className={cn(
                            "h-5 w-5 mt-0.5 flex-shrink-0",
                            alert.level === "critical" && "text-red-500",
                            alert.level === "high" && "text-orange-500",
                            alert.level === "medium" && "text-yellow-500",
                            alert.level === "low" && "text-blue-500",
                          )}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm">
                              {alert.title}
                            </h3>
                            <Badge
                              className={cn(
                                "text-xs",
                                getLevelColor(alert.level),
                              )}
                            >
                              {alert.level.toUpperCase()}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={getStatusColor(alert.status)}
                            >
                              {alert.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {alert.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Source: {alert.source}</span>
                            <span>{alert.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {alert.actions.slice(0, 2).map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            {action}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredAlerts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No security alerts match the current filter</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
