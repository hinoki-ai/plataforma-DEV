"use client";

import React, { useState, useMemo } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
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
  Database,
  Table2,
  Search,
  Play,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Settings,
  FileText,
  BarChart3,
  Zap,
  Shield,
  HardDrive,
  Activity,
} from "lucide-react";
import {
  RoleAwareBreadcrumb,
  RoleAwareHeader,
} from "@/components/layout/RoleAwareNavigation";

interface DatabaseTable {
  name: string;
  rows: number;
  size: string;
  lastModified: string;
  status: "active" | "inactive" | "maintenance";
}

interface QueryResult {
  id: string;
  query: string;
  executionTime: number;
  rowsAffected: number;
  status: "success" | "error" | "running";
  timestamp: string;
}

// Note: Real database table and query information would require additional
// Convex queries. For now, showing placeholder content to indicate
// this functionality exists but needs specific database introspection queries.

function DatabaseOverviewCard() {
  const { stats } = useDashboardData();

  const dbStats = useMemo(
    () => ({
      totalTables: "N/A", // Would need a specific query for this
      totalSize: stats.database?.size || "N/A",
      activeConnections:
        stats.database?.connectionPoolSize ||
        stats.performance?.activeConnections ||
        0,
      queriesPerSecond: Math.round((stats.performance?.throughput || 0) / 1000),
      cacheHitRate: "N/A", // Would need specific query for this
      backupStatus: stats.database?.lastBackup
        ? `Last backup: ${new Date(stats.database.lastBackup).toLocaleString()}`
        : "Backup status unknown",
    }),
    [stats],
  );

  return (
    <Card className="border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          Vista General de Base de Datos
        </CardTitle>
        <CardDescription>
          Estado y métricas del sistema de base de datos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <Table2 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {dbStats.totalTables}
            </div>
            <div className="text-sm text-muted-foreground">Tablas Totales</div>
          </div>

          <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <HardDrive className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {dbStats.totalSize}
            </div>
            <div className="text-sm text-muted-foreground">Tamaño Total</div>
          </div>

          <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <Activity className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {dbStats.activeConnections}
            </div>
            <div className="text-sm text-muted-foreground">
              Conexiones Activas
            </div>
          </div>

          <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
            <Zap className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {dbStats.queriesPerSecond}
            </div>
            <div className="text-sm text-muted-foreground">Queries/seg</div>
          </div>

          <div className="text-center p-4 bg-teal-50 dark:bg-teal-950/20 rounded-lg">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-teal-600" />
            <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">
              {dbStats.cacheHitRate}
            </div>
            <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
          </div>

          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
            <Shield className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-sm font-bold text-yellow-700 dark:text-yellow-300">
              {dbStats.backupStatus}
            </div>
            <div className="text-sm text-muted-foreground">Estado Backup</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TablesManagementCard() {
  const [searchTerm, setSearchTerm] = useState("");
  const { stats } = useDashboardData();

  // Placeholder - real implementation would need database introspection queries
  const mockTables = [
    {
      name: "users",
      rows: stats.users?.total || 0,
      size: "N/A",
      lastModified: new Date().toISOString(),
      status: "active" as const,
    },
    {
      name: "content",
      rows: stats.content?.total || 0,
      size: "N/A",
      lastModified: new Date().toISOString(),
      status: "active" as const,
    },
  ];

  const filteredTables = useMemo(() => {
    return mockTables.filter((table) =>
      table.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, mockTables]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Table2 className="h-5 w-5" />
          Gestión de Tablas
        </CardTitle>
        <CardDescription>
          Administrar tablas de la base de datos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tabla..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refrescar
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Filas</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Última Modificación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTables.map((table) => (
                  <TableRow key={table.name}>
                    <TableCell className="font-medium">{table.name}</TableCell>
                    <TableCell>{table.rows.toLocaleString()}</TableCell>
                    <TableCell>{table.size}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {table.lastModified}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          table.status === "active"
                            ? "default"
                            : table.status === "inactive"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {table.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QueryExecutorCard() {
  const [query, setQuery] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecuteQuery = () => {
    if (!query.trim()) return;

    setIsExecuting(true);
    // Simulate query execution
    setTimeout(() => {
      setIsExecuting(false);
      console.log("Query executed:", query);
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Ejecutor de Queries
        </CardTitle>
        <CardDescription>
          Ejecutar queries SQL directamente en la base de datos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800 dark:text-yellow-200">
              ⚠️ Zona de Alto Riesgo
            </AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
              Las queries ejecutadas aquí pueden modificar datos
              permanentemente. Asegúrate de tener backups antes de proceder.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label className="text-sm font-medium">Query SQL</label>
            <Textarea
              placeholder="SELECT * FROM users LIMIT 10;"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="font-mono text-sm min-h-32"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleExecuteQuery}
              disabled={!query.trim() || isExecuting}
              className="flex-1"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Ejecutando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Ejecutar Query
                </>
              )}
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Resultados
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QueryHistoryCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Historial de Queries
        </CardTitle>
        <CardDescription>
          Historial de queries ejecutadas recientemente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <Badge variant="secondary">System</Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleString()}
              </span>
            </div>

            <div className="font-mono text-sm bg-muted p-2 rounded mb-2">
              Dashboard data queries executed successfully
            </div>

            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Status: Real-time</span>
              <span>Data: {Object.keys({}).length} metrics loaded</span>
            </div>
          </div>

          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              Query history tracking requires additional database logging setup.
            </p>
            <p className="text-sm mt-2">
              Current dashboard uses live data from Convex.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DatabaseToolsDashboard() {
  return (
    <div className="space-y-6 p-6">
      {/* Database Tools Header */}

      {/* Database Tools Sections */}
      <div className="space-y-6">
        <TablesManagementCard />
        <QueryExecutorCard />
        <QueryHistoryCard />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Operaciones de Mantenimiento
            </CardTitle>
            <CardDescription>
              Herramientas avanzadas de mantenimiento de base de datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <a href="/master/advanced-operations">
                  <Settings className="h-6 w-6 text-blue-600" />
                  <div>
                    <div className="font-medium text-sm">
                      Operaciones Avanzadas
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Herramientas de mantenimiento
                    </div>
                  </div>
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <a href="/master/advanced-operations">
                  <Shield className="h-6 w-6 text-green-600" />
                  <div>
                    <div className="font-medium text-sm">
                      Verificar Integridad
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Comprobar estado de tablas
                    </div>
                  </div>
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <a href="/master/advanced-operations">
                  <Download className="h-6 w-6 text-purple-600" />
                  <div>
                    <div className="font-medium text-sm">Backup Manual</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Crear copia de seguridad
                    </div>
                  </div>
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <a href="/master/advanced-operations">
                  <RefreshCw className="h-6 w-6 text-orange-600" />
                  <div>
                    <div className="font-medium text-sm">Optimizar Tablas</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Mejorar rendimiento
                    </div>
                  </div>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
