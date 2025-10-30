"use client";

import { ReactNode } from "react";
import { useResponsiveMode } from "@/lib/hooks/useDesktopToggle";
import {
  usePageTransition,
  UsePageTransitionOptions,
} from "@/lib/hooks/usePageTransition";
import {
  PageSkeleton,
  CardGridSkeleton,
  TableSkeleton,
  FormSkeleton,
  DetailSkeleton,
  FotosVideosSkeleton,
  EquipoMultidisciplinarioSkeleton,
  ReservaSkeleton,
  CentroConsejoSkeleton,
  HomePageSkeleton,
} from "@/components/ui/loading-skeletons";

export type SkeletonType =
  | "page"
  | "cards"
  | "table"
  | "form"
  | "detail"
  | "fotos-videos"
  | "equipo-multidisciplinario"
  | "reserva"
  | "cpma"
  | "homepage"
  | "custom";

export interface PageTransitionProps extends UsePageTransitionOptions {
  children: ReactNode;

  /**
   * Type of skeleton to show during loading
   * @default 'page'
   */
  skeletonType?: SkeletonType;

  /**
   * Custom skeleton component to render
   */
  customSkeleton?: ReactNode;

  /**
   * Additional props for skeleton components
   */
  skeletonProps?: {
    columns?: number;
    rows?: number;
    fields?: number;
    sections?: number;
  };

  /**
   * CSS classes to apply to the container
   */
  className?: string;

  /**
   * Whether to apply progressive animation to children
   * @default true
   */
  enableProgressiveAnimation?: boolean;
}

export function PageTransition({
  children,
  skeletonType = "page",
  customSkeleton,
  skeletonProps = {},
  className = "",
  enableProgressiveAnimation = true,
  ...transitionOptions
}: PageTransitionProps) {
  const { isDesktopForced } = useResponsiveMode();
  const { isLoading, mounted } = usePageTransition(transitionOptions);

  // Render skeleton during loading
  if (isLoading) {
    return (
      <div className={className}>
        {customSkeleton ? (
          customSkeleton
        ) : (
          <SkeletonRenderer
            type={skeletonType}
            isDesktopForced={isDesktopForced}
            {...skeletonProps}
          />
        )}
      </div>
    );
  }

  // Render content with progressive animation
  return (
    <div
      className={`${className} ${
        enableProgressiveAnimation
          ? `transition-all duration-700 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`
          : ""
      }`}
    >
      {children}
    </div>
  );
}

/**
 * Skeleton renderer component
 */
function SkeletonRenderer({
  type,
  isDesktopForced,
  columns = 3,
  rows = 2,
  fields = 6,
  sections = 3,
}: {
  type: SkeletonType;
  isDesktopForced: boolean;
  columns?: number;
  rows?: number;
  fields?: number;
  sections?: number;
}) {
  switch (type) {
    case "cards":
      return (
        <CardGridSkeleton
          isDesktopForced={isDesktopForced}
          columns={columns}
          rows={rows}
        />
      );

    case "table":
      return (
        <TableSkeleton
          isDesktopForced={isDesktopForced}
          rows={rows}
          columns={columns}
        />
      );

    case "form":
      return <FormSkeleton isDesktopForced={isDesktopForced} fields={fields} />;

    case "detail":
      return (
        <DetailSkeleton isDesktopForced={isDesktopForced} sections={sections} />
      );

    case "fotos-videos":
      return <FotosVideosSkeleton isDesktopForced={isDesktopForced} />;

    case "equipo-multidisciplinario":
      return (
        <EquipoMultidisciplinarioSkeleton isDesktopForced={isDesktopForced} />
      );

    case "reserva":
      return <ReservaSkeleton isDesktopForced={isDesktopForced} />;

    case "cpma":
      return <CentroConsejoSkeleton isDesktopForced={isDesktopForced} />;

    case "homepage":
      return <HomePageSkeleton isDesktopForced={isDesktopForced} />;

    case "page":
    default:
      return <PageSkeleton isDesktopForced={isDesktopForced} />;
  }
}

/**
 * Wrapper for content that needs progressive reveal animation
 */
export function ProgressiveReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { mounted } = usePageTransition({ autoLoad: false });

  return (
    <div
      className={`transition-all duration-700 ease-out transition-delay-custom ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
      data-delay={delay.toString()}
    >
      {children}
    </div>
  );
}

/**
 * Container for multiple elements with staggered animation
 */
export function StaggeredContainer({
  children,
  staggerDelay = 150,
  className = "",
}: {
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <ProgressiveReveal key={index} delay={index * staggerDelay}>
          {child}
        </ProgressiveReveal>
      ))}
    </div>
  );
}
