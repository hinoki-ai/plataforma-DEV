"use client";

import React, { useState, useMemo } from "react";
import { useSession } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Terminal,
  Play,
  Bug,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Download,
  Upload,
  RefreshCw,
  Zap,
  Database,
  Server,
  Globe,
} from "lucide-react";
import {
  RoleAwareBreadcrumb,
  RoleAwareHeader,
} from "@/components/layout/RoleAwareNavigation";

interface DebugCommand {
  id: string;
  command: string;
  output: string;
  status: "success" | "error" | "running";
  timestamp: string;
  duration: number;
}

interface SystemLog {
  id: string;
  level: "info" | "warning" | "error" | "debug";
  message: string;
  source: string;
  timestamp: string;
}

const debugCommands: DebugCommand[] = [
  {
    id: "1",
    command: "system.health.check",
    output: "All systems operational. CPU: 23%, Memory: 67%, Network: 12%",
    status: "success",
    timestamp: "2024-01-15 14:30:25",
    duration: 45,
  },
  {
    id: "2",
    command: "db.connection.test",
    output: "Database connection successful. Pool size: 20, Active: 12",
    status: "success",
    timestamp: "2024-01-15 14:25:10",
    duration: 23,
  },
  {
    id: "3",
    command: "cache.clear.all",
    output: "Cache cleared successfully. 1,247 items removed",
    status: "success",
    timestamp: "2024-01-15 14:20:45",
    duration: 89,
  },
];

const systemLogs: SystemLog[] = [
  {
    id: "1",
    level: "info",
    message: "User authentication successful",
    source: "auth-service",
    timestamp: "2024-01-15 14:30:25",
  },
  {
    id: "2",
    level: "warning",
    message: "High memory usage detected",
    source: "system-monitor",
    timestamp: "2024-01-15 14:25:10",
  },
  {
    id: "3",
    level: "error",
    message: "Failed to connect to external API",
    source: "api-gateway",
    timestamp: "2024-01-15 14:20:45",
  },
  {
    id: "4",
    level: "debug",
    message: "Database query executed in 45ms",
    source: "db-service",
    timestamp: "2024-01-15 14:15:30",
  },
];

function DebugConsoleCard() {
  const [command, setCommand] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecuteCommand = () => {
    if (!command.trim()) return;

    setIsExecuting(true);
    // Simulate command execution
    setTimeout(() => {
      setIsExecuting(false);
      console.log("Debug command executed:", command);
    }, 2000);
  };

  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-gray-600" />
          Consola de Debug
        </CardTitle>
        <CardDescription>
          Ejecutar comandos de debug y diagnóstico del sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800 dark:text-red-200">
              ⚠️ Comando de Alto Riesgo
            </AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-300">
              Los comandos ejecutados aquí pueden afectar el funcionamiento del
              sistema. Solo para uso de desarrolladores autorizados.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label className="text-sm font-medium">Comando de Debug</label>
            <div className="flex gap-2">
              <Input
                placeholder="system.health.check"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                className="font-mono text-sm"
              />
              <Button
                onClick={handleExecuteCommand}
                disabled={!command.trim() || isExecuting}
              >
                {isExecuting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-3">
            <Button variant="outline" size="sm" className="text-xs">
              <Database className="h-3 w-3 mr-1" />
              DB Health
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Server className="h-3 w-3 mr-1" />
              System Info
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Globe className="h-3 w-3 mr-1" />
              Network Test
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CommandHistoryCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Historial de Comandos
        </CardTitle>
        <CardDescription>
          Historial de comandos de debug ejecutados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {debugCommands.map((cmd) => (
            <div key={cmd.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {cmd.status === "success" && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {cmd.status === "error" && (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  {cmd.status === "running" && (
                    <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                  )}
                  <Badge
                    variant={
                      cmd.status === "success"
                        ? "default"
                        : cmd.status === "error"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {cmd.status}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {cmd.timestamp}
                </span>
              </div>

              <div className="font-mono text-sm bg-muted p-2 rounded mb-2">
                {cmd.command}
              </div>

              <div className="text-sm text-muted-foreground mb-2">
                {cmd.output}
              </div>

              <div className="text-xs text-muted-foreground">
                Duración: {cmd.duration}ms
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SystemLogsCard() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = useMemo(() => {
    return systemLogs.filter((log) => {
      const matchesFilter = filter === "all" || log.level === filter;
      const matchesSearch =
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchTerm]);

  const getLogIcon = (level: string) => {
    switch (level) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Bug className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Logs del Sistema
        </CardTitle>
        <CardDescription>
          Monitoreo de logs del sistema en tiempo real
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="error">Errores</SelectItem>
                <SelectItem value="warning">Advertencias</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                {getLogIcon(log.level)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant={
                        log.level === "error"
                          ? "destructive"
                          : log.level === "warning"
                            ? "default"
                            : log.level === "info"
                              ? "secondary"
                              : "outline"
                      }
                    >
                      {log.level.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {log.source}
                    </span>
                  </div>
                  <p className="text-sm">{log.message}</p>
                  <span className="text-xs text-muted-foreground">
                    {log.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar Logs
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refrescar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PerformanceProfilerCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Analizador de Rendimiento
        </CardTitle>
        <CardDescription>
          Herramientas de profiling y optimización
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Database className="h-6 w-6" />
            <span>Profile DB Queries</span>
            <span className="text-xs text-muted-foreground">
              Analizar queries lentas
            </span>
          </Button>

          <Button variant="outline" className="h-20 flex-col gap-2">
            <Server className="h-6 w-6" />
            <span>Memory Analysis</span>
            <span className="text-xs text-muted-foreground">
              Análisis de memoria
            </span>
          </Button>

          <Button variant="outline" className="h-20 flex-col gap-2">
            <Globe className="h-6 w-6" />
            <span>Network Tracing</span>
            <span className="text-xs text-muted-foreground">
              Trazado de red
            </span>
          </Button>

          <Button variant="outline" className="h-20 flex-col gap-2">
            <Bug className="h-6 w-6" />
            <span>Error Tracing</span>
            <span className="text-xs text-muted-foreground">
              Trazado de errores
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function DebugConsoleDashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6 p-6">
      {/* Debug Console Header */}
      <RoleAwareHeader />

      {/* Debug Tools Sections */}
      <div className="space-y-6">
        <DebugConsoleCard />
        <CommandHistoryCard />
        <SystemLogsCard />
        <PerformanceProfilerCard />
      </div>
    </div>
  );
}
