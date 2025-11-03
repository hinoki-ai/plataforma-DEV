"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  useFormContext,
  useWatch,
  Controller,
  type FieldPath,
  type FieldValues,
  type ValidationRule,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Eye,
  EyeOff,
  Search,
  X,
  Plus,
  Minus,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Lock,
  Check,
  ChevronDown,
} from "lucide-react";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

// Enhanced form validation with real-time feedback
interface ValidationResult {
  isValid: boolean;
  strength?: "weak" | "medium" | "strong";
  suggestions?: string[];
  errors?: string[];
}

interface SmartValidationRules {
  email?: boolean;
  phone?: boolean;
  password?: {
    minLength?: number;
    requireSpecial?: boolean;
    requireNumber?: boolean;
    requireUpper?: boolean;
    requireLower?: boolean;
  };
  custom?: (value: any) => ValidationResult;
}

interface ConditionalLogicRule {
  dependsOn: string;
  condition: (value: any) => boolean;
  action: "show" | "hide" | "require" | "optional";
}

interface FieldConfig {
  label: string;
  placeholder?: string;
  description?: string;
  type?:
    | "text"
    | "email"
    | "password"
    | "tel"
    | "number"
    | "textarea"
    | "select"
    | "combobox"
    | "date"
    | "time";
  validation?: SmartValidationRules;
  conditional?: ConditionalLogicRule[];
  options?: Array<{ value: string; label: string }>;
  suggestions?: string[];
  autoComplete?: boolean;
  realTimeValidation?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

// Smart password validation
export function usePasswordValidation(password: string) {
  return useMemo(() => {
    const result: ValidationResult = {
      isValid: false,
      strength: "weak",
      suggestions: [],
      errors: [],
    };

    if (!password) {
      result.errors = ["La contraseña es requerida"];
      return result;
    }

    let score = 0;
    const suggestions: string[] = [];

    // Length check - minimum 8 characters
    if (password.length >= 8) {
      score += 1;
    } else {
      suggestions.push("La contraseña debe tener al menos 8 caracteres");
    }

    // Number check - at least one number (required)
    if (/\d/.test(password)) {
      score += 1;
    } else {
      suggestions.push("Incluye al menos un número");
    }

    // Common patterns check - avoid repeating characters
    if (!/(.)\1{2,}/.test(password)) {
      score += 1;
    } else {
      suggestions.push("Evita repetir el mismo carácter más de 2 veces");
    }

    // Strength assessment
    if (score >= 4) {
      result.strength = "strong";
      result.isValid = true;
    } else if (score >= 2) {
      result.strength = "medium";
    } else {
      result.strength = "weak";
      result.isValid = false;
    }

    result.suggestions = suggestions;
    return result;
  }, [password]);
}

// Smart email validation
export function useEmailValidation(email: string) {
  const { t } = useDivineParsing(["common"]);
  return useMemo(() => {
    const result: ValidationResult = {
      isValid: false,
      suggestions: [],
    };

    if (!email) {
      result.errors = [t("form.email_required")];
      return result;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidFormat = emailRegex.test(email);

    if (!isValidFormat) {
      result.errors = [t("form.email_invalid_format")];
      return result;
    }

    // Check for common typos and suggest corrections
    const commonDomains = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "icloud.com",
      "live.com",
      "msn.com",
    ];

    const domain = email.split("@")[1];
    if (domain) {
      const suggestion = commonDomains.find(
        (d) => d.includes(domain) || domain.includes(d.split(".")[0]),
      );

      if (suggestion && suggestion !== domain) {
        result.suggestions = [
          `¿Quisiste decir ${email.split("@")[0]}@${suggestion}?`,
        ];
      }
    }

    result.isValid = true;
    return result;
  }, [email, t]);
}

// Enhanced form field with smart validation
interface SmartFormFieldProps {
  name: string;
  config: FieldConfig;
  className?: string;
}

export function SmartFormField({
  name,
  config,
  className,
}: SmartFormFieldProps) {
  const { t } = useDivineParsing(["common"]);
  const form = useFormContext();
  const [showPassword, setShowPassword] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isRequired, setIsRequired] = useState(false);

  const watchedValue = useWatch({ name, control: form.control });

  // Handle conditional logic
  useEffect(() => {
    if (config.conditional) {
      config.conditional.forEach((rule) => {
        const dependentValue = form.getValues(rule.dependsOn);
        const conditionMet = rule.condition(dependentValue);

        switch (rule.action) {
          case "show":
            setIsVisible(conditionMet);
            break;
          case "hide":
            setIsVisible(!conditionMet);
            break;
          case "require":
            setIsRequired(conditionMet);
            break;
          case "optional":
            setIsRequired(!conditionMet);
            break;
        }
      });
    }
  }, [config.conditional, form]);

  // Real-time validation (hooks must be called unconditionally)
  const passwordValidation = usePasswordValidation(
    config.type === "password" ? String(watchedValue ?? "") : "",
  );
  const emailValidation = useEmailValidation(
    config.type === "email" ? String(watchedValue ?? "") : "",
  );
  const validationResult = useMemo(() => {
    if (!config.realTimeValidation || !watchedValue) return null;
    if (config.type === "password") return passwordValidation;
    if (config.type === "email") return emailValidation;
    return null;
  }, [
    config.realTimeValidation,
    config.type,
    watchedValue,
    passwordValidation,
    emailValidation,
  ]);

  // Auto-suggestions
  useEffect(() => {
    if (config.suggestions && watchedValue) {
      const filtered = config.suggestions
        .filter((suggestion) =>
          suggestion.toLowerCase().includes(watchedValue.toLowerCase()),
        )
        .slice(0, 5);

      setSuggestions(filtered);
    }
  }, [watchedValue, config.suggestions]);

  const getValidationRules = useCallback(() => {
    const rules: any = {};

    if (isRequired) {
      rules.required = t("form.field_required");
    }

    if (config.validation) {
      if (config.validation.email) {
        rules.pattern = {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: t("form.email_invalid"),
        };
      }

      if (config.validation.phone) {
        rules.pattern = {
          value: /^\+?[\d\s-()]{8,15}$/,
          message: t("form.phone_invalid"),
        };
      }

      if (config.validation.password) {
        const { minLength = 8 } = config.validation.password;
        rules.minLength = {
          value: minLength,
          message: `Password must be at least ${minLength} characters long`,
        };
      }

      if (config.validation.custom) {
        rules.validate = (value: any) => {
          const result = config.validation!.custom!(value);
          return (
            result.isValid || result.errors?.[0] || t("form.value_invalid")
          );
        };
      }
    }

    return rules;
  }, [config.validation, isRequired, t]);

  if (!isVisible) return null;

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("space-y-2", className)}
    >
      <FormField
        control={form.control}
        name={name}
        rules={getValidationRules()}
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4" />}
              {config.label}
              {isRequired && <span className="text-destructive">*</span>}
              {validationResult?.isValid && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </FormLabel>

            <FormControl>
              <div className="relative">
                {config.type === "textarea" ? (
                  <Textarea
                    placeholder={config.placeholder}
                    className={cn(
                      "min-h-[80px]",
                      fieldState.error && "border-destructive",
                      validationResult?.isValid && "border-green-500",
                    )}
                    {...field}
                  />
                ) : config.type === "select" ? (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={config.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {config.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : config.type === "combobox" ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? config.options?.find(
                              (option) => option.value === field.value,
                            )?.label
                          : config.placeholder}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder={`Buscar ${config.label.toLowerCase()}...`}
                        />
                        <CommandEmpty>No se encontraron opciones.</CommandEmpty>
                        <CommandGroup>
                          {config.options?.map((option) => (
                            <CommandItem
                              value={option.label}
                              key={option.value}
                              onSelect={() => {
                                form.setValue(name, option.value);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  option.value === field.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {option.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Input
                    type={
                      config.type === "password" && showPassword
                        ? "text"
                        : config.type
                    }
                    placeholder={config.placeholder}
                    className={cn(
                      fieldState.error && "border-destructive",
                      validationResult?.isValid && "border-green-500",
                      config.type === "password" && "pr-10",
                    )}
                    {...field}
                  />
                )}

                {config.type === "password" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full w-10 px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </FormControl>

            {/* Password strength indicator */}
            {config.type === "password" && validationResult && watchedValue && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>{t("auth.password.label")}</span>
                  <span
                    className={cn(
                      "font-medium",
                      validationResult.strength === "strong" &&
                        "text-green-600",
                      validationResult.strength === "medium" &&
                        "text-yellow-600",
                      validationResult.strength === "weak" && "text-red-600",
                    )}
                  >
                    {validationResult.strength === "strong" &&
                      t("form.password_strength_strong")}
                    {validationResult.strength === "medium" &&
                      t("form.password_strength_medium")}
                    {validationResult.strength === "weak" &&
                      t("form.password_strength_weak")}
                  </span>
                </div>
                <Progress
                  value={
                    validationResult.strength === "strong"
                      ? 100
                      : validationResult.strength === "medium"
                        ? 60
                        : 20
                  }
                  className="h-2"
                />
                {validationResult.suggestions &&
                  validationResult.suggestions.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <ul className="list-disc list-inside space-y-1">
                        {validationResult.suggestions.map(
                          (suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            )}

            {/* Auto-suggestions */}
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => {
                      form.setValue(name, suggestion);
                      setSuggestions([]);
                    }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}

            {config.description && (
              <FormDescription>{config.description}</FormDescription>
            )}

            <AnimatePresence>
              {fieldState.error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <FormMessage />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email suggestions */}
            {config.type === "email" && validationResult?.suggestions && (
              <div className="text-sm text-muted-foreground">
                {validationResult.suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-blue-600"
                    onClick={() => {
                      const correctedEmail = suggestion
                        .split("¿Quisiste decir ")[1]
                        ?.split("?")[0];
                      if (correctedEmail) {
                        form.setValue(name, correctedEmail);
                      }
                    }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
          </FormItem>
        )}
      />
    </motion.div>
  );
}

// Form progress indicator
interface FormProgressProps {
  totalSteps?: number;
  currentStep?: number;
  completedFields?: string[];
  totalFields?: string[];
  showFieldProgress?: boolean;
}

export function FormProgress({
  totalSteps,
  currentStep,
  completedFields = [],
  totalFields = [],
  showFieldProgress = true,
}: FormProgressProps) {
  const { t } = useDivineParsing(["common"]);
  const progress = useMemo(() => {
    if (totalSteps && currentStep) {
      return (currentStep / totalSteps) * 100;
    }
    if (showFieldProgress && totalFields.length > 0) {
      return (completedFields.length / totalFields.length) * 100;
    }
    return 0;
  }, [
    totalSteps,
    currentStep,
    completedFields,
    totalFields,
    showFieldProgress,
  ]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{t("form.progress_title")}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      {showFieldProgress && totalFields.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {`${completedFields.length} of ${totalFields.length} fields completed`}
        </div>
      )}
    </div>
  );
}

// Smart form wrapper with auto-save and validation
interface SmartFormProps {
  children: React.ReactNode;
  onSubmit?: (data: any) => void | Promise<void>;
  autoSave?: boolean;
  autoSaveInterval?: number;
  showProgress?: boolean;
  enableValidation?: boolean;
  className?: string;
}

export function SmartForm({
  children,
  onSubmit,
  autoSave = false,
  autoSaveInterval = 30000,
  showProgress = false,
  enableValidation = true,
  className,
}: SmartFormProps) {
  const { t } = useDivineParsing(["common"]);
  const form = useFormContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave) return;

    const interval = setInterval(() => {
      const data = form.getValues();
      localStorage.setItem(
        "form-autosave",
        JSON.stringify({
          data,
          timestamp: new Date().toISOString(),
        }),
      );
      setLastSaved(new Date());
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [autoSave, autoSaveInterval, form]);

  // Load auto-saved data
  useEffect(() => {
    if (!autoSave) return;

    const saved = localStorage.getItem("form-autosave");
    if (saved) {
      try {
        const { data, timestamp } = JSON.parse(saved);
        const savedDate = new Date(timestamp);
        const hoursSinceLastSave =
          (Date.now() - savedDate.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastSave < 24) {
          form.reset(data);
          setLastSaved(savedDate);
        }
      } catch (error) {
        console.error("Error loading auto-saved data:", error);
      }
    }
  }, [autoSave, form]);

  const handleSubmit = async (data: any) => {
    if (!onSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit(data);
      if (autoSave) {
        localStorage.removeItem("form-autosave");
      }
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className={cn("space-y-6", className)}
    >
      {children}

      <div className="flex items-center justify-between pt-6">
        <div className="flex items-center gap-4">
          {autoSave && lastSaved && (
            <div className="text-xs text-muted-foreground">
              Guardado automáticamente: {lastSaved.toLocaleTimeString()}
            </div>
          )}

          {showProgress && (
            <div className="flex-1 max-w-xs">
              <FormProgress />
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={
            isSubmitting || (enableValidation && !form.formState.isValid)
          }
        >
          {isSubmitting ? t("form.submitting") : t("form.submit")}
        </Button>
      </div>
    </form>
  );
}

// Field array component for dynamic forms
interface FieldArrayProps {
  name: string;
  label: string;
  minItems?: number;
  maxItems?: number;
  renderItem: (index: number, remove: () => void) => React.ReactNode;
  addButtonLabel?: string;
  className?: string;
}

export function FieldArray({
  name,
  label,
  minItems = 0,
  maxItems = 10,
  renderItem,
  addButtonLabel,
  className,
}: FieldArrayProps) {
  const { t } = useDivineParsing(["common"]);
  const form = useFormContext();
  const [items, setItems] = useState([0]);

  const buttonLabel = addButtonLabel || t("form.add_item");

  const addItem = () => {
    if (items.length < maxItems) {
      setItems([...items, Math.max(...items) + 1]);
    }
  };

  const removeItem = (index: number) => {
    if (items.length > minItems) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      form.unregister(`${name}.${index}`);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">{label}</Label>
        <Badge variant="secondary">
          {items.length} / {maxItems}
        </Badge>
      </div>

      <AnimatePresence>
        {items.map((itemId, index) => (
          <motion.div
            key={itemId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border rounded-lg p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">#{index + 1}</span>
              {items.length > minItems && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {renderItem(index, () => removeItem(index))}
          </motion.div>
        ))}
      </AnimatePresence>

      {items.length < maxItems && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={addItem}
        >
          <Plus className="h-4 w-4 mr-2" />
          {buttonLabel}
        </Button>
      )}
    </div>
  );
}
