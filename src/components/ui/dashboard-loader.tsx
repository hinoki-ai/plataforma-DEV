import React from 'react';
import { cn } from '@/lib/utils';

// Loading spinner component
export const ActionLoader = ({ className, size = 'sm' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn('animate-spin rounded-full border-2 border-muted border-t-primary', sizeClasses[size], className)} />
  );
};

// Dashboard loading component
export const DashboardLoader = ({
  className,
  text = 'Cargando...'
}: {
  className?: string;
  text?: string;
}) => {
  return (
    <div className={cn('flex items-center justify-center min-h-screen bg-background p-8', className)}>
      <div className="flex flex-col items-center gap-4">
        <ActionLoader size="lg" />
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      </div>
    </div>
  );
};

// Skeleton loader for different variants
export const SkeletonLoader = ({ 
  variant = 'content', 
  lines = 3,
  className 
}: { 
  variant?: 'card' | 'content' | 'table' | 'chart' | 'list';
  lines?: number;
  className?: string;
}) => {
  if (variant === 'card') {
    return (
      <div className={cn('rounded-lg border p-6 space-y-4', className)}>
        <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
              {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 bg-muted rounded animate-pulse w-full max-w-[80%]" />
      ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-8 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={cn('rounded-lg border p-6', className)}>
        <div className="h-4 bg-muted rounded animate-pulse w-1/3 mb-4" />
        <div className="h-40 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-muted rounded animate-pulse" />
            <div className="flex-1 space-y-1">
              <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-2 bg-muted rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default content variant
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={cn('h-3 bg-muted rounded animate-pulse', i === 0 ? 'w-3/4' : i === 1 ? 'w-1/2' : 'w-2/3')} />
      ))}
    </div>
  );
};
