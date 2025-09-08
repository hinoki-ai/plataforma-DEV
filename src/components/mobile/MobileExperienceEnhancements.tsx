'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from '@/components/ui/sheet';
import {
  Search,
  X,
  ArrowUp,
  WifiOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSwipeGesture, useHapticFeedback } from '@/hooks/useGestures';

// Mobile-first bottom navigation
interface BottomNavigationProps {
  items: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    badge?: number;
  }>;
  currentPath: string;
  onNavigate: (href: string) => void;
}

export function BottomNavigation({
  items,
  currentPath,
  onNavigate,
}: BottomNavigationProps) {
  const { tapFeedback } = useHapticFeedback();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border md:hidden"
    >
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        {items.map(item => {
          const Icon = item.icon;
          const isActive =
            currentPath === item.href ||
            currentPath.startsWith(item.href + '/');

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                tapFeedback();
                onNavigate(item.href);
              }}
              className={cn(
                'flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[60px]',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge && item.badge > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center min-w-[16px]"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs mt-1 truncate max-w-[50px]">
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}

// Pull-to-refresh component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  disabled?: boolean;
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 100,
  disabled = false,
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const { tapFeedback } = useHapticFeedback();

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || typeof window === 'undefined' || window.scrollY > 10) return;
      startYRef.current = e.touches[0].clientY;
    },
    [disabled]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled || typeof window === 'undefined' || !startYRef.current || window.scrollY > 10) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startYRef.current;

      if (deltaY > 0) {
        const distance = Math.min(deltaY * 0.5, threshold * 1.5);
        setPullDistance(distance);

        if (distance > 50 && !isPulling) {
          setIsPulling(true);
          tapFeedback();
        } else if (distance <= 50 && isPulling) {
          setIsPulling(false);
        }

        e.preventDefault();
      }
    },
    [disabled, threshold, isPulling, tapFeedback]
  );

  const handleTouchEnd = useCallback(async () => {
    if (disabled || !isPulling) {
      setPullDistance(0);
      setIsPulling(false);
      return;
    }

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      tapFeedback();

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
    setIsPulling(false);
    startYRef.current = 0;
  }, [disabled, isPulling, pullDistance, threshold, onRefresh, tapFeedback]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    });
    container.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const rotationAngle = Math.min((pullDistance / threshold) * 180, 180);

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Pull indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{
              opacity: 1,
              y: Math.max(0, pullDistance - 50),
              transition: { type: 'spring', damping: 20 },
            }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-0 left-0 right-0 z-10 flex justify-center py-4"
          >
            <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
              <motion.div
                animate={{
                  rotate: isRefreshing ? 360 : rotationAngle,
                  transition: isRefreshing
                    ? { duration: 1, repeat: Infinity, ease: 'linear' }
                    : { type: 'spring', damping: 20 },
                }}
              >
                <ArrowUp className="h-4 w-4 text-primary" />
              </motion.div>
              <span className="text-sm text-muted-foreground">
                {isRefreshing
                  ? 'Actualizando...'
                  : pullDistance >= threshold
                    ? 'Suelta para actualizar'
                    : 'Desliza para actualizar'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <motion.div
        animate={{
          y: Math.max(0, pullDistance * 0.3),
          transition: { type: 'spring', damping: 20 },
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Mobile floating action button
interface FloatingActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export function FloatingActionButton({
  icon: Icon,
  onClick,
  label,
  position = 'bottom-right',
  size = 'md',
  variant = 'primary',
}: FloatingActionButtonProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { tapFeedback } = useHapticFeedback();

  // Auto-hide on scroll down, show on scroll up - hydration-safe
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      if (typeof window === 'undefined') return;
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const positionClasses = {
    'bottom-right': 'bottom-20 right-4',
    'bottom-left': 'bottom-20 left-4',
    'bottom-center': 'bottom-20 left-1/2 transform -translate-x-1/2',
  };

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-14 w-14',
    lg: 'h-16 w-16',
  };

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground shadow-lg',
    secondary: 'bg-secondary text-secondary-foreground shadow-lg',
    success: 'bg-green-500 text-white shadow-lg',
    warning: 'bg-yellow-500 text-white shadow-lg',
    danger: 'bg-red-500 text-white shadow-lg',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            tapFeedback();
            onClick();
          }}
          className={cn(
            'fixed z-40 rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-xl md:hidden',
            positionClasses[position],
            sizeClasses[size],
            variantClasses[variant]
          )}
          aria-label={label}
        >
          <Icon className="h-6 w-6" />

          {label && (
            <motion.span
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              className="ml-2 text-sm font-medium whitespace-nowrap overflow-hidden"
            >
              {label}
            </motion.span>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// Mobile swipe actions
interface SwipeActionProps {
  children: React.ReactNode;
  leftActions?: Array<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    color: 'red' | 'green' | 'blue' | 'yellow';
    action: () => void;
  }>;
  rightActions?: Array<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    color: 'red' | 'green' | 'blue' | 'yellow';
    action: () => void;
  }>;
  threshold?: number;
}

export function SwipeActions({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 100,
}: SwipeActionProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { tapFeedback } = useHapticFeedback();

  useSwipeGesture(
    containerRef as unknown as React.RefObject<HTMLElement>,
    {
      onSwipeLeft: event => {
        if (rightActions.length === 0) return;

        if (event.distance >= threshold) {
          tapFeedback();
          rightActions[0].action();
          resetSwipe();
        }
      },
      onSwipeRight: event => {
        if (leftActions.length === 0) return;

        if (event.distance >= threshold) {
          tapFeedback();
          leftActions[0].action();
          resetSwipe();
        }
      },
      threshold: threshold / 2,
    }
  );

  const resetSwipe = useCallback(() => {
    setIsAnimating(true);
    setSwipeOffset(0);
    setTimeout(() => setIsAnimating(false), 200);
  }, []);

  const colorClasses = {
    red: 'bg-red-500 text-white',
    green: 'bg-green-500 text-white',
    blue: 'bg-blue-500 text-white',
    yellow: 'bg-yellow-500 text-white',
  };

  return (
    <div className="relative overflow-hidden">
      {/* Left actions */}
      {leftActions.length > 0 && (
        <div className="absolute left-0 top-0 bottom-0 flex items-center">
          {leftActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={index}
                className={cn(
                  'h-full px-4 flex flex-col items-center justify-center',
                  colorClasses[action.color]
                )}
                animate={{
                  width: Math.max(0, swipeOffset) / leftActions.length,
                  opacity: swipeOffset > 20 ? 1 : 0,
                }}
                onClick={action.action}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{action.label}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Right actions */}
      {rightActions.length > 0 && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center">
          {rightActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={index}
                className={cn(
                  'h-full px-4 flex flex-col items-center justify-center',
                  colorClasses[action.color]
                )}
                animate={{
                  width: Math.max(0, -swipeOffset) / rightActions.length,
                  opacity: swipeOffset < -20 ? 1 : 0,
                }}
                onClick={action.action}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{action.label}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Content */}
      <motion.div
        ref={containerRef}
        animate={{
          x: isAnimating ? 0 : swipeOffset,
          transition: isAnimating
            ? { type: 'spring', damping: 20 }
            : { duration: 0 },
        }}
        className="relative z-10 bg-background"
      >
        {children}
      </motion.div>
    </div>
  );
}

// Mobile-optimized search
interface MobileSearchProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  suggestions?: string[];
  className?: string;
}

export function MobileSearch({
  placeholder = 'Buscar...',
  onSearch,
  suggestions = [],
  className,
}: MobileSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      onSearch(searchQuery);
      setQuery(searchQuery);
      setShowSuggestions(false);
      setIsOpen(false);
    },
    [onSearch]
  );

  return (
    <div className={cn('md:hidden', className)}>
      <Button
        variant="outline"
        className="w-full justify-start text-muted-foreground"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-4 w-4 mr-2" />
        {placeholder}
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="top" className="h-full">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={e => {
                    setQuery(e.target.value);
                    setShowSuggestions(e.target.value.length > 0);
                  }}
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      handleSearch(query);
                    }
                  }}
                  placeholder={placeholder}
                  className="pl-10"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {showSuggestions && suggestions.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Sugerencias
              </h3>
              {suggestions
                .filter(suggestion =>
                  suggestion.toLowerCase().includes(query.toLowerCase())
                )
                .slice(0, 8)
                .map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(suggestion)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted text-left"
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span>{suggestion}</span>
                  </button>
                ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Connection status indicator
export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [connection, setConnection] = useState<
    '4g' | '3g' | '2g' | 'wifi' | 'unknown'
  >('wifi');

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    const navAny = navigator as any;
    if (navAny.connection) {
      const conn = navAny.connection as any;
      const updateConnection = () => {
        const raw = (conn.effectiveType as string) || '';
        const normalized: '4g' | '3g' | '2g' | 'wifi' | 'unknown' =
          raw === '4g'
            ? '4g'
            : raw === '3g'
              ? '3g'
              : raw.includes('2g')
                ? '2g'
                : 'unknown';
        setConnection(normalized);
      };

      conn.addEventListener('change', updateConnection);
      updateConnection();
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);

      return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
      };
    }
  }, []);

  if (!isOnline) {
    // Trigger unified error page instead of showing banner
    const offlineError = new Error('Sin conexión a internet. No tienes conexión a internet. Algunas funciones pueden no estar disponibles.');
    offlineError.name = 'NetworkError';
    throw offlineError;
  }

  // Show connection status in development
  if (process.env.NODE_ENV === 'development') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-16 left-4 z-50 bg-green-500 text-white p-2 rounded-lg shadow-lg flex items-center gap-2 md:hidden"
      >
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span className="text-xs font-medium">{connection.toUpperCase()}</span>
      </motion.div>
    );
  }

  return null;
}

// Performance metrics display
interface PerformanceMetricsProps {
  showInDevelopment?: boolean;
}

export function PerformanceMetrics({
  showInDevelopment = true,
}: PerformanceMetricsProps) {
  const [metrics, setMetrics] = useState<{
    fps: number;
    memory: number;
    loadTime: number;
    connection: string;
  }>({
    fps: 0,
    memory: 0,
    loadTime: 0,
    connection: 'unknown',
  });

  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!isDevelopment && !showInDevelopment) return;

    const updateMetrics = () => {
      const navAny = navigator as any;
      const perfAny = performance as any;
      if (perfAny.memory) {
        setMetrics(prev => ({
          ...prev,
          memory: Math.round(
            (perfAny.memory.usedJSHeapSize as number) / 1048576
          ),
        }));
      }

      if (navAny.connection) {
        const raw = (navAny.connection.effectiveType as string) || '';
        const normalized: '4g' | '3g' | '2g' | 'wifi' | 'unknown' =
          raw === '4g'
            ? '4g'
            : raw === '3g'
              ? '3g'
              : raw.includes('2g')
                ? '2g'
                : 'unknown';
        setMetrics(prev => ({
          ...prev,
          connection: normalized,
        }));
      }
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 1000);

    return () => clearInterval(interval);
  }, [isDevelopment, showInDevelopment]);

  if (!isDevelopment && !showInDevelopment) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.8 }}
      className="fixed bottom-4 left-4 z-50 bg-black/80 text-white text-xs p-2 rounded font-mono md:hidden"
    >
      <div>RAM: {metrics.memory}MB</div>
      <div>NET: {metrics.connection}</div>
    </motion.div>
  );
}
