"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/layout/Header";
import MinEducFooter from "@/components/layout/MinEducFooter";
import CompactFooter from "@/components/layout/CompactFooter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  Check,
  Mail,
  MessageCircle,
  Users,
  AlertTriangle,
  TrendingDown,
  Info,
  ChevronRight,
} from "lucide-react";
import {
  BillingCycle,
  pricingPlans,
  findPricingPlan,
  isValidBillingCycle,
  billingCycleDiscount,
  formatCLP,
  findPlanByStudentCount,
  validatePlanForStudents,
  calculatePriceBreakdown,
  compareBillingCycles,
  type PriceBreakdown,
  type BillingCycleComparison,
} from "@/data/pricing-plans";
import {
  INSTITUTION_TYPE_INFO,
  EducationalInstitutionType,
} from "@/lib/educational-system";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { developerContacts } from "@/data/developer-contacts";
import { createBillingMetadata } from "@/data/billing-metadata";
import { toast } from "sonner";

const numberFormatter = new Intl.NumberFormat("es-CL");

// Map legacy or alternative plan names to correct plan IDs
const planMappings: Record<string, string> = {
  enterprise: "institucional",
  // Legacy mappings for renamed plans
  inicial: "esencial", // Old "inicial" is now "esencial"
  avanzado: "aula", // Old "avanzado" → "academico" → now "aula"
  academico: "aula", // Old "academico" is now "aula"
  profesional: "integral", // Old "profesional" → "superior" → now "integral"
  superior: "integral", // Old "superior" is now "integral"
};

interface PricingCalculatorPageProps {
  searchParams: Promise<{
    plan?: string;
    billing?: string;
    students?: string;
    type?: string;
  }>;
}

export default function PricingCalculatorPage({
  searchParams,
}: PricingCalculatorPageProps) {
  const { t } = useDivineParsing(["common", "planes"]);
  const tc = (key: string) => t(key, "planes");
  const router = useRouter();

  const [resolvedSearchParams, setResolvedSearchParams] = useState<{
    plan?: string;
    billing?: string;
    students?: string;
    type?: string;
  }>({});

  useEffect(() => {
    const resolveParams = async () => {
      const params = await searchParams;
      setResolvedSearchParams(params);
    };
    resolveParams();
  }, [searchParams]);

  const planParam = resolvedSearchParams.plan;
  const mappedPlanId = planParam
    ? planMappings[planParam] || planParam
    : undefined;
  const planFromParams = mappedPlanId
    ? findPricingPlan(mappedPlanId)
    : undefined;
  const fallbackPlan = pricingPlans[1] ?? pricingPlans[0];

  // Smart plan selection: use URL param if valid, otherwise auto-select based on student count
  // Initialize with plan from params if available, otherwise use fallback
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    planFromParams?.id ?? fallbackPlan.id,
  );
  const [manualPlanOverride, setManualPlanOverride] = useState<boolean>(
    Boolean(planFromParams),
  );

  // Initialize institution type
  const [institutionType, setInstitutionTypeState] =
    useState<EducationalInstitutionType>("PRESCHOOL");

  // Update selectedPlanId when resolvedSearchParams.plan changes
  useEffect(() => {
    const planParam = resolvedSearchParams.plan;
    if (resolvedSearchParams.type) {
      setInstitutionTypeState(
        resolvedSearchParams.type as EducationalInstitutionType,
      );
    }
    if (planParam) {
      const mappedPlanId = planMappings[planParam] || planParam;
      const plan = findPricingPlan(mappedPlanId);
      if (plan) {
        setSelectedPlanId((currentId) => {
          if (currentId !== plan.id) {
            return plan.id;
          }
          return currentId;
        });

        // Determine if this should be treated as a manual override
        // If the plan matches the recommended plan for the student count,
        // we treat it as "auto" mode (allow switching), unless it explicitly mismatches.
        const studentsParam = resolvedSearchParams.students;
        const parsedStudents = studentsParam
          ? parseInt(studentsParam, 10)
          : NaN;
        const effectiveStudents = Number.isNaN(parsedStudents)
          ? fallbackPlan.minStudents
          : parsedStudents;

        const recommendedForParams = findPlanByStudentCount(effectiveStudents);

        // If the param plan is the same as what we'd recommend, allow auto-switching
        // This prevents "locking" the plan when the system auto-updates the URL
        if (recommendedForParams.id === plan.id) {
          setManualPlanOverride(false);
        } else {
          setManualPlanOverride(true);
        }
        return;
      }
    }
    // Only reset if params were actually resolved (not just initial empty state)
    // Check if we have any params to know if they've been resolved
    const hasResolvedParams =
      resolvedSearchParams.billing !== undefined ||
      resolvedSearchParams.students !== undefined ||
      resolvedSearchParams.plan !== undefined;
    if (hasResolvedParams && !planParam) {
      setManualPlanOverride(false);
    }
  }, [
    resolvedSearchParams.plan,
    resolvedSearchParams.billing,
    resolvedSearchParams.students,
    fallbackPlan.minStudents,
  ]);

  // Get initial students to determine auto-plan
  const initialStudentsForPlan = useMemo(() => {
    const parsed = resolvedSearchParams.students
      ? Number.parseInt(resolvedSearchParams.students, 10)
      : NaN;
    return Number.isNaN(parsed) ? fallbackPlan.minStudents : parsed;
  }, [resolvedSearchParams.students, fallbackPlan.minStudents]);

  // Auto-select plan based on student count if no manual override
  const autoSelectedPlan = useMemo(
    () => findPlanByStudentCount(initialStudentsForPlan),
    [initialStudentsForPlan],
  );

  const selectedPlan = useMemo(() => {
    if (manualPlanOverride) {
      const plan = findPricingPlan(selectedPlanId);
      return plan ?? autoSelectedPlan;
    }
    return autoSelectedPlan;
  }, [selectedPlanId, manualPlanOverride, autoSelectedPlan]);

  // Update selectedPlanId when plan changes
  useEffect(() => {
    setSelectedPlanId(selectedPlan.id);
  }, [selectedPlan.id]);

  const initialBilling: BillingCycle = isValidBillingCycle(
    resolvedSearchParams.billing,
  )
    ? (resolvedSearchParams.billing as BillingCycle)
    : "semestral";
  const [billingCycle, setBillingCycleState] =
    useState<BillingCycle>(initialBilling);
  const [paymentFrequency, setPaymentFrequency] = useState<
    "monthly" | "upfront"
  >("monthly");

  const clampStudents = useCallback((value: number) => {
    // Clamp to global minimum and maximum, but allow values outside current plan range
    // to trigger plan switching or validation warnings
    const rounded = Math.round(value);
    return Math.max(1, Math.min(10000, rounded)); // Allow up to 10000 students max
  }, []);

  // Calculate initial students - use fallback plan to avoid circular dependency
  const initialStudents = useMemo(() => {
    const parsed = resolvedSearchParams.students
      ? Number.parseInt(resolvedSearchParams.students, 10)
      : NaN;
    if (Number.isNaN(parsed)) {
      return fallbackPlan.minStudents;
    }
    // Use global clamping to avoid dependency on selectedPlan
    return clampStudents(parsed);
  }, [resolvedSearchParams.students, fallbackPlan.minStudents, clampStudents]);

  // Initialize with fallback plan initially, will be updated when params resolve
  const [students, setStudentsState] = useState<number>(
    fallbackPlan.minStudents,
  );
  // Separate input state to allow temporary invalid values while typing
  const [inputValue, setInputValue] = useState<string>(
    String(fallbackPlan.minStudents),
  );
  const isEditingInput = useRef(false);

  // Update students state when initialStudents changes (e.g., when URL params change)
  useEffect(() => {
    // Only update if the value actually changed to avoid unnecessary re-renders
    if (students !== initialStudents) {
      setStudentsState(initialStudents);
      if (!isEditingInput.current) {
        setInputValue(String(initialStudents));
      }
    }
  }, [initialStudents, students]);

  // Function to update URL with current state (defined after all variables are declared)
  const updateUrl = useCallback(
    (
      newBillingCycle?: BillingCycle,
      newStudents?: number,
      newPlan?: string,
      newType?: EducationalInstitutionType,
    ) => {
      const params = new URLSearchParams();

      // Use new plan if provided, otherwise keep current
      const planToUse = newPlan ?? selectedPlan.id;
      params.set("plan", planToUse);

      // Use new billing cycle if provided, otherwise keep current
      const billingToUse = newBillingCycle ?? billingCycle;
      params.set("billing", billingToUse);

      // Use new students if provided, otherwise use current students state
      // We need to read the current state value, not from closure
      setStudentsState((currentStudents) => {
        const studentsToUse = newStudents ?? currentStudents;
        params.set("students", studentsToUse.toString());
        return currentStudents; // Don't change state here, just read it
      });

      // Actually set students param properly
      setStudentsState((currentStudents) => {
        const studentsToUse = newStudents ?? currentStudents;
        params.set("students", studentsToUse.toString());

        // Use new type if provided, otherwise keep current
        const typeToUse = newType ?? institutionType;
        params.set("type", typeToUse);

        router.replace(`/planes/calculadora?${params.toString()}`, {
          scroll: false,
        });

        return currentStudents; // Don't change state here
      });
    },
    [router, selectedPlan.id, billingCycle, institutionType],
  );

  // Wrapper functions to update state and URL
  const setBillingCycle = useCallback(
    (cycle: BillingCycle) => {
      setBillingCycleState(cycle);
      updateUrl(cycle, students);
    },
    [updateUrl, students],
  );

  const setStudents = useCallback(
    (newStudents: number) => {
      setStudentsState(newStudents);
      updateUrl(billingCycle, newStudents);
    },
    [updateUrl, billingCycle],
  );

  const setInstitutionType = useCallback(
    (type: EducationalInstitutionType) => {
      setInstitutionTypeState(type);
      updateUrl(billingCycle, students, undefined, type);
    },
    [updateUrl, billingCycle, students],
  );

  // Sync inputValue when students changes externally (slider, buttons, plan change)
  useEffect(() => {
    if (!isEditingInput.current) {
      setInputValue(String(students));
    }
  }, [students]);

  // Auto-switch plan when student count changes (if not manually overridden)
  useEffect(() => {
    if (!manualPlanOverride) {
      const recommendedPlan = findPlanByStudentCount(students);
      if (recommendedPlan.id !== selectedPlan.id) {
        setSelectedPlanId(recommendedPlan.id);
        updateUrl(billingCycle, students, recommendedPlan.id);
      }
    }
  }, [students, manualPlanOverride, selectedPlan.id, billingCycle, updateUrl]);

  // Ensure students is valid when plan changes - only clamp to global limits
  useEffect(() => {
    const currentStudents = students;
    const clamped = clampStudents(currentStudents);
    if (clamped !== currentStudents) {
      setInputValue(String(clamped));
      setStudentsState(clamped);
      // Update URL after clamping
      updateUrl(billingCycle, clamped);
    }
  }, [students, billingCycle, updateUrl, clampStudents]);

  // Plan validation
  const planValidation = useMemo(
    () => validatePlanForStudents(selectedPlan, students),
    [selectedPlan, students],
  );

  // Show toast notification when plan validation fails
  useEffect(() => {
    if (!planValidation.isValid && planValidation.reasonKey) {
      toast.warning(
        tc(planValidation.reasonKey)
          .replace("{plan}", planValidation.reasonParams?.plan || "")
          .replace("{min}", planValidation.reasonParams?.min || "")
          .replace("{max}", planValidation.reasonParams?.max || ""),
        {
          description: tc("calculator.plan_validation_description"),
        },
      );
    }
  }, [planValidation, tc]);

  // Check if there's a better plan for current student count
  const recommendedPlan = useMemo(
    () => findPlanByStudentCount(students),
    [students],
  );
  const shouldRecommendPlan = useMemo(
    () =>
      !manualPlanOverride &&
      recommendedPlan.id !== selectedPlan.id &&
      planValidation.isValid,
    [
      manualPlanOverride,
      recommendedPlan.id,
      selectedPlan.id,
      planValidation.isValid,
    ],
  );

  // Create billingMetadata with translations
  const billingMetadata = createBillingMetadata(tc);

  const billingInfo = billingMetadata[billingCycle];
  const discountPercentage = billingCycleDiscount[billingCycle];

  // Comprehensive price breakdown using new calculation system
  const priceBreakdown = useMemo(
    () =>
      calculatePriceBreakdown(
        selectedPlan.pricePerStudent,
        students,
        billingCycle,
        paymentFrequency,
        0.05, // upfront discount
        0.19, // VAT
      ),
    [selectedPlan.pricePerStudent, students, billingCycle, paymentFrequency],
  );

  // Billing cycle comparison for savings optimizer
  const billingComparisons = useMemo(
    () =>
      compareBillingCycles(
        selectedPlan.pricePerStudent,
        students,
        paymentFrequency,
      ),
    [selectedPlan.pricePerStudent, students, paymentFrequency],
  );

  // Best billing cycle (lowest total cost)
  const bestBillingCycle = useMemo(
    () => billingComparisons[0],
    [billingComparisons],
  );

  // Derived values for backward compatibility and display
  const monthlyPrice = priceBreakdown.totalPerMonth;
  const periodTotal = priceBreakdown.total;
  const upfrontTotal = paymentFrequency === "upfront" ? periodTotal : null;
  const totalSavingsPeriod = priceBreakdown.savings.total;
  // Safe division - students is always >= 1 due to clamping
  const finalPerStudentMonthly =
    students > 0
      ? priceBreakdown.totalPerMonth / students
      : priceBreakdown.totalPerMonth;
  const savingsPerStudent =
    selectedPlan.pricePerStudent - finalPerStudentMonthly;

  const sliderUpperBound = selectedPlan.maxStudents
    ? selectedPlan.maxStudents
    : Math.max(selectedPlan.minStudents * 4, Math.ceil(students * 1.5), 2000);

  const studentsLabel = `${numberFormatter.format(selectedPlan.minStudents)}${
    selectedPlan.maxStudents
      ? ` - ${numberFormatter.format(selectedPlan.maxStudents)}`
      : "+"
  } ${tc("calculator.students_count").replace("{count}", "")}`;

  const cycleOptions = (
    Object.keys(billingMetadata) as Array<BillingCycle>
  ).map((value) => ({
    value,
    label: billingMetadata[value].label,
    description: billingMetadata[value].description,
  }));

  const studentsFormatted = useMemo(
    () => numberFormatter.format(students),
    [students],
  );
  const periodLabel = useMemo(
    () =>
      billingInfo.months === 1
        ? tc("calculator.month")
        : tc("calculator.months").replace(
            "{count}",
            String(billingInfo.months),
          ) + ` (${billingInfo.label})`,
    [billingCycle, tc],
  );

  const monthlyPriceFormatted = formatCLP(monthlyPrice);
  const totalFormatted = formatCLP(periodTotal);
  const paymentFrequencyLabel =
    paymentFrequency === "monthly"
      ? tc("calculator.pay_monthly")
      : tc("calculator.pay_upfront");

  const whatsappMessage = encodeURIComponent(
    tc("calculator.whatsapp_message")
      .replace("{plan}", selectedPlan.name)
      .replace("{students}", studentsFormatted)
      .replace("{cycle}", billingInfo.label)
      .replace("{monthly_price}", monthlyPriceFormatted)
      .replace("{period}", periodLabel)
      .replace("{total}", totalFormatted)
      .replace("{payment_frequency}", paymentFrequencyLabel) +
      `\n${tc("calculator.institution_type_prefix")} ${INSTITUTION_TYPE_INFO[institutionType].chileanName}`,
  );

  const emailSubject = encodeURIComponent(
    tc("calculator.email_subject")
      .replace("{plan}", selectedPlan.name)
      .replace("{students}", studentsFormatted),
  );
  const emailBody = encodeURIComponent(
    tc("calculator.email_body")
      .replace("{plan}", selectedPlan.name)
      .replace("{students}", studentsFormatted)
      .replace("{cycle}", billingInfo.label)
      .replace("{monthly_price}", monthlyPriceFormatted)
      .replace("{period}", periodLabel)
      .replace("{total}", totalFormatted) +
      `\n${tc("calculator.institution_type_prefix")} ${INSTITUTION_TYPE_INFO[institutionType].chileanName}`,
  );

  const updateStudents = useCallback(
    (value: number) => {
      const clamped = clampStudents(value);
      setStudentsState(clamped);
      // Always update input value when called from slider or buttons
      // The isEditingInput check is only for preventing updates while typing
      setInputValue(String(clamped));
      isEditingInput.current = false; // Reset editing flag
      updateUrl(billingCycle, clamped);
    },
    [clampStudents, billingCycle, updateUrl],
  );

  const handleStudentInputChange = useCallback(
    (value: string) => {
      isEditingInput.current = true;
      // Allow empty string or partial input while typing
      if (value === "" || value === "-") {
        setInputValue(value);
        return;
      }

      // Allow typing numbers freely
      const numeric = Number.parseInt(value.replace(/\D/g, ""), 10);
      if (!Number.isNaN(numeric)) {
        setInputValue(value.replace(/\D/g, ""));
        // Live update of calculations - use clampStudents for consistency
        const clamped = clampStudents(numeric);
        setStudentsState(clamped);
        updateUrl(billingCycle, clamped);
      }
    },
    [billingCycle, updateUrl, clampStudents],
  );

  const handleStudentInputBlur = useCallback(() => {
    isEditingInput.current = false;
    // On blur, validate and clamp the value
    const numeric = Number.parseInt(inputValue, 10);
    if (Number.isNaN(numeric) || inputValue === "") {
      // Reset to current valid students value if input is invalid
      setInputValue(String(students));
    } else {
      // Clamp and apply the value
      const clamped = clampStudents(numeric);
      setStudentsState(clamped);
      setInputValue(String(clamped));
      updateUrl(billingCycle, clamped);
    }
  }, [inputValue, students, clampStudents, billingCycle, updateUrl]);

  const adjustStudents = useCallback(
    (delta: number) => {
      const newValue = students + delta;
      const clamped = clampStudents(newValue);
      setStudentsState(clamped);
      setInputValue(String(clamped));
      updateUrl(billingCycle, clamped);
    },
    [students, clampStudents, billingCycle, updateUrl],
  );

  const highlightItems = [
    {
      label: tc("calculator.recommended_range"),
      value: selectedPlan.maxStudents
        ? `${numberFormatter.format(selectedPlan.minStudents)} - ${numberFormatter.format(selectedPlan.maxStudents)} ${tc("calculator.students_count").replace("{count}", "")}`
        : `${numberFormatter.format(selectedPlan.minStudents)}+ ${tc("calculator.students_count").replace("{count}", "")}`,
    },
    {
      label: tc("calculator.price_per_student"),
      value: `${formatCLP(selectedPlan.pricePerStudent)} / ${tc("calculator.month")}`,
    },
    {
      label: tc("calculator.admin_users"),
      value: `${selectedPlan.features.users}`,
    },
    {
      label: tc("calculator.support"),
      value: selectedPlan.features.support,
    },
  ];

  return (
    <div className="min-h-screen bg-responsive-desktop bg-planes">
      <Header />
      <main className="container mx-auto px-4 pt-8 pb-16">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr] lg:grid-cols-1">
            <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/60 text-white">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-3xl font-semibold">
                        {selectedPlan.name}
                      </CardTitle>
                      {selectedPlan.badge && (
                        <Badge className="bg-primary text-primary-foreground">
                          {selectedPlan.badge}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-gray-300 text-base mt-2">
                      {selectedPlan.description}
                    </CardDescription>

                    {/* Plan Selector */}
                    <div className="flex flex-nowrap gap-2 mt-4 mb-2">
                      {pricingPlans.map((plan) => (
                        <Button
                          key={plan.id}
                          variant={
                            selectedPlan.id === plan.id ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            setSelectedPlanId(plan.id);
                            setManualPlanOverride(true);
                            updateUrl(billingCycle, students, plan.id);
                          }}
                          className={`flex-1 ${
                            selectedPlan.id === plan.id
                              ? "bg-primary text-primary-foreground"
                              : "border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                          }`}
                        >
                          {plan.name}
                        </Button>
                      ))}
                    </div>

                    {/* Plan Validation Warning */}
                    {!planValidation.isValid && (
                      <div className="mt-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-yellow-400 leading-tight">
                                {tc("calculator.plan_not_compatible")}
                              </p>
                              <p className="text-xs text-yellow-300/80 mt-0 leading-tight">
                                {planValidation.reasonKey
                                  ? tc(planValidation.reasonKey)
                                      .replace(
                                        "{plan}",
                                        planValidation.reasonParams?.plan,
                                      )
                                      .replace(
                                        "{min}",
                                        planValidation.reasonParams?.min,
                                      )
                                      .replace(
                                        "{max}",
                                        planValidation.reasonParams?.max,
                                      )
                                  : ""}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 h-8 w-8 text-yellow-400 border-yellow-400/50 hover:bg-yellow-400/20 hover:border-yellow-400"
                            onClick={() => {
                              setSelectedPlanId(recommendedPlan.id);
                              setManualPlanOverride(false);
                              updateUrl(
                                billingCycle,
                                students,
                                recommendedPlan.id,
                              );
                            }}
                            title={tc("calculator.change_to").replace(
                              "{plan}",
                              recommendedPlan.name,
                            )}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {/* Plan Recommendation */}
                    {shouldRecommendPlan && (
                      <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Info className="w-4 h-4 text-primary shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-primary leading-tight">
                                {tc("calculator.recommended_plan_available")}
                              </p>
                              <p
                                className="text-xs text-primary/80 mt-0 leading-tight"
                                dangerouslySetInnerHTML={{
                                  __html: tc(
                                    "calculator.recommended_plan_description",
                                  )
                                    .replace("{students}", studentsFormatted)
                                    .replace("{plan}", recommendedPlan.name),
                                }}
                              />
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 h-8 w-8 text-primary border-primary/50 hover:bg-primary/20 hover:border-primary"
                            onClick={() => {
                              setSelectedPlanId(recommendedPlan.id);
                              setManualPlanOverride(false);
                              updateUrl(
                                billingCycle,
                                students,
                                recommendedPlan.id,
                              );
                            }}
                            title={tc("calculator.change_to").replace(
                              "{plan}",
                              recommendedPlan.name,
                            )}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">
                      {tc("calculator.price_per_student")}
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {formatCLP(selectedPlan.pricePerStudent)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-300">
                    <Users className="w-4 h-4" />{" "}
                    {tc("calculator.configure_students")}
                  </div>
                  <div className="mt-4 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={inputValue}
                          onChange={(event) =>
                            handleStudentInputChange(event.target.value)
                          }
                          onBlur={handleStudentInputBlur}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.currentTarget.blur();
                            }
                          }}
                          className="flex-1 sm:flex-none sm:w-32 bg-gray-800 border-gray-700 text-lg font-semibold text-white"
                          aria-label={tc("calculator.aria.student_count_range")
                            .replace(
                              "{min}",
                              selectedPlan.minStudents.toString(),
                            )
                            .replace(
                              "{max}",
                              selectedPlan.maxStudents
                                ? ` - ${selectedPlan.maxStudents}`
                                : "+",
                            )}
                          aria-describedby="students-range-description"
                        />
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => adjustStudents(-10)}
                            disabled={students <= selectedPlan.minStudents}
                            aria-label={tc("calculator.decrease_10")}
                          >
                            {tc("calculator.decrease_10_short")}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => adjustStudents(10)}
                            disabled={
                              selectedPlan.maxStudents !== null &&
                              students >= selectedPlan.maxStudents
                            }
                            aria-label={tc("calculator.increase_10")}
                          >
                            {tc("calculator.increase_10_short")}
                          </Button>
                        </div>
                      </div>
                      <span
                        id="students-range-description"
                        className="text-sm text-gray-400 text-center sm:text-left"
                      >
                        {studentsLabel}
                      </span>
                    </div>
                    <Slider
                      value={[students]}
                      min={selectedPlan.minStudents}
                      max={sliderUpperBound}
                      step={1}
                      onValueChange={(value) => updateStudents(value[0])}
                      aria-label={tc("calculator.aria.student_selector")}
                      aria-valuemin={selectedPlan.minStudents}
                      aria-valuemax={sliderUpperBound}
                      aria-valuenow={students}
                    />
                  </div>
                </div>

                {/* Institution Type Selector */}
                <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
                  <div className="text-sm font-semibold uppercase tracking-wide text-gray-300 mb-4">
                    {tc("educational_system.institution_type")}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(INSTITUTION_TYPE_INFO).map(
                      ([key, info]) => (
                        <Button
                          key={key}
                          onClick={() =>
                            setInstitutionType(
                              key as EducationalInstitutionType,
                            )
                          }
                          variant={
                            institutionType === key ? "default" : "outline"
                          }
                          size="sm"
                          className={`${
                            institutionType === key
                              ? info.color
                              : "border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                          }`}
                        >
                          {info.chileanName}
                        </Button>
                      ),
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    {INSTITUTION_TYPE_INFO[institutionType].description}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {highlightItems.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-gray-800 bg-gray-900/60 p-4"
                    >
                      <div className="text-xs uppercase tracking-wide text-gray-400">
                        {item.label}
                      </div>
                      <div className="mt-2 text-lg font-semibold text-white">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/60 text-white">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calculator className="w-6 h-6 text-primary" />
                  <div>
                    <CardTitle className="text-2xl">
                      {tc("calculator.estimated_investment")}
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      {tc("calculator.calculation_note")}
                    </CardDescription>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {cycleOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        billingCycle === option.value ? "default" : "outline"
                      }
                      className="justify-center py-3 px-4"
                      onClick={() => setBillingCycle(option.value)}
                      aria-label={`Ciclo de facturación: ${option.label}`}
                      aria-pressed={billingCycle === option.value}
                    >
                      <span className="text-sm font-semibold">
                        {option.label}
                      </span>
                    </Button>
                  ))}
                </div>
                {/* Payment Frequency Selector */}
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-300">
                    {tc("calculator.payment_frequency")}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={
                        paymentFrequency === "monthly" ? "default" : "outline"
                      }
                      className="justify-center py-2 flex-1 min-w-[155px]"
                      onClick={() => setPaymentFrequency("monthly")}
                      aria-label={tc("calculator.aria.monthly_payment")}
                      aria-pressed={paymentFrequency === "monthly"}
                    >
                      <span className="text-sm font-semibold">
                        {tc("calculator.pay_monthly")}
                      </span>
                    </Button>
                    <Button
                      variant={
                        paymentFrequency === "upfront" ? "default" : "outline"
                      }
                      className="justify-center py-2 relative flex-[1.2] pr-8"
                      onClick={() => setPaymentFrequency("upfront")}
                      aria-label={tc("calculator.aria.upfront_payment")}
                      aria-pressed={paymentFrequency === "upfront"}
                    >
                      <span className="text-sm font-semibold">
                        {tc("calculator.pay_upfront")}
                      </span>
                      <span
                        className="absolute -top-2 -right-2 bg-green-500 text-white text-sm font-bold px-2 py-1 rounded-full shadow-lg"
                        aria-label={tc("calculator.aria.discount_5_percent")}
                      >
                        -5%
                      </span>
                    </Button>
                  </div>
                  {paymentFrequency === "upfront" && (
                    <p className="text-xs text-gray-400 italic">
                      {tc("calculator.upfront_discount_disclosure")}
                    </p>
                  )}
                </div>
                {/* Savings Optimizer */}
                {bestBillingCycle &&
                  bestBillingCycle.cycle !== billingCycle &&
                  bestBillingCycle.savings > 0 && (
                    <div className="rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <TrendingDown className="w-4 h-4 text-green-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-1.5 flex-wrap leading-tight">
                              <span className="text-xs font-medium text-green-400 uppercase tracking-wide">
                                {tc("calculator.best_option_available")}
                              </span>
                              <span className="text-sm font-bold text-green-300">
                                {formatCLP(
                                  (priceBreakdown.totalPerMonth -
                                    bestBillingCycle.monthlyCost) *
                                    billingInfo.months,
                                )}
                              </span>
                              <span className="text-xs text-green-300/70">
                                {tc("calculator.savings")}
                              </span>
                            </div>
                            <p className="text-xs text-gray-300 mt-0 leading-tight">
                              {tc("calculator.best_option_description")
                                .replace(
                                  "{cycle}",
                                  billingMetadata[bestBillingCycle.cycle].label,
                                )
                                .replace(
                                  "{amount}",
                                  formatCLP(
                                    (priceBreakdown.totalPerMonth -
                                      bestBillingCycle.monthlyCost) *
                                      billingInfo.months,
                                  ),
                                )
                                .replace("{months}", String(billingInfo.months))
                                .replace(
                                  "{percent}",
                                  String(bestBillingCycle.savingsPercent),
                                )}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0 h-8 w-8 text-green-400 border-green-400/50 hover:bg-green-400/20 hover:border-green-400"
                          onClick={() =>
                            setBillingCycle(bestBillingCycle.cycle)
                          }
                          title={tc("calculator.change_to_cycle").replace(
                            "{cycle}",
                            billingMetadata[bestBillingCycle.cycle].label,
                          )}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
              </CardHeader>
              <CardContent className="space-y-5">
                {paymentFrequency === "monthly" ? (
                  <div className="rounded-2xl border border-gray-800 bg-black/40 p-5">
                    <div className="text-sm text-gray-300">
                      {tc("calculator.monthly_payment")}
                    </div>
                    <div className="mt-2 text-4xl font-bold text-primary">
                      {formatCLP(monthlyPrice)}
                    </div>
                    <p className="mt-2 text-sm text-gray-400">
                      {studentsFormatted}{" "}
                      {tc("calculator.students_count").replace("{count}", "")} •{" "}
                      {billingInfo.label}
                    </p>
                    {discountPercentage > 0 &&
                      priceBreakdown.savings.fromBillingCycle > 0 && (
                        <p className="mt-2 text-sm text-green-400">
                          {tc("calculator.savings_per_month")}:{" "}
                          {formatCLP(
                            priceBreakdown.savings.fromBillingCycle /
                              billingInfo.months,
                          )}{" "}
                          ({Math.round(discountPercentage * 100)}%{" "}
                          {tc("calculator.less")})
                        </p>
                      )}
                    {/* VAT Notice */}
                    <p className="mt-2 text-xs text-gray-500">
                      {tc("calculator.price_includes_vat")}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gray-800 bg-black/40 p-5">
                    <div className="text-sm text-gray-300">
                      {tc("calculator.full_payment")}
                    </div>
                    <div className="mt-2 text-4xl font-bold text-primary">
                      {formatCLP(upfrontTotal!)}
                    </div>
                    <p className="mt-2 text-sm text-gray-400">
                      {studentsFormatted}{" "}
                      {tc("calculator.students_count").replace("{count}", "")} •{" "}
                      {billingInfo.label} • {tc("calculator.pay_upfront")}
                    </p>
                    <div className="mt-3 space-y-1">
                      {discountPercentage > 0 &&
                        priceBreakdown.savings.fromBillingCycle > 0 && (
                          <p className="text-sm text-green-400">
                            {tc("calculator.savings_from_plan")} (
                            {Math.round(discountPercentage * 100)}%):{" "}
                            {formatCLP(priceBreakdown.savings.fromBillingCycle)}
                          </p>
                        )}
                      {priceBreakdown.savings.fromUpfront > 0 && (
                        <p className="text-sm text-green-400">
                          {tc("calculator.upfront_discount")}:{" "}
                          {formatCLP(priceBreakdown.savings.fromUpfront)}
                        </p>
                      )}
                      {totalSavingsPeriod > 0 && (
                        <p className="text-sm font-semibold text-green-400 mt-2 pt-2 border-t border-gray-700">
                          {tc("calculator.total_savings")}:{" "}
                          {formatCLP(totalSavingsPeriod)}
                        </p>
                      )}
                    </div>
                    {/* VAT Breakdown */}
                    <div className="mt-3 pt-3 border-t border-gray-700 space-y-1 text-xs">
                      <div className="flex justify-between text-gray-400">
                        <span>{tc("calculator.subtotal")}</span>
                        <span>{formatCLP(priceBreakdown.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>{tc("calculator.vat")}</span>
                        <span>{formatCLP(priceBreakdown.vatAmount)}</span>
                      </div>
                      <div className="flex justify-between text-primary font-semibold pt-1 border-t border-gray-700">
                        <span>{tc("calculator.total")}</span>
                        <span>{formatCLP(priceBreakdown.total)}</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
                    <div className="text-xs uppercase tracking-wide text-gray-400">
                      {tc("calculator.total_per_period").replace(
                        "{period}",
                        periodLabel,
                      )}
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-white">
                      {formatCLP(periodTotal)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
                    <div className="text-xs uppercase tracking-wide text-gray-400">
                      {tc("calculator.final_student_price")}
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-white">
                      {formatCLP(Math.round(finalPerStudentMonthly))}
                    </div>
                    <div className="mt-1 text-sm text-green-400">
                      {tc("calculator.savings")}:{" "}
                      {formatCLP(Math.round(savingsPerStudent))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
                    <div className="text-xs uppercase tracking-wide text-gray-400">
                      {tc("calculator.savings_in_period")}
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-green-400">
                      {totalSavingsPeriod > 0
                        ? formatCLP(totalSavingsPeriod)
                        : "$0"}
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
                  <p className="text-sm text-primary font-semibold">
                    {tc("calculator.ready_to_activate")}
                  </p>
                  <p className="text-sm text-gray-200 mt-1">
                    {tc("calculator.ready_description")}
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Button asChild className="flex-1">
                      <a
                        href={`${developerContacts[0].whatsappLink}?text=${whatsappMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {tc("calculator.contact_express")}
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                      <a
                        href={`mailto:${developerContacts[0].email}?subject=${emailSubject}&body=${emailBody}`}
                      >
                        {tc("calculator.request_activation")}
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/60 text-white">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">
                {tc("calculator.contact_team")}
              </CardTitle>
              <CardDescription className="text-gray-300 text-base">
                {tc("calculator.contact_description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {developerContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="rounded-2xl border border-gray-800 bg-black/40 p-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-3 text-primary">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-white">
                          {tc(contact.nameKey)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {tc(contact.roleKey)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-gray-300">
                      <div>
                        <span className="block text-xs uppercase tracking-wide text-gray-500">
                          {tc("calculator.direct_email")}
                        </span>
                        <a
                          href={`mailto:${contact.email}?subject=${emailSubject}&body=${emailBody}`}
                          className="text-white hover:underline"
                        >
                          {contact.email}
                        </a>
                      </div>
                      <div>
                        <span className="block text-xs uppercase tracking-wide text-gray-500">
                          {tc("calculator.whatsapp_immediate")}
                        </span>
                        <a
                          href={`${contact.whatsappLink}?text=${whatsappMessage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:underline"
                        >
                          {contact.whatsappDisplay}
                        </a>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                      <Button asChild className="flex-1">
                        <a
                          href={`${contact.whatsappLink}?text=${whatsappMessage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="w-4 h-4" />
                          {tc("calculator.whatsapp_now")}
                        </a>
                      </Button>
                      <Button asChild variant="outline" className="flex-1">
                        <a
                          href={`mailto:${contact.email}?subject=${emailSubject}&body=${emailBody}`}
                        >
                          <Mail className="w-4 h-4" />
                          {tc("calculator.send_email")}
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <MinEducFooter />
      <CompactFooter />
    </div>
  );
}
