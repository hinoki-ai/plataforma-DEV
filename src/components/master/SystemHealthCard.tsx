'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Heart, Database, Server, Zap, Wifi, Shield, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemComponent {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  type: 'database' | 'server' | 'network' | 'security' | 'cache';
  uptime: string;
  responseTime: number;
  load: number;
  lastChecked: string;
  issues?: string[];
}

export function SystemHealthCard() {
  const [components, setComponents] = useState<SystemComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Mock system health data
  useEffect(() => {
    const mockComponents: SystemComponent[] = [
      {
        id: '1',
        name: 'PostgreSQL Database',
        status: 'healthy',
        type: 'database',
        uptime: '99.98%',
        responseTime: 12,
        load: 23,
        lastChecked: 'Just now',
      },
      {
        id: '2',
        name: 'Next.js Application Server',
        status: 'healthy',
        type: 'server',
        uptime: '99.95%',
        responseTime: 45,
        load: 67,
        lastChecked: '1 minute ago',
      },
      {
        id: '3',
        name: 'Redis Cache',
        status: 'warning',
        type: 'cache',
        uptime: '98.2%',
        responseTime: 8,
        load: 89,
        lastChecked: '2 minutes ago',
        issues: ['High memory usage detected']
      },
      {
        id: '4',
        name: 'Authentication Service',
        status: 'healthy',
        type: 'security',
        uptime: '100%',
        responseTime: 15,
        load: 12,
        lastChecked: '30 seconds ago',
      },
      {
        id: '5',
        name: 'CDN Network',
        status: 'healthy',
        type: 'network',
        uptime: '99.99%',
        responseTime: 25,
        load: 34,
        lastChecked: '1 minute ago',
      }
    ];

    setTimeout(() => {
      setComponents(mockComponents);
      setIsLoading(false);
    }, 1000);
  }, [lastRefresh]);

  const healthStats = useMemo(() => {
    const total = components.length;
    const healthy = components.filter(c => c.status === 'healthy').length;
    const warning = components.filter(c => c.status === 'warning').length;
    const critical = components.filter(c => c.status === 'critical').length;
    const offline = components.filter(c => c.status === 'offline').length;

    return {
      total,
      healthy,
      warning,
      critical,
      offline,
      healthPercentage: total > 0 ? Math.round((healthy / total) * 100) : 0
    };
  }, [components]);

  const getStatusIcon = (status: SystemComponent['status']) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return AlertTriangle;
      case 'offline': return AlertTriangle;
    }
  };

  const getStatusColor = (status: SystemComponent['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      case 'offline': return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: SystemComponent['type']) => {
    switch (type) {
      case 'database': return Database;
      case 'server': return Server;
      case 'network': return Wifi;
      case 'security': return Shield;
      case 'cache': return Zap;
    }
  };

  const getLoadColor = (load: number) => {
    if (load < 30) return 'bg-green-500';
    if (load < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const refreshData = () => {
    setLastRefresh(new Date());
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 w-40 bg-muted rounded mb-2" />
            <div className="h-4 w-80 bg-muted rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-muted rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Health Status */}
      <Card className="border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <Heart className="h-6 w-6" />
            System Health Overview
          </CardTitle>
          <CardDescription>
            Real-time monitoring of all system components and services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{healthStats.healthy}</div>
              <div className="text-sm text-muted-foreground">Healthy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{healthStats.warning}</div>
              <div className="text-sm text-muted-foreground">Warning</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{healthStats.critical}</div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{healthStats.offline}</div>
              <div className="text-sm text-muted-foreground">Offline</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Health</span>
              <span>{healthStats.healthPercentage}%</span>
            </div>
            <Progress value={healthStats.healthPercentage} className="h-2" />
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Component Details */}
      <Card>
        <CardHeader>
          <CardTitle>Component Status</CardTitle>
          <CardDescription>
            Detailed status of individual system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {components.map((component) => {
              const StatusIcon = getStatusIcon(component.status);
              const TypeIcon = getTypeIcon(component.type);

              return (
                <div key={component.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <TypeIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold text-sm">{component.name}</h3>
                        <p className="text-xs text-muted-foreground">{component.uptime} uptime</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={component.status === 'healthy' ? 'default' : 'destructive'}
                        className={cn(
                          component.status === 'healthy' && 'bg-green-100 text-green-800',
                          component.status === 'warning' && 'bg-yellow-100 text-yellow-800'
                        )}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {component.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Response Time</div>
                      <div className="font-semibold">{component.responseTime}ms</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Load</div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{component.load}%</span>
                        </div>
                        <Progress value={component.load} className="h-1" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Last checked: {component.lastChecked}</span>
                    {component.issues && component.issues.length > 0 && (
                      <span className="text-yellow-600">
                        {component.issues.length} issue{component.issues.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {component.issues && component.issues.length > 0 && (
                    <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded text-xs">
                      {component.issues[0]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}