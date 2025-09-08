'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertTriangle,
  Flame,
  Power,
  Lock,
  Skull,
} from 'lucide-react';
import { RoleIndicator } from '@/components/layout/RoleAwareNavigation';
import { MasterPageTemplate } from './MasterPageTemplate';
import { MasterStatusIndicator } from './MasterStatusIndicator';
import { GodModeStatusCard } from './GodModeStatusCard';
import { SystemOverviewCard } from './SystemOverviewCard';
import { PerformanceMetricsCard } from './PerformanceMetricsCard';
import { AdvancedControlsCard } from './AdvancedControlsCard';

function SupremeActionsWarning() {
  return (
    <Card className="border-yellow-200 dark:border-yellow-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
          <AlertTriangle className="h-5 w-5" />
          Acciones Supremas Reubicadas
        </CardTitle>
        <CardDescription className="text-yellow-600 dark:text-yellow-400">
          Las acciones supremas peligrosas han sido movidas a un área segura
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="border-yellow-200 mb-4">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-200">
            ⚠️ Área de Poder Supremo Segura
          </AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            Para proteger la integridad del sistema, todas las acciones supremas
            peligrosas han sido consolidadas en la página de <strong>Operaciones Avanzadas</strong>.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Las siguientes acciones están ahora disponibles en <strong>Operaciones Avanzadas</strong>:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 text-slate-600 dark:text-slate-400">
            <li>🔥 SUPREME OVERRIDE</li>
            <li>Reinicio del Sistema</li>
            <li>Bloqueo de Emergencia</li>
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

function SupremeAuthorityFooter() {
  return (
    <Card className="border-yellow-200 dark:border-yellow-800">
      <CardContent className="p-6 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
              🏛️ SUPREME AUTHORITY CONFIRMED
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Sistema operativo bajo control MASTER absoluto
            </p>
          </div>
        </div>
        <div className="text-xs text-yellow-600 dark:text-yellow-400 font-mono">
          Última verificación: {new Date().toISOString()} | Estado: GOD MODE ACTIVE
        </div>
      </CardContent>
    </Card>
  );
}

export function GodModeDashboard() {
  const { data: session } = useSession();
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Real-time updates for MASTER oversight
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
        title="🏛️ GOD MODE SUPREME AUTHORITY"
        subtitle={`Bienvenido, Arquitecto Supremo ${session?.user?.name || 'Master Developer'} - Nivel máximo de control`}
        context="GOD_MODE_DASHBOARD"
      >


        {/* Critical Warning - Enhanced */}
        <Alert className="border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
            ⚠️ MODO DIOS ACTIVADO - AUTORIDAD SUPREMA
            <Badge variant="outline" className="text-xs">CRÍTICO</Badge>
          </AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300 space-y-2">
            <p>
              <strong>🏛️ SUPREME AUTHORITY ACTIVE:</strong> Tienes control absoluto sobre el sistema.
              Todas las restricciones han sido eliminadas para tu acceso MASTER.
            </p>
            <p>
              <strong>⚡ GOD MODE CAPABILITIES:</strong> Sistema de monitoreo en tiempo real,
              control de amenazas globales, y autoridad para ejecutar cualquier acción crítica.
            </p>
            <p className="text-sm font-mono p-2 rounded">
              🔒 Sistema protegido por encriptación cuántica - Solo MASTER puede acceder
            </p>
          </AlertDescription>
        </Alert>

        {/* God Mode Status */}
        <GodModeStatusCard />

        {/* Supreme Actions - Moved to Danger Zone */}
        <SupremeActionsWarning />

        {/* System Overview */}
        <SystemOverviewCard />

        {/* Real-time Performance Metrics */}
        <PerformanceMetricsCard />

        {/* Advanced Controls */}
        <AdvancedControlsCard />

        {/* MASTER Authority Footer */}
        <SupremeAuthorityFooter />
      </MasterPageTemplate>
    </>
  );
}