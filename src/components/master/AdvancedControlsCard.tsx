'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  Server,
  Database,
  Settings,
  Code,
  FileText,
  Shield,
  Key,
  Eye,
  Lock,
  TrendingUp,
  Activity,
  Cpu,
  HardDrive,
} from 'lucide-react';
import { MasterActionCard } from './MasterActionCard';

interface ControlSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  actions: {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
    variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  }[];
}

export function AdvancedControlsCard() {
  const controlSections: ControlSection[] = [
    {
      title: 'Controles del Sistema',
      icon: Server,
      actions: [
        {
          id: 'database-management',
          title: 'Gestión de BD',
          description: 'Administrar bases de datos',
          icon: Database,
          badge: 'MASTER',
        },
        {
          id: 'global-settings',
          title: 'Configuración Global',
          description: 'Ajustes del sistema',
          icon: Settings,
          badge: 'MASTER',
        },
        {
          id: 'debug-console',
          title: 'Consola Debug',
          description: 'Herramientas de desarrollo',
          icon: Code,
          badge: 'MASTER',
        },
        {
          id: 'system-backups',
          title: 'Backups del Sistema',
          description: 'Gestión de copias de seguridad',
          icon: FileText,
          badge: 'MASTER',
        },
      ],
    },
    {
      title: 'Controles de Seguridad',
      icon: Shield,
      actions: [
        {
          id: 'firewall-control',
          title: 'Firewall Control',
          description: 'Control de acceso a red',
          icon: Shield,
          badge: 'CRÍTICO',
          badgeVariant: 'destructive',
          variant: 'outline',
        },
        {
          id: 'quantum-encryption',
          title: 'Encriptación Quantum',
          description: 'Cifrado de nivel cuántico',
          icon: Key,
          badge: 'CRÍTICO',
          badgeVariant: 'destructive',
          variant: 'outline',
        },
        {
          id: 'global-threat-monitor',
          title: 'Monitor de Amenazas Global',
          description: 'Vigilancia de amenazas',
          icon: Eye,
          badge: 'CRÍTICO',
          badgeVariant: 'destructive',
          variant: 'outline',
        },
        {
          id: 'emergency-access',
          title: 'Acceso de Emergencia MASTER',
          description: 'Acceso crítico del sistema',
          icon: Lock,
          badge: 'CRÍTICO',
          badgeVariant: 'destructive',
          variant: 'outline',
        },
      ],
    },
    {
      title: 'Controles de Rendimiento',
      icon: TrendingUp,
      actions: [
        {
          id: 'auto-optimization',
          title: 'Optimización Automática',
          description: 'Mejora automática del rendimiento',
          icon: TrendingUp,
          badge: 'AUTO',
          badgeVariant: 'secondary',
        },
        {
          id: 'realtime-monitoring',
          title: 'Monitoreo en Tiempo Real',
          description: 'Observación continua del sistema',
          icon: Activity,
          badge: 'LIVE',
          badgeVariant: 'secondary',
        },
        {
          id: 'resource-management',
          title: 'Gestión de Recursos',
          description: 'Administración de recursos del sistema',
          icon: Cpu,
          badge: 'AUTO',
          badgeVariant: 'secondary',
        },
        {
          id: 'smart-storage',
          title: 'Almacenamiento Inteligente',
          description: 'Gestión inteligente del almacenamiento',
          icon: HardDrive,
          badge: 'SMART',
          badgeVariant: 'secondary',
        },
      ],
    },
    {
      title: 'Controles de Logs',
      icon: FileText,
      actions: [
        {
          id: 'system-logs',
          title: 'System Logs - MASTER',
          description: 'Registros completos del sistema',
          icon: FileText,
          badge: 'ALL',
          badgeVariant: 'secondary',
        },
        {
          id: 'access-logs',
          title: 'Access Logs - Global',
          description: 'Registros de acceso globales',
          icon: Eye,
          badge: 'GLOBAL',
          badgeVariant: 'secondary',
        },
        {
          id: 'error-logs',
          title: 'Error Logs - Critical',
          description: 'Registros de errores críticos',
          icon: FileText,
          badge: 'CRITICAL',
          badgeVariant: 'destructive',
          variant: 'outline',
        },
        {
          id: 'analytics-logs',
          title: 'Analytics Logs - MASTER',
          description: 'Registros analíticos del sistema',
          icon: TrendingUp,
          badge: 'MASTER',
          badgeVariant: 'secondary',
        },
      ],
    },
  ];

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Command className="h-5 w-5 text-slate-600" />
          Controles Avanzados - MASTER Authority
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Herramientas de desarrollo y configuración avanzada - Solo para MASTER
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {controlSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <section.icon className="h-5 w-5 text-slate-600" />
                {section.title}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {section.actions.map((action) => (
                  <Button
                    key={action.id}
                    variant={action.variant || 'outline'}
                    className="h-20 flex-col gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <action.icon className="h-6 w-6" />
                    <span className="text-sm">{action.title}</span>
                    {action.badge && (
                      <Badge
                        variant={action.badgeVariant || 'secondary'}
                        className="text-xs"
                      >
                        {action.badge}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}