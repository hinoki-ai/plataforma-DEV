"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
// Removed direct import of server function to use API route instead
import { PlanningDashboard } from "@/components/planning/PlanningDashboard";
import { PageTransition } from "@/components/ui/page-transition";
import { ActionLoader } from "@/components/ui/dashboard-loader";
import { useLanguage } from "@/components/language/LanguageContext";

export default function AdminPlanificacionesPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [documents, setDocuments] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const params = {
          q: searchParams.get("q") || undefined,
          subject: searchParams.get("subject") || undefined,
          grade: searchParams.get("grade") || undefined,
        };

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

        if (!result.success || !result.data) {
          setError(t("admin.planificaciones.error_loading", "common"));
          return;
        }

        setDocuments(result.data);
      } catch (err) {
        console.error("Error fetching planning documents:", err);
        setError(t("admin.planificaciones.error_loading", "common"));
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [searchParams, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <ActionLoader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-destructive text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition
      skeletonType="cards"
      skeletonProps={{ columns: 4, rows: 2 }}
      duration={700}
    >
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">
            {t("admin.planificaciones.title", "common")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.planificaciones.description", "common")}
          </p>
        </div>
        <PlanningDashboard
          documents={documents}
          searchParams={{
            q: searchParams.get("q") || undefined,
            subject: searchParams.get("subject") || undefined,
            grade: searchParams.get("grade") || undefined,
          }}
        />
      </div>
    </PageTransition>
  );
}
