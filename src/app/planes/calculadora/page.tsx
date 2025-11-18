"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  ArrowLeft,
  Calculator,
  Check,
  Mail,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";
import {
  BillingCycle,
  pricingPlans,
  findPricingPlan,
  isValidBillingCycle,
  billingCycleDiscount,
  calculateBillingPrice,
  formatCLP,
} from "@/data/pricing-plans";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

// billingMetadata will be created inside the component to use translations

const developerContacts = [
  {
    id: "principal",
    name: "Tu Equipo Astral",
    role: "Lead Developer & Onboarding",
    email: "plataforma@astral.cl",
    whatsappDisplay: "+56 9 7500 1234",
    whatsappLink: "https://wa.me/56975001234",
  },
  {
    id: "loreto",
    name: "Loreto",
    role: "Onboarding Chief",
    email: "loreto@astral.cl",
    whatsappDisplay: "+56 9 6854 3210",
    whatsappLink: "https://wa.me/56968543210",
  },
  {
    id: "agustin",
    name: "Agustin",
    role: "Lead Developer",
    email: "agustin@astral.cl",
    whatsappDisplay: "+56 9 8889 6773",
    whatsappLink: "https://wa.me/56988896773",
  },
  {
    id: "salesman",
    name: "Equipo de Ventas",
    role: "Sales Representative",
    email: "ventas@astral.cl",
    whatsappDisplay: "+56 9 8008 8008",
    whatsappLink: "https://wa.me/56980088008",
  },
] as const;

const numberFormatter = new Intl.NumberFormat("es-CL");

interface PricingCalculatorPageProps {
  searchParams: Promise<{
    plan?: string;
    billing?: string;
    students?: string;
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
  }>({});

  useEffect(() => {
    const resolveParams = async () => {
      const params = await searchParams;
      setResolvedSearchParams(params);
    };
    resolveParams();
  }, [searchParams]);

  // Function to update URL with current state
  const updateUrl = useCallback(
    (newBillingCycle?: BillingCycle, newStudents?: number) => {
      const params = new URLSearchParams();

      // Set current resolved params
      if (resolvedSearchParams.plan) {
        params.set("plan", resolvedSearchParams.plan);
      }
      if (resolvedSearchParams.billing) {
        params.set("billing", resolvedSearchParams.billing);
      }
      if (resolvedSearchParams.students) {
        params.set("students", resolvedSearchParams.students);
      }

      if (newBillingCycle) {
        params.set("billing", newBillingCycle);
      }

      if (newStudents !== undefined) {
        params.set("students", newStudents.toString());
      }

      router.replace(`/planes/calculadora?${params.toString()}`, {
        scroll: false,
      });
    },
    [router, resolvedSearchParams],
  );

  // Map legacy or alternative plan names to correct plan IDs
  const planMappings: Record<string, string> = {
    enterprise: "institucional",
    // Add any other mappings here if needed
  };

  const planParam = resolvedSearchParams.plan;
  const mappedPlanId = planParam
    ? planMappings[planParam] || planParam
    : undefined;
  const planFromParams = mappedPlanId
    ? findPricingPlan(mappedPlanId)
    : undefined;
  const fallbackPlan = pricingPlans[1] ?? pricingPlans[0];
  const selectedPlan = planFromParams ?? fallbackPlan;

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

  const clampStudents = (value: number) => {
    const min = selectedPlan.minStudents;
    const rounded = Math.max(min, Math.round(value));
    if (selectedPlan.maxStudents) {
      return Math.min(selectedPlan.maxStudents, rounded);
    }
    return rounded;
  };

  const initialStudents = useMemo(() => {
    const parsed = resolvedSearchParams.students
      ? Number.parseInt(resolvedSearchParams.students, 10)
      : NaN;
    if (Number.isNaN(parsed)) {
      return selectedPlan.minStudents;
    }
    return clampStudents(parsed);
  }, [
    resolvedSearchParams.students,
    selectedPlan.minStudents,
    selectedPlan.maxStudents,
  ]);

  const [students, setStudentsState] = useState<number>(
    selectedPlan.minStudents,
  );
  // Separate input state to allow temporary invalid values while typing
  const [inputValue, setInputValue] = useState<string>(
    String(selectedPlan.minStudents),
  );

  // Update students state when initialStudents changes (e.g., when URL params change)
  useEffect(() => {
    setStudentsState(initialStudents);
    setInputValue(String(initialStudents));
  }, [initialStudents]);

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

  // Sync inputValue when students changes externally (slider, buttons, plan change)
  useEffect(() => {
    setInputValue(String(students));
  }, [students]);

  // Ensure students is valid when plan changes
  useEffect(() => {
    const currentStudents = students;
    const clamped = clampStudents(currentStudents);
    if (clamped !== currentStudents) {
      setInputValue(String(clamped));
      setStudentsState(clamped);
      // Update URL after clamping
      updateUrl(billingCycle, clamped);
    }
  }, [selectedPlan.id]); // Only when plan changes

  // Create billingMetadata with translations
  const billingMetadata: Record<
    BillingCycle,
    { label: string; description: string; months: number }
  > = {
    semestral: {
      label: tc("billing.semestral"),
      description:
        tc("billing.semestral") +
        " - " +
        tc("calculator.months").replace("{count}", "6"),
      months: 6,
    },
    annual: {
      label: tc("billing.annual"),
      description:
        tc("billing.annual") +
        " - " +
        tc("calculator.months").replace("{count}", "12") +
        " (" +
        tc("billing.discount_annual") +
        ")",
      months: 12,
    },
    biannual: {
      label: tc("billing.biannual"),
      description:
        tc("billing.biannual") +
        " - " +
        tc("calculator.months").replace("{count}", "24") +
        " (" +
        tc("billing.discount_biannual") +
        ")",
      months: 24,
    },
  };

  const billingInfo = billingMetadata[billingCycle];
  const discountPercentage = billingCycleDiscount[billingCycle];
  const upfrontDiscount = 0.05; // 5% additional discount for upfront payment
  const basePrice = selectedPlan.pricePerStudent * students;

  // Calculate monthly price with plan period discount
  const monthlyPriceWithPlanDiscount = calculateBillingPrice(
    selectedPlan.pricePerStudent,
    students,
    billingCycle,
  );

  // Calculate period total with plan discount
  const periodTotalWithPlanDiscount =
    monthlyPriceWithPlanDiscount * billingInfo.months;

  // Apply upfront discount to total if selected (5% off total period amount)
  const periodTotal =
    paymentFrequency === "upfront"
      ? Math.round(periodTotalWithPlanDiscount * (1 - upfrontDiscount))
      : periodTotalWithPlanDiscount;

  // Monthly price (for display when paying monthly)
  const monthlyPrice = monthlyPriceWithPlanDiscount;

  // Upfront total (for display when paying upfront)
  const upfrontTotal = paymentFrequency === "upfront" ? periodTotal : null;

  // Savings calculations
  const savingsFromPlanDiscount = basePrice - monthlyPriceWithPlanDiscount;
  const savingsFromPlanDiscountPeriod =
    savingsFromPlanDiscount * billingInfo.months;

  const savingsFromUpfront =
    paymentFrequency === "upfront"
      ? Math.round(periodTotalWithPlanDiscount * upfrontDiscount)
      : 0;

  const totalSavingsPeriod = savingsFromPlanDiscountPeriod + savingsFromUpfront;

  // Calculate final per-student values after all discounts
  const finalPerStudentMonthly = paymentFrequency === "upfront"
    ? periodTotal / billingInfo.months / students
    : monthlyPriceWithPlanDiscount / students;
  const savingsPerStudent = selectedPlan.pricePerStudent - finalPerStudentMonthly;

  const sliderUpperBound = selectedPlan.maxStudents
    ? selectedPlan.maxStudents
    : Math.max(selectedPlan.minStudents * 4, students, 2000);

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

  const studentsFormatted = numberFormatter.format(students);
  const periodLabel =
    billingInfo.months === 1
      ? tc("calculator.month")
      : tc("calculator.months").replace("{count}", String(billingInfo.months)) +
        ` (${billingInfo.label})`;

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
      .replace("{payment_frequency}", paymentFrequencyLabel),
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
      .replace("{total}", totalFormatted),
  );

  const updateStudents = (value: number) => {
    const clamped = clampStudents(value);
    setStudents(clamped);
    setInputValue(String(clamped));
  };

  const handleStudentInputChange = (value: string) => {
    // Allow empty string or partial input while typing
    if (value === "" || value === "-") {
      setInputValue(value);
      return;
    }

    // Allow typing numbers freely
    const numeric = Number.parseInt(value.replace(/\D/g, ""), 10);
    if (!Number.isNaN(numeric)) {
      setInputValue(value.replace(/\D/g, ""));
    }
  };

  const handleStudentInputBlur = () => {
    // On blur, validate and clamp the value
    const numeric = Number.parseInt(inputValue, 10);
    if (Number.isNaN(numeric) || inputValue === "") {
      // Reset to current valid students value if input is invalid
      setInputValue(String(students));
    } else {
      // Clamp and apply the value
      updateStudents(numeric);
    }
  };

  const adjustStudents = (delta: number) => {
    updateStudents(students + delta);
  };

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
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/60 text-white">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
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
                <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-300">
                    <Users className="w-4 h-4" />{" "}
                    {tc("calculator.configure_students")}
                  </div>
                  <div className="mt-4 flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-3">
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
                        className="w-32 bg-gray-800 border-gray-700 text-lg font-semibold text-white"
                      />
                      <div className="flex items-center gap-2">
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
                          aria-label={tc("calculator.increase_10")}
                        >
                          {tc("calculator.increase_10_short")}
                        </Button>
                      </div>
                      <span className="text-sm text-gray-400">
                        {studentsLabel}
                      </span>
                    </div>
                    <Slider
                      value={[students]}
                      min={selectedPlan.minStudents}
                      max={sliderUpperBound}
                      step={1}
                      onValueChange={(value) => updateStudents(value[0])}
                    />
                  </div>
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
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={
                        paymentFrequency === "monthly" ? "default" : "outline"
                      }
                      className="justify-center py-2"
                      onClick={() => setPaymentFrequency("monthly")}
                    >
                      <span className="text-sm font-semibold">
                        {tc("calculator.pay_monthly")}
                      </span>
                    </Button>
                    <Button
                      variant={
                        paymentFrequency === "upfront" ? "default" : "outline"
                      }
                      className="justify-center py-2 relative"
                      onClick={() => setPaymentFrequency("upfront")}
                    >
                      <span className="text-sm font-semibold">
                        {tc("calculator.pay_upfront")}
                      </span>
                      <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
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
                    {discountPercentage > 0 && savingsFromPlanDiscount > 0 && (
                      <p className="mt-2 text-sm text-green-400">
                        {tc("calculator.savings_per_month")}:{" "}
                        {formatCLP(savingsFromPlanDiscount)} (
                        {Math.round(discountPercentage * 100)}%{" "}
                        {tc("calculator.less")})
                      </p>
                    )}
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
                        savingsFromPlanDiscountPeriod > 0 && (
                          <p className="text-sm text-green-400">
                            {tc("calculator.savings_from_plan")} (
                            {Math.round(discountPercentage * 100)}%):{" "}
                            {formatCLP(savingsFromPlanDiscountPeriod)}
                          </p>
                        )}
                      {savingsFromUpfront > 0 && (
                        <p className="text-sm text-green-400">
                          {tc("calculator.upfront_discount")}:{" "}
                          {formatCLP(savingsFromUpfront)}
                        </p>
                      )}
                      {totalSavingsPeriod > 0 && (
                        <p className="text-sm font-semibold text-green-400 mt-2 pt-2 border-t border-gray-700">
                          {tc("calculator.total_savings")}:{" "}
                          {formatCLP(totalSavingsPeriod)}
                        </p>
                      )}
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
                      Valor final estudiante
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-white">
                      {formatCLP(Math.round(finalPerStudentMonthly))}
                    </div>
                    <div className="mt-1 text-sm text-green-400">
                      Ahorro: {formatCLP(Math.round(savingsPerStudent))}
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
                          {contact.name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {contact.role}
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
