'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

export type LoadingContext = 'public' | 'auth' | 'auto';
export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';
export type LoadingVariant = 'spinner' | 'dots' | 'pulse' | 'bars' | 'skeleton';

export interface AdaptiveLoadingProps {
  /**
   * Context override - auto-detects by default
   */
  context?: LoadingContext;

  /**
   * Loading variant
   */
  variant?: LoadingVariant;

  /**
   * Size of the loading indicator
   */
  size?: LoadingSize;

  /**
   * Loading message
   */
  message?: string;

  /**
   * Show background overlay
   */
  overlay?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Context-aware loading component
 */
export function AdaptiveLoading({
  context = 'auto',
  variant = 'spinner',
  size = 'md',
  message,
  overlay = false,
  className,
}: AdaptiveLoadingProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Auto-detect context
  const detectedContext: Exclude<LoadingContext, 'auto'> =
    context !== 'auto'
      ? context
      : session &&
          (pathname?.startsWith('/admin') ||
            pathname?.startsWith('/profesor') ||
            pathname?.startsWith('/parent'))
        ? 'auth'
        : 'public';

  // Size configurations
  const sizeConfig = {
    sm: { icon: 'w-4 h-4', text: 'text-sm', spacing: 'gap-2' },
    md: { icon: 'w-6 h-6', text: 'text-base', spacing: 'gap-3' },
    lg: { icon: 'w-8 h-8', text: 'text-lg', spacing: 'gap-4' },
    xl: { icon: 'w-12 h-12', text: 'text-xl', spacing: 'gap-6' },
  };

  const currentSize = sizeConfig[size];

  // Context-specific styling
  const contextStyles = {
    public: {
      container: 'text-white',
      background: overlay ? 'bg-black/50 backdrop-blur-sm' : '',
      message: 'text-gray-200',
      accent: 'text-blue-300',
    },
    auth: {
      container: 'text-foreground',
      background: overlay ? 'bg-background/80 backdrop-blur-sm' : '',
      message: 'text-muted-foreground',
      accent: 'text-primary',
    },
  };

  const styles = contextStyles[detectedContext];

  // Render loading variants
  const renderLoadingIndicator = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div
            className={cn(
              currentSize.icon,
              'animate-spin rounded-full border-b-2',
              styles.accent.replace('text-', 'border-')
            )}
          />
        );

      case 'dots':
        return (
          <div className={cn('flex', currentSize.spacing)}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={cn(
                  'rounded-full animate-pulse',
                  size === 'sm'
                    ? 'w-1 h-1'
                    : size === 'md'
                      ? 'w-2 h-2'
                      : size === 'lg'
                        ? 'w-3 h-3'
                        : 'w-4 h-4',
                  styles.accent.replace('text-', 'bg-')
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,

                  animationDuration: '1s',
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div
            className={cn(
              'rounded-full animate-pulse',
              currentSize.icon,
              styles.accent.replace('text-', 'bg-')
            )}
          />
        );

      case 'bars':
        return (
          <div className={cn('flex items-end', currentSize.spacing)}>
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={cn(
                  'animate-pulse',
                  styles.accent.replace('text-', 'bg-'),
                  size === 'sm'
                    ? 'w-1'
                    : size === 'md'
                      ? 'w-1.5'
                      : size === 'lg'
                        ? 'w-2'
                        : 'w-3'
                )}
                style={{
                  height: `${20 + (i % 2) * 10}px`,

                  animationDelay: `${i * 0.15}s`,

                  animationDuration: '1.2s',
                }}
              />
            ))}
          </div>
        );

      case 'skeleton':
        return (
          <div className="space-y-2">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={cn(
                  'rounded animate-pulse',
                  styles.accent
                    .replace('text-', 'bg-')
                    .replace('blue-300', 'gray-300')
                    .replace('primary', 'muted'),
                  size === 'sm'
                    ? 'h-2'
                    : size === 'md'
                      ? 'h-3'
                      : size === 'lg'
                        ? 'h-4'
                        : 'h-6'
                )}
                style={{
                  width: `${60 + i * 20}%`,

                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        );

      default:
        return (
          <div
            className={cn(
              currentSize.icon,
              'animate-spin rounded-full border-b-2',
              styles.accent.replace('text-', 'border-')
            )}
          />
        );
    }
  };

  // Default messages based on context
  const getDefaultMessage = () => {
    if (detectedContext === 'public') {
      return 'Cargando...';
    } else {
      return 'Cargando datos...';
    }
  };

  const displayMessage = message || getDefaultMessage();

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        styles.container,
        overlay && ['fixed inset-0 z-50', styles.background],
        !overlay && 'py-8',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={`Cargando ${displayMessage || 'contenido'}`}
    >
      <div className={cn('flex flex-col items-center', currentSize.spacing)}>
        <div aria-hidden="true">{renderLoadingIndicator()}</div>

        {displayMessage && (
          <div
            className={cn(
              'font-medium text-center',
              currentSize.text,
              styles.message
            )}
          >
            {displayMessage}
          </div>
        )}

        {/* Enhanced loading for public context */}
        {detectedContext === 'public' && variant === 'spinner' && (
          <div className="flex items-center gap-1 mt-2">
            <Sparkles
              className="w-3 h-3 text-blue-300 animate-pulse"
              aria-hidden="true"
            />
            <span className="text-xs text-gray-300">
              Preparando experiencia...
            </span>
          </div>
        )}

        {/* Screen reader announcement */}
        <span className="sr-only">
          {displayMessage || 'Cargando contenido'}, por favor espere...
        </span>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for cards
 */
export function LoadingSkeleton({
  context = 'auto',
  className,
}: {
  context?: LoadingContext;
  className?: string;
}) {
  return (
    <AdaptiveLoading
      context={context}
      variant="skeleton"
      size="md"
      className={className}
    />
  );
}

/**
 * Page loading component
 */
export function PageLoading({
  context = 'auto',
  message = 'Cargando página...',
}: {
  context?: LoadingContext;
  message?: string;
}) {
  return (
    <AdaptiveLoading
      context={context}
      variant="spinner"
      size="lg"
      message={message}
      overlay
    />
  );
}

/**
 * Inline loading component
 */
export function InlineLoading({
  context = 'auto',
  size = 'sm',
  message,
}: {
  context?: LoadingContext;
  size?: LoadingSize;
  message?: string;
}) {
  return (
    <AdaptiveLoading
      context={context}
      variant="spinner"
      size={size}
      message={message}
      className="inline-flex"
    />
  );
}

export default AdaptiveLoading;
