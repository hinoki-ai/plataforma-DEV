"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  useForm,
  UseFormReturn,
  FieldValues,
  FieldPath,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  validation?: z.ZodSchema;
  onValidate?: (data: any) => boolean | Promise<boolean>;
  onEnter?: (data: any) => void;
  onExit?: (data: any) => void;
}

export interface AutoSaveOptions {
  enabled: boolean;
  interval?: number;
  storageKey?: string;
  compress?: boolean;
}

export interface FormAnalytics {
  startTime: Date;
  fieldFocusTimes: Record<string, number>;
  fieldErrors: Record<string, number>;
  stepTimes: Record<string, number>;
  abandonedFields: string[];
  completionTime?: number;
}

export interface UseAdvancedFormOptions<T extends FieldValues> {
  schema?: z.ZodSchema<T>;
  defaultValues?: Partial<T>;
  steps?: FormStep[];
  autoSave?: AutoSaveOptions;
  analytics?: boolean;
  onSubmit?: (data: T) => void | Promise<void>;
  onStepChange?: (currentStep: number, totalSteps: number) => void;
  onFieldFocus?: (fieldName: string) => void;
  onFieldBlur?: (fieldName: string, value: any) => void;
  onError?: (errors: any) => void;
}

/**
 * Advanced form hook with multi-step, auto-save, analytics, and smart validation
 */
export function useAdvancedForm<T extends FieldValues = FieldValues>({
  schema,
  defaultValues,
  steps = [],
  autoSave = { enabled: false },
  analytics = false,
  onSubmit,
  onStepChange,
  onFieldFocus,
  onFieldBlur,
  onError,
}: UseAdvancedFormOptions<T>) {
  const form = useForm<T>({
    // Cast to satisfy resolver generic expectations with dynamic schemas
    resolver: schema ? (zodResolver(schema as any) as any) : undefined,
    defaultValues: defaultValues as any,
    mode: "onChange",
  });

  // Multi-step state
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepErrors, setStepErrors] = useState<Record<number, boolean>>({});

  // Auto-save state
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Analytics state
  const [formAnalytics, setFormAnalytics] = useState<FormAnalytics>(() => ({
    startTime: new Date(),
    fieldFocusTimes: {},
    fieldErrors: {},
    stepTimes: {},
    abandonedFields: [],
  }));

  // Field interaction tracking
  const fieldFocusStartRef = useRef<Record<string, Date>>({});

  // Auto-save functionality
  const saveFormData = useCallback(async () => {
    if (!autoSave.enabled) return;

    const data = form.getValues();
    const storageKey = autoSave.storageKey || "advanced-form-autosave";

    try {
      const saveData = {
        data,
        currentStep,
        completedSteps: Array.from(completedSteps),
        timestamp: new Date().toISOString(),
        analytics: analytics ? formAnalytics : null,
      };

      let serializedData = JSON.stringify(saveData);

      if (autoSave.compress && typeof window !== "undefined") {
        // Simple compression using built-in compression if available
        try {
          serializedData = btoa(serializedData);
        } catch (e) {
          console.warn("Compression failed, saving uncompressed");
        }
      }

      localStorage.setItem(storageKey, serializedData);
      setLastAutoSave(new Date());
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, [autoSave, form, currentStep, completedSteps, analytics, formAnalytics]);

  // Load saved data
  const loadSavedData = useCallback(() => {
    if (!autoSave.enabled) return false;

    const storageKey = autoSave.storageKey || "advanced-form-autosave";

    try {
      let savedData = localStorage.getItem(storageKey);
      if (!savedData) return false;

      // Try to decompress if it was compressed
      if (autoSave.compress) {
        try {
          savedData = atob(savedData);
        } catch (e) {
          // Data might not be compressed, continue with original
        }
      }

      const parsed = JSON.parse(savedData);
      const savedDate = new Date(parsed.timestamp);
      const hoursSinceSave =
        (Date.now() - savedDate.getTime()) / (1000 * 60 * 60);

      // Only load if saved within last 24 hours
      if (hoursSinceSave > 24) {
        localStorage.removeItem(storageKey);
        return false;
      }

      form.reset(parsed.data);
      setCurrentStep(parsed.currentStep || 0);
      setCompletedSteps(new Set(parsed.completedSteps || []));
      setLastAutoSave(savedDate);

      if (analytics && parsed.analytics) {
        setFormAnalytics({
          ...parsed.analytics,
          startTime: new Date(parsed.analytics.startTime),
        });
      }

      return true;
    } catch (error) {
      console.error("Failed to load saved data:", error);
      return false;
    }
  }, [autoSave, form, analytics]);

  // Auto-save interval effect
  useEffect(() => {
    if (!autoSave.enabled) return;

    const interval = autoSave.interval || 30000; // Default 30 seconds

    const scheduleAutoSave = () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        saveFormData();
        scheduleAutoSave(); // Schedule next save
      }, interval);
    };

    scheduleAutoSave();

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [autoSave.enabled, autoSave.interval, saveFormData]);

  // Form field change tracking
  useEffect(() => {
    const subscription = form.watch((data, { name }) => {
      if (name && analytics) {
        // Track field abandonment
        const fieldName = Array.isArray(name) ? name[0] : name;
        if (fieldName && fieldFocusStartRef.current[fieldName]) {
          delete fieldFocusStartRef.current[fieldName];
          setFormAnalytics((prev) => ({
            ...prev,
            abandonedFields: prev.abandonedFields.filter(
              (f) => f !== fieldName,
            ),
          }));
        }
      }

      // Trigger auto-save on change
      if (autoSave.enabled) {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        autoSaveTimeoutRef.current = setTimeout(saveFormData, 1000); // Debounce 1 second
      }
    });

    return () => subscription.unsubscribe();
  }, [form, analytics, autoSave.enabled, saveFormData]);

  // Step validation
  const validateCurrentStep = useCallback(async () => {
    if (steps.length === 0) return true;

    const currentStepConfig = steps[currentStep];
    if (!currentStepConfig) return true;

    // Validate required fields for this step
    const stepData: any = {};
    currentStepConfig.fields.forEach((field) => {
      stepData[field] = form.getValues(field as FieldPath<T>);
    });

    // Check step-specific validation schema
    if (currentStepConfig.validation) {
      try {
        currentStepConfig.validation.parse(stepData);
      } catch (error) {
        setStepErrors((prev) => ({ ...prev, [currentStep]: true }));
        return false;
      }
    }

    // Run custom validation if provided
    if (currentStepConfig.onValidate) {
      const isValid = await currentStepConfig.onValidate(stepData);
      if (!isValid) {
        setStepErrors((prev) => ({ ...prev, [currentStep]: true }));
        return false;
      }
    }

    setStepErrors((prev) => ({ ...prev, [currentStep]: false }));
    return true;
  }, [currentStep, steps, form]);

  // Navigation functions
  const nextStep = useCallback(async () => {
    if (currentStep >= steps.length - 1) return false;

    const isValid = await validateCurrentStep();
    if (!isValid) return false;

    const stepConfig = steps[currentStep];
    if (stepConfig?.onExit) {
      stepConfig.onExit(form.getValues());
    }

    setCompletedSteps((prev) => new Set(prev).add(currentStep));

    if (analytics) {
      setFormAnalytics((prev) => ({
        ...prev,
        stepTimes: {
          ...prev.stepTimes,
          [currentStep]:
            Date.now() - (prev.stepTimes[currentStep] || Date.now()),
        },
      }));
    }

    setCurrentStep((prev) => {
      const next = prev + 1;
      onStepChange?.(next, steps.length);

      const nextStepConfig = steps[next];
      if (nextStepConfig?.onEnter) {
        nextStepConfig.onEnter(form.getValues());
      }

      if (analytics) {
        setFormAnalytics((prevAnalytics) => ({
          ...prevAnalytics,
          stepTimes: {
            ...prevAnalytics.stepTimes,
            [next]: Date.now(),
          },
        }));
      }

      return next;
    });

    return true;
  }, [currentStep, steps, validateCurrentStep, form, onStepChange, analytics]);

  const previousStep = useCallback(() => {
    if (currentStep <= 0) return false;

    const stepConfig = steps[currentStep];
    if (stepConfig?.onExit) {
      stepConfig.onExit(form.getValues());
    }

    setCurrentStep((prev) => {
      const next = prev - 1;
      onStepChange?.(next, steps.length);

      const prevStepConfig = steps[next];
      if (prevStepConfig?.onEnter) {
        prevStepConfig.onEnter(form.getValues());
      }

      return next;
    });

    return true;
  }, [currentStep, steps, form, onStepChange]);

  const goToStep = useCallback(
    async (stepIndex: number) => {
      if (stepIndex < 0 || stepIndex >= steps.length) return false;
      if (stepIndex === currentStep) return true;

      // If going forward, validate all steps in between
      if (stepIndex > currentStep) {
        for (let i = currentStep; i < stepIndex; i++) {
          setCurrentStep(i);
          const isValid = await validateCurrentStep();
          if (!isValid) return false;
          setCompletedSteps((prev) => new Set(prev).add(i));
        }
      }

      setCurrentStep(stepIndex);
      onStepChange?.(stepIndex, steps.length);

      const stepConfig = steps[stepIndex];
      if (stepConfig?.onEnter) {
        stepConfig.onEnter(form.getValues());
      }

      return true;
    },
    [currentStep, steps, validateCurrentStep, onStepChange],
  );

  // Field interaction handlers
  const handleFieldFocus = useCallback(
    (fieldName: string) => {
      if (analytics) {
        fieldFocusStartRef.current[fieldName] = new Date();
      }
      onFieldFocus?.(fieldName);
    },
    [analytics, onFieldFocus],
  );

  const handleFieldBlur = useCallback(
    (fieldName: string, value: any) => {
      if (analytics && fieldFocusStartRef.current[fieldName]) {
        const focusTime =
          Date.now() - fieldFocusStartRef.current[fieldName].getTime();
        setFormAnalytics((prev) => ({
          ...prev,
          fieldFocusTimes: {
            ...prev.fieldFocusTimes,
            [fieldName]: (prev.fieldFocusTimes[fieldName] || 0) + focusTime,
          },
        }));
        delete fieldFocusStartRef.current[fieldName];
      }
      onFieldBlur?.(fieldName, value);
    },
    [analytics, onFieldBlur],
  );

  // Enhanced submit handler
  const handleSubmit = useCallback(
    async (data: T) => {
      if (steps.length > 0) {
        // Validate all steps
        for (let i = 0; i <= currentStep; i++) {
          setCurrentStep(i);
          const isValid = await validateCurrentStep();
          if (!isValid) return;
        }
      }

      if (analytics) {
        setFormAnalytics((prev) => ({
          ...prev,
          completionTime: Date.now() - prev.startTime.getTime(),
        }));
      }

      try {
        await onSubmit?.(data);

        // Clear auto-saved data on successful submission
        if (autoSave.enabled) {
          const storageKey = autoSave.storageKey || "advanced-form-autosave";
          localStorage.removeItem(storageKey);
        }
      } catch (error) {
        onError?.(error);
        throw error;
      }
    },
    [
      steps,
      currentStep,
      validateCurrentStep,
      analytics,
      onSubmit,
      autoSave,
      onError,
    ],
  );

  // Initialize saved data on mount
  useEffect(() => {
    loadSavedData();
  }, [loadSavedData]);

  // Get current step configuration
  const currentStepConfig = steps[currentStep];

  // Calculate completion percentage
  const completionPercentage =
    steps.length > 0 ? (completedSteps.size / steps.length) * 100 : 0;

  // Get field completion status
  const getFieldCompletionStatus = useCallback(() => {
    const allFields = steps.flatMap((step) => step.fields);
    const formValues = form.getValues();

    const completedFields = allFields.filter((field) => {
      const value = formValues[field as keyof T];
      return value !== undefined && value !== "" && value !== null;
    });

    return {
      total: allFields.length,
      completed: completedFields.length,
      percentage:
        allFields.length > 0
          ? (completedFields.length / allFields.length) * 100
          : 0,
    };
  }, [steps, form]);

  return {
    // Form instance
    form,

    // Step management
    currentStep,
    currentStepConfig,
    totalSteps: steps.length,
    completedSteps: Array.from(completedSteps),
    stepErrors,
    nextStep,
    previousStep,
    goToStep,
    canGoNext: currentStep < steps.length - 1,
    canGoPrevious: currentStep > 0,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,

    // Validation
    validateCurrentStep,

    // Progress
    completionPercentage,
    fieldCompletion: getFieldCompletionStatus(),

    // Auto-save
    lastAutoSave,
    saveFormData,
    loadSavedData,
    clearSavedData: () => {
      if (autoSave.enabled) {
        const storageKey = autoSave.storageKey || "advanced-form-autosave";
        localStorage.removeItem(storageKey);
        setLastAutoSave(null);
      }
    },

    // Analytics
    analytics: formAnalytics,

    // Field handlers
    handleFieldFocus,
    handleFieldBlur,

    // Submit
    handleSubmit: form.handleSubmit(handleSubmit as any),

    // Utilities
    reset: () => {
      form.reset();
      setCurrentStep(0);
      setCompletedSteps(new Set());
      setStepErrors({});
      if (analytics) {
        setFormAnalytics({
          startTime: new Date(),
          fieldFocusTimes: {},
          fieldErrors: {},
          stepTimes: {},
          abandonedFields: [],
        });
      }
    },

    isDirty: form.formState.isDirty,
    isValid: form.formState.isValid,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
  };
}

/**
 * Hook for form field auto-completion and smart suggestions
 */
export function useFormAutoComplete(options: {
  suggestions?: Record<string, string[]>;
  apiEndpoint?: string;
  cacheResults?: boolean;
  minCharacters?: number;
}) {
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const cacheRef = useRef<Record<string, string[]>>({});

  const getSuggestions = useCallback(
    async (fieldName: string, query: string) => {
      const {
        suggestions: localSuggestions,
        apiEndpoint,
        cacheResults = true,
        minCharacters = 2,
      } = options;

      if (query.length < minCharacters) {
        setSuggestions((prev) => ({ ...prev, [fieldName]: [] }));
        return;
      }

      const cacheKey = `${fieldName}-${query}`;

      // Check cache first
      if (cacheResults && cacheRef.current[cacheKey]) {
        setSuggestions((prev) => ({
          ...prev,
          [fieldName]: cacheRef.current[cacheKey],
        }));
        return;
      }

      setLoading((prev) => ({ ...prev, [fieldName]: true }));

      try {
        let results: string[] = [];

        // Use local suggestions if available
        if (localSuggestions?.[fieldName]) {
          results = localSuggestions[fieldName].filter((suggestion) =>
            suggestion.toLowerCase().includes(query.toLowerCase()),
          );
        }

        // Fetch from API if endpoint provided
        if (apiEndpoint) {
          const response = await fetch(
            `${apiEndpoint}?field=${fieldName}&q=${encodeURIComponent(query)}`,
          );
          if (response.ok) {
            const apiResults = await response.json();
            results = [...results, ...(apiResults.suggestions || [])];
          }
        }

        // Remove duplicates and limit results
        results = [...new Set(results)].slice(0, 10);

        if (cacheResults) {
          cacheRef.current[cacheKey] = results;
        }

        setSuggestions((prev) => ({ ...prev, [fieldName]: results }));
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions((prev) => ({ ...prev, [fieldName]: [] }));
      } finally {
        setLoading((prev) => ({ ...prev, [fieldName]: false }));
      }
    },
    [options],
  );

  return {
    suggestions,
    loading,
    getSuggestions,
    clearSuggestions: (fieldName?: string) => {
      if (fieldName) {
        setSuggestions((prev) => ({ ...prev, [fieldName]: [] }));
      } else {
        setSuggestions({});
      }
    },
  };
}
