// ⚡ Performance: Dynamic imports utility for better code splitting
"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { SkeletonLoader } from "@/components/ui/dashboard-loader";

// ⚡ Performance: Unified skeleton components for dynamic imports
const CardSkeleton = () => <SkeletonLoader variant="card" lines={2} />;
const CalendarSkeleton = () => <SkeletonLoader variant="content" lines={6} />;
const DashboardSkeleton = () => <SkeletonLoader variant="content" lines={8} />;
const ChartSkeleton = () => <SkeletonLoader variant="content" lines={4} />;
const StatsSkeleton = () => <SkeletonLoader variant="list" lines={4} />;
const DocumentSkeleton = () => <SkeletonLoader variant="content" lines={12} />;
const InputSkeleton = () => <SkeletonLoader variant="content" lines={1} />;

/**
 * Enhanced dynamic import wrapper with loading states and error boundaries
 */
export function createDynamicComponent(
  importFn: () => Promise<{ default: React.ComponentType<any> }>,
  options?: {
    loading?: () => React.ReactElement;
    ssr?: boolean;
    displayName?: string;
  },
) {
  const Component = dynamic(importFn, {
    loading: options?.loading || (() => <CardSkeleton />),
    ssr: options?.ssr ?? true,
  });

  if (options?.displayName) {
    Component.displayName = options.displayName;
  }

  return Component;
}

/**
 * Specialized dynamic imports for different component types
 */

// ⚡ Performance: Calendar components - lazy loaded to reduce initial bundle
export const CalendarComponents = {
  UnifiedCalendarView: createDynamicComponent(
    () => import("@/components/calendar/UnifiedCalendarView"),
    {
      loading: () => <CalendarSkeleton />,
      displayName: "UnifiedCalendarView",
      ssr: false, // Disable SSR for now to avoid hydration issues
    },
  ),

  AdminCalendarView: createDynamicComponent(
    () => import("@/components/calendar/AdminCalendarView"),
    {
      loading: () => <CalendarSkeleton />,
      displayName: "AdminCalendarView",
    },
  ),

  CalendarView: createDynamicComponent(
    () => import("@/components/calendar/CalendarView"),
    {
      loading: () => <CalendarSkeleton />,
      displayName: "CalendarView",
    },
  ),
};

// ⚡ Performance: Dashboard components - role-based lazy loading
export const DashboardComponents = {
  ParentDashboardFeatures: createDynamicComponent(
    () => import("@/components/dashboard/ParentDashboardFeatures"),
    {
      loading: () => <DashboardSkeleton />,
      displayName: "ParentDashboardFeatures",
    },
  ),

  ParentAnalytics: createDynamicComponent(
    () => import("@/components/dashboard/ParentAnalytics"),
    {
      loading: () => <ChartSkeleton />,
      displayName: "ParentAnalytics",
    },
  ),

  DashboardStats: createDynamicComponent(
    () =>
      import("@/components/dashboard/DashboardStats").then((mod) => ({
        default: mod.DashboardStats,
      })),
    {
      loading: () => <StatsSkeleton />,
      displayName: "DashboardStats",
    },
  ),
};

// ⚡ Performance: Heavy components that should always be lazy loaded
/*
export const HeavyComponents = {
  // Planning components
  PlanningDashboard: createDynamicComponent(
    () => import('@/components/planning/PlanningDashboard'),
    {
      loading: () => <DashboardSkeleton />,
      displayName: 'PlanningDashboard',
    }
  ),

  // Meeting components
  MeetingCalendar: createDynamicComponent(
    () => import('@/components/meetings/MeetingCalendar'),
    {
      loading: () => <CalendarSkeleton />,
      displayName: 'MeetingCalendar',
    }
  ),

  // File components
  PDFViewer: createDynamicComponent(
    () => import('@/components/ui/pdf-viewer'),
    {
      loading: () => <DocumentSkeleton />,
      displayName: 'PDFViewer',
      ssr: false, // PDF viewer shouldn't SSR
    }
  ),
};
*/

// ⚡ Performance: Conditional imports based on user role
/*
export const ConditionalComponents = {
  AdminOnly: {
    TeamMemberList: createDynamicComponent(
      () => import('@/components/admin/team-member-list'),
      {
        loading: () => <TableSkeleton />,
        displayName: 'TeamMemberList',
      }
    ),
  },

  TeacherOnly: {
    PMEDashboard: createDynamicComponent(
      () => import('@/components/pme/PMEDashboard'),
      {
        loading: () => <DashboardSkeleton />,
        displayName: 'PMEDashboard',
      }
    ),
  },

  ParentOnly: {
    VotingDashboard: createDynamicComponent(
      () => import('@/components/parent/VotingDashboard'),
      {
        loading: () => <DashboardSkeleton />,
        displayName: 'VotingDashboard',
      }
    ),
  },
};
*/

/**
 * Preload function for critical components
 */
export const preloadComponents = {
  calendar: () => {
    // Preload calendar components when user hovers over calendar navigation
    import("@/components/calendar/UnifiedCalendarView");
    import("@/components/calendar/CalendarView");
  },

  dashboard: () => {
    // Preload dashboard components when user is authenticated
    import("@/components/dashboard/DashboardStats");
    import("@/components/dashboard/DashboardWelcome");
  },

  planning: () => {
    // Preload planning components for teachers/admins
    import("@/components/planning/PlanningDashboard");
    import("@/components/planning/PlanningDocumentForm");
  },
};

/**
 * Bundle size optimization utilities
 */
export const OptimizedImports = {
  // Import only specific parts of large libraries
  DatePicker: createDynamicComponent(
    () =>
      import("react-day-picker").then((mod) => ({ default: mod.DayPicker })),
    {
      loading: () => <InputSkeleton />,
      displayName: "DatePicker",
      ssr: false,
    },
  ),
};
