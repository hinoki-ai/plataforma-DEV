'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useHydrationSafe } from '@/components/ui/hydration-error-boundary';
import { useLanguage } from '@/components/language/LanguageContext';
import { useRoleSwitching } from '@/hooks/useRoleSwitching';
import { UserRole } from '@prisma/client';

import {
  User,
  LogOut,
  ChevronDown,
  Shield,
  Calendar,
  BookOpen,
  Menu,
  Home,
  Building,
  Moon,
  Sun,
  Globe,
  Crown,
  Users as UsersIcon,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// ⚡ Performance: Move static config outside component to prevent recreation
const ROLE_CONFIG = {
  MASTER: { icon: Crown, color: 'text-yellow-500', name: 'Desarrollador' },
  ADMIN: { icon: Shield, color: 'text-red-500', name: 'Administrador' },
  PROFESOR: { icon: BookOpen, color: 'text-blue-500', name: 'Profesor' },
  PARENT: { icon: UsersIcon, color: 'text-green-500', name: 'Padre/Apoderado' },
  PUBLIC: { icon: Eye, color: 'text-gray-500', name: 'Público' },
  default: { icon: Building, color: 'text-gray-500', name: 'Usuario' },
} as const;

// Role switching configuration for MASTER users
const ROLE_SWITCH_CONFIG = [
  {
    role: 'MASTER' as UserRole,
    icon: Crown,
    name: 'Desarrollador',
    description: 'Acceso completo al sistema',
    color: 'text-yellow-500',
  },
  {
    role: 'ADMIN' as UserRole,
    icon: Shield,
    name: 'Administrador',
    description: 'Gestión administrativa',
    color: 'text-red-500',
  },
  {
    role: 'PROFESOR' as UserRole,
    icon: BookOpen,
    name: 'Profesor',
    description: 'Funciones docentes',
    color: 'text-blue-500',
  },
  {
    role: 'PARENT' as UserRole,
    icon: UsersIcon,
    name: 'Padre/Apoderado',
    description: 'Vista de padres',
    color: 'text-green-500',
  },
] as const;

// ⚡ Performance: Extract initials function to prevent recreation
const getInitials = (name?: string | null): string => {
  if (!name) return 'MP';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function LoginButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isHydrated = useHydrationSafe();

  // ⚡ Performance: Optimize session hook with better configuration
  const { data: session, status } = useSession({
    required: false,
  });

  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    switchRole,
    isSwitching,
    error,
    clearError,
    currentRole,
    hasSwitched,
  } = useRoleSwitching();

  // Remove manual theme handling - let ThemeProvider handle this

  // ⚡ Performance: Memoize click outside handler
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, handleClickOutside]);

  // ⚡ Performance: Memoize theme toggle function
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  // ⚡ Performance: Memoize language toggle function
  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'es' ? 'en' : 'es');
  }, [language, setLanguage]);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await signOut({
        callbackUrl: '/',
        redirect: true,
      });
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/');
    } finally {
      setIsLoggingOut(false);
    }
  }, [router]);

  // Role switching handler for MASTER users
  const handleRoleSwitch = useCallback(async (targetRole: UserRole) => {
    if (targetRole === currentRole) return;

    const result = await switchRole(targetRole);
    if (!result.success && result.error) {
      console.error('Role switch failed:', result.error);
    }
  }, [switchRole, currentRole]);

  // Clear errors when dropdown closes
  useEffect(() => {
    if (!isOpen && error) {
      clearError();
    }
  }, [isOpen, error, clearError]);

  // ⚡ Performance: Optimized role data calculation with static config
  const roleData = useMemo(() => {
    const role = session?.user?.role;
    const config =
      ROLE_CONFIG[role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.default;

    return {
      initials: getInitials(session?.user?.name),
      icon: config.icon,
      color: config.color,
      name: config.name,
    };
  }, [session?.user?.role, session?.user?.name]);

  if (status === 'loading' || !isHydrated) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        <div className="hidden md:block h-4 w-20 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-sm font-medium hover:bg-muted/50 transition-colors"
          onClick={() => router.push('/login')}
        >
          Portal Escolar
        </Button>
      </div>
    );
  }

  const RoleIcon = roleData.icon;

  return (
    <div ref={menuRef} className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              'relative h-10 w-auto flex items-center space-x-2 px-3 py-2',
              'hover:bg-muted/50 transition-all duration-200',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          >
            <Avatar className="h-8 w-8 border-2 border-border">
              <AvatarImage
                src={session.user.image || undefined}
                alt={session.user.name || 'Usuario'}
              />
              <AvatarFallback
                className={cn(
                  'text-xs font-bold',
                  roleData.color.replace('text-', 'bg-').replace('500', '100'),
                  'border border-border'
                )}
              >
                {roleData.initials}
              </AvatarFallback>
            </Avatar>

            <div className="hidden md:flex flex-col items-start">
              <span className="text-xs font-medium text-muted-foreground">
                {roleData.name}
              </span>
              <span className="text-sm font-semibold text-foreground">
                {session.user.name?.split(' ')[0]}
              </span>
            </div>

            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-64" align="end" sideOffset={8}>
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={session.user.image || undefined}
                  alt={session.user.name || 'Usuario'}
                />
                <AvatarFallback
                  className={cn(
                    'text-sm font-bold',
                    roleData.color.replace('text-', 'bg-').replace('500', '100')
                  )}
                >
                  {roleData.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {session.user.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session.user.email}
                </p>
                <div className="flex items-center space-x-1">
                  <RoleIcon className={cn('h-3 w-3', roleData.color)} />
                  <span className={cn('text-xs font-medium', roleData.color)}>
                    {roleData.name}
                  </span>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            {/* Role Switching Dropdown for MASTER users */}
            {session.user.role === 'MASTER' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem onSelect={e => e.preventDefault()}>
                    <Crown className="mr-2 h-4 w-4" />
                    <span>Cambiar Rol</span>
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={8} align="start" className="w-64">
                  <DropdownMenuLabel className="text-xs font-medium">
                    Seleccionar Rol de Prueba
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {ROLE_SWITCH_CONFIG.map((roleConfig) => {
                    const Icon = roleConfig.icon;
                    const isActive = roleConfig.role === currentRole;

                    return (
                      <DropdownMenuItem
                        key={roleConfig.role}
                        onClick={() => handleRoleSwitch(roleConfig.role)}
                        disabled={isActive || isSwitching}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <Icon className={cn('h-4 w-4', roleConfig.color)} />
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {roleConfig.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {roleConfig.description}
                          </div>
                        </div>
                        {isActive && (
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                        )}
                        {isSwitching && (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                  {hasSwitched && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleRoleSwitch('MASTER')}
                        disabled={isSwitching}
                        className="flex items-center gap-3 cursor-pointer text-yellow-600"
                      >
                        <Crown className="h-4 w-4" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            Volver a MASTER
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Rol original
                          </div>
                        </div>
                        {isSwitching && (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        )}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Dashboard Navigation Dropdown for MASTER users */}
            {session.user.role === 'MASTER' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem onSelect={e => e.preventDefault()}>
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={8} align="start">
                  <DropdownMenuItem asChild>
                    <Link href="/master" className="cursor-pointer">
                      <Crown className="mr-2 h-4 w-4" />
                      <span>Master Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profesor" className="cursor-pointer">
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>Profesor Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/parent" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Apoderado Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/" className="cursor-pointer">
                      <Home className="mr-2 h-4 w-4" />
                      <span>Inicio</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Error display for role switching */}
            {session.user.role === 'MASTER' && error && (
              <div className="px-2 py-1 text-xs text-destructive bg-destructive/10 rounded border">
                {error}
              </div>
            )}

            {/* Dashboard Navigation Dropdown for ADMIN users */}
            {session.user.role === 'ADMIN' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem onSelect={e => e.preventDefault()}>
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={8} align="start">
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profesor" className="cursor-pointer">
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>Profesor Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/parent" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Apoderado Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/" className="cursor-pointer">
                      <Home className="mr-2 h-4 w-4" />
                      <span>Inicio</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Dashboard Navigation Dropdown for PROFESOR users */}
            {session.user.role === 'PROFESOR' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem onSelect={e => e.preventDefault()}>
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={8} align="start">
                  <DropdownMenuItem asChild>
                    <Link href="/profesor" className="cursor-pointer">
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>Profesor Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/parent" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Apoderado Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/" className="cursor-pointer">
                      <Home className="mr-2 h-4 w-4" />
                      <span>Inicio</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Direct menu items for PARENT users */}
            {session.user.role === 'PARENT' && (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/parent" className="cursor-pointer">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Apoderado Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/" className="cursor-pointer">
                    <Menu className="mr-2 h-4 w-4" />
                    <span>Inicio</span>
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
              {isHydrated && theme === 'dark' ? (
                <Moon className="mr-2 h-4 w-4" />
              ) : (
                <Sun className="mr-2 h-4 w-4" />
              )}
              <span>
                Modo {isHydrated && theme === 'dark' ? 'Oscuro' : 'Claro'}
              </span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={toggleLanguage} className="cursor-pointer">
              <Globe className="mr-2 h-4 w-4" />
              <span>
                {language === 'es' ? 'Español' : 'English'}
              </span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-red-600 focus:text-red-600 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
