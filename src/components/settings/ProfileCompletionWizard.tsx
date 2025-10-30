import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

interface ProfileCompletionWizardProps {
  currentStep?: number;
  totalSteps?: number;
  onStepChange?: (step: number) => void;
}

export function ProfileCompletionWizard({
  currentStep = 1,
  totalSteps = 4,
  onStepChange,
}: ProfileCompletionWizardProps) {
  const { t } = useDivineParsing(["common"]);

  const steps = [
    {
      id: 1,
      title: t("wizard.personal_info", "common"),
      description: t("wizard.personal_info_desc", "common"),
      completed: currentStep > 1,
    },
    {
      id: 2,
      title: t("wizard.preferences", "common"),
      description: t("wizard.preferences_desc", "common"),
      completed: currentStep > 2,
    },
    {
      id: 3,
      title: t("wizard.security_settings", "common"),
      description: t("wizard.security_settings_desc", "common"),
      completed: currentStep > 3,
    },
    {
      id: 4,
      title: t("wizard.verification", "common"),
      description: t("wizard.verification_desc", "common"),
      completed: currentStep > 4,
    },
  ];

  const progress = (currentStep / totalSteps) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("wizard.profile_completion.title", "common")}</CardTitle>
        <CardDescription>
          {t("wizard.profile_completion.description", "common")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              {t("wizard.progress", "common")}
            </label>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-1">
              {t("wizard.step", "common")} {currentStep}{" "}
              {t("wizard.of", "common")} {totalSteps} ({Math.round(progress)}%)
            </p>
          </div>

          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h4
                    className={cn(
                      "text-sm font-medium",
                      step.completed ? "text-green-600" : "text-foreground",
                    )}
                  >
                    {step.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {currentStep <= totalSteps && (
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={() => onStepChange?.(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                {t("wizard.previous", "common")}
              </Button>
              <Button
                onClick={() =>
                  onStepChange?.(Math.min(totalSteps, currentStep + 1))
                }
                disabled={currentStep === totalSteps}
              >
                {t("wizard.next", "common")}{" "}
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
