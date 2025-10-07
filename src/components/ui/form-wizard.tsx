"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Clock,
  Save,
  Eye,
  EyeOff,
  RotateCcw,
} from "lucide-react";
import { useAdvancedForm, FormStep } from "@/hooks/useAdvancedForm";
import { FormProgress } from "./enhanced-form";
import { ActionLoader } from "@/components/ui/dashboard-loader";
import { useDivineParsing } from "@/components/language/useDivineLanguage";

interface FormWizardProps<T = any> {
  steps: FormStep[];
  onSubmit: (data: T) => void | Promise<void>;
  onStepChange?: (step: number) => void;
  showProgress?: boolean;
  showStepList?: boolean;
  allowStepJumping?: boolean;
  autoSave?: boolean;
  className?: string;
  title?: string;
  description?: string;
  submitButtonText?: string;
  children: (step: FormStep, stepIndex: number, form: any) => React.ReactNode;
}

export function FormWizard<
  T extends Record<string, any> = Record<string, any>,
>({
  steps,
  onSubmit,
  onStepChange,
  showProgress = true,
  showStepList = true,
  allowStepJumping = false,
  autoSave = false,
  className,
  title,
  description,
  submitButtonText,
  children,
}: FormWizardProps<T>) {
  const { t } = useDivineParsing(["common"]);
  const [previewMode, setPreviewMode] = useState(false);

  // Set default submit button text if not provided
  const finalSubmitButtonText = submitButtonText || t("form.complete");

  const {
    form,
    currentStep,
    currentStepConfig,
    totalSteps,
    completedSteps,
    stepErrors,
    nextStep,
    previousStep,
    goToStep,
    canGoNext,
    canGoPrevious,
    isFirstStep,
    isLastStep,
    completionPercentage,
    fieldCompletion,
    lastAutoSave,
    handleSubmit,
    validateCurrentStep,
    reset,
    isSubmitting,
    isDirty,
  } = useAdvancedForm({
    steps,
    autoSave: { enabled: autoSave },
    analytics: true,
    onSubmit,
    onStepChange,
  });

  const handleNext = useCallback(async () => {
    const success = await nextStep();
    if (success) {
      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  }, [nextStep]);

  const handlePrevious = useCallback(() => {
    previousStep();
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, [previousStep]);

  const handleStepClick = useCallback(
    async (stepIndex: number) => {
      if (!allowStepJumping) return;

      if (stepIndex <= currentStep || completedSteps.includes(stepIndex - 1)) {
        await goToStep(stepIndex);
      }
    },
    [allowStepJumping, currentStep, completedSteps, goToStep],
  );

  const getStepStatus = useCallback(
    (stepIndex: number) => {
      if (completedSteps.includes(stepIndex)) return "completed";
      if (stepErrors[stepIndex]) return "error";
      if (stepIndex === currentStep) return "current";
      if (stepIndex < currentStep) return "completed";
      return "pending";
    },
    [completedSteps, stepErrors, currentStep],
  );

  const canJumpToStep = useCallback(
    (stepIndex: number) => {
      if (!allowStepJumping) return false;
      return stepIndex <= currentStep || completedSteps.includes(stepIndex - 1);
    },
    [allowStepJumping, currentStep, completedSteps],
  );

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      {/* Header */}
      {(title || description) && (
        <div className="text-center space-y-2">
          {title && <h1 className="text-2xl font-bold">{title}</h1>}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {/* Progress Section */}
      {showProgress && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">{t("form.progress")}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    {t("form.step")} {currentStep + 1} {t("form.of")}{" "}
                    {totalSteps}
                  </span>
                  {autoSave && lastAutoSave && (
                    <div className="flex items-center gap-1">
                      <Save className="h-3 w-3" />
                      <span>
                        {t("form.saved")} {lastAutoSave.toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Progress value={completionPercentage} className="h-2" />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {Math.round(completionPercentage)}% {t("form.completed")}
                </span>
                <span>
                  {fieldCompletion.completed} {t("form.of")}{" "}
                  {fieldCompletion.total} {t("form.fields")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step List */}
      {showStepList && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("form.steps")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {steps.map((step, index) => {
                const status = getStepStatus(index);
                const canJump = canJumpToStep(index);

                return (
                  <motion.button
                    key={step.id}
                    type="button"
                    disabled={!canJump}
                    onClick={() => handleStepClick(index)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                      "border hover:shadow-sm disabled:cursor-not-allowed",
                      status === "current" && "border-primary bg-primary/5",
                      status === "completed" && "border-green-200 bg-green-50",
                      status === "error" && "border-red-200 bg-red-50",
                      status === "pending" && "border-border bg-muted/30",
                      !canJump && "opacity-60",
                    )}
                    whileHover={canJump ? { scale: 1.02 } : {}}
                    whileTap={canJump ? { scale: 0.98 } : {}}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium",
                        status === "current" &&
                          "bg-primary text-primary-foreground",
                        status === "completed" && "bg-green-500 text-white",
                        status === "error" && "bg-red-500 text-white",
                        status === "pending" &&
                          "bg-muted text-muted-foreground",
                      )}
                    >
                      {status === "completed" ? (
                        <Check className="h-3 w-3" />
                      ) : status === "error" ? (
                        <AlertCircle className="h-3 w-3" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {step.title}
                      </div>
                      {step.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {step.description}
                        </div>
                      )}
                    </div>

                    {status === "current" && (
                      <Badge variant="default" className="text-xs">
                        {t("form.current")}
                      </Badge>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Form Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {currentStep + 1}
                </span>
                {currentStepConfig?.title}
              </CardTitle>
              {currentStepConfig?.description && (
                <p className="text-muted-foreground mt-1">
                  {currentStepConfig.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isDirty && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Cambios sin guardar
                </Badge>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="ml-1">
                  {previewMode ? t("common.edit") : t("form.preview")}
                </span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {previewMode ? (
                  <div className="p-6 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-4">{t("form.preview")}</h4>
                    <div className="space-y-2 text-sm">
                      {currentStepConfig?.fields.map((fieldName) => {
                        const value = form.getValues(fieldName as any);
                        return (
                          <div key={fieldName} className="flex justify-between">
                            <span className="font-medium capitalize">
                              {fieldName.replace(/([A-Z])/g, " $1")}:
                            </span>
                            <span className="text-muted-foreground">
                              {value || "No especificado"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  currentStepConfig &&
                  children(currentStepConfig, currentStep, form)
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <Separator />

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={!canGoPrevious}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>

                {isDirty && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={reset}
                    className="text-muted-foreground"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reiniciar
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isLastStep ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!canGoNext}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <>
                        <ActionLoader size="sm" className="mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        {finalSubmitButtonText}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Summary Card (visible on last step) */}
      {isLastStep && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("form.summary")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {steps.map((step, stepIndex) => {
                const hasData = step.fields.some((field) => {
                  const value = form.getValues(field as any);
                  return value !== undefined && value !== "" && value !== null;
                });

                if (!hasData) return null;

                return (
                  <div key={step.id} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {stepIndex + 1}
                      </div>
                      <h4 className="font-medium">{step.title}</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
                      {step.fields.map((fieldName) => {
                        const value = form.getValues(fieldName as any);
                        if (
                          value === undefined ||
                          value === "" ||
                          value === null
                        )
                          return null;

                        return (
                          <div key={fieldName} className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              {fieldName.replace(/([A-Z])/g, " $1")}
                            </label>
                            <div className="text-sm">
                              {typeof value === "boolean"
                                ? value
                                  ? "Sí"
                                  : "No"
                                : String(value)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
