"use client";

import { useState, useEffect, Suspense } from "react";
// Removed direct import of server function to use API route instead
import { HeavyComponents } from "@/lib/dynamic-imports";
import { PageTransition } from "@/components/ui/page-transition";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { LoadingState } from "@/components/ui/loading-states";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import type { PlanningDocumentsResponse } from "@/lib/types/service-responses";

interface Props {
  searchParams: Promise<{
    q?: string;
    subject?: string;
    grade?: string;
  }>;
}

// Removed static revalidation to prevent authentication state conflicts

function PlanificacionesContent({ searchParams }: Props) {
  const { t } = useDivineParsing(["common", "profesor"]);
  const [documents, setDocuments] = useState<PlanningDocumentsResponse["data"]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        setLoading(true);
        setError(null);

        const params = await searchParams;

        // Build query string from search params
        const queryParams = new URLSearchParams();
        if (params.q) queryParams.set("q", params.q);
        if (params.subject) queryParams.set("subject", params.subject);
        if (params.grade) queryParams.set("grade", params.grade);

        const queryString = queryParams.toString();
        const url = `/api/profesor/planning${queryString ? `?${queryString}` : ""}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setDocuments(result.data || []);
        } else {
          setError(
            result.error || t("profesor.planning.error_loading", "profesor"),
          );
        }
      } catch (err) {
        console.error("Error fetching planning documents:", err);
        setError(t("profesor.planning.error_loading", "profesor"));
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, [searchParams]);

  if (loading) {
    return (
      <PageTransition
        skeletonType="cards"
        skeletonProps={{ columns: 4, rows: 2 }}
        duration={700}
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-foreground">
              {t("profesor.planning.title", "common")}
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-48"></div>
              </div>
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition
        skeletonType="cards"
        skeletonProps={{ columns: 4, rows: 2 }}
        duration={700}
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-foreground">
              {t("profesor.planning.title", "common")}
            </h1>
          </div>
          <div className="text-center py-16">
            <div className="text-red-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t("profesor.planning.error_loading", "profesor")}
            </h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition
      skeletonType="cards"
      skeletonProps={{ columns: 4, rows: 2 }}
      duration={700}
    >
      <HeavyComponents.PlanningDashboard
        documents={documents || []}
        searchParams={searchParams}
      />
    </PageTransition>
  );
}

export default function PlanificacionesPage(props: Props) {
  return (
    <ErrorBoundary fallback={<div>Error al cargar planificaciones</div>}>
      <Suspense fallback={<LoadingState />}>
        <PlanificacionesContent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}
