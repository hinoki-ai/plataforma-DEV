"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PerformanceData {
  id: string;
  type: string;
  data: {
    endpoint: string;
    responseTime: number;
    status: number;
  };
  timestamp: string;
}

export function PerformanceMonitor() {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [averageResponseTime, setAverageResponseTime] = useState(0);
  const [slowestEndpoint, setSlowestEndpoint] = useState<string>("");
  const [totalRequests, setTotalRequests] = useState(0);

  const fetchPerformanceData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/debug-performance?limit=20");
      if (response.ok) {
        const result = await response.json();
        setPerformanceData(result.data || []);

        // Calculate metrics
        if (result.data && result.data.length > 0) {
          const responseTimes = result.data.map(
            (item: PerformanceData) => item.data.responseTime,
          );
          const avgTime =
            responseTimes.reduce((a: number, b: number) => a + b, 0) /
            responseTimes.length;
          setAverageResponseTime(Math.round(avgTime));

          const slowest = result.data.reduce(
            (prev: PerformanceData, current: PerformanceData) =>
              prev.data.responseTime > current.data.responseTime
                ? prev
                : current,
          );
          setSlowestEndpoint(slowest.data.endpoint);
          setTotalRequests(result.total);
        }
      }
    } catch (error) {
      console.error("Failed to fetch performance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchPerformanceData, 30000);

    return () => clearInterval(interval);
  }, []);

  const getResponseTimeColor = (time: number) => {
    if (time < 100) return "text-green-600";
    if (time < 300) return "text-yellow-600";
    if (time < 1000) return "text-orange-600";
    return "text-red-600";
  };

  const getResponseTimeProgress = (time: number) => {
    return Math.min(100, (time / 2000) * 100); // Max 2 seconds for 100%
  };

  const getStatusBadgeVariant = (status: number) => {
    if (status >= 200 && status < 300) return "default";
    if (status >= 300 && status < 400) return "secondary";
    if (status >= 400 && status < 500) return "destructive";
    if (status >= 500) return "destructive";
    return "outline";
  };

  return (
    <div className="space-y-4">
      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div
            className={`text-2xl font-bold ${getResponseTimeColor(averageResponseTime)}`}
          >
            {averageResponseTime}ms
          </div>
          <div className="text-sm text-muted-foreground">Avg Response Time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{totalRequests}</div>
          <div className="text-sm text-muted-foreground">Total Requests</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-medium truncate" title={slowestEndpoint}>
            {slowestEndpoint || "N/A"}
          </div>
          <div className="text-sm text-muted-foreground">Slowest Endpoint</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Recent Performance Data</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchPerformanceData}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {/* Performance Data Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px]">
            {performanceData.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {isLoading
                  ? "Loading performance data..."
                  : "No performance data available"}
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {performanceData.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {item.data.endpoint}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleTimeString()} •{" "}
                        {item.type}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusBadgeVariant(item.data.status)}>
                        {item.data.status}
                      </Badge>
                      <div className="text-right min-w-[60px]">
                        <div
                          className={`text-sm font-medium ${getResponseTimeColor(item.data.responseTime)}`}
                        >
                          {item.data.responseTime}ms
                        </div>
                        <Progress
                          value={getResponseTimeProgress(
                            item.data.responseTime,
                          )}
                          className="w-[60px] h-1 mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Performance Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Performance Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Excellent: &lt; 100ms</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Good: 100-300ms</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Acceptable: 300-1000ms</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Poor: &gt; 1000ms</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
