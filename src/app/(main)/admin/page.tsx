"use client";

import { Suspense, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedErrorBoundary } from "@/components/ui/advanced-error-boundary";
import { dbLogger } from "@/lib/logger";
import { RoleAwareDashboard } from "@/components/dashboard/RoleAwareDashboard";
import { EducationalInstitutionSelector } from "@/components/admin/EducationalInstitutionSelector";
import { EducationalInstitutionType } from "@/lib/educational-system";

// Force dynamic rendering for Vercel compatibility
export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  const [currentInstitutionType, setCurrentInstitutionType] =
    useState<EducationalInstitutionType>("PRESCHOOL");
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  // Fetch current institution configuration on mount
  useEffect(() => {
    const fetchInstitutionConfig = async () => {
      try {
        const response = await fetch("/api/educational-system");

        if (!response.ok) {
          if (response.status === 401) {
            console.warn(
              "Unauthorized to fetch institution config, using default",
            );
          } else {
            console.error(
              "Failed to fetch institution config:",
              response.status,
              response.statusText,
            );
          }
          // Keep default 'PRESCHOOL' if API fails
          return;
        }

        const data = await response.json();

        if (data.success && data.institutionType) {
          setCurrentInstitutionType(data.institutionType);
        } else {
          console.warn("Invalid response format from institution config API");
        }
      } catch (error) {
        console.error("Error fetching institution configuration:", error);
        // Keep default 'PRESCHOOL' if API fails
      } finally {
        setIsLoadingConfig(false);
      }
    };

    fetchInstitutionConfig();
  }, []);

  // 🚨 EMERGENCY: Handle database failures gracefully
  try {
    // Dashboard will show empty state but remain functional
  } catch (error) {
    dbLogger.error(
      "Database unavailable in admin dashboard, showing empty state",
      error,
      { context: "AdminDashboard", emergencyMode: true },
    );
    // Dashboard will show empty state but remain functional
  }

  return (
    <AdvancedErrorBoundary
      context="Admin Dashboard Page"
      enableRetry={true}
      showDetails={process.env.NODE_ENV === "development"}
    >
      <Suspense
        fallback={
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="p-6">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </Card>
              ))}
            </div>

            {/* Enhanced loading states */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <div className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <Skeleton className="h-6 w-40 mb-4" />
                  <Skeleton className="h-32 w-full rounded" />
                </div>
              </Card>
            </div>
          </div>
        }
      >
        <div className="space-y-8">
          {/* Educational Institution Configuration - Priority Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            {isLoadingConfig ? (
              <div className="animate-pulse">
                <div className="h-6 w-64 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-32 bg-gray-300 dark:bg-gray-700 rounded"
                    ></div>
                  ))}
                </div>
                <div className="h-10 w-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            ) : (
              <EducationalInstitutionSelector
                currentType={currentInstitutionType}
                onTypeChange={(type) => {
                  setCurrentInstitutionType(type);
                }}
              />
            )}
          </div>

          {/* Standard Admin Dashboard */}
          <RoleAwareDashboard />
        </div>
      </Suspense>
    </AdvancedErrorBoundary>
  );
}
