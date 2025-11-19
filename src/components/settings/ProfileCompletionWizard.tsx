"use client";

import React, { useState, useEffect } from "react";
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
}

export function ProfileCompletionWizard({
  currentStep: initialStep,
  totalSteps = 4,
  onStepChange,
}: ProfileCompletionWizardProps) {
  const { t } = useDivineParsing(["common"]);
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(initialStep ?? 1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

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
    completed.push(4);

    setCompletedSteps(completed);

    // Auto-advance to first incomplete step
    const firstIncomplete = [1, 2, 3, 4].find(
      (step) => !completed.includes(step),
    );
    if (firstIncomplete && !initialStep) {
      setCurrentStep(firstIncomplete);
    }
  }, [session, initialStep]);

  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep);
    onStepChange?.(newStep);
  };

  const handleNext = () => {
    const next = Math.min(totalSteps, currentStep + 1);
    handleStepChange(next);
  };

  const handlePrevious = () => {
    const prev = Math.max(1, currentStep - 1);
    handleStepChange(prev);
  };

  const steps = [
    {
      id: 1,
      title: t("wizard.personal_info", "Personal Information"),
      description: t(
        "wizard.personal_info_desc",
        "Complete your profile information",
      ),
      completed: completedSteps.includes(1),
    },
    {
      id: 2,
      title: t("wizard.preferences", "Preferences"),
      description: t(
        "wizard.preferences_desc",
        "Set up your notification preferences",
      ),
      completed: completedSteps.includes(2),
    },
    {
      id: 3,
      title: t("wizard.security_settings", "Security Settings"),
      description: t(
        "wizard.security_settings_desc",
        "Update your password and security settings",
      ),
      completed: completedSteps.includes(3),
    },
    {
      id: 4,
      title: t("wizard.verification", "Verification"),
      description: t(
        "wizard.verification_desc",
        "Verify your account information",
      ),
      completed: completedSteps.includes(4),
    },
  ];

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
              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-md transition-colors",
                    isCurrent && "bg-muted",
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
