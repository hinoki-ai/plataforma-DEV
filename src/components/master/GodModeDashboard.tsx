"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Flame, Power, Lock, Skull } from "lucide-react";
import { RoleIndicator } from "@/components/layout/RoleAwareNavigation";
import { MasterPageTemplate } from "./MasterPageTemplate";
import { MasterStatusIndicator } from "./MasterStatusIndicator";
import { GodModeStatusCard } from "./GodModeStatusCard";
import { SystemOverviewCard } from "./SystemOverviewCard";
import { PerformanceMetricsCard } from "./PerformanceMetricsCard";
import { AdvancedControlsCard } from "./AdvancedControlsCard";

function CriticalActionsWarning() {
  return (
    <Card className="border-yellow-200 dark:border-yellow-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
          <AlertTriangle className="h-5 w-5" />
          Critical Actions Relocated
        </CardTitle>
        <CardDescription className="text-yellow-600 dark:text-yellow-400">
          Critical system actions have been moved to a secure area
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="border-yellow-200 mb-4">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-200">
            Secure Operations Area
          </AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            To protect system integrity, all critical system actions have been
            consolidated in the <strong>Advanced Operations</strong> page.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            The following actions are now available in{" "}
            <strong>Advanced Operations</strong>:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 text-slate-600 dark:text-slate-400">
            <li>System Override</li>
            <li>System Restart</li>
            <li>Emergency Lockdown</li>
          </ul>
        </div>

        <div className="mt-6">
          <Button asChild className="w-full">
            <a href="/master/advanced-operations">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Ir a Operaciones Avanzadas
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminAccessFooter() {
  return (
    <Card className="border-blue-200 dark:border-blue-800">
      <CardContent className="p-6 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200">
              Administrator Access Active
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              System under full administrative control
            </p>
          </div>
        </div>
        <div className="text-xs text-blue-600 dark:text-blue-400 font-mono">
          Last verification: {new Date().toISOString()} | Status: Active
        </div>
      </CardContent>
    </Card>
  );
}

export function GodModeDashboard() {
  const { data: session } = useSession();
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Real-time updates for administrative oversight
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* MASTER Status Indicator - Always Visible */}
      <MasterStatusIndicator />

      <MasterPageTemplate
        title="Advanced System Administration"
        subtitle={`Welcome, ${session?.user?.name || "Administrator"} - Full system access`}
        context="ADVANCED_ADMIN_DASHBOARD"
      >
        {/* Critical Warning */}
        <Alert className="border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
            Advanced Administration Active
            <Badge variant="outline" className="text-xs">
              FULL ACCESS
            </Badge>
          </AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300 space-y-2">
            <p>
              <strong>Full System Access:</strong> You have complete control
              over the system. All administrative restrictions have been removed
              for MASTER access.
            </p>
            <p>
              <strong>Capabilities:</strong> Real-time monitoring system, global
              threat control, and authority to execute any critical action.
            </p>
            <p className="text-sm font-mono p-2 rounded">
              Secure access - MASTER administrators only
            </p>
          </AlertDescription>
        </Alert>

        {/* Admin Status */}
        <GodModeStatusCard />

        {/* Critical Actions - Moved to Danger Zone */}
        <CriticalActionsWarning />

        {/* System Overview */}
        <SystemOverviewCard />

        {/* Real-time Performance Metrics */}
        <PerformanceMetricsCard />

        {/* Advanced Controls */}
        <AdvancedControlsCard />

        {/* Admin Access Footer */}
        <AdminAccessFooter />
      </MasterPageTemplate>
    </>
  );
}
