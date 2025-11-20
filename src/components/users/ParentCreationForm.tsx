"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, UserPlus, ChevronRight, ChevronLeft } from "lucide-react";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { cn } from "@/lib/utils";
import { useStepNavigation } from "@/lib/hooks/useFocusManagement";
import {
  formatChileanPhone,
  handlePhoneInputChange,
  isCompletePhoneNumber,
  normalizePhoneNumber,
} from "@/lib/phone-utils";

// Import standardized password schema
import { passwordSchema } from "@/lib/user-creation";

// Helper function to create parent schema with translations
const createParentSchemaWithTranslations = (
  t: (key: string, namespace?: string) => string,
) => {
  return z
    .object({
      // Parent information
      name: z
        .string()
        .min(2, t("admin.parent_form.validation.name_min", "admin")),
      email: z
        .string()
        .email(t("admin.parent_form.validation.email_invalid", "admin")),
      password: passwordSchema,
      confirmPassword: z
        .string()
        .min(
          1,
          t("admin.parent_form.validation.confirm_password_required", "admin"),
        ),
      phone: z
        .string()
        .min(1, t("admin.parent_form.validation.phone_required", "admin"))
        .refine(
          (val) => !val || isCompletePhoneNumber(val),
          t("admin.parent_form.validation.phone_incomplete", "admin") || "Please enter the complete phone number"
        ),
      // Student information
      studentName: z
        .string()
        .min(
          2,
          t("admin.parent_form.validation.student_name_required", "admin"),
        ),
      studentGrade: z
        .string()
        .min(
          1,
          t("admin.parent_form.validation.student_grade_required", "admin"),
        ),
      studentEmail: z
        .string()
        .email(t("admin.parent_form.validation.student_email_invalid", "admin"))
        .optional()
        .or(z.literal("")),
      guardianPhone: z
        .string()
        .optional()
        .refine(
          (val) => !val || isCompletePhoneNumber(val),
          t("admin.parent_form.validation.phone_incomplete", "admin") || "Please enter the complete phone number"
        ),
      relationship: z
        .string()
        .min(
          1,
          t("admin.parent_form.validation.relationship_required", "admin"),
        ),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("admin.parent_form.validation.password_mismatch", "admin"),
          path: ["confirmPassword"],
        });
      }
    });
};

type ParentFormValues = z.infer<
  ReturnType<typeof createParentSchemaWithTranslations>
>;
type ParentFormOutput = Omit<ParentFormValues, "confirmPassword">;

interface ParentCreationFormProps {
  onSubmit: (data: ParentFormOutput) => void;
  onCancel: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  className?: string;
}

interface StepIndicatorProps {
  currentStep: number;
}

const StepIndicator = ({ currentStep }: StepIndicatorProps) => (
  <div className="flex items-center justify-center mb-8">
    {[1, 2, 3, 4].map((step) => (
      <div key={step} className="flex items-center">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2",
            currentStep >= step
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110 border-primary"
              : "bg-muted text-muted-foreground border-muted-foreground/30",
          )}
        >
          {step}
        </div>
        {step < 4 && (
          <div
            className={cn(
              "w-12 h-1 mx-2 transition-all duration-300 rounded-full",
              currentStep > step ? "bg-primary shadow-sm" : "bg-muted",
            )}
          />
        )}
      </div>
    ))}
  </div>
);

export function ParentCreationForm({
  onSubmit,
  onCancel,
  isLoading = false,
  title,
  description,
  className,
}: ParentCreationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { t } = useDivineParsing(["admin", "common"]);

  // Create schema with translations
  const createParentSchema = createParentSchemaWithTranslations(t);

  // Grade options with translations
  const gradeOptions = [
    t("admin.parent_form.grades.pre_kinder", "admin"),
    t("admin.parent_form.grades.kinder", "admin"),
    t("admin.parent_form.grades.grade_1", "admin"),
    t("admin.parent_form.grades.grade_2", "admin"),
    t("admin.parent_form.grades.grade_3", "admin"),
    t("admin.parent_form.grades.grade_4", "admin"),
    t("admin.parent_form.grades.grade_5", "admin"),
    t("admin.parent_form.grades.grade_6", "admin"),
    t("admin.parent_form.grades.grade_7", "admin"),
    t("admin.parent_form.grades.grade_8", "admin"),
    t("admin.parent_form.grades.medium_1", "admin"),
    t("admin.parent_form.grades.medium_2", "admin"),
    t("admin.parent_form.grades.medium_3", "admin"),
    t("admin.parent_form.grades.medium_4", "admin"),
  ];

  // Relationship options with translations
  const relationshipOptions = [
    t("admin.parent_form.relationships.father", "admin"),
    t("admin.parent_form.relationships.mother", "admin"),
    t("admin.parent_form.relationships.legal_guardian", "admin"),
    t("admin.parent_form.relationships.grandparent", "admin"),
    t("admin.parent_form.relationships.uncle_aunt", "admin"),
    t("admin.parent_form.relationships.other_family", "admin"),
  ];

  // Default title and description with translations
  const defaultTitle = title || t("admin.parent_form.title", "admin");
  const defaultDescription =
    description || t("admin.parent_form.description", "admin");

  const form = useForm<ParentFormValues>({
    resolver: zodResolver(createParentSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      studentName: "",
      studentGrade: "",
      studentEmail: "",
      guardianPhone: "",
      relationship: "",
      confirmPassword: "",
    },
  });

  // Define field order for each step
  const getFieldOrderForStep = (step: number): string[] => {
    switch (step) {
      case 1:
        return ["name", "email", "phone", "relationship"];
      case 2:
        return ["password"];
      case 3:
        return ["confirmPassword"];
      case 4:
        return ["studentName", "studentGrade", "studentEmail", "guardianPhone"];
      default:
        return [];
    }
  };

  const validateStep = (step: number): boolean => {
    const values = form.getValues();

    switch (step) {
      case 1:
        // Validate parent basic info
        return !!(
          values.name &&
          values.email &&
          values.phone &&
          values.relationship
        );
      case 2:
        // Validate password creation
        return !!(
          values.password && passwordSchema.safeParse(values.password).success
        );
      case 3:
        // Validate password confirmation
        return !!(
          values.confirmPassword && values.password === values.confirmPassword
        );
      case 4:
        // Validate student info
        return !!(values.studentName && values.studentGrade);
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    } else {
      form.trigger();
    }
  };

  const handleSubmit = async (data: ParentFormValues) => {
    // Clean up empty optional fields and normalize phone numbers
    const { confirmPassword: _confirmPassword, ...formValues } = data;
    const normalizedPhone = data.phone ? normalizePhoneNumber(data.phone) : "";
    const normalizedGuardianPhone = data.guardianPhone ? normalizePhoneNumber(data.guardianPhone) : "";
    
    const cleanedData = {
      ...formValues,
      studentEmail: data.studentEmail || undefined,
      phone: normalizedPhone || data.phone,
      guardianPhone: normalizedGuardianPhone || data.guardianPhone || undefined,
    } satisfies ParentFormOutput;
    await onSubmit(cleanedData);
  };

  const { handleKeyDown } = useStepNavigation(
    getFieldOrderForStep,
    currentStep,
    4,
    nextStep,
    () => handleSubmit({} as any),
  );

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const stepTitles = [
    t("admin.parent_form.step.personal_info", "admin"),
    t("admin.parent_form.step.create_password", "admin"),
    t("admin.parent_form.step.confirm_password", "admin"),
    t("admin.parent_form.step.student_data", "admin"),
  ];

  const stepDescriptions = [
    t("admin.parent_form.step_desc.personal_info", "admin"),
    t("admin.parent_form.step_desc.create_password", "admin"),
    t("admin.parent_form.step_desc.confirm_password", "admin"),
    t("admin.parent_form.step_desc.student_data", "admin"),
  ];

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          {defaultTitle}
        </CardTitle>
        <CardDescription>{defaultDescription}</CardDescription>
      </CardHeader>

      <CardContent>
        <StepIndicator currentStep={currentStep} />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("admin.parent_form.field.name", "admin")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t(
                              "admin.parent_form.field.name_placeholder",
                              "admin",
                            )}
                            {...field}
                            onKeyDown={(e) => handleKeyDown(e, "name")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("admin.parent_form.field.email", "admin")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={t(
                              "admin.parent_form.field.email_placeholder",
                              "admin",
                            )}
                            {...field}
                            onKeyDown={(e) => handleKeyDown(e, "email")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("admin.parent_form.field.phone", "admin")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+569 8889 67763"
                            {...field}
                            onChange={(e) => {
                              const formatted = handlePhoneInputChange(
                                e.target.value,
                                field.value
                              );
                              field.onChange(formatted);
                            }}
                            onKeyDown={(e) => handleKeyDown(e, "phone")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("admin.parent_form.field.relationship", "admin")}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              onKeyDown={(e) =>
                                handleKeyDown(e, "relationship")
                              }
                            >
                              <SelectValue
                                placeholder={t(
                                  "admin.parent_form.field.relationship_placeholder",
                                  "admin",
                                )}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {relationshipOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("admin.parent_form.field.password", "admin")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder={t(
                              "admin.parent_form.field.password_placeholder",
                              "admin",
                            )}
                            {...field}
                            className="pr-10"
                            onKeyDown={(e) => handleKeyDown(e, "password")}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={
                              showPassword
                                ? t(
                                    "admin.parent_form.aria.hide_password",
                                    "admin",
                                  )
                                : t(
                                    "admin.parent_form.aria.show_password",
                                    "admin",
                                  )
                            }
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        {t(
                          "admin.parent_form.field.password_description",
                          "admin",
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("admin.parent_form.field.confirm_password", "admin")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={t(
                              "admin.parent_form.field.confirm_password_placeholder",
                              "admin",
                            )}
                            {...field}
                            className="pr-10"
                            onKeyDown={(e) =>
                              handleKeyDown(e, "confirmPassword")
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            aria-label={
                              showConfirmPassword
                                ? t(
                                    "admin.parent_form.aria.hide_confirm_password",
                                    "admin",
                                  )
                                : t(
                                    "admin.parent_form.aria.show_confirm_password",
                                    "admin",
                                  )
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="studentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("admin.parent_form.field.student_name", "admin")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t(
                              "admin.parent_form.field.student_name_placeholder",
                              "admin",
                            )}
                            {...field}
                            onKeyDown={(e) => handleKeyDown(e, "studentName")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="studentGrade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("admin.parent_form.field.student_grade", "admin")}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              onKeyDown={(e) =>
                                handleKeyDown(e, "studentGrade")
                              }
                            >
                              <SelectValue
                                placeholder={t(
                                  "admin.parent_form.field.student_grade_placeholder",
                                  "admin",
                                )}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {gradeOptions.map((grade) => (
                              <SelectItem key={grade} value={grade}>
                                {grade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="studentEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("admin.parent_form.field.student_email", "admin")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={t(
                              "admin.parent_form.field.student_email_placeholder",
                              "admin",
                            )}
                            {...field}
                            onKeyDown={(e) => handleKeyDown(e, "studentEmail")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="guardianPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("admin.parent_form.field.guardian_phone", "admin")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+569 8889 67763"
                            {...field}
                            onChange={(e) => {
                              const formatted = handlePhoneInputChange(
                                e.target.value,
                                field.value
                              );
                              field.onChange(formatted);
                            }}
                            onKeyDown={(e) => handleKeyDown(e, "guardianPhone")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  {t("admin.parent_form.button.cancel", "admin")}
                </Button>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t("admin.parent_form.button.previous", "admin")}
                  </Button>
                )}
              </div>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {t("admin.parent_form.button.next", "admin")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? t("admin.parent_form.button.creating", "admin")
                    : t("admin.parent_form.button.submit", "admin")}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
