"use client";

import UnifiedCalendarView from "@/components/calendar/UnifiedCalendarView";
import { PageTransition } from "@/components/ui/page-transition";
import { CalendarDays } from "lucide-react";
import { useDivineParsing } from "@/components/language/useDivineLanguage";

export default function CalendarioEscolarProfesorPage() {
  const { t } = useDivineParsing(["common", "profesor"]);
  return (
    <PageTransition skeletonType="page" duration={700}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <CalendarDays className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t("profesor.calendar.title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("profesor.calendar.description")}
          </p>
        </div>

        {/* Calendar Section */}
        <div>
          <UnifiedCalendarView
            mode="full"
            showAdminControls={false}
            showExport={true}
            initialCategories={["ACADEMIC", "HOLIDAY", "SPECIAL", "MEETING"]}
            userRole="PROFESOR"
          />
        </div>

        {/* Info Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">
                {t("profesor.calendar.school_year")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("profesor.calendar.start_date")}
                <br />
                {t("profesor.calendar.winter_break")}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">
                {t("profesor.calendar.levels_served")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("profesor.calendar.nt1_level")}
                <br />
                {t("profesor.calendar.nt2_level")}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">
                {t("profesor.calendar.schedule")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("profesor.calendar.morning")}
                <br />
                {t("profesor.calendar.afternoon")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
