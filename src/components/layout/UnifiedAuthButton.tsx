"use client";

import { useState } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useHydrationSafe } from "@/components/ui/hydration-error-boundary";
import { useAppContext } from "@/components/providers/ContextProvider";
import { useDivineParsing } from "@/components/language/useDivineLanguage";

import {
  User,
  LogOut,
  ChevronDown,
  Crown,
  Shield,
  Calendar,
  BookOpen,
  Menu,
  Home,
  Building,
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
import SkyToggle from "@/components/ui/sky-toggle";
import SoundToggle from "@/components/ui/sound-toggle";
import { LanguageToggle } from "@/components/language/LanguageToggle";

// ⚡ Performance: Move static config outside component to prevent recreation
const ROLE_CONFIG = {
  MASTER: {
    icon: Crown,
    color: "text-yellow-500",
    nameKey: "user.role.master" as const,
  },
  ADMIN: {
    icon: Shield,
    color: "text-red-500",
    nameKey: "user.role.admin" as const,
  },
  PROFESOR: {
    icon: BookOpen,
    color: "text-blue-500",
    nameKey: "user.role.profesor" as const,
  },
  PARENT: {
    icon: UsersIcon,
    color: "text-green-500",
    nameKey: "user.role.parent" as const,
  },
  PUBLIC: {
    icon: Eye,
    color: "text-gray-500",
    nameKey: "user.role.public" as const,
  },
  default: {
    icon: Building,
    color: "text-gray-500",
    nameKey: "user.role.default" as const,
  },
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
  const [isPublicSettingsOpen, setIsPublicSettingsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isHydrated = useHydrationSafe();

  // ⚡ Performance: Optimize session hook with better configuration
  const { data: session, status } = useSession();

  const router = useRouter();
  const { isAuthRoute } = useAppContext();
  const { t } = useDivineParsing(["common"]);

  // More robust authentication check - consistent with ContextProvider
  // Only consider authenticated if we have a complete session with user data
  const isAuthenticated =
    status === "authenticated" &&
    Boolean(session?.user) &&
    Boolean(session?.user?.id);
  const isAuthenticatedRoute = isHydrated && isAuthRoute;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: "/" });
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
      name: t(config.nameKey, "common"),
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
  // Only show when explicitly unauthenticated or during loading with no session
  if (!isAuthenticated) {
    // Debug: Log when public state is shown
    console.warn(
      "🔐 [UnifiedAuthButton] Showing PUBLIC state - Auth check failed:",
      {
        status,
        hasSession: !!session,
        hasUser: !!session?.user,
        hasUserId: !!session?.user?.id,
        userRole: session?.user?.role,
        isAuthenticated,
        timestamp: new Date().toISOString(),
      },
    );
    return (
      <div className="flex items-center space-x-2">
        {/* Portal Escolar Button */}
        <Button
          variant="ghost"
          size="default"
          className="text-base font-medium hover:bg-muted/50 transition-colors"
          onClick={() => router.push("/login")}
        >
          {t("nav.school.portal", "navigation")}
        </Button>

        {/* Settings Gear Button - Hidden on mobile since it's in the menu */}
        <DropdownMenu
          open={isPublicSettingsOpen}
          onOpenChange={setIsPublicSettingsOpen}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex w-9 h-9 hover:bg-muted/50 transition-colors"
              title={t("ui.settings.label", "common")}
            >
              <Settings2 className="h-[1.1rem] w-[1.1rem]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-10">
            <DropdownMenuGroup>
              <div className="flex flex-col items-center gap-4 p-2">
                <div className="transform scale-125">
                  <SkyToggle size="sm" />
                </div>
                <div className="transform scale-125">
                  <SoundToggle size="sm" />
                </div>
                <div className="transform scale-125">
                  <LanguageToggle size="sm" />
                </div>
              </div>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // AUTHENTICATED STATE: User Profile + Advanced Settings Gear
  // TypeScript guard: we know session exists here because isAuthenticated check passed
  if (!session?.user) {
    // This should never happen, but TypeScript needs it
    return null;
  }

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

        <DropdownMenuContent className="w-72" align="end" sideOffset={8}>
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
                <span>{t("nav.dashboard", "navigation")}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/" className="cursor-pointer">
                <Home className="mr-2 h-4 w-4" />
                <span>{t("nav.home", "navigation")}</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <div className="flex items-center justify-center py-2">
              <SkyToggle size="sm" />
            </div>
            <div className="flex items-center justify-center py-2">
              <SoundToggle size="sm" />
            </div>
            <div className="flex items-center justify-center py-2">
              <div onClick={(e) => e.stopPropagation()}>
                <LanguageToggle size="sm" />
              </div>
            </div>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-red-600 focus:text-red-600 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>
              {isLoggingOut
                ? t("nav.logout.loading", "navigation")
                : t("nav.logout", "navigation")}
            </span>
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
