'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Monitor,
  Tablet,
  Smartphone,
  Maximize,
  Minimize,
  RotateCcw,
  Settings,
  Palette,
  Layout,
  Zap,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface ResponsiveLayoutContextType {
  viewMode: 'desktop' | 'tablet' | 'mobile' | 'auto';
  setViewMode: (mode: 'desktop' | 'tablet' | 'mobile' | 'auto') => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  layoutDensity: 'compact' | 'comfortable' | 'spacious';
  setLayoutDensity: (density: 'compact' | 'comfortable' | 'spacious') => void;
  sidebarPosition: 'left' | 'right';
  setSidebarPosition: (position: 'left' | 'right') => void;
  currentBreakpoint: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const ResponsiveLayoutContext = createContext<
  ResponsiveLayoutContextType | undefined
>(undefined);

export function useResponsiveLayout() {
  const context = useContext(ResponsiveLayoutContext);
  if (!context) {
    throw new Error(
      'useResponsiveLayout must be used within ResponsiveLayoutProvider'
    );
  }
  return context;
}

interface ResponsiveLayoutProviderProps {
  children: React.ReactNode;
}

export function ResponsiveLayoutProvider({
  children,
}: ResponsiveLayoutProviderProps) {
  const [viewMode, setViewMode] = useState<
    'desktop' | 'tablet' | 'mobile' | 'auto'
  >('auto');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layoutDensity, setLayoutDensity] = useState<
    'compact' | 'comfortable' | 'spacious'
  >('comfortable');
  const [sidebarPosition, setSidebarPosition] = useState<'left' | 'right'>(
    'left'
  );
  const [currentBreakpoint, setCurrentBreakpoint] = useState('desktop');
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Detect screen size and set breakpoints - hydration-safe
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      if (typeof window === 'undefined') return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowSize({ width, height });

      if (width < 640) {
        setCurrentBreakpoint('mobile');
      } else if (width < 1024) {
        setCurrentBreakpoint('tablet');
      } else if (width < 1440) {
        setCurrentBreakpoint('desktop');
      } else {
        setCurrentBreakpoint('large');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load saved preferences - hydration-safe
  useEffect(() => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;

    const savedPreferences = localStorage.getItem('layout-preferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        setViewMode(preferences.viewMode || 'auto');
        setLayoutDensity(preferences.layoutDensity || 'comfortable');
        setSidebarPosition(preferences.sidebarPosition || 'left');
      } catch (error) {
        console.error('Error loading layout preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage - hydration-safe
  useEffect(() => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;

    const preferences = {
      viewMode,
      layoutDensity,
      sidebarPosition,
    };
    localStorage.setItem('layout-preferences', JSON.stringify(preferences));
  }, [viewMode, layoutDensity, sidebarPosition]);

  // Fullscreen functionality - hydration-safe
  const toggleFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return;

    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  // Listen for fullscreen changes - hydration-safe
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Determine actual breakpoint based on view mode
  const effectiveBreakpoint =
    viewMode === 'auto' ? currentBreakpoint : viewMode;

  const isMobile = effectiveBreakpoint === 'mobile';
  const isTablet = effectiveBreakpoint === 'tablet';
  const isDesktop = ['desktop', 'large'].includes(effectiveBreakpoint);

  const value: ResponsiveLayoutContextType = {
    viewMode,
    setViewMode,
    isFullscreen,
    toggleFullscreen,
    layoutDensity,
    setLayoutDensity,
    sidebarPosition,
    setSidebarPosition,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
  };

  return (
    <ResponsiveLayoutContext.Provider value={value}>
      {children}
    </ResponsiveLayoutContext.Provider>
  );
}

interface ViewportControlsProps {
  className?: string;
}

export function ViewportControls({ className }: ViewportControlsProps) {
  const {
    viewMode,
    setViewMode,
    isFullscreen,
    toggleFullscreen,
    layoutDensity,
    setLayoutDensity,
    sidebarPosition,
    setSidebarPosition,
    currentBreakpoint,
  } = useResponsiveLayout();
  const { theme, setTheme } = useTheme();

  const viewModes = [
    { key: 'auto', label: 'Automático', icon: Monitor },
    { key: 'desktop', label: 'Escritorio', icon: Monitor },
    { key: 'tablet', label: 'Tablet', icon: Tablet },
    { key: 'mobile', label: 'Móvil', icon: Smartphone },
  ] as const;

  const densityOptions = [
    {
      key: 'compact',
      label: 'Compacto',
      description: 'Más contenido, menos espacio',
    },
    {
      key: 'comfortable',
      label: 'Cómodo',
      description: 'Balance entre contenido y espacio',
    },
    {
      key: 'spacious',
      label: 'Espacioso',
      description: 'Más espacio, mejor legibilidad',
    },
  ] as const;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* View Mode Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="hidden md:flex">
            {React.createElement(
              viewModes.find(mode => mode.key === viewMode)?.icon || Monitor,
              { className: 'h-4 w-4 mr-2' }
            )}
            <span className="hidden lg:inline">
              {viewModes.find(mode => mode.key === viewMode)?.label}
            </span>
            <Badge variant="secondary" className="ml-2 text-xs">
              {currentBreakpoint}
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Vista de Pantalla</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {viewModes.map(({ key, label, icon: Icon }) => (
            <DropdownMenuItem
              key={key}
              onClick={() => setViewMode(key)}
              className={cn(viewMode === key && 'bg-accent')}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
              {key === 'auto' && (
                <Badge variant="outline" className="ml-auto text-xs">
                  {currentBreakpoint}
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Layout Controls */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Layout className="h-4 w-4" />
            <span className="sr-only">Opciones de diseño</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Configuración de Diseño</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Density Options */}
          <div className="px-2 py-2">
            <label className="text-sm font-medium mb-2 block">Densidad</label>
            <div className="space-y-1">
              {densityOptions.map(({ key, label, description }) => (
                <button
                  key={key}
                  onClick={() => setLayoutDensity(key)}
                  className={cn(
                    'w-full text-left p-2 rounded-sm hover:bg-accent transition-colors',
                    layoutDensity === key && 'bg-accent'
                  )}
                >
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs text-muted-foreground">
                    {description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Sidebar Position */}
          <div className="px-2 py-2">
            <label className="text-sm font-medium mb-2 block">
              Posición del Menú
            </label>
            <div className="flex gap-1">
              <Button
                variant={sidebarPosition === 'left' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setSidebarPosition('left')}
              >
                Izquierda
              </Button>
              <Button
                variant={sidebarPosition === 'right' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setSidebarPosition('right')}
              >
                Derecha
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Fullscreen Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleFullscreen}
        className="hidden md:flex"
      >
        {isFullscreen ? (
          <Minimize className="h-4 w-4" />
        ) : (
          <Maximize className="h-4 w-4" />
        )}
        <span className="sr-only">
          {isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        </span>
      </Button>
    </div>
  );
}

interface AdaptiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function AdaptiveContainer({
  children,
  className,
  maxWidth = 'full',
  padding = 'md',
}: AdaptiveContainerProps) {
  const { layoutDensity, isMobile, isTablet } = useResponsiveLayout();

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: '',
    sm: cn(
      layoutDensity === 'compact' ? 'p-2' : '',
      layoutDensity === 'comfortable' ? 'p-3' : '',
      layoutDensity === 'spacious' ? 'p-4' : ''
    ),
    md: cn(
      layoutDensity === 'compact' ? 'p-3' : '',
      layoutDensity === 'comfortable' ? 'p-4' : '',
      layoutDensity === 'spacious' ? 'p-6' : ''
    ),
    lg: cn(
      layoutDensity === 'compact' ? 'p-4' : '',
      layoutDensity === 'comfortable' ? 'p-6' : '',
      layoutDensity === 'spacious' ? 'p-8' : ''
    ),
  };

  const gapClasses = cn(
    layoutDensity === 'compact' ? 'space-y-3' : '',
    layoutDensity === 'comfortable' ? 'space-y-4' : '',
    layoutDensity === 'spacious' ? 'space-y-6' : ''
  );

  return (
    <div
      className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        gapClasses,
        // Responsive adjustments
        isMobile && 'px-4',
        isTablet && 'px-6',
        className
      )}
    >
      {children}
    </div>
  );
}

interface AdaptiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

export function AdaptiveGrid({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 4 },
  gap = 'md',
}: AdaptiveGridProps) {
  const { layoutDensity, isMobile, isTablet, isDesktop } =
    useResponsiveLayout();

  const gapClasses = {
    sm: cn(
      layoutDensity === 'compact' ? 'gap-2' : '',
      layoutDensity === 'comfortable' ? 'gap-3' : '',
      layoutDensity === 'spacious' ? 'gap-4' : ''
    ),
    md: cn(
      layoutDensity === 'compact' ? 'gap-3' : '',
      layoutDensity === 'comfortable' ? 'gap-4' : '',
      layoutDensity === 'spacious' ? 'gap-6' : ''
    ),
    lg: cn(
      layoutDensity === 'compact' ? 'gap-4' : '',
      layoutDensity === 'comfortable' ? 'gap-6' : '',
      layoutDensity === 'spacious' ? 'gap-8' : ''
    ),
  };

  let gridCols = 'grid-cols-1';
  if (isMobile && cols.mobile) {
    gridCols = `grid-cols-${cols.mobile}`;
  } else if (isTablet && cols.tablet) {
    gridCols = `grid-cols-${cols.tablet}`;
  } else if (isDesktop && cols.desktop) {
    gridCols = `grid-cols-${cols.desktop}`;
  }

  return (
    <div className={cn('grid', gridCols, gapClasses[gap], className)}>
      {children}
    </div>
  );
}

interface ResponsiveDialogProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function ResponsiveDialog({
  children,
  isOpen,
  onClose,
  title,
  size = 'md',
}: ResponsiveDialogProps) {
  const { isMobile, layoutDensity } = useResponsiveLayout();

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  };

  const paddingClasses = cn(
    layoutDensity === 'compact' ? 'p-4' : '',
    layoutDensity === 'comfortable' ? 'p-6' : '',
    layoutDensity === 'spacious' ? 'p-8' : ''
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={cn(
            'relative w-full bg-background rounded-lg shadow-2xl border',
            isMobile ? 'max-h-[90vh] overflow-y-auto' : sizeClasses[size],
            isMobile && size === 'full' && 'h-full max-h-full rounded-none'
          )}
          onClick={e => e.stopPropagation()}
        >
          {title && (
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold">{title}</h2>
            </div>
          )}

          <div className={paddingClasses}>{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Utility hook for responsive values
export function useResponsiveValue<T>(values: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  default: T;
}): T {
  const { isMobile, isTablet, isDesktop } = useResponsiveLayout();

  if (isMobile && values.mobile !== undefined) {
    return values.mobile;
  }
  if (isTablet && values.tablet !== undefined) {
    return values.tablet;
  }
  if (isDesktop && values.desktop !== undefined) {
    return values.desktop;
  }
  return values.default;
}

// Performance optimized responsive image component
type BaseImgProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'sizes'> & {
  sizes?: string;
};

interface ResponsiveImageProps extends BaseImgProps {
  src: string;
  alt: string;
  responsiveSizes?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  quality?: 'low' | 'medium' | 'high';
}

export function ResponsiveImage({
  src,
  alt,
  responsiveSizes = {},
  quality = 'medium',
  className,
  sizes,
  ...props
}: ResponsiveImageProps) {
  const { isMobile, isTablet, isDesktop } = useResponsiveLayout();

  // Determine appropriate size based on breakpoint
  let imageSize = responsiveSizes.desktop || src;
  if (isMobile && responsiveSizes.mobile) {
    imageSize = responsiveSizes.mobile;
  } else if (isTablet && responsiveSizes.tablet) {
    imageSize = responsiveSizes.tablet;
  }

  // Quality settings
  const qualitySettings = {
    low: 'loading="lazy" decoding="async"',
    medium: 'loading="lazy" decoding="async"',
    high: 'loading="eager" decoding="sync"',
  };

  return (
    <img
      src={imageSize}
      alt={alt}
      className={cn('responsive-image', className)}
      {...(quality === 'low' && { loading: 'lazy', decoding: 'async' })}
      {...(quality === 'medium' && { loading: 'lazy', decoding: 'async' })}
      {...(quality === 'high' && { loading: 'eager', decoding: 'sync' })}
      sizes={sizes}
      {...props}
    />
  );
}
