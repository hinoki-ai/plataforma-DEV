"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Server,
  Database,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/components/language/useDivineLanguage";

interface SystemMetrics {
  database: {
    status: "healthy" | "warning" | "error";
    responseTime: number;
    connections: number;
  };
  api: {
    status: "healthy" | "warning" | "error";
    uptime: number;
    requests: number;
  };
  auth: {
    status: "healthy" | "warning" | "error";
    activeSessions: number;
    failedAttempts: number;
  };
  storage: {
    status: "healthy" | "warning" | "error";
    usedSpace: number;
    totalSpace: number;
  };
  lastUpdated: string;
}

interface SystemStatusWidgetProps {
  metrics: SystemMetrics;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "healthy":
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    case "error":
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    default:
      return <Server className="w-4 h-4 text-gray-600" />;
  }
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case "healthy":
      return "CONFIRMED";
    case "warning":
      return "PENDING";
    case "error":
      return "CANCELLED";
    default:
      return "CONFIRMED";
  }
};

export function SystemStatusWidget({ metrics }: SystemStatusWidgetProps) {
  const { t } = useLanguage();
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Server className="w-5 h-5" />
          Estado del Sistema
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Última actualización: {formatDate(new Date(metrics.lastUpdated))}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Database Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span className="text-sm font-medium">Base de Datos</span>
              </div>
              <StatusBadge status={getStatusVariant(metrics.database.status)} />
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Respuesta: {metrics.database.responseTime}ms</div>
              <div>Conexiones: {metrics.database.connections}</div>
            </div>
          </div>

          {/* API Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">API</span>
              </div>
              <StatusBadge status={getStatusVariant(metrics.api.status)} />
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Uptime: {formatUptime(metrics.api.uptime)}</div>
              <div>Requests: {metrics.api.requests.toLocaleString()}</div>
            </div>
          </div>

          {/* Auth Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Autenticación</span>
              </div>
              <StatusBadge status={getStatusVariant(metrics.auth.status)} />
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Sesiones: {metrics.auth.activeSessions}</div>
              <div>Intentos fallidos: {metrics.auth.failedAttempts}</div>
            </div>
          </div>

          {/* Storage Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4" />
                <span className="text-sm font-medium">Almacenamiento</span>
              </div>
              <StatusBadge status={getStatusVariant(metrics.storage.status)} />
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Usado: {formatBytes(metrics.storage.usedSpace)}</div>
              <div>Total: {formatBytes(metrics.storage.totalSpace)}</div>
            </div>
          </div>
        </div>

        {/* Overall Status Summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Estado General</span>
            <Badge
              variant={
                Object.values(metrics).every(
                  (m) =>
                    typeof m === "object" &&
                    "status" in m &&
                    m.status === "healthy",
                )
                  ? "default"
                  : "destructive"
              }
              className="flex items-center gap-1"
            >
              {getStatusIcon(
                Object.values(metrics).every(
                  (m) =>
                    typeof m === "object" &&
                    "status" in m &&
                    m.status === "healthy",
                )
                  ? "healthy"
                  : "warning",
              )}
              {Object.values(metrics).every(
                (m) =>
                  typeof m === "object" &&
                  "status" in m &&
                  m.status === "healthy",
              )
                ? "Todo funcionando"
                : "Requiere atención"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
