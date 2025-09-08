'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface MetricItem {
  id: string;
  label: string;
  value: string | number;
  progress?: number;
  status?: 'good' | 'warning' | 'error' | 'info';
  icon?: LucideIcon;
  unit?: string;
}

interface MasterMetricsCardProps {
  title: string;
  description?: string;
  metrics: MetricItem[];
  className?: string;
  showProgress?: boolean;
}

const statusColors = {
  good: {
    badge: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800',
    progress: 'bg-green-600',
  },
  warning: {
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    progress: 'bg-yellow-600',
  },
  error: {
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800',
    progress: 'bg-red-600',
  },
  info: {
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    progress: 'bg-blue-600',
  },
};

export function MasterMetricsCard({
  title,
  description,
  metrics,
  className = '',
  showProgress = true
}: MasterMetricsCardProps) {
  return (
    <Card className={`border-slate-200 dark:border-slate-800 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-slate-600 dark:text-slate-400">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric) => (
            <div key={metric.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {metric.icon && (
                    <metric.icon className="h-4 w-4 text-slate-500" />
                  )}
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {metric.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {typeof metric.value === 'number'
                      ? metric.value.toLocaleString()
                      : metric.value
                    }
                    {metric.unit && (
                      <span className="text-slate-500 ml-1">{metric.unit}</span>
                    )}
                  </span>
                  {metric.status && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${statusColors[metric.status].badge}`}
                    >
                      {metric.status.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>

              {showProgress && metric.progress !== undefined && (
                <Progress
                  value={metric.progress}
                  className="h-2"
                  style={{
                    // Custom progress bar color based on status
                    '--progress-background': statusColors[metric.status || 'info'].progress,
                  } as React.CSSProperties}
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}