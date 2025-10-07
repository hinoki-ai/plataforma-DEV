"use client";

import React, { Suspense, lazy, ComponentType } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load dashboard components
const RoleAwareDashboard = lazy(() =>
  import("@/components/dashboard/RoleAwareDashboard").then((module) => ({
    default: module.RoleAwareDashboard,
  })),
);
const MasterDashboard = lazy(() =>
  import("@/components/master/MasterDashboard").then((module) => ({
    default: module.MasterDashboard,
  })),
);
const NotificationCenter = lazy(() =>
  import("@/components/notifications/NotificationCenter").then((module) => ({
    default: module.NotificationCenter,
  })),
);
const PerformanceMonitor = lazy(() =>
  import("@/components/performance/PerformanceMonitor").then((module) => ({
    default: module.PerformanceMonitor,
  })),
);

// Loading fallback component
function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-32 w-full rounded" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Error boundary for lazy loaded components
class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Lazy loading error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Error al cargar el componente. Inténtalo de nuevo.
              </p>
            </CardContent>
          </Card>
        )
      );
    }

    return this.props.children;
  }
}

// Lazy wrapper component with intersection observer for performance
function LazyWrapper({
  children,
  rootMargin = "50px",
}: {
  children: React.ReactNode;
  rootMargin?: string;
}) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin]);

  return <div ref={ref}>{isVisible ? children : <DashboardSkeleton />}</div>;
}

// Exported lazy components
export const LazyRoleAwareDashboard = (props: any) => (
  <LazyWrapper>
    <LazyErrorBoundary>
      <Suspense fallback={<DashboardSkeleton />}>
        <RoleAwareDashboard {...props} />
      </Suspense>
    </LazyErrorBoundary>
  </LazyWrapper>
);

export const LazyMasterDashboard = (props: any) => (
  <LazyWrapper>
    <LazyErrorBoundary>
      <Suspense fallback={<DashboardSkeleton />}>
        <MasterDashboard {...props} />
      </Suspense>
    </LazyErrorBoundary>
  </LazyWrapper>
);

export const LazyNotificationCenter = (props: any) => (
  <LazyWrapper>
    <LazyErrorBoundary>
      <Suspense fallback={<DashboardSkeleton />}>
        <NotificationCenter {...props} />
      </Suspense>
    </LazyErrorBoundary>
  </LazyWrapper>
);

export const LazyPerformanceMonitor = (props: any) => (
  <LazyWrapper>
    <LazyErrorBoundary>
      <Suspense fallback={<DashboardSkeleton />}>
        <PerformanceMonitor {...props} />
      </Suspense>
    </LazyErrorBoundary>
  </LazyWrapper>
);

// Utility function to preload critical components
export const preloadDashboardComponents = () => {
  // Preload critical components
  import("@/components/dashboard/RoleAwareDashboard");
  import("@/components/notifications/NotificationCenter");
};

// Utility function to preload all dashboard components
export const preloadAllDashboardComponents = () => {
  import("@/components/dashboard/RoleAwareDashboard");
  import("@/components/master/MasterDashboard");
  import("@/components/notifications/NotificationCenter");
  import("@/components/performance/PerformanceMonitor");
};
