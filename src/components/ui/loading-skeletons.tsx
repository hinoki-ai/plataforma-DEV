"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { layout } from "@/lib/responsive-utils";

export function NavigationSkeleton() {
  return (
    <nav className="bg-background shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
    </nav>
  );
}

export function HeroSkeleton({
  isDesktopForced,
}: {
  isDesktopForced: boolean;
}) {
  return (
    <section className={layout.spacing.section(isDesktopForced)}>
      <div className={`${layout.container(isDesktopForced)} text-center`}>
        <Skeleton
          className={`${typographySkeleton(isDesktopForced).hero} h-16 mx-auto mb-6`}
        />
        <Skeleton className="h-6 w-full max-w-4xl mx-auto mb-4" />
        <Skeleton className="h-6 w-3/4 max-w-3xl mx-auto" />
      </div>
    </section>
  );
}

export function MissionVisionSkeleton({
  isDesktopForced,
}: {
  isDesktopForced: boolean;
}) {
  return (
    <section className="py-4 bg-background">
      <div className={layout.container(isDesktopForced)}>
        <div
          className={
            isDesktopForced
              ? "grid grid-cols-2 gap-8"
              : "grid grid-cols-1 md:grid-cols-2 gap-8"
          }
        >
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-32 mb-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-32 mb-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

export function FeaturesSkeleton({
  isDesktopForced,
}: {
  isDesktopForced: boolean;
}) {
  return (
    <section className={layout.spacing.section(isDesktopForced)}>
      <div className={layout.container(isDesktopForced)}>
        <div className="text-center mb-12">
          <Skeleton
            className={`${typographySkeleton(isDesktopForced).heading} h-12 mx-auto mb-4`}
          />
          <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
        </div>

        <div
          className={
            isDesktopForced
              ? "grid grid-cols-3 gap-8"
              : "grid grid-cols-1 md:grid-cols-3 gap-8"
          }
        >
          {[1, 2, 3].map((i) => (
            <Card key={i} className="text-center">
              <CardHeader>
                <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-32 mx-auto" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-4/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FooterSkeleton({
  isDesktopForced,
}: {
  isDesktopForced: boolean;
}) {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className={layout.container(isDesktopForced)}>
        <div
          className={
            isDesktopForced
              ? "grid grid-cols-3 gap-8"
              : "grid grid-cols-1 md:grid-cols-3 gap-8"
          }
        >
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto mt-2" />
        </div>
      </div>
    </footer>
  );
}

// Universal Page Skeleton Components
export function PageSkeleton({
  isDesktopForced,
}: {
  isDesktopForced: boolean;
}) {
  return (
    <div className={layout.container(isDesktopForced)}>
      <div className={layout.spacing.section(isDesktopForced)}>
        {/* Page Header */}
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Main Content Area */}
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function CardGridSkeleton({
  isDesktopForced,
  columns = 3,
  rows = 2,
}: {
  isDesktopForced: boolean;
  columns?: number;
  rows?: number;
}) {
  const gridCols = isDesktopForced
    ? `grid-cols-${columns}`
    : `grid-cols-1 md:grid-cols-${columns}`;

  return (
    <div className={layout.container(isDesktopForced)}>
      <div className={layout.spacing.section(isDesktopForced)}>
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Grid */}
        <div className={`grid ${gridCols} gap-6`}>
          {Array.from({ length: columns * rows }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({
  isDesktopForced,
  rows = 5,
  columns = 4,
}: {
  isDesktopForced: boolean;
  rows?: number;
  columns?: number;
}) {
  return (
    <div className={layout.container(isDesktopForced)}>
      <div className={layout.spacing.section(isDesktopForced)}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="bg-muted p-4 border-b">
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
              }}
            >
              {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-20" />
              ))}
            </div>
          </div>

          {/* Table Rows */}
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="p-4 border-b last:border-b-0">
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                }}
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <Skeleton key={colIndex} className="h-4 w-24" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton({
  isDesktopForced,
  fields = 6,
}: {
  isDesktopForced: boolean;
  fields?: number;
}) {
  return (
    <div className={layout.container(isDesktopForced)}>
      <div className={layout.spacing.section(isDesktopForced)}>
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-8 w-40 mb-4" />
          <Skeleton className="h-4 w-80" />
        </div>

        {/* Form */}
        <Card className="max-w-2xl">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.from({ length: fields }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-20" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function DetailSkeleton({
  isDesktopForced,
  sections = 3,
}: {
  isDesktopForced: boolean;
  sections?: number;
}) {
  return (
    <div className={layout.container(isDesktopForced)}>
      <div className={layout.spacing.section(isDesktopForced)}>
        {/* Header with Back Button */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Detail Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {Array.from({ length: sections }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-32 w-full rounded" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-28" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Typography helper for skeletons
function typographySkeleton(isDesktopForced: boolean) {
  return {
    hero: isDesktopForced ? "text-6xl" : "text-4xl",
    heading: isDesktopForced ? "text-4xl" : "text-2xl",
    subheading: isDesktopForced ? "text-2xl" : "text-xl",
    body: isDesktopForced ? "text-lg" : "text-base",
  };
}

// New skeleton components for public pages
export function ProyectoEducativoSkeleton({
  isDesktopForced,
}: {
  isDesktopForced: boolean;
}) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative z-10 px-4 py-12 sm:px-6 sm:py-16 lg:py-24">
          <div className={`${layout.container(isDesktopForced)} text-center`}>
            <Skeleton
              className={`${typographySkeleton(isDesktopForced).heading} h-16 mx-auto mb-6`}
            />
            <Skeleton className="h-6 w-full max-w-3xl mx-auto" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div
        className={`${layout.container(isDesktopForced)} ${layout.spacing.section(isDesktopForced)}`}
      >
        <div className="space-y-8">
          {/* Video Section */}
          <div className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <Skeleton className="h-8 w-48" />
              </div>
            </div>
            <div className="p-6">
              <Skeleton className="aspect-video w-full rounded-lg" />
            </div>
          </div>

          {/* PDF Section */}
          <div className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </div>
            <div className="p-6">
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>

          {/* Philosophical Foundation */}
          <div className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-700/50">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-80" />
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <Skeleton className="h-6 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Educational Objectives */}
          <div className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-700/50">
              <Skeleton className="h-8 w-56 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-48" />
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-8 w-48" />
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Methodological Approach */}
          <div className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-700/50">
              <Skeleton className="h-8 w-56" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-700/50">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-80" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div>
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FotosVideosSkeleton({
  isDesktopForced,
}: {
  isDesktopForced: boolean;
}) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative z-10 px-4 py-12 sm:px-6 sm:py-16 lg:py-24">
          <div className={`${layout.container(isDesktopForced)} text-center`}>
            <Skeleton
              className={`${typographySkeleton(isDesktopForced).heading} h-16 mx-auto mb-6`}
            />
            <Skeleton className="h-6 w-full max-w-3xl mx-auto" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div
        className={`${layout.container(isDesktopForced)} ${layout.spacing.section(isDesktopForced)}`}
      >
        <div className="space-y-8">
          {/* Gallery Section */}
          <div className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-700/50">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-80" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Video Section */}
          <div className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-700/50">
              <Skeleton className="h-8 w-56 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-video w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EquipoMultidisciplinarioSkeleton({
  isDesktopForced,
}: {
  isDesktopForced: boolean;
}) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative z-10 px-4 py-12 sm:px-6 sm:py-16 lg:py-24">
          <div className={`${layout.container(isDesktopForced)} text-center`}>
            <Skeleton
              className={`${typographySkeleton(isDesktopForced).heading} h-16 mx-auto mb-6`}
            />
            <Skeleton className="h-6 w-full max-w-3xl mx-auto" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div
        className={`${layout.container(isDesktopForced)} ${layout.spacing.section(isDesktopForced)}`}
      >
        <div className="space-y-8">
          {/* Team Members Grid */}
          <div className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-700/50">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-80" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-16 h-16 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-700/50">
              <Skeleton className="h-8 w-56 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-700/50">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReservaSkeleton({
  isDesktopForced,
}: {
  isDesktopForced: boolean;
}) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative z-10 px-4 py-12 sm:px-6 sm:py-16 lg:py-24">
          <div className={`${layout.container(isDesktopForced)} text-center`}>
            <Skeleton
              className={`${typographySkeleton(isDesktopForced).heading} h-16 mx-auto mb-6`}
            />
            <Skeleton className="h-6 w-full max-w-3xl mx-auto" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div
        className={`${layout.container(isDesktopForced)} ${layout.spacing.section(isDesktopForced)}`}
      >
        <div className="space-y-8">
          {/* Reservation Form */}
          <div className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-700/50">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-80" />
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-48" />
              </div>
            </div>
          </div>

          {/* Available Times */}
          <div className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-700/50">
              <Skeleton className="h-8 w-56 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-700/50">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="w-2 h-2 rounded-full mt-2 flex-shrink-0" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CentroConsejoSkeleton({
  isDesktopForced,
}: {
  isDesktopForced: boolean;
}) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative z-10 px-4 py-12 sm:px-6 sm:py-16 lg:py-24">
          <div className={`${layout.container(isDesktopForced)} text-center`}>
            <Skeleton
              className={`${typographySkeleton(isDesktopForced).heading} h-16 mx-auto mb-6`}
            />
            <Skeleton className="h-6 w-full max-w-3xl mx-auto" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div
        className={`${layout.container(isDesktopForced)} ${layout.spacing.section(isDesktopForced)}`}
      >
        <div className="space-y-8">
          {/* Introduction */}
          <div className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-700/50">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-80" />
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-700/50">
              <Skeleton className="h-8 w-56 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-48" />
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-700/50">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div>
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-700/50">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomePageSkeleton({
  isDesktopForced,
}: {
  isDesktopForced: boolean;
}) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className={layout.spacing.section(isDesktopForced)}>
        <div className={`${layout.container(isDesktopForced)} text-center`}>
          <Skeleton
            className={`${typographySkeleton(isDesktopForced).hero} h-16 mx-auto mb-6`}
          />
          <Skeleton className="h-6 w-full max-w-4xl mx-auto mb-4" />
          <Skeleton className="h-6 w-3/4 max-w-3xl mx-auto" />
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-4">
        <div className={layout.container(isDesktopForced)}>
          <div
            className={
              isDesktopForced
                ? "grid grid-cols-2 gap-8"
                : "grid grid-cols-1 md:grid-cols-2 gap-8"
            }
          >
            <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <Skeleton className="h-8 w-32 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <Skeleton className="h-8 w-32 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={layout.spacing.section(isDesktopForced)}>
        <div className={layout.container(isDesktopForced)}>
          <div className="text-center mb-12">
            <Skeleton
              className={`${typographySkeleton(isDesktopForced).heading} h-12 mx-auto mb-4`}
            />
            <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
          </div>

          <div
            className={
              isDesktopForced
                ? "grid grid-cols-3 gap-8"
                : "grid grid-cols-1 md:grid-cols-3 gap-8"
            }
          >
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="text-center backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl"
              >
                <CardHeader>
                  <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-6 w-32 mx-auto" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
