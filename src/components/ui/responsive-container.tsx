'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
}

export function ResponsiveContainer({
  children,
  className,
  mobileClassName,
  tabletClassName,
  desktopClassName,
}: ResponsiveContainerProps) {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);

    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const responsiveClasses = {
    mobile: mobileClassName,
    tablet: tabletClassName,
    desktop: desktopClassName,
  };

  return (
    <div
      className={cn(
        className,
        responsiveClasses[screenSize]
      )}
    >
      {children}
    </div>
  );
}

// Responsive grid component
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

export function ResponsiveGrid({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md'
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const gridClasses = {
    mobile: cols.mobile ? `grid-cols-${cols.mobile}` : 'grid-cols-1',
    tablet: cols.tablet ? `grid-cols-${cols.tablet}` : 'grid-cols-2',
    desktop: cols.desktop ? `grid-cols-${cols.desktop}` : 'grid-cols-3',
  };

  return (
    <div
      className={cn(
        'grid',
        // Mobile first
        gridClasses.mobile,
        // Tablet
        `md:${gridClasses.tablet}`,
        // Desktop
        `lg:${gridClasses.desktop}`,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

// Responsive text component
interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  size?: {
    mobile?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
    tablet?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
    desktop?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  };
}

export function ResponsiveText({
  children,
  className,
  size = { mobile: 'sm', tablet: 'base', desktop: 'lg' }
}: ResponsiveTextProps) {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  };

  return (
    <div
      className={cn(
        // Mobile first
        size.mobile ? sizeClasses[size.mobile] : 'text-sm',
        // Tablet
        size.tablet ? `md:${sizeClasses[size.tablet]}` : 'md:text-base',
        // Desktop
        size.desktop ? `lg:${sizeClasses[size.desktop]}` : 'lg:text-lg',
        className
      )}
    >
      {children}
    </div>
  );
}

// Responsive card component
interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: {
    mobile?: 'sm' | 'md' | 'lg';
    tablet?: 'sm' | 'md' | 'lg';
    desktop?: 'sm' | 'md' | 'lg';
  };
}

export function ResponsiveCard({
  children,
  className,
  padding = { mobile: 'md', tablet: 'md', desktop: 'lg' }
}: ResponsiveCardProps) {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={cn(
        'bg-card text-card-foreground rounded-lg border shadow-sm',
        // Mobile first
        padding.mobile ? paddingClasses[padding.mobile] : 'p-4',
        // Tablet
        padding.tablet ? `md:${paddingClasses[padding.tablet]}` : 'md:p-4',
        // Desktop
        padding.desktop ? `lg:${paddingClasses[padding.desktop]}` : 'lg:p-6',
        className
      )}
    >
      {children}
    </div>
  );
}

// Mobile-first responsive hook
export function useResponsive() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const updateResponsive = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    updateResponsive();
    window.addEventListener('resize', updateResponsive);

    return () => window.removeEventListener('resize', updateResponsive);
  }, []);

  return { isMobile, isTablet, isDesktop };
}

// Touch-friendly button component
interface TouchButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
}

export function TouchButton({
  children,
  onClick,
  className,
  disabled = false,
  variant = 'default'
}: TouchButtonProps) {
  const baseClasses = 'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground focus:ring-primary',
    ghost: 'hover:bg-accent hover:text-accent-foreground focus:ring-primary',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        // Mobile-first touch targets (minimum 44px)
        'min-h-[44px] min-w-[44px] px-4 py-2',
        // Better touch targets on mobile
        'sm:min-h-[40px] sm:min-w-[40px] sm:px-3 sm:py-2',
        className
      )}
    >
      {children}
    </button>
  );
}

// Responsive navigation component
interface ResponsiveNavProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function ResponsiveNav({
  children,
  className,
  orientation = 'horizontal'
}: ResponsiveNavProps) {
  return (
    <nav
      className={cn(
        'flex',
        orientation === 'horizontal'
          ? 'flex-row items-center space-x-4'
          : 'flex-col space-y-2',
        // Mobile: stack vertically if horizontal
        orientation === 'horizontal' && 'flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4',
        className
      )}
    >
      {children}
    </nav>
  );
}

// Mobile-optimized modal/drawer
interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  position?: 'left' | 'right' | 'bottom';
}

export function MobileDrawer({
  isOpen,
  onClose,
  children,
  title,
  position = 'right'
}: MobileDrawerProps) {
  const positionClasses = {
    left: 'left-0 top-0 h-full w-80 transform -translate-x-full',
    right: 'right-0 top-0 h-full w-80 transform translate-x-full',
    bottom: 'bottom-0 left-0 right-0 h-96 transform translate-y-full',
  };

  const openClasses = {
    left: 'translate-x-0',
    right: 'translate-x-0',
    bottom: 'translate-y-0',
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed z-50 bg-background shadow-lg transition-transform duration-300 ease-in-out',
          positionClasses[position],
          isOpen && openClasses[position]
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-accent"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-full">
          {children}
        </div>
      </div>
    </>
  );
}