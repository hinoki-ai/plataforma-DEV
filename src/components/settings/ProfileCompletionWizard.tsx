"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { useSession } from "@/lib/auth-client";

interface ProfileCompletionWizardProps {
  currentStep?: number;
  totalSteps?: number;
  onStepChange?: (step: number) => void;
  onStepClick?: (step: number) => void;
  activeTab?: string;
}

export function ProfileCompletionWizard({
  currentStep: initialStep,
  totalSteps = 4,
  onStepChange,
  onStepClick,
  activeTab,
}: ProfileCompletionWizardProps) {
  const { t } = useDivineParsing(["common"]);
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(() => {
    // Initialize with initialStep prop, or default to 1
    const initial = initialStep ?? 1;
    // Ensure it's within valid bounds
    return Math.max(1, Math.min(totalSteps, initial));
  });
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const hasManuallyNavigated = useRef(false);
  const hasInitialized = useRef(false);
  const prevInitialStep = useRef(initialStep);

  // Calculate completion based on user data
  useEffect(() => {
    const completed: number[] = [];

    // Step 1: Personal info (name is filled)
    if (session?.user?.name) {
      completed.push(1);
    }

    // Step 2: Preferences (check localStorage)
    try {
      if (typeof window !== "undefined") {
        const prefs = localStorage.getItem("plataforma_user_preferences");
        if (prefs) {
          try {
            const parsed = JSON.parse(prefs);
            if (typeof parsed === "object" && parsed !== null) {
              completed.push(2);
            }
          } catch (e) {
            // Invalid JSON, ignore
          }
        }
      }
    } catch (e) {
      // ignore localStorage errors
    }

    // Step 3: Security settings (password changed or OAuth user)
    if (session?.user?.isOAuthUser) {
      completed.push(3); // OAuth users don't need password
    }
    // For password users, we can't know if they changed it, so we'll leave it optional

    // Step 4: Verification (always complete for now)
    if (totalSteps >= 4) {
      completed.push(4);
    }

    setCompletedSteps(completed);
  }, [session, totalSteps]);

  // Handle initialization and auto-advance logic
  useEffect(() => {
    // Sync with initialStep prop changes (but only if user hasn't manually navigated)
    if (initialStep !== undefined && initialStep !== prevInitialStep.current) {
      prevInitialStep.current = initialStep;
      if (!hasManuallyNavigated.current) {
        const validStep = Math.max(1, Math.min(totalSteps, initialStep));
        setCurrentStep(validStep);
        hasInitialized.current = true;
      }
      return;
    }

    // Skip if already initialized or user has manually navigated
    if (hasManuallyNavigated.current || hasInitialized.current) {
      return;
    }

    // If initialStep was explicitly provided, respect it and mark as initialized
    // (don't wait for session/completion data in this case)
    if (initialStep !== undefined) {
      hasInitialized.current = true;
      return;
    }

    // Wait for session to be available before auto-advancing
    // (session could be loading initially, and we want to use its data for completion check)
    if (session === undefined) {
      return;
    }

    // For auto-advance, we need completion data to be calculated
    // The completion calculation effect runs when session changes, so we need to wait for it
    // However, completedSteps might be empty if session exists but no steps are completed yet
    // So we check if we have processed the session data at least once
    // We do this by checking if the completion calculation has had a chance to run

    // Wait for the completion calculation to process (it will set completedSteps)
    // We'll let it run at least once by checking if session exists (which it does at this point)
    // The completion effect depends on session, so once session is defined, completedSteps should be calculated

    const stepArray = Array.from({ length: totalSteps }, (_, i) => i + 1);
    const firstIncomplete = stepArray.find(
      (step) => !completedSteps.includes(step),
    );

    // Only auto-advance if we found an incomplete step
    // We check against currentStep using a callback to avoid including it in dependencies
    if (firstIncomplete !== undefined) {
      setCurrentStep((prevStep) => {
        // Only update if different from current step
        return firstIncomplete !== prevStep ? firstIncomplete : prevStep;
      });
    }

    // Mark as initialized once we've processed the auto-advance logic
    // (even if no incomplete step was found, meaning all are complete)
    hasInitialized.current = true;
  }, [initialStep, totalSteps, completedSteps, session]);

  // Ensure currentStep stays within valid bounds
  useEffect(() => {
    if (currentStep < 1 || currentStep > totalSteps) {
      const validStep = Math.max(1, Math.min(totalSteps, currentStep));
      setCurrentStep(validStep);
    }
  }, [currentStep, totalSteps]);

  const handleStepChange = (newStep: number) => {
    // Ensure step is within valid bounds
    const validStep = Math.max(1, Math.min(totalSteps, newStep));
    setCurrentStep(validStep);
    hasManuallyNavigated.current = true;
    onStepChange?.(validStep);
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      handleStepChange(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      handleStepChange(currentStep - 1);
    }
  };

  // Generate steps dynamically based on totalSteps
  const steps = React.useMemo(() => {
    const stepConfigs = [
      {
        id: 1,
        title: t("wizard.personal_info", "Personal Information"),
        description: t("wizard.personal_info_desc", "Complete your basic data"),
        tab: "profile",
      },
      {
        id: 2,
        title: t("wizard.preferences", "Preferences"),
        description: t("wizard.preferences_desc", "Configure your preferences"),
        tab: "notifications",
      },
      {
        id: 3,
        title: t("wizard.security_settings", "Security Settings"),
        description: t("wizard.security_settings_desc", "Ajusta tu seguridad"),
        tab: "account",
      },
      {
        id: 4,
        title: t("wizard.verification", "Verification"),
        description: t("wizard.verification_desc", "Verifica tu cuenta"),
        tab: "profile",
      },
    ];

    return stepConfigs.slice(0, totalSteps).map((config) => ({
      ...config,
      completed: completedSteps.includes(config.id),
    }));
  }, [totalSteps, completedSteps, t]);

  const handleStepClick = (stepId: number) => {
    const step = steps.find((s) => s.id === stepId);
    if (step) {
      handleStepChange(stepId);
      onStepClick?.(stepId);
    }
  };

  const completedCount = completedSteps.length;
  const progress = (completedCount / totalSteps) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t("wizard.profile_completion.title", "Profile Completion")}
        </CardTitle>
        <CardDescription>
          {t(
            "wizard.profile_completion.description",
            "Complete your profile to get the most out of the platform",
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">
                {t("wizard.progress", "Progress")}
              </label>
              <span className="text-sm text-muted-foreground">
                {completedCount} / {totalSteps}{" "}
                {t("wizard.completed", "completed")}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-1">
              {Math.round(progress)}% {t("wizard.complete", "complete")}
            </p>
          </div>

          <div className="space-y-3">
            {steps.map((step) => {
              const isCurrent = step.id === currentStep;
              const isTabActive = activeTab === step.tab;
              const isClickable = onStepClick !== undefined;

              return (
                <div
                  key={step.id}
                  onClick={() => isClickable && handleStepClick(step.id)}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-md transition-all",
                    isCurrent && "bg-muted",
                    isTabActive &&
                      !isCurrent &&
                      "bg-muted/50 ring-2 ring-primary/20",
                    isClickable && "cursor-pointer hover:bg-muted/50",
                  )}
                >
                  <div className="flex-shrink-0">
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle
                        className={cn(
                          "h-5 w-5",
                          isCurrent ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4
                      className={cn(
                        "text-sm font-medium",
                        step.completed
                          ? "text-green-600"
                          : isCurrent
                            ? "text-foreground"
                            : isTabActive
                              ? "text-primary"
                              : "text-muted-foreground",
                      )}
                    >
                      {step.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {currentStep <= totalSteps && (
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("wizard.previous", "Previous")}
              </Button>
              <Button
                onClick={handleNext}
                disabled={currentStep === totalSteps}
              >
                {t("wizard.next", "Next")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ProfileCompletionWizard;
