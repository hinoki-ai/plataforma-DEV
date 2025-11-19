"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTransition } from "@/components/ui/page-transition";
import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { ProfileCompletionWizard } from "@/components/settings/ProfileCompletionWizard";
import { DashboardLoader } from "@/components/ui/dashboard-loader";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useDivineParsing(["common"]);
  const [activeTab, setActiveTab] = useState("profile");
  const [wizardStep, setWizardStep] = useState<number | undefined>(undefined);

  // Map wizard steps to tabs
  const stepToTabMap: Record<number, string> = {
    1: "profile",
    2: "notifications",
    3: "security",
    4: "profile",
  };

  // Map tabs to wizard steps (for reverse navigation)
  const tabToStepMap: Record<string, number[]> = {
    profile: [1, 4],
    notifications: [2],
    security: [3],
    appearance: [],
    privacy: [],
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Handle wizard step click - navigate to corresponding tab
  const handleWizardStepClick = (step: number) => {
    const tab = stepToTabMap[step];
    if (tab) {
      setActiveTab(tab);
      setWizardStep(step);
    }
  };

  // Handle tab change - optionally update wizard step if it matches
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Find if any wizard step corresponds to this tab
    const correspondingSteps = tabToStepMap[tab] || [];
    if (correspondingSteps.length > 0 && wizardStep !== undefined) {
      // Only update if current wizard step doesn't match this tab
      const currentTab = stepToTabMap[wizardStep];
      if (currentTab !== tab) {
        // Set to the first matching step
        setWizardStep(correspondingSteps[0]);
      }
    }
  };

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
          <h1 className="text-3xl font-bold text-foreground mb-4">
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
              <ProfileCompletionWizard
                currentStep={wizardStep}
                onStepChange={setWizardStep}
                onStepClick={handleWizardStepClick}
                activeTab={activeTab}
              />
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
            <SettingsTabs activeTab={activeTab} onTabChange={handleTabChange} />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
