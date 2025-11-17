"use client";

import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedErrorBoundary } from "@/components/ui/advanced-error-boundary";
import { MasterPageTemplate } from "@/components/master/MasterPageTemplate";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

// Force dynamic rendering for Vercel compatibility
export const dynamic = "force-dynamic";

const systemOverviewFallback = (
  <div className="space-y-8">
    <Card className="animate-pulse border-blue-200 dark:border-blue-800">
      <div className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-32 w-full rounded" />
      </div>
    </Card>
  </div>
);

export default function SystemOverviewPage() {
  const { t } = useDivineParsing(["master"]);

  return (
    <MasterPageTemplate
      title={`🔍 ${t("master.system_overview.title", "master")}`}
      subtitle={t("master.system_overview.subtitle", "master")}
      context="SYSTEM_OVERVIEW"
      errorContext="SystemOverviewPage"
      fallbackContent={systemOverviewFallback}
    >
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* System Health */}
        <Card className="border-green-200 dark:border-green-800">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {t("master.system_overview.health.title", "master")}
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>
                  {t("master.system_overview.health.overall", "master")}
                </span>
                <span className="text-green-600 font-medium">
                  {t("master.system_overview.health.excellent", "master")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>
                  {t("master.system_overview.health.database", "master")}
                </span>
                <span className="text-green-600 font-medium">99.2%</span>
              </div>
              <div className="flex justify-between">
                <span>{t("master.system_overview.health.api", "master")}</span>
                <span className="text-green-600 font-medium">97.8%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* System Statistics */}
        <Card className="border-blue-200 dark:border-blue-800">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {t("master.system_overview.stats.title", "master")}
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>
                  {t("master.system_overview.stats.total_users", "master")}
                </span>
                <span className="font-medium">1,247</span>
              </div>
              <div className="flex justify-between">
                <span>
                  {t("master.system_overview.stats.active_sessions", "master")}
                </span>
                <span className="font-medium">89</span>
              </div>
              <div className="flex justify-between">
                <span>
                  {t("master.system_overview.stats.queries_hour", "master")}
                </span>
                <span className="font-medium">15.4K</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="border-purple-200 dark:border-purple-800">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {t("master.system_overview.performance.title", "master")}
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>
                  {t(
                    "master.system_overview.performance.response_time",
                    "master",
                  )}
                </span>
                <span className="font-medium">45ms</span>
              </div>
              <div className="flex justify-between">
                <span>
                  {t("master.system_overview.performance.throughput", "master")}
                </span>
                <span className="font-medium">1,200 req/s</span>
              </div>
              <div className="flex justify-between">
                <span>
                  {t("master.system_overview.performance.uptime", "master")}
                </span>
                <span className="text-green-600 font-medium">99.98%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Real-time Monitoring */}
      <Card className="border-orange-200 dark:border-orange-800">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {t("master.system_overview.monitoring.title", "master")}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {t("master.system_overview.monitoring.cpu", "master")}
                </span>
                <span>23%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full w-[23%]"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {t("master.system_overview.monitoring.memory", "master")}
                </span>
                <span>67%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full w-[67%]"></div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </MasterPageTemplate>
  );
}
