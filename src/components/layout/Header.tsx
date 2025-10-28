"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AdaptiveButton } from "@/components/ui/adaptive-button";
import { ChevronLeft, Menu, X } from "lucide-react";
import { useAppContext } from "@/components/providers/ContextProvider";
import { cn } from "@/lib/utils";
import LoginButton from "./LoginButton";
import ProfileCompletionBadge from "./ProfileCompletionBadge";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import SkyToggle from "@/components/ui/sky-toggle";
import SoundToggle from "@/components/ui/sound-toggle";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const { context, isPublicRoute, isAuthRoute } = useAppContext();
  const { t } = useDivineParsing(["common", "navigation"]);

  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if we're in authenticated context (use context-aware logic)
  const isAuthenticatedRoute = mounted && isAuthRoute;

  // Reset mobile menu state on route changes to prevent stuck states
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Public navigation links
  const publicNavLinks = [
    { href: "/programas", label: "Programas" },
    { href: "/testimonios", label: "Testimonios" },
    { href: "/precios", label: "Precios" },
    { href: "/contacto", label: "Contacto" },
  ];

  // Show loading skeleton until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm border-b border-border sticky top-0 z-50">
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
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm border-b border-border sticky top-0 z-50">
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

          {/* Right: Navigation and Login */}
          <div className="flex items-center space-x-2">
            {/* Profile Completion Badge - Authenticated users only */}
            {isAuthenticatedRoute && <ProfileCompletionBadge />}

            {/* Desktop Navigation - Public pages only */}
            {!isAuthenticatedRoute && (
              <div className="hidden md:flex items-center space-x-2">
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
              </div>
            )}

            {/* Desktop: Login Button and Toggles */}
            <div className="hidden md:flex items-center space-x-2">
              <LoginButton />
              <SoundToggle size="sm" />
              <SkyToggle size="sm" />
            </div>

            {/* Mobile Menu Button - Public pages only */}
            {!isAuthenticatedRoute && (
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
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
              className="md:hidden fixed inset-0 top-[57px] bg-black/50 z-30"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <div className="md:hidden fixed inset-x-0 top-[57px] bottom-0 bg-background z-40 overflow-y-auto">
              <div className="flex flex-col h-full">
                {/* Logo Section */}
                <div className="px-6 py-6 border-b border-border">
                  <Link
                    href="/"
                    className="flex items-center space-x-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-xl font-bold text-foreground">
                      {t("school.name")}
                    </span>
                  </Link>
                </div>

                {/* Navigation Links Section */}
                <div className="flex-1 px-4 py-6">
                  <div className="flex flex-col space-y-2">
                    {publicNavLinks.map((link) => (
                      <Button
                        key={link.href}
                        variant="ghost"
                        size="lg"
                        className="justify-start text-base font-medium hover:bg-muted/50 transition-colors"
                        asChild
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Link href={link.href}>{link.label}</Link>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Settings Controls Section */}
                <div className="px-6 py-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    Controles
                  </p>
                  <div className="flex items-center justify-center space-x-6">
                    <SoundToggle size="md" />
                    <SkyToggle size="md" />
                  </div>
                </div>

                {/* Authentication Section */}
                <div className="px-6 py-6 border-t border-border">
                  <LoginButton />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
