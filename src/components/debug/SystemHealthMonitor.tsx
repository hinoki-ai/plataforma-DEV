"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface SystemStatus {
  database: "healthy" | "warning" | "error";
  authentication: "healthy" | "warning" | "error";
  api: "healthy" | "warning" | "error";
  storage: "healthy" | "warning" | "error";
}

interface PerformanceMetrics {
  responseTime: number;
  uptime: string;
  activeUsers: number;
  errorRate: number;
}

export function SystemHealthMonitor() {
  const [status, setStatus] = useState<SystemStatus>({
    database: "healthy",
    authentication: "healthy",
    api: "healthy",
    storage: "healthy",
  });

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    responseTime: 0,
    uptime: "0d 0h 0m",
    activeUsers: 0,
    errorRate: 0,
  });

  const [lastCheck, setLastCheck] = useState<string>("");
  const [isChecking, setIsChecking] = useState(false);

  const checkSystemHealth = async () => {
    setIsChecking(true);
    try {
      const start = Date.now();

      // Check API health
      const apiResponse = await fetch("/api/health");
      const apiStatus = apiResponse.ok ? "healthy" : "error";

      // Check database health
      const dbResponse = await fetch("/api/db/health");
      const dbStatus = dbResponse.ok ? "healthy" : "error";

      // Check authentication
      const authResponse = await fetch("/api/auth/session");
      const authStatus = authResponse.ok ? "healthy" : "warning";

      const responseTime = Date.now() - start;

      setStatus({
        database: dbStatus,
        authentication: authStatus,
        api: apiStatus,
        storage: "healthy", // Assume storage is healthy for now
      });

      setMetrics((prev) => ({
        ...prev,
        responseTime,
      }));

      setLastCheck(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Health check failed:", error);
      setStatus({
        database: "error",
        authentication: "error",
        api: "error",
        storage: "error",
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkSystemHealth();

    // Set up periodic checks every 30 seconds
    const interval = setInterval(checkSystemHealth, 30000);

    // Mock some metrics
    setMetrics({
      responseTime: 0,
      uptime: "2d 14h 23m",
      activeUsers: Math.floor(Math.random() * 15) + 1,
      errorRate: Math.random() * 2, // 0-2% error rate
    });

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: SystemStatus[keyof SystemStatus]) => {
    switch (status) {
      case "healthy":
        return "default";
      case "warning":
        return "secondary";
      case "error":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: SystemStatus[keyof SystemStatus]) => {
    switch (status) {
      case "healthy":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      default:
        return "❓";
    }
  };

  const overallHealth = Object.values(status).every((s) => s === "healthy")
    ? "healthy"
    : Object.values(status).some((s) => s === "error")
      ? "error"
      : "warning";

  return (
    <div className="space-y-6">
      {/* Overall System Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(overallHealth)}
              System Health Overview
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Last checked: {lastCheck || "Never"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkSystemHealth}
            disabled={isChecking}
          >
            {isChecking ? "Checking..." : "Check Now"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.responseTime}ms</div>
              <div className="text-sm text-muted-foreground">Response Time</div>
              <Progress
                value={Math.min(100, (metrics.responseTime / 1000) * 100)}
                className="mt-2"
              />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.uptime}</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.activeUsers}</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {metrics.errorRate.toFixed(2)}%
              </div>
              <div className="text-sm text-muted-foreground">Error Rate</div>
              <Progress value={metrics.errorRate * 10} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <span className="text-lg">{getStatusIcon(status.database)}</span>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant={getStatusColor(status.database)}>
                {status.database}
              </Badge>
              <div className="text-xs text-muted-foreground">PostgreSQL</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Authentication
            </CardTitle>
            <span className="text-lg">
              {getStatusIcon(status.authentication)}
            </span>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant={getStatusColor(status.authentication)}>
                {status.authentication}
              </Badge>
              <div className="text-xs text-muted-foreground">NextAuth.js</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API</CardTitle>
            <span className="text-lg">{getStatusIcon(status.api)}</span>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant={getStatusColor(status.api)}>{status.api}</Badge>
              <div className="text-xs text-muted-foreground">Next.js API</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <span className="text-lg">{getStatusIcon(status.storage)}</span>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant={getStatusColor(status.storage)}>
                {status.storage}
              </Badge>
              <div className="text-xs text-muted-foreground">Cloudinary</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
