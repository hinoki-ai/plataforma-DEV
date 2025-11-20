"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Trash2 } from "lucide-react";

interface ErrorLog {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  userAgent?: string;
  url?: string;
  severity: "error" | "warning" | "info";
}

export function ErrorTracker() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadErrors();
  }, []);

  const loadErrors = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll show a placeholder
      setErrors([
        {
          id: "1",
          timestamp: new Date().toISOString(),
          message: "Sample error for demonstration",
          severity: "error",
          url: window.location.href,
          userAgent: navigator.userAgent,
        },
      ]);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "destructive";
      case "warning":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <h3 className="text-lg font-semibold">Error Tracking</h3>
          <Badge variant="outline">{errors.length} errors</Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadErrors}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearErrors}
            disabled={errors.length === 0}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {errors.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No errors recorded</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          errors.map((error) => (
            <Card key={error.id} className="border-l-4 border-l-destructive">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">
                      {error.message}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(error.severity)}>
                        {error.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(error.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              {error.stack && (
                <CardContent className="pt-0">
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap text-xs bg-muted p-2 rounded">
                      {error.stack}
                    </pre>
                  </details>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
