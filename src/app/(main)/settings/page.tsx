"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTransition } from "@/components/ui/page-transition";
import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { ProfileCompletionWizard } from "@/components/settings/ProfileCompletionWizard";
import { DashboardLoader } from "@/components/ui/dashboard-loader";
import { useLanguage } from "@/components/language/LanguageContext";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return <DashboardLoader text={t("settings.loading.auth", "common")} />;
  }

  // Don't render anything if not authenticated (will redirect)
  if (status === "unauthenticated") {
    return null;
  }

  const userRole = session?.user?.role;

  return (
    <PageTransition
      skeletonType="cards"
      skeletonProps={{ columns: 1, rows: 3 }}
      duration={700}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4 sm:text-5xl lg:text-6xl">
            {t("settings.title", "common")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("settings.description", "common")}
          </p>
        </div>

        {/* Profile Completion Section */}
        <div>
          <Card>
            <CardContent className="p-6">
              <ProfileCompletionWizard />
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">
              {t("settings.account.title", "common")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SettingsTabs />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
