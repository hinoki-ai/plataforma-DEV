"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Database,
  Key,
  Server,
  HardDrive,
  Flame,
  Power,
  Lock,
  Globe,
  Target,
  Zap as Lightning,
  RefreshCw,
  Download,
  Upload,
  Shield,
  Settings,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { DangerConfirmationDialog } from "@/components/ui/danger-confirmation-dialog";
import { ActionLoader } from "@/components/ui/dashboard-loader";
import { dbLogger } from "@/lib/logger";

interface DangerousOperation {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  confirmationText: string;
  action: () => void | Promise<void>;
}

// Database Operations
const databaseOperations: DangerousOperation[] = [
  {
    id: "optimize-tables",
    title: "Optimize Tables",
    description:
      "Reorganize and optimize all database tables for better performance",
    icon: Database,
    category: "database",
    confirmationText: "OPTIMIZE TABLES",
    action: async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
      dbLogger.warn("Database optimization initiated", {
        operation: "optimize-tables",
        user: "MASTER",
        timestamp: new Date().toISOString(),
      });
      toast.success("Database optimization completed successfully");
    },
  },
  {
    id: "create-backup",
    title: "Create Full Backup",
    description: "Generate complete backup of the entire database",
    icon: Download,
    category: "database",
    confirmationText: "CREATE BACKUP",
    action: async () => {
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate API call
      dbLogger.warn("Full database backup initiated", {
        operation: "create-backup",
        user: "MASTER",
        timestamp: new Date().toISOString(),
      });
      toast.success("Database backup completed successfully");
    },
  },
  {
    id: "restore-backup",
    title: "Restore Backup",
    description: "Restore database from backup - HIGH RISK OPERATION",
    icon: Upload,
    category: "database",
    confirmationText: "RESTORE BACKUP",
    action: async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate API call
      dbLogger.error("CRITICAL: Database restoration initiated", {
        operation: "restore-backup",
        user: "MASTER",
        timestamp: new Date().toISOString(),
        risk: "HIGH",
      });
      toast.success("Database restoration completed successfully");
    },
  },
  {
    id: "verify-integrity",
    title: "Verify Integrity",
    description: "Verify data integrity and database structure",
    icon: Shield,
    category: "database",
    confirmationText: "VERIFY INTEGRITY",
    action: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
      dbLogger.info("Database integrity verification completed", {
        operation: "verify-integrity",
        user: "MASTER",
        timestamp: new Date().toISOString(),
        status: "PASSED",
      });
      toast.success(
        "Database integrity verification completed - All systems healthy",
      );
    },
  },
];

// System Operations
const systemOperations: DangerousOperation[] = [
  {
    id: "reset-database",
    title: "Reset Database",
    description: "Delete ALL data and reset database - IRREVERSIBLE OPERATION",
    icon: Database,
    category: "system",
    confirmationText: "RESET DATABASE",
    action: async () => {
      await new Promise((resolve) => setTimeout(resolve, 10000)); // Simulate critical operation
      dbLogger.error(
        "CRITICAL: Complete database reset initiated - ALL DATA LOST",
        {
          operation: "reset-database",
          user: "MASTER",
          timestamp: new Date().toISOString(),
          risk: "CRITICAL",
          irreversible: true,
        },
      );
      toast.success("Database reset completed - System initialized");
    },
  },
  {
    id: "regenerate-keys",
    title: "Regenerate Keys",
    description: "Invalidate all sessions and regenerate access keys",
    icon: Key,
    category: "system",
    confirmationText: "REGENERATE KEYS",
    action: async () => {
      await new Promise((resolve) => setTimeout(resolve, 4000)); // Simulate API call
      dbLogger.warn(
        "System key regeneration initiated - All sessions invalidated",
        {
          operation: "regenerate-keys",
          user: "MASTER",
          timestamp: new Date().toISOString(),
          risk: "HIGH",
        },
      );
      toast.success(
        "Security keys regenerated - All users must re-authenticate",
      );
    },
  },
  {
    id: "maintenance-mode",
    title: "Maintenance Mode",
    description: "Disable public access and activate maintenance mode",
    icon: Server,
    category: "system",
    confirmationText: "MAINTENANCE MODE",
    action: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      dbLogger.warn("System maintenance mode activated", {
        operation: "maintenance-mode",
        user: "MASTER",
        timestamp: new Date().toISOString(),
        publicAccess: "DISABLED",
      });
      toast.success("Maintenance mode activated - Public access disabled");
    },
  },
  {
    id: "clear-cache",
    title: "Clear Global Cache",
    description: "Remove all temporary data and system cache",
    icon: HardDrive,
    category: "system",
    confirmationText: "CLEAR CACHE",
    action: async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
      dbLogger.info("Global cache cleared successfully", {
        operation: "clear-cache",
        user: "MASTER",
        timestamp: new Date().toISOString(),
      });
      toast.success("Global cache cleared - System performance optimized");
    },
  },
];

// Supreme Operations
const supremeOperations: DangerousOperation[] = [
  {
    id: "supreme-override",
    title: "🔥 SUPREME OVERRIDE",
    description: "Activate absolute system control - Maximum authority level",
    icon: Flame,
    category: "supreme",
    confirmationText: "SUPREME OVERRIDE",
    action: async () => {
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate critical operation
      dbLogger.error("SUPREME OVERRIDE ACTIVATED - Maximum authority assumed", {
        operation: "supreme-override",
        user: "MASTER",
        timestamp: new Date().toISOString(),
        authority: "ABSOLUTE",
        risk: "MAXIMUM",
      });
      toast.success(
        "Supreme Override activated - Absolute system control granted",
      );
    },
  },
  {
    id: "system-reboot",
    title: "System Reboot",
    description: "Restart all system services and components",
    icon: Power,
    category: "supreme",
    confirmationText: "SYSTEM REBOOT",
    action: async () => {
      await new Promise((resolve) => setTimeout(resolve, 8000)); // Simulate system reboot
      dbLogger.error("CRITICAL: Complete system reboot initiated", {
        operation: "system-reboot",
        user: "MASTER",
        timestamp: new Date().toISOString(),
        risk: "CRITICAL",
        downtime: "EXPECTED",
      });
      toast.success("System reboot completed - All services restarted");
    },
  },
  {
    id: "emergency-lockdown",
    title: "Emergency Lockdown",
    description: "Completely isolate system - Emergency mode activation",
    icon: Lock,
    category: "supreme",
    confirmationText: "EMERGENCY LOCKDOWN",
    action: async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate lockdown
      dbLogger.error("EMERGENCY LOCKDOWN ACTIVATED - System isolated", {
        operation: "emergency-lockdown",
        user: "MASTER",
        timestamp: new Date().toISOString(),
        risk: "CRITICAL",
        access: "ISOLATED",
      });
      toast.success(
        "Emergency lockdown activated - System completely isolated",
      );
    },
  },
];

function OperationCard({
  operation,
  onExecute,
  isExecuting,
}: {
  operation: DangerousOperation;
  onExecute: (operation: DangerousOperation) => void;
  isExecuting: boolean;
}) {
  const Icon = operation.icon;

  return (
    <Card
      className={`border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 transition-colors ${
        isExecuting ? "opacity-75" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
          <Icon className="h-5 w-5" />
          {operation.title}
        </CardTitle>
        <CardDescription className="text-red-600 dark:text-red-400">
          {operation.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          className="w-full border-red-300 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-700 dark:text-red-300"
          onClick={() => onExecute(operation)}
          disabled={isExecuting}
        >
          {isExecuting ? (
            <>
              <ActionLoader size="sm" className="mr-2" />
              Executing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Execute Operation
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function DangerZoneHeader() {
  return (
    <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
      <AlertTriangle className="h-5 w-5 text-red-600" />
      <AlertTitle className="text-red-800 dark:text-red-200 font-bold">
        🚨 MAXIMUM DANGER ZONE
      </AlertTitle>
      <AlertDescription className="text-red-700 dark:text-red-300">
        <strong>CRITICAL WARNING:</strong> Operations on this page can cause:
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Permanent data loss</li>
          <li>Service interruption</li>
          <li>User session invalidation</li>
          <li>Irreversible configuration changes</li>
        </ul>
        <br />
        <strong>
          Only authorized personnel with SUPREME MASTER level should proceed.
        </strong>
      </AlertDescription>
    </Alert>
  );
}

export function AdvancedOperationsDashboard() {
  const [selectedOperation, setSelectedOperation] =
    useState<DangerousOperation | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [executingOperation, setExecutingOperation] = useState<string | null>(
    null,
  );

  const handleExecuteOperation = (operation: DangerousOperation) => {
    setSelectedOperation(operation);
    setConfirmDialogOpen(true);
  };

  const handleConfirmOperation = async () => {
    if (!selectedOperation) return;

    setExecutingOperation(selectedOperation.id);
    try {
      await selectedOperation.action();
    } catch (error) {
      toast.error(
        `Operation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setExecutingOperation(null);
    }
  };

  const operationsByCategory = {
    database: databaseOperations,
    system: systemOperations,
    supreme: supremeOperations,
  };

  return (
    <div className="space-y-6 p-6">
      {/* Critical Warning */}
      <DangerZoneHeader />

      {/* Operations Sections */}
      <div className="space-y-8">
        {/* Database Operations */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-300 flex items-center gap-2">
            🗄️ Operaciones de Base de Datos
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {operationsByCategory.database.map((operation) => (
              <OperationCard
                key={operation.id}
                operation={operation}
                onExecute={handleExecuteOperation}
                isExecuting={executingOperation === operation.id}
              />
            ))}
          </div>
        </div>

        {/* System Operations */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-300 flex items-center gap-2">
            ⚙️ Operaciones del Sistema
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {operationsByCategory.system.map((operation) => (
              <OperationCard
                key={operation.id}
                operation={operation}
                onExecute={handleExecuteOperation}
                isExecuting={executingOperation === operation.id}
              />
            ))}
          </div>
        </div>

        {/* Supreme Operations */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-300 flex items-center gap-2">
            Operaciones Supremas
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {operationsByCategory.supreme.map((operation) => (
              <OperationCard
                key={operation.id}
                operation={operation}
                onExecute={handleExecuteOperation}
                isExecuting={executingOperation === operation.id}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <DangerConfirmationDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title={`Confirm: ${selectedOperation?.title}`}
        description={`Are you sure you want to execute "${selectedOperation?.title}"? This action ${selectedOperation?.description.toLowerCase()}.`}
        confirmationText={selectedOperation?.confirmationText || ""}
        confirmButtonText="Execute Operation"
        onConfirm={handleConfirmOperation}
        variant="destructive"
      />
    </div>
  );
}
