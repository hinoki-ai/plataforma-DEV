'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  AdaptiveCard,
  AdaptiveCardContent,
} from '@/components/ui/adaptive-card';
import { AdaptiveH1, AdaptiveP } from '@/components/ui/adaptive-typography';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Star,
  Heart,
  BookOpen,
  Users,
  Target,
  Sparkles,
} from 'lucide-react';

export type DashboardWelcomeVariant =
  | 'admin'
  | 'profesor'
  | 'parent'
  | 'public'
  | 'auto';

export interface DashboardWelcomeProps {
  /**
   * Display variant - auto-detects by default
   */
  variant?: DashboardWelcomeVariant;

  /**
   * User name override
   */
  userName?: string;

  /**
   * Custom welcome message
   */
  customMessage?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Show role badge
   */
  showRole?: boolean;
}

/**
 * Personalized welcome messages component
 */
export function DashboardWelcome({
  variant = 'auto',
  userName,
  customMessage,
  className,
  showRole = true,
}: DashboardWelcomeProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Auto-detect variant based on route and session
  const detectedVariant: Exclude<DashboardWelcomeVariant, 'auto'> =
    variant !== 'auto'
      ? variant
      : pathname?.startsWith('/admin')
        ? 'admin'
        : pathname?.startsWith('/profesor')
          ? 'profesor'
          : pathname?.startsWith('/parent')
            ? 'parent'
            : 'public';

  const context = detectedVariant === 'public' ? 'public' : 'auth';

  // Get user information
  const displayName = userName || session?.user?.name || 'Usuario';
  const userRole = session?.user?.role;

  // Time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 6) {
      return {
        greeting: 'Buenas madrugadas',
        icon: Moon,
        time: 'early-morning',
      };
    } else if (hour < 12) {
      return { greeting: 'Buenos días', icon: Sunrise, time: 'morning' };
    } else if (hour < 18) {
      return { greeting: 'Buenas tardes', icon: Sun, time: 'afternoon' };
    } else if (hour < 22) {
      return { greeting: 'Buenas noches', icon: Sunset, time: 'evening' };
    } else {
      return { greeting: 'Buenas noches', icon: Star, time: 'night' };
    }
  };

  const { greeting, icon: TimeIcon, time } = getTimeBasedGreeting();

  // Role-specific messages and styling
  const getRoleConfig = () => {
    switch (detectedVariant) {
      case 'admin':
        return {
          title: `${greeting}, ${displayName}`,
          message:
            customMessage ||
            'Bienvenido/a al panel de administración. Desde aquí puedes gestionar todo el sistema educativo y supervisar el funcionamiento de la escuela.',
          icon: Target,
          roleLabel: 'Administrador',
          roleColor:
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
          accentColor:
            context === 'public'
              ? 'text-red-300'
              : 'text-red-600 dark:text-red-400',
        };

      case 'profesor':
        return {
          title: `${greeting}, Profesor/a ${displayName}`,
          message:
            customMessage ||
            'Tu espacio para crear, planificar y gestionar el aprendizaje. Aquí encontrarás todas las herramientas que necesitas para acompañar a tus estudiantes.',
          icon: BookOpen,
          roleLabel: 'Profesor',
          roleColor:
            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
          accentColor:
            context === 'public'
              ? 'text-blue-300'
              : 'text-blue-600 dark:text-blue-400',
        };

      case 'parent':
        return {
          title: `${greeting}, ${displayName}`,
          message:
            customMessage ||
            'Mantente conectado/a con la educación de tu hijo/a. Aquí puedes ver eventos, actividades y comunicarte con nuestro equipo educativo.',
          icon: Heart,
          roleLabel: 'Padre/Apoderado',
          roleColor:
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
          accentColor:
            context === 'public'
              ? 'text-green-300'
              : 'text-green-600 dark:text-green-400',
        };

      case 'public':
        return {
          title: `${greeting}, bienvenido/a`,
          message:
            customMessage ||
            'Explora nuestra comunidad educativa. Conoce nuestros eventos, equipo multidisciplinario y todo lo que ofrecemos para el crecimiento integral de nuestros estudiantes.',
          icon: Sparkles,
          roleLabel: 'Visitante',
          roleColor:
            'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
          accentColor:
            context === 'public'
              ? 'text-purple-300'
              : 'text-purple-600 dark:text-purple-400',
        };

      default:
        return {
          title: `${greeting}`,
          message:
            customMessage || 'Bienvenido/a a nuestra plataforma educativa.',
          icon: Users,
          roleLabel: 'Usuario',
          roleColor:
            'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
          accentColor:
            context === 'public'
              ? 'text-gray-300'
              : 'text-gray-600 dark:text-gray-400',
        };
    }
  };

  const roleConfig = getRoleConfig();
  const WelcomeIcon = roleConfig.icon;

  // Background gradient based on time and context
  const getBackgroundGradient = () => {
    if (context === 'public') {
      switch (time) {
        case 'morning':
          return 'bg-gradient-to-br from-blue-900/20 via-indigo-900/20 to-purple-900/20';
        case 'afternoon':
          return 'bg-gradient-to-br from-orange-900/20 via-yellow-900/20 to-red-900/20';
        case 'evening':
          return 'bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-indigo-900/20';
        case 'night':
        case 'early-morning':
          return 'bg-gradient-to-br from-gray-900/30 via-blue-900/20 to-indigo-900/20';
        default:
          return 'bg-gradient-to-br from-gray-900/20 to-gray-800/20';
      }
    } else {
      return 'bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20';
    }
  };

  return (
    <AdaptiveCard
      variant={context}
      className={cn(
        'relative overflow-hidden',
        getBackgroundGradient(),
        className
      )}
    >
      <AdaptiveCardContent className="p-6 sm:p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Time and welcome greeting */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className={cn(
                  'p-2 rounded-lg',
                  context === 'public'
                    ? 'bg-white/10 backdrop-blur-sm'
                    : 'bg-background/80 border border-border'
                )}
              >
                <TimeIcon
                  className={cn(
                    'w-5 h-5',
                    context === 'public' ? 'text-yellow-300' : 'text-yellow-500'
                  )}
                />
              </div>

              {showRole && userRole && (
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs font-medium',
                    context === 'public'
                      ? 'bg-white/10 text-white border-white/20 backdrop-blur-sm'
                      : roleConfig.roleColor
                  )}
                >
                  {roleConfig.roleLabel}
                </Badge>
              )}
            </div>

            {/* Main welcome message */}
            <div className="space-y-3">
              <AdaptiveH1 className="leading-tight">
                {roleConfig.title}
              </AdaptiveH1>

              <AdaptiveP className="leading-relaxed max-w-2xl">
                {roleConfig.message}
              </AdaptiveP>
            </div>
          </div>

          {/* Decorative icon */}
          <div
            className={cn(
              'p-4 rounded-xl',
              context === 'public'
                ? 'bg-white/5 backdrop-blur-sm'
                : 'bg-background/60 border border-border'
            )}
          >
            <WelcomeIcon className={cn('w-8 h-8', roleConfig.accentColor)} />
          </div>
        </div>

        {/* Decorative elements for public context */}
        {context === 'public' && (
          <>
            <div className="absolute top-4 right-16 w-2 h-2 bg-white/20 rounded-full animate-pulse" />
            <div className="absolute top-8 right-8 w-1 h-1 bg-white/30 rounded-full animate-pulse delay-500" />
            <div className="absolute bottom-8 left-8 w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse delay-1000" />
          </>
        )}
      </AdaptiveCardContent>
    </AdaptiveCard>
  );
}

export default DashboardWelcome;
