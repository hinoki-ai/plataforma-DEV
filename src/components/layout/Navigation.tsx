"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { LanguageToggle } from "@/components/language/LanguageToggle";
import { useResponsiveMode } from "@/lib/hooks/useDesktopToggle";
import { navigation, layout } from "@/lib/responsive-utils";
import { useTheme } from "next-themes";
// 🕊️ DIVINE PARSING ORACLE - Enhanced navigation with route-based loading
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { isDesktopForced } = useResponsiveMode();
  const { t } = useDivineParsing(["common"]);

  // 🕊️ DIVINE PARSING ORACLE - Route-based namespace loading
  const divineOracle = useDivineParsing();

  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load route-specific namespaces
  useEffect(() => {
    const loadRouteNamespaces = () => {
      const namespacesToLoad: string[] = [];

      if (pathname.startsWith("/admin")) {
        namespacesToLoad.push("admin", "dashboard");
      } else if (pathname.startsWith("/profesor")) {
        namespacesToLoad.push("profesor", "dashboard");
      } else if (pathname.startsWith("/parent")) {
        namespacesToLoad.push("parent", "dashboard");
      }

      if (namespacesToLoad.length > 0) {
        divineOracle.preinvokeOracles(namespacesToLoad);
      }
    };

    loadRouteNamespaces();
  }, [pathname, divineOracle]);

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingOut(true);
    try {
      // Clear browser storage and autofill data
      localStorage.clear();
      sessionStorage.clear();

      // Clear form autofill data
      if (typeof window !== "undefined") {
        // Clear any stored credentials in forms
        const forms = document.querySelectorAll("form");
        forms.forEach((form) => {
          const inputs = form.querySelectorAll(
            'input[type="email"], input[type="password"]',
          );
          inputs.forEach((input) => {
            (input as HTMLInputElement).value = "";
            (input as HTMLInputElement).defaultValue = "";
          });
        });
      }

      // Use client-side signOut which is more reliable
      await signOut();

      // Use Next.js router for navigation
      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
      // Fallback to router push
      router.push("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // 🕊️ DIVINE PARSING ORACLE - Performance monitoring (dev mode only)
  const translationStats =
    process.env.NODE_ENV === "development"
      ? divineOracle.getTranslationStats()
      : null;

  // Show loading skeleton until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <nav className="bg-background shadow-sm border-b border-border relative">
        <div className={layout.container(isDesktopForced)}>
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-8 w-48 bg-muted/50 rounded animate-pulse" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-24 bg-muted/50 rounded animate-pulse" />
              <div className="h-8 w-8 bg-muted/50 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-background shadow-sm border-b border-border relative">
      <div className={layout.container(isDesktopForced)}>
        <div className="flex justify-between items-center py-4">
          {/* MAIN PAGE ONLY: Left side - Corner to Center */}
          {!(
            pathname.startsWith("/admin") ||
            pathname.startsWith("/profesor") ||
            pathname.startsWith("/parent")
          ) ? (
            <>
              {/* CENTER CONTENT: Title only */}
              <div className="flex items-center">
                {/* Position 3: "Plataforma Astral" text/button */}
                <Link
                  href="/"
                  className="text-xl font-bold text-foreground hover:text-primary transition-colors ml-4"
                >
                  Plataforma Astral
                </Link>
              </div>

              {/* Empty div to maintain flex layout */}
              <div></div>

              {/* Mobile menu button */}
              <div className={navigation.menu.mobile(isDesktopForced)}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(!isOpen)}
                  className="text-sm font-medium transition-all duration-200 hover:bg-muted/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label="Alternar menú"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {isOpen ? (
                      <path d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </Button>
              </div>
            </>
          ) : (
            /* ADMIN/PROFESOR ROUTES: Keep original simple layout */
            <>
              <div className="flex items-center">{/* Logo removed */}</div>

              {/* Mobile menu button */}
              <div className={navigation.menu.mobile(isDesktopForced)}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(!isOpen)}
                  className="text-sm font-medium transition-all duration-200 hover:bg-muted/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={t("nav.toggle.menu", "navigation")}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {isOpen ? (
                      <path d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </Button>
              </div>

              {/* ModeToggle absolutely positioned for admin/profesor */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 z-50 pointer-events-auto">
                <div className="flex items-center gap-2">
                  <LanguageToggle />
                  <ModeToggle />
                </div>
              </div>
            </>
          )}

          {/* FAVICONS ABSOLUTELY POSITIONED IN LEFT CORNER - MAIN PAGE ONLY */}
          {!(
            pathname.startsWith("/admin") ||
            pathname.startsWith("/profesor") ||
            pathname.startsWith("/parent")
          ) && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50 pointer-events-auto">
              <div className="flex items-center space-x-1">
                {/* Developer favicon removed */}

                {/* Position 2: Client favicon - Plataforma Astral branding */}
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-background shadow border border-border transition-all duration-300 overflow-hidden">
                  <Image
                    src="/dfav.png"
                    alt="Plataforma Astral"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </span>
              </div>
            </div>
          )}

          {/* BUTTON BUNDLE ABSOLUTELY POSITIONED IN RIGHT CORNER - MAIN PAGE ONLY */}
          {!(
            pathname.startsWith("/admin") ||
            pathname.startsWith("/profesor") ||
            pathname.startsWith("/parent")
          ) && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-50 pointer-events-auto">
              <div className={navigation.menu.desktop(isDesktopForced)}>
                <div className="flex items-center space-x-0">
                  {/* Position 7: CFMG Center of Fathers, Mothers and Guardians */}
                  <Link
                    href="/cpma"
                    className="text-sm font-medium hover:bg-muted/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 px-3 py-2 rounded-md transition-all duration-200"
                  >
                    {t("nav.center.council", "navigation")}
                  </Link>

                  {/* Position 2: Portal Escolar/Cerrar Sesión */}
                  {!session ? (
                    <Link
                      href="/login"
                      className="text-sm font-medium hover:bg-muted/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 px-3 py-2 rounded-md transition-all duration-200 cursor-pointer"
                      prefetch={false}
                    >
                      {t("nav.school.portal", "navigation")}
                    </Link>
                  ) : (
                    <form onSubmit={handleLogout}>
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        disabled={isLoggingOut}
                        className="text-sm font-medium transition-all duration-200 hover:bg-muted/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                      >
                        {isLoggingOut ? "..." : t("nav.logout", "navigation")}
                      </Button>
                    </form>
                  )}

                  {/* Position 1: Toggle buttons - rightmost */}
                  <div className="flex items-center gap-2">
                    <LanguageToggle />
                    <ModeToggle />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {isOpen && !isDesktopForced && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2 px-4">
              {/* Only show these buttons if NOT on admin or profesor routes */}
              {!(
                pathname.startsWith("/admin") ||
                pathname.startsWith("/profesor") ||
                pathname.startsWith("/parent")
              ) ? (
                <>
                  <Link
                    href="/cpma"
                    className="w-full text-sm font-medium hover:bg-muted/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 justify-start px-3 py-2 rounded-md text-left"
                  >
                    {t("nav.center.council", "navigation")}
                  </Link>
                </>
              ) : null}
              {!session ? (
                <Link
                  href="/login"
                  className="w-full text-sm font-medium transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 justify-start px-3 py-2 rounded-md text-left cursor-pointer"
                  prefetch={false}
                >
                  Portal Escolar
                </Link>
              ) : (
                <div className="pt-2 border-t border-border">
                  <form onSubmit={handleLogout}>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      disabled={isLoggingOut}
                      className="w-full text-sm font-medium hover:bg-muted/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 justify-start disabled:opacity-50"
                    >
                      {isLoggingOut ? "Cerrando..." : "Cerrar Sesión"}
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 🕊️ DIVINE PARSING ORACLE - Development debug info */}
      {process.env.NODE_ENV === "development" && translationStats && (
        <div className="fixed bottom-4 left-4 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 text-xs font-mono shadow-lg z-50 max-w-xs">
          <div className="text-primary font-bold mb-2">🕊️ Divine Oracle</div>
          <div>Total Keys: {translationStats.totalKeys}</div>
          <div>Namespaces: {translationStats.loadedNamespaces}</div>
          <div>Cache Hit: {translationStats.cacheHitRate.toFixed(1)}%</div>
          <div>Avg Load: {translationStats.loadTime.toFixed(1)}ms</div>
          <div className="mt-2 text-muted-foreground">
            Loaded: {divineOracle.getLoadedNamespaces().join(", ")}
          </div>
        </div>
      )}
    </nav>
  );
}
