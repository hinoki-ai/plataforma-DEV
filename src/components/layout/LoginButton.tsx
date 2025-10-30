"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useHydrationSafe } from "@/components/ui/hydration-error-boundary";
import { useLanguage } from "@/components/language/LanguageContext";

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

// ⚡ Performance: Move static config outside component to prevent recreation
const ROLE_CONFIG = {
  MASTER: {
    icon: Crown,
    color: "text-yellow-500",
    translationKey: "user.role.master",
  },
  ADMIN: { icon: Shield, color: "text-red-500", translationKey: "user.role.admin" },
  PROFESOR: {
    icon: BookOpen,
    color: "text-blue-500",
    translationKey: "user.role.profesor",
  },
  PARENT: {
    icon: UsersIcon,
    color: "text-green-500",
    translationKey: "user.role.parent",
  },
  PUBLIC: { icon: Eye, color: "text-gray-500", translationKey: "user.role.public" },
  default: {
    icon: Building,
    color: "text-gray-500",
    translationKey: "user.role.default",
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

export default function LoginButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isHydrated = useHydrationSafe();

  // ⚡ Performance: Optimize session hook with better configuration
  const { data: session, status } = useSession();

  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Remove manual theme handling - let ThemeProvider handle this

  // ⚡ Performance: Memoize click outside handler
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, handleClickOutside]);

  // ⚡ Performance: Memoize theme toggle function
  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  // ⚡ Performance: Memoize language toggle function
  const toggleLanguage = useCallback(() => {
    setLanguage(language === "es" ? "en" : "es");
  }, [language, setLanguage]);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/");
    } finally {
      setIsLoggingOut(false);
    }
  }, [router]);

  // ⚡ Performance: Optimized role data calculation with static config
  const roleData = useMemo(() => {
    const role = session?.user?.role;
    const config =
      ROLE_CONFIG[role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.default;

    return {
      initials: getInitials(session?.user?.name),
      icon: config.icon,
      color: config.color,
      nameKey: config.translationKey,
    };
  }, [session?.user?.role, session?.user?.name]);

  if (status === "loading" || !isHydrated) {
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
          className="text-base font-medium hover:bg-muted/50 transition-colors"
          onClick={() => router.push("/login")}
        >
          {t("auth.portal_title", "common")}
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
              "relative h-10 w-auto flex items-center space-x-2 px-3 py-2",
              "hover:bg-muted/50 transition-all duration-200",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          >
              <Avatar className="h-8 w-8 border-2 border-border">
              <AvatarImage
                src={session.user.image || undefined}
                  alt={session.user.name || t("user.role.default", "common")}
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
                {t(roleData.nameKey, "common")}
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
                  alt={session.user.name || t("user.role.default", "common")}
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
                    {t(roleData.nameKey, "common")}
                  </span>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            {/* Dashboard Navigation Dropdown for MASTER users */}
            {session.user.role === "MASTER" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{t("nav.dashboard", "navigation")}</span>
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  sideOffset={8}
                  align="start"
                  className="w-56"
                >
                  <DropdownMenuItem
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/master");
                    }}
                    className="cursor-pointer"
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    <span>{t("master.dashboard.title", "common")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/admin");
                    }}
                    className="cursor-pointer"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    <span>{t("admin.dashboard", "admin")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/profesor");
                    }}
                    className="cursor-pointer"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>{t("profesor.dashboard", "profesor")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/parent");
                    }}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>{t("parent.dashboard", "parent")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/");
                    }}
                    className="cursor-pointer"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    <span>{t("nav.home", "navigation")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Dashboard Navigation Dropdown for ADMIN users */}
            {session.user.role === "ADMIN" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{t("nav.dashboard", "navigation")}</span>
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  sideOffset={8}
                  align="start"
                  className="w-56"
                >
                  <DropdownMenuItem
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/admin");
                    }}
                    className="cursor-pointer"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    <span>{t("admin.dashboard", "admin")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/profesor");
                    }}
                    className="cursor-pointer"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>{t("profesor.dashboard", "profesor")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/parent");
                    }}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>{t("parent.dashboard", "parent")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/");
                    }}
                    className="cursor-pointer"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    <span>{t("nav.home", "navigation")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Dashboard Navigation Dropdown for PROFESOR users */}
            {session.user.role === "PROFESOR" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{t("nav.dashboard", "navigation")}</span>
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  sideOffset={8}
                  align="start"
                  className="w-56"
                >
                  <DropdownMenuItem
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/profesor");
                    }}
                    className="cursor-pointer"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>{t("profesor.dashboard", "profesor")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/parent");
                    }}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>{t("parent.dashboard", "parent")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/");
                    }}
                    className="cursor-pointer"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    <span>{t("nav.home", "navigation")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Direct menu items for PARENT users */}
            {session.user.role === "PARENT" && (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/parent" className="cursor-pointer">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{t("parent.dashboard", "parent")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/" className="cursor-pointer">
                    <Menu className="mr-2 h-4 w-4" />
                    <span>{t("nav.home", "navigation")}</span>
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
              {isHydrated && theme === "dark" ? (
                <Moon className="mr-2 h-4 w-4" />
              ) : (
                <Sun className="mr-2 h-4 w-4" />
              )}
              <span>
                {t(
                  isHydrated && theme === "dark"
                    ? "appearance.theme_dark"
                    : "appearance.theme_light",
                  "common",
                )}
              </span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={toggleLanguage}
              className="cursor-pointer"
            >
              <Globe className="mr-2 h-4 w-4" />
              <span>
                {t(
                  language === "es" ? "language.spanish" : "language.english",
                  "language",
                )}
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
            <span>
              {isLoggingOut
                ? t("nav.logout.loading", "navigation")
                : t("nav.logout", "navigation")}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
