'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Crown, Sparkles } from 'lucide-react';
import { MasterStatsCard } from './MasterStatsCard';

interface GodModeMetrics {
  system: {
    status: 'GOD_MODE_ACTIVE' | 'MAINTENANCE' | 'CRITICAL';
    uptime: string;
    lastBackup: string;
    nextMaintenance: string;
  };
  authority: {
    godModeActive: boolean;
    supremeOverride: boolean;
    globalControl: boolean;
  };
  threats: {
    active: number;
    blocked: number;
    neutralized: number;
  };
  performance: {
    responseTime: number;
    throughput: number;
    efficiency: number;
  };
}

export function GodModeStatusCard() {
  const [godModeActive, setGodModeActive] = useState(true);
  const [supremeOverride, setSupremeOverride] = useState(false);

  const metrics: GodModeMetrics = useMemo(() => ({
    system: {
      status: godModeActive ? 'GOD_MODE_ACTIVE' : 'MAINTENANCE',
      uptime: '99.99%',
      lastBackup: '2 minutos atrás',
      nextMaintenance: 'Esta noche 2:00 AM',
    },
    authority: {
      godModeActive,
      supremeOverride,
      globalControl: true,
    },
    threats: {
      active: 0,
      blocked: 47,
      neutralized: 12,
    },
    performance: {
      responseTime: 12,
      throughput: 99999,
      efficiency: 100,
    },
  }), [godModeActive, supremeOverride]);

  const systemStats = [
    {
      icon: Crown,
      value: metrics.threats.active,
      label: 'Amenazas Activas',
      color: 'red' as const,
    },
    {
      icon: Sparkles,
      value: metrics.threats.blocked,
      label: 'Bloqueadas',
      color: 'green' as const,
    },
    {
      icon: Crown,
      value: `${metrics.performance.responseTime}ms`,
      label: 'Tiempo de Respuesta',
      color: 'blue' as const,
    },
    {
      icon: Sparkles,
      value: `${metrics.performance.efficiency}%`,
      label: 'Eficiencia',
      color: 'purple' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
            <Crown className="h-6 w-6" />
            ESTADO GOD MODE SUPREMO
          </CardTitle>
          <CardDescription className="text-yellow-600 dark:text-yellow-400">
            Control absoluto del sistema - Nivel máximo de autoridad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Indicator */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${godModeActive ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
              <div>
                <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                  {godModeActive ? 'GOD MODE ACTIVO' : 'MODO MANTENIMIENTO'}
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Uptime: {metrics.system.uptime}
                </p>
              </div>
            </div>
            <Badge variant={godModeActive ? 'default' : 'secondary'}>
              {godModeActive ? 'SUPREME' : 'MAINTENANCE'}
            </Badge>
          </div>

          {/* Authority Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg">
              <span className="text-sm font-medium">God Mode</span>
              <Switch
                checked={godModeActive}
                onCheckedChange={setGodModeActive}
                className="data-[state=checked]:bg-yellow-600"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg">
              <span className="text-sm font-medium">Supreme Override</span>
              <Switch
                checked={supremeOverride}
                onCheckedChange={setSupremeOverride}
                className="data-[state=checked]:bg-red-600"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg">
              <span className="text-sm font-medium">Global Control</span>
              <Switch checked={true} disabled className="data-[state=checked]:bg-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Statistics */}
      <MasterStatsCard />
    </div>
  );
}