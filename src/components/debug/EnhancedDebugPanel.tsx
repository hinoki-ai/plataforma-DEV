"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { debugMonitor } from "@/lib/debug-monitor";

// Extended navigator interface for Network Information API
interface NavigatorWithConnection extends Navigator {
  connection?: {
    type?: string;
    effectiveType?: string;
    downlink?: number;
  };
}

interface DebugLog {
  id: string;
  type: "info" | "warn" | "error" | "success";
  message: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

interface SystemMetrics {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  performance: {
    loadTime: number;
    domContentLoaded: number;
    firstPaint: number;
    firstContentfulPaint: number;
  };
  network: {
    connection: string;
    effectiveType: string;
    downlink: number;
  };
}

export function EnhancedDebugPanel() {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [activeTab, setActiveTab] = useState("console");

  const addLog = useCallback(
    (
      type: DebugLog["type"],
      message: string,
      details?: Record<string, unknown>,
    ) => {
      const newLog: DebugLog = {
        id: Date.now().toString(),
        type,
        message,
        timestamp: new Date().toLocaleTimeString(),
        details,
      };

      setLogs((prev) => [newLog, ...prev.slice(0, 99)]); // Keep last 100 logs
    },
    [],
  );

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    debugMonitor.init();
    addLog("success", "Debug monitoring started");

    // Get initial metrics
    const performanceMetrics = debugMonitor.getPerformanceMetrics();
    if (performanceMetrics) {
      setMetrics({
        memory: performanceMetrics.memoryUsage
          ? {
              used: performanceMetrics.memoryUsage.usedJSHeapSize,
              total: performanceMetrics.memoryUsage.totalJSHeapSize,
              percentage: Math.round(
                (performanceMetrics.memoryUsage.usedJSHeapSize /
                  performanceMetrics.memoryUsage.totalJSHeapSize) *
                  100,
              ),
            }
          : { used: 0, total: 0, percentage: 0 },
        performance: {
          loadTime: performanceMetrics.loadTime,
          domContentLoaded: performanceMetrics.domContentLoaded,
          firstPaint: performanceMetrics.firstPaint,
          firstContentfulPaint: performanceMetrics.firstContentfulPaint,
        },
        network: {
          connection:
            (navigator as NavigatorWithConnection).connection?.type ||
            "unknown",
          effectiveType:
            (navigator as NavigatorWithConnection).connection?.effectiveType ||
            "unknown",
          downlink:
            (navigator as NavigatorWithConnection).connection?.downlink || 0,
        },
      });
    }
  }, [addLog]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    debugMonitor.destroy();
    addLog("info", "Debug monitoring stopped");
  }, [addLog]);

  const testError = useCallback(() => {
    debugMonitor.trackError("Test error from debug panel", "medium", {
      testData: true,
      timestamp: Date.now(),
    });
    addLog("error", "Test error logged to monitoring system");
  }, [addLog]);

  const testApiCall = useCallback(() => {
    const start = Date.now();
    fetch("/api/health")
      .then(() => {
        const duration = Date.now() - start;
        debugMonitor.trackApiCall("/api/health", duration, true);
        addLog("success", `API test completed in ${duration}ms`);
      })
      .catch(() => {
        const duration = Date.now() - start;
        debugMonitor.trackApiCall("/api/health", duration, false);
        addLog("error", `API test failed after ${duration}ms`);
      });
  }, [addLog]);

  const refreshMetrics = useCallback(() => {
    const performanceMetrics = debugMonitor.getPerformanceMetrics();
    if (performanceMetrics) {
      setMetrics((prev) => ({
        memory: performanceMetrics.memoryUsage
          ? {
              used: performanceMetrics.memoryUsage.usedJSHeapSize,
              total: performanceMetrics.memoryUsage.totalJSHeapSize,
              percentage: Math.round(
                (performanceMetrics.memoryUsage.usedJSHeapSize /
                  performanceMetrics.memoryUsage.totalJSHeapSize) *
                  100,
              ),
            }
          : prev?.memory || { used: 0, total: 0, percentage: 0 },
        performance: {
          loadTime: performanceMetrics.loadTime,
          domContentLoaded: performanceMetrics.domContentLoaded,
          firstPaint: performanceMetrics.firstPaint,
          firstContentfulPaint: performanceMetrics.firstContentfulPaint,
        },
        network: prev?.network || {
          connection: (navigator as any).connection?.type || "unknown",
          effectiveType:
            (navigator as any).connection?.effectiveType || "unknown",
          downlink: (navigator as any).connection?.downlink || 0,
        },
      }));
      addLog("info", "Metrics refreshed");
    }
  }, [addLog]);

  useEffect(() => {
    // Auto-start monitoring - initialization is appropriate here
    // Only start if not already monitoring to avoid cascading renders
    if (!isMonitoring) {
      startMonitoring();
    }

    return () => {
      debugMonitor.destroy();
    };
  }, [startMonitoring, isMonitoring]);

  const getBadgeVariant = (type: DebugLog["type"]) => {
    switch (type) {
      case "error":
        return "destructive";
      case "warn":
        return "secondary";
      case "success":
        return "default";
      default:
        return "outline";
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full space-y-4">
      {/* Control Panel */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={isMonitoring ? "destructive" : "default"}
            size="sm"
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
          >
            {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
          </Button>
          <Button variant="outline" size="sm" onClick={refreshMetrics}>
            Refresh Metrics
          </Button>
          <Button variant="outline" size="sm" onClick={testError}>
            Test Error
          </Button>
          <Button variant="outline" size="sm" onClick={testApiCall}>
            Test API Call
          </Button>
        </div>
        <div className="flex gap-2">
          <Badge variant={isMonitoring ? "default" : "secondary"}>
            {isMonitoring ? "Monitoring Active" : "Monitoring Inactive"}
          </Badge>
          <Button variant="ghost" size="sm" onClick={clearLogs}>
            Clear Logs
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Memory Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.memory.percentage}%
              </div>
              <div className="text-xs text-muted-foreground">
                {formatBytes(metrics.memory.used)} /{" "}
                {formatBytes(metrics.memory.total)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Load Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.performance.loadTime}ms
              </div>
              <div className="text-xs text-muted-foreground">
                FCP: {Math.round(metrics.performance.firstContentfulPaint)}ms
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Network</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.network.effectiveType}
              </div>
              <div className="text-xs text-muted-foreground">
                {metrics.network.downlink}mbps downlink
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Debug Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="console">Console ({logs.length})</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="console">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Debug Console</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full">
                {logs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No logs yet. Start monitoring to see debug information.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-2 p-2 rounded border-l-2 border-l-muted"
                      >
                        <Badge
                          variant={getBadgeVariant(log.type)}
                          className="mt-0.5"
                        >
                          {log.type}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-mono">{log.message}</div>
                          <div className="text-xs text-muted-foreground">
                            {log.timestamp}
                          </div>
                          {log.details && (
                            <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Network Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Network monitoring data will appear here when available.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Page Load Metrics</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Load Time: {metrics.performance.loadTime}ms</div>
                      <div>
                        DOM Content Loaded:{" "}
                        {metrics.performance.domContentLoaded}ms
                      </div>
                      <div>
                        First Paint:{" "}
                        {Math.round(metrics.performance.firstPaint)}ms
                      </div>
                      <div>
                        First Contentful Paint:{" "}
                        {Math.round(metrics.performance.firstContentfulPaint)}ms
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Start monitoring to view performance metrics.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Storage Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  LocalStorage items:{" "}
                  {typeof window !== "undefined" && window.localStorage
                    ? Object.keys(window.localStorage).length
                    : "N/A"}
                </div>
                <div>
                  SessionStorage items:{" "}
                  {typeof window !== "undefined" && window.sessionStorage
                    ? Object.keys(window.sessionStorage).length
                    : "N/A"}
                </div>
                <div>
                  Cookies:{" "}
                  {typeof document !== "undefined"
                    ? document.cookie.split(";").length
                    : "N/A"}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
