"use client";

import React, { Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/Header";
import { usePathname } from "next/navigation";
import { NavigationSkeleton } from "@/components/ui/loading-skeletons";
import HydratedLayoutWrapper from "./HydratedLayoutWrapper";
import { UnifiedErrorBoundary } from "@/components/ui/unified-error-boundary";
import { MobileSidebar } from "./MobileSidebar";
import { useHydrationSafe } from "@/components/ui/hydration-error-boundary";
import { useSidebarState } from "./hooks/useSidebarState";
import { useSidebarGestures } from "./hooks/useSidebarGestures";
import { NavigationProvider } from "./NavigationContext";
import { NetworkErrorBoundary } from "@/components/ui/network-error-boundary";
import { JoshOnboarding } from "@/components/onboarding/JoshOnboarding";

interface ClientLayoutProviderProps {
  children: React.ReactNode;
}

function ClientLayoutContent({ children }: ClientLayoutProviderProps) {
  const isHydrated = useHydrationSafe();
  const { data: session, status } = useSession();
  // Sidebar state management
  const pathname = usePathname();

  const [isSidebarHighlighted, setIsSidebarHighlighted] = React.useState(false);

  const { isSidebarCollapsed, setIsSidebarCollapsed } =
    useSidebarState(isHydrated);

  // Mobile gesture handling
  const { onTouchStart, onTouchMove, onTouchEnd } = useSidebarGestures({
    onToggleSidebar: setIsSidebarCollapsed,
    isSidebarCollapsed,
  });

  const handleToggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  // Pages that use FixedBackgroundLayout and need full-screen rendering
  const isFullScreenPage =
    pathname?.startsWith("/equipo-multidisciplinario") ||
    pathname === "/cpma" ||
    pathname?.startsWith("/fotos-videos");

  // Special layout for full-screen pages (no sidebar, no container constraints)
  if (isFullScreenPage) {
    return (
      <div className="min-h-screen">
        <Suspense
          fallback={
            <div className="h-16 bg-background border-b animate-pulse" />
          }
        >
          <Header />
        </Suspense>
        {/* Render children without container constraints for full-screen background */}
        {children}
      </div>
    );
  }

  // Don't show any loading state at layout level - let pages handle their own loading
  // This prevents dual loaders

  // Layout for non-authenticated users (no sidebar)
  if (!session && status === "unauthenticated") {
    return (
      <div className="min-h-screen">
        <Suspense fallback={<NavigationSkeleton />}>
          <Header />
        </Suspense>
        <main className="container mx-auto px-4 py-8 max-w-full">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <Suspense fallback={<NavigationSkeleton />}>
        <Header />
      </Suspense>
      <div className="flex flex-1 relative">
        {/* Desktop Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={handleToggleSidebar}
          className={cn(
            "hidden md:flex",
            isSidebarHighlighted &&
              "z-50 relative shadow-2xl ring-2 ring-primary/50",
          )}
        />

        {/* Mobile Sidebar Components - Always render trigger button */}
        <MobileSidebar
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <main
            className={cn(
              "flex-1 w-full transition-all duration-300",
              "px-4 md:px-6 lg:px-8 pt-2 md:pt-3 lg:pt-4 pb-4 md:pb-6 lg:pb-8",
              "max-w-full overflow-y-auto",
            )}
          >
            {children}
          </main>
        </div>
      </div>
      <JoshOnboarding onHighlightSidebar={setIsSidebarHighlighted} />
    </div>
  );
}

export default function ClientLayoutProvider({
  children,
}: ClientLayoutProviderProps) {
  return (
    <div data-layout-provider="true">
      <UnifiedErrorBoundary
        context="client_layout"
        variant="minimal"
        enableRetry={true}
        enableHome={true}
        showDetails={process.env.NODE_ENV === "development"}
      >
        <HydratedLayoutWrapper>
          <NavigationProvider>
            <ClientLayoutContent>{children}</ClientLayoutContent>
          </NavigationProvider>
        </HydratedLayoutWrapper>
      </UnifiedErrorBoundary>
    </div>
  );
}
