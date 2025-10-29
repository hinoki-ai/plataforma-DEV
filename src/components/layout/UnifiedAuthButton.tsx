"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useHydrationSafe } from "@/components/ui/hydration-error-boundary";
import { useLanguage } from "@/components/language/LanguageContext";
import { useAppContext } from "@/components/providers/ContextProvider";
import { useDivineParsing } from "@/components/language/useDivineLanguage";

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
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AdvancedButton } from "@/components/master/SmartSettingsButton";

// ⚡ Performance: Move static config outside component to prevent recreation
const ROLE_CONFIG = {
  MASTER: { icon: Crown, color: "text-yellow-500", name: "Desarrollador" },
  ADMIN: { icon: Shield, color: "text-red-500", name: "Administrador" },
  PROFESOR: { icon: BookOpen, color: "text-blue-500", name: "Profesor" },
  PARENT: { icon: UsersIcon, color: "text-green-500", name: "Padre/Apoderado" },
  PUBLIC: { icon: Eye, color: "text-gray-500", name: "Público" },
  default: { icon: Building, color: "text-gray-500", name: "Usuario" },
} as const;

// ⚡ Performance: Extract initials function to prevent recreation
const getInitials = (name?: string | null): string => {
  if (!name) return "MP";
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * UNIFIED AUTH BUTTON - GOLD STANDARD
 *
 * Morphs between different states:
 * - Public: Portal Escolar + Settings (gear icon)
 * - Authenticated: User profile + Advanced settings (gear icon)
 *
 * Single button that transforms based on authentication state.
 */
export default function UnifiedAuthButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isHydrated = useHydrationSafe();

  // ⚡ Performance: Optimize session hook with better configuration
  const { data: session, status } = useSession();

  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const { isAuthRoute } = useAppContext();
  const { t } = useDivineParsing(["common"]);

  const isAuthenticated = !!session?.user && status === "authenticated";
  const isAuthenticatedRoute = isHydrated && isAuthRoute;

  // ⚡ Performance: Memoize theme toggle function
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // ⚡ Performance: Memoize language toggle function
  const toggleLanguage = () => {
    setLanguage(language === "es" ? "en" : "es");
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // ⚡ Performance: Optimized role data calculation with static config
  const roleData = (() => {
    const role = session?.user?.role;
    const config =
      ROLE_CONFIG[role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.default;

    return {
      initials: getInitials(session?.user?.name),
      icon: config.icon,
      color: config.color,
      name: config.name,
    };
  })();

  if (status === "loading" || !isHydrated) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        <div className="hidden md:block h-4 w-20 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  // PUBLIC STATE: Portal Escolar + Settings Gear
  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-2">
        {/* Portal Escolar Button */}
        <Button
          variant="ghost"
          size="sm"
          className="text-sm font-medium hover:bg-muted/50 transition-colors"
          onClick={() => router.push("/login")}
        >
          Portal Escolar
        </Button>

        {/* Settings Gear Button - Hidden on mobile since it's in the menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex w-8 h-8 hover:bg-muted/50 transition-colors"
              title="Configuración"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Configuración</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={toggleTheme}
                className="cursor-pointer"
              >
                {theme === "dark" ? (
                  <Moon className="mr-2 h-4 w-4" />
                ) : (
                  <Sun className="mr-2 h-4 w-4" />
                )}
                <span>Modo {theme === "dark" ? "Claro" : "Oscuro"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={toggleLanguage}
                className="cursor-pointer"
              >
                <Globe className="mr-2 h-4 w-4" />
                <span>{language === "es" ? "English" : "Español"}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // AUTHENTICATED STATE: User Profile + Advanced Settings Gear
  const RoleIcon = roleData.icon;

  return (
    <div className="flex items-center space-x-2">
      {/* User Profile Button */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "relative h-10 w-auto flex items-center space-x-2 px-3 py-2",
              "hover:bg-muted/50 transition-all duration-200",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          >
            <Avatar className="h-8 w-8 border-2 border-border">
              <AvatarImage
                src={session.user.image || undefined}
                alt={session.user.name || "Usuario"}
              />
              <AvatarFallback
                className={cn(
                  "text-xs font-bold",
                  roleData.color.replace("text-", "bg-").replace("500", "100"),
                  "border border-border",
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
                {session.user.name?.split(" ")[0]}
              </span>
            </div>

            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-180",
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
                  alt={session.user.name || "Usuario"}
                />
                <AvatarFallback
                  className={cn(
                    "text-sm font-bold",
                    roleData.color
                      .replace("text-", "bg-")
                      .replace("500", "100"),
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
                  <RoleIcon className={cn("h-3 w-3", roleData.color)} />
                  <span className={cn("text-xs font-medium", roleData.color)}>
                    {roleData.name}
                  </span>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            {/* Dashboard Navigation */}
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="cursor-pointer">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/" className="cursor-pointer">
                <Home className="mr-2 h-4 w-4" />
                <span>Inicio</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
              {theme === "dark" ? (
                <Moon className="mr-2 h-4 w-4" />
              ) : (
                <Sun className="mr-2 h-4 w-4" />
              )}
              <span>Modo {theme === "dark" ? "Claro" : "Oscuro"}</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={toggleLanguage}
              className="cursor-pointer"
            >
              <Globe className="mr-2 h-4 w-4" />
              <span>{language === "es" ? "English" : "Español"}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-red-600 focus:text-red-600 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Advanced Settings Gear Button - Only when authenticated on desktop */}
      {isAuthenticatedRoute && (
        <div className="hidden md:block">
          <AdvancedButton />
        </div>
      )}
    </div>
  );
}
