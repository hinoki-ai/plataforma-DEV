"use client";

import { CalendarDays, Plus, Download, Upload } from "lucide-react";
import UnifiedCalendarView from "@/components/calendar/UnifiedCalendarView";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/page-transition";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

export const dynamic = "force-dynamic";

export default function CalendarioEscolarAdminPage() {
  const { t } = useDivineParsing(["admin"]);

  return (
    <PageTransition skeletonType="page" duration={700}>
      <div className="min-h-screen bg-background">
        {/* Header Section */}
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b border-border">
          <div className="container mx-auto px-4 py-8 sm:py-12">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <CalendarDays className="w-8 h-8 text-primary" />
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("admin.calendario.description", "admin")}
              </p>
            </div>
          </div>
        </div>

        {/* Admin Controls */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <p className="text-muted-foreground">
                {t("admin.calendario.panel_description", "admin")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="w-4 h-4" />
                {t("admin.calendario.import_csv", "admin")}
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                {t("admin.calendario.export_csv", "admin")}
              </Button>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                {t("admin.calendario.new_event", "admin")}
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="container mx-auto px-4 py-8">
          <UnifiedCalendarView
            mode="full"
            showAdminControls={true}
            showExport={true}
            initialCategories={[
              "ACADEMIC",
              "HOLIDAY",
              "SPECIAL",
              "ADMINISTRATIVE",
              "MEETING",
            ]}
            userRole="ADMIN"
          />
        </div>

        {/* Admin Features Info */}
        <div className="bg-muted/30 border-t border-border">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  {t("admin.calendario.features.events", "admin")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("admin.calendario.features.events_desc", "admin")}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  {t("admin.calendario.features.import_export", "admin")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("admin.calendario.features.import_export_desc", "admin")}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  {t("admin.calendario.features.recurring", "admin")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("admin.calendario.features.recurring_desc", "admin")}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  {t("admin.calendario.features.templates", "admin")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("admin.calendario.features.templates_desc", "admin")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
