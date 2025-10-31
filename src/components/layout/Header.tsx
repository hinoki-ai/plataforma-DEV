"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AdaptiveButton } from "@/components/ui/adaptive-button";
import { ChevronLeft, Menu, X } from "lucide-react";
import { useAppContext } from "@/components/providers/ContextProvider";
import { cn } from "@/lib/utils";
import UnifiedAuthButton from "./UnifiedAuthButton";
import ProfileCompletionBadge from "./ProfileCompletionBadge";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { SettingsHamburger } from "@/components/ui/settings-hamburger";
import { LanguageToggle } from "@/components/language/LanguageToggle";
import SkyToggle from "@/components/ui/sky-toggle";
import SoundToggle from "@/components/ui/sound-toggle";
import { useHydrationSafe } from "./hooks/useHydrationSafe";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const { context, isPublicRoute, isAuthRoute } = useAppContext();
  const { t } = useDivineParsing(["common", "navigation"]);

  const isClient = useHydrationSafe();

  // Determine if we're in authenticated context (use context-aware logic)
  const isAuthenticatedRoute = isClient && isAuthRoute;

  // Public navigation links
  const publicNavLinks = [
    { href: "/contacto", label: t("nav.contact", "navigation") },
    { href: "/programas", label: t("nav.programs", "navigation") },
    { href: "/planes", label: t("nav.plans", "navigation") },
    { href: "/cpma", label: t("cpma.title", "common") },
  ];

  // Show loading skeleton until mounted to prevent hydration mismatch
  if (!isClient) {
    return (
      <header className="bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-48 bg-muted/50 rounded animate-pulse" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-24 bg-muted/50 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* Skip Links for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
      >
        Saltar al contenido principal
      </a>
      <a
        href="#navigation"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:translate-y-12"
      >
        Saltar a navegación
      </a>

      <header className="bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Left: Logo/Branding */}
            <div className="flex items-center space-x-4">
              {isAuthenticatedRoute ? (
                // Authenticated: Logo + Dashboard Title
                <div className="flex items-center space-x-4">
                  {/* Dashboard Title */}
                  <div className="hidden md:block">
                    <h1 className="text-lg font-semibold text-foreground">
                      {pathname?.startsWith("/parent") &&
                        t("nav.parent_dashboard", "common")}
                      {pathname?.startsWith("/profesor") &&
                        t("nav.professor_area", "common")}
                      {pathname?.startsWith("/admin") &&
                        t("nav.admin_dashboard", "common")}
                    </h1>
                  </div>
                </div>
              ) : (
                // Public: Main site title
                <Link href="/" className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 text-lg font-semibold hover:bg-muted/50 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    <span>{t("school.name")}</span>
                  </Button>
                </Link>
              )}
            </div>

            {/* Right: Navigation and Unified Auth Button */}
            <div className="flex items-center space-x-2">
              {/* Profile Completion Badge - Authenticated users only */}
              {isAuthenticatedRoute && <ProfileCompletionBadge />}

              {/* Desktop Navigation - Public pages only */}
              {!isAuthenticatedRoute && (
                <nav
                  id="navigation"
                  className="hidden md:flex items-center space-x-2"
                >
                  {publicNavLinks.map((link) => (
                    <Button
                      key={link.href}
                      variant="ghost"
                      size="sm"
                      className="text-base font-medium hover:bg-muted/50 transition-colors"
                      asChild
                    >
                      <Link href={link.href}>{link.label}</Link>
                    </Button>
                  ))}
                </nav>
              )}

              {/* UNIFIED AUTH BUTTON - GOLD STANDARD - Morphs between states */}
              <div className="hidden md:flex">
                <UnifiedAuthButton />
              </div>

              {/* Mobile Menu Button - Public pages only */}
              {!isAuthenticatedRoute && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden h-11 w-11"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label={t("nav.toggle.menu", "navigation")}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Navigation Menu - Public pages only */}
          {!isAuthenticatedRoute && isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="md:hidden fixed inset-0 bg-black/50 z-40"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              {/* Menu Panel */}
              <div className="md:hidden fixed left-0 right-0 top-0 w-full bg-background z-50 overflow-y-auto shadow-xl max-h-[90vh]">
                <div className="flex flex-col">
                  {/* Header with Close Button */}
                  <div className="bg-background border-b border-border z-10 px-4 py-4 flex items-center justify-between backdrop-blur supports-backdrop-filter:bg-background/95">
                    <Link
                      href="/"
                      className="flex items-center space-x-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-xl font-bold text-foreground">
                        {t("school.name")}
                      </span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10"
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-label={
                        t("nav.close.menu", "navigation") || "Close menu"
                      }
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Navigation Links Section */}
                  <div className="px-4 py-6">
                    <nav className="grid grid-cols-2 gap-2">
                      {/* Row 1: First 2 nav links */}
                      {publicNavLinks.slice(0, 2).map((link) => (
                        <Button
                          key={link.href}
                          variant="ghost"
                          size="lg"
                          className="justify-start text-base font-medium hover:bg-muted/50 transition-colors w-full h-auto py-3"
                          asChild
                        >
                          <Link
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {link.label}
                          </Link>
                        </Button>
                      ))}

                      {/* Row 2: Next 2 nav links */}
                      {publicNavLinks.slice(2, 4).map((link) => (
                        <Button
                          key={link.href}
                          variant="ghost"
                          size="lg"
                          className="justify-start text-base font-medium hover:bg-muted/50 transition-colors w-full h-auto py-3"
                          asChild
                        >
                          <Link
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {link.label}
                          </Link>
                        </Button>
                      ))}

                      {/* Row 3: Portal Escolar | Language Toggle */}
                      <Button
                        variant="ghost"
                        size="lg"
                        className="justify-start text-base font-medium hover:bg-muted/50 transition-colors w-full h-auto py-3"
                        asChild
                      >
                        <Link
                          href="/login"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {t("nav.school.portal", "navigation")}
                        </Link>
                      </Button>
                      <div className="w-full h-auto py-3 flex items-center justify-start pl-[30px]">
                        <div className="scale-[1.2]">
                          <LanguageToggle size="sm" />
                        </div>
                      </div>

                      {/* Row 4: Sky Toggle | Sound Toggle */}
                      <div className="w-full h-auto py-3 flex items-center justify-start pl-[30px]">
                        <div className="scale-[1.2]">
                          <SkyToggle size="sm" />
                        </div>
                      </div>
                      <div className="w-full h-auto py-3 flex items-center justify-start pl-[30px]">
                        <div className="scale-[1.2]">
                          <SoundToggle size="sm" />
                        </div>
                      </div>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </header>
    </>
  );
}
