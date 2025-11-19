"use client";

import React from "react";
import Header from "@/components/layout/Header";
import MinEducFooter from "@/components/layout/MinEducFooter";
import CompactFooter from "@/components/layout/CompactFooter";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContactForm } from "@/components/contact/ContactForm";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Shield,
  Server,
  Lock,
  Phone,
  Users,
  BookOpen,
  HardDrive,
  Video,
  Zap,
  BarChart3,
  Database,
  Code,
  Headphones,
  Clock,
  TrendingUp,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "motion/react";
import { useDesktopToggle } from "@/lib/hooks/useDesktopToggle";
import { layout, typography } from "@/lib/responsive-utils";
import {
  BillingCycle,
  pricingPlans,
  featureLabels,
  billingCycleDiscount,
  calculateBillingPrice,
  formatCLP,
} from "@/data/pricing-plans";

const plans = pricingPlans;

const featuresList = featureLabels;

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerChildren: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function PreciosPage() {
  const { t } = useDivineParsing(["common", "planes"]);
  const tp = (key: string) =>
    t(key.startsWith("planes.") ? key.slice(7) : key, "planes");
  const { isDesktopForced } = useDesktopToggle();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("semestral");
  const [mounted] = useState(true);
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());

  const getDiscount = (cycle: BillingCycle) => billingCycleDiscount[cycle];

  const togglePlanExpansion = (planId: string) => {
    setExpandedPlans((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(planId)) {
        newSet.delete(planId);
      } else {
        newSet.add(planId);
      }
      return newSet;
    });
  };

  const getMonthlyPrice = (
    pricePerStudent: number,
    students: number = 1,
    cycle: BillingCycle,
  ) => {
    const total = calculateBillingPrice(pricePerStudent, students, cycle);
    const divisor = cycle === "semestral" ? 6 : cycle === "annual" ? 12 : 24;
    return total / divisor;
  };

  const getMonthlyPriceWithoutDiscount = (
    pricePerStudent: number,
    students: number = 1,
    cycle: BillingCycle,
  ) => {
    const baseTotal = pricePerStudent * students;
    const divisor = cycle === "semestral" ? 6 : cycle === "annual" ? 12 : 24;
    return baseTotal / divisor;
  };

  const getTotalPrice = (
    pricePerStudent: number,
    students: number,
    cycle: BillingCycle,
  ) => {
    return calculateBillingPrice(pricePerStudent, students, cycle);
  };

  const featureIcons: Record<
    string,
    React.ComponentType<{ className?: string }>
  > = {
    courses: BookOpen,
    storage: HardDrive,
    meetings: Video,
    users: Users,
    support: Headphones,
    sla: Shield,
    platform: Zap,
    basicMaterials: BookOpen,
    academicTracking: BarChart3,
    training: TrendingUp,
    advancedReports: BarChart3,
    integrations: Code,
    api: Database,
    dedicatedManager: Users,
  };

  const renderFeatureAvailability = (
    isAvailable: boolean,
    availableText: string = tp("pricing.available"),
    notAvailableText: string = tp("pricing.not_available"),
  ) =>
    isAvailable ? (
      <span className="text-green-500 font-semibold">{availableText}</span>
    ) : (
      <span className="text-red-500">{notAvailableText}</span>
    );

  const renderFeatureIncluded = (isIncluded: boolean) =>
    isIncluded ? (
      <span className="text-green-500 font-semibold">
        {tp("pricing.included")}
      </span>
    ) : (
      <span className="text-red-500">{tp("pricing.not_included")}</span>
    );

  return (
    <div className="min-h-screen bg-responsive-desktop bg-planes">
      <Header />
      <main className="container mx-auto px-4 pt-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerChildren}
              className="max-w-4xl mx-auto"
            >
              <motion.div
                variants={fadeInUp}
                className={`mb-4 transition-all duration-700 ease-out ${
                  mounted
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <div className="backdrop-blur-md bg-white/5 dark:bg-black/20 rounded-2xl border border-white/10 dark:border-white/5 shadow-2xl p-6 mx-auto inline-block">
                  <h1
                    className={`${typography.hero(isDesktopForced)} font-bold leading-tight text-gray-900 dark:text-white drop-shadow-2xl text-center transition-all duration-700 ease-out`}
                  >
                    {tp("planes.hero.title")}
                  </h1>
                  <p className="text-center text-lg font-medium leading-relaxed text-gray-700 dark:text-gray-300 mt-3 transition-all duration-700 ease-out md:text-xl">
                    {tp("planes.hero.subtitle")}
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Billing Cycle Toggle */}
            <div className="flex justify-center gap-4 mb-6">
              <Button
                onClick={() => setBillingCycle("semestral")}
                variant={billingCycle === "semestral" ? "default" : "outline"}
                size="lg"
                className="min-w-[160px] text-lg font-bold py-6 px-8 h-auto"
              >
                {tp("planes.billing.semestral")}
              </Button>
              <Button
                onClick={() => setBillingCycle("annual")}
                variant={billingCycle === "annual" ? "default" : "outline"}
                size="lg"
                className="min-w-[160px] text-lg font-bold py-6 px-8 h-auto relative"
              >
                {tp("planes.billing.annual")}
                <span className="absolute -top-2 -right-2 bg-green-700 text-white text-sm px-3 py-1 rounded-full font-bold">
                  {tp("planes.billing.discount_annual")}
                </span>
              </Button>
              <Button
                onClick={() => setBillingCycle("biannual")}
                variant={billingCycle === "biannual" ? "default" : "outline"}
                size="lg"
                className="min-w-[160px] text-lg font-bold py-6 px-8 h-auto relative"
              >
                {tp("planes.billing.biannual")}
                <span className="absolute -top-2 -right-2 bg-green-700 text-white text-sm px-3 py-1 rounded-full font-bold">
                  {tp("planes.billing.discount_biannual")}
                </span>
              </Button>
            </div>
            <p className="text-sm text-gray-700 dark:text-white">
              {tp("planes.billing.billing_info")}
            </p>
          </div>

          {/* Pricing Cards - Enhanced with Detailed Information */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12 grid-rows-[1fr]">
            {plans.map((plan) => {
              const monthlyPrice = getMonthlyPrice(
                plan.pricePerStudent,
                1,
                billingCycle,
              );
              const monthlyPriceWithoutDiscount =
                getMonthlyPriceWithoutDiscount(
                  plan.pricePerStudent,
                  1,
                  billingCycle,
                );
              const isExpanded = expandedPlans.has(plan.id);

              return (
                <Card
                  key={plan.id}
                  className="relative backdrop-blur-xl bg-card/80 border border-border rounded-2xl shadow-2xl flex flex-col h-full hover:shadow-3xl transition-all duration-300"
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <span
                        className={`${
                          plan.badge === "Premium"
                            ? "bg-linear-to-r from-purple-500 to-pink-500"
                            : "bg-primary"
                        } text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1`}
                      >
                        <Sparkles className="w-3 h-3" />
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold text-foreground min-h-[3rem] flex items-center justify-center text-center">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-sm font-medium mt-2">
                      {plan.description}
                    </CardDescription>

                    {/* Simple Price Display */}
                    <div className="pt-6 pb-4 border-b border-border/50">
                      <div className="text-center">
                        {billingCycle !== "semestral" ? (
                          <>
                            <div className="flex items-center justify-center gap-3 mb-2">
                              <div className="text-xl font-medium text-muted-foreground line-through">
                                {formatCLP(plan.pricePerStudent)}
                              </div>
                              <div className="text-4xl font-bold text-primary">
                                {formatCLP(
                                  calculateBillingPrice(
                                    plan.pricePerStudent,
                                    1,
                                    billingCycle,
                                  ),
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <span className="text-xs font-semibold text-green-500">
                                {tp("pricing.savings_label")}{" "}
                                {(getDiscount(billingCycle) * 100).toFixed(0)}%
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="text-4xl font-bold text-primary mb-2">
                            {formatCLP(plan.pricePerStudent)}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground font-medium">
                          {tp("billing.per_student_per_month")}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col px-6">
                    {/* Key Features List */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                        <Zap className="w-4 h-4 text-primary" />
                        {tp("pricing.key_features")}
                      </div>
                      <ul className="space-y-2.5 text-sm">
                        {[
                          {
                            key: "courses",
                            label: `${plan.features.courses} cursos`,
                            icon: BookOpen,
                          },
                          {
                            key: "subjects",
                            label: `${plan.features.subjects} asignaturas`,
                            icon: BookOpen,
                          },
                          {
                            key: "storage",
                            label: `${plan.features.storage} de almacenamiento`,
                            icon: HardDrive,
                          },
                          {
                            key: "meetings",
                            label: `${plan.features.meetings} ${tp("pricing.virtual_meetings_per_month")}`,
                            icon: Video,
                          },
                          {
                            key: "users",
                            label: `${plan.features.users} ${tp("pricing.admin_users")}`,
                            icon: Users,
                          },
                          {
                            key: "support",
                            label: `${tp("pricing.support_label")}: ${plan.features.support}`,
                            icon: Headphones,
                          },
                          {
                            key: "sla",
                            label: tp("pricing.sla_availability").replace(
                              "{sla}",
                              plan.features.sla,
                            ),
                            icon: Shield,
                          },
                        ].map((feature) => {
                          const Icon = feature.icon;
                          return (
                            <li
                              key={feature.key}
                              className="flex items-start gap-2 text-muted-foreground"
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <Icon className="w-4 h-4 text-primary shrink-0" />
                                <span>{feature.label}</span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Expandable Detailed Features */}
                    <div className="border-t border-border/50 pt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between text-xs"
                        onClick={() => togglePlanExpansion(plan.id)}
                      >
                        <span className="flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          {isExpanded
                            ? tp("pricing.hide_all_features")
                            : tp("pricing.view_all_features")}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>

                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 space-y-4"
                        >
                          {/* Platform Features */}
                          <div>
                            <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                              <Zap className="w-4 h-4 text-primary" />
                              {tp("pricing.platform")}
                            </h4>
                            <ul className="space-y-1.5 text-xs text-muted-foreground pl-6">
                              <li>✓ {tp("pricing.full_platform_access")}</li>
                              <li>✓ {tp("pricing.basic_materials")}</li>
                              <li>✓ {tp("pricing.academic_tracking")}</li>
                            </ul>
                          </div>

                          {/* Advanced Features */}
                          <div>
                            <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-primary" />
                              {tp("pricing.advanced_features")}
                            </h4>
                            <ul className="space-y-1.5 text-xs text-muted-foreground pl-6">
                              <li>
                                {tp("pricing.training")}:{" "}
                                {renderFeatureIncluded(plan.features.training)}
                              </li>
                              <li>
                                {tp("pricing.advanced_reports")}:{" "}
                                {renderFeatureAvailability(
                                  plan.features.advancedReports,
                                )}
                              </li>
                              <li>
                                {tp("pricing.integrations")}:{" "}
                                {renderFeatureAvailability(
                                  plan.features.integrations,
                                )}
                              </li>
                              <li>
                                {tp("pricing.api_webhooks")}:{" "}
                                {renderFeatureAvailability(plan.features.api)}
                              </li>
                              <li>
                                {tp("pricing.dedicated_manager")}:{" "}
                                {renderFeatureIncluded(
                                  plan.features.dedicatedManager,
                                )}
                              </li>
                            </ul>
                          </div>

                          {/* Limits & Capacity */}
                          <div>
                            <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                              <Database className="w-4 h-4 text-primary" />
                              {tp("pricing.limits_capacity")}
                            </h4>
                            <ul className="space-y-1.5 text-xs text-muted-foreground pl-6">
                              <li>
                                {tp("pricing.students_range")}:{" "}
                                {plan.minStudents} -{" "}
                                {plan.maxStudents
                                  ? `${plan.maxStudents.toLocaleString()}`
                                  : tp("common.unlimited")}
                              </li>
                              <li>
                                {tp("pricing.admin_users")}:{" "}
                                {plan.features.users}
                              </li>
                              <li>
                                {tp("pricing.storage")}: {plan.features.storage}
                              </li>
                              <li>
                                {tp("pricing.virtual_meetings")}:{" "}
                                {typeof plan.features.meetings === "number"
                                  ? `${plan.features.meetings}/${tp("billing.per_month")}`
                                  : plan.features.meetings}
                              </li>
                              <li>
                                {tp("pricing.max_courses")}:{" "}
                                {plan.features.courses + plan.features.subjects}
                              </li>
                            </ul>
                          </div>

                          {/* Support Details */}
                          <div>
                            <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                              <Headphones className="w-4 h-4 text-primary" />
                              {tp("pricing.support_details")}
                            </h4>
                            <ul className="space-y-1.5 text-xs text-muted-foreground pl-6">
                              <li>
                                {tp("pricing.support_type")}:{" "}
                                {plan.features.support}
                              </li>
                              <li>
                                {tp("pricing.availability_sla")}:{" "}
                                {plan.features.sla}
                              </li>
                              <li>
                                {plan.features.dedicatedManager
                                  ? tp("pricing.dedicated_account_manager")
                                  : tp("pricing.standard_support")}
                              </li>
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Button
                      className="w-full mt-auto font-semibold"
                      size="lg"
                      onClick={() =>
                        router.push(
                          `/planes/calculadora?plan=${plan.id}&billing=${billingCycle}`,
                        )
                      }
                    >
                      {tp("planes.pricing.select_plan")}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Comparison Table */}
          <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-6 mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
              {tp("planes.comparison.title")}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 text-muted-foreground font-semibold">
                      {tp("planes.comparison.feature")}
                    </th>
                    {plans.map((plan) => (
                      <th
                        key={plan.id}
                        className="text-center py-4 px-4 text-foreground font-semibold"
                      >
                        {plan.name.replace("Plan ", "")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {featuresList.map((feature, idx) => (
                    <tr
                      key={feature.key}
                      className={`border-b border-border/50 ${
                        idx % 2 === 0 ? "bg-muted/30" : ""
                      }`}
                    >
                      <td className="py-3 px-4 text-muted-foreground">
                        {feature.label}
                      </td>
                      {plans.map((plan) => {
                        const value =
                          plan.features[
                            feature.key as keyof typeof plan.features
                          ];
                        return (
                          <td key={plan.id} className="text-center py-3 px-4">
                            {typeof value === "boolean" ? (
                              value ? (
                                <Check className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-gray-600 mx-auto" />
                              )
                            ) : (
                              <span className="text-foreground">{value}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8 mb-12">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
                {tp("planes.contact.title")}
              </h2>
              <ContactForm />
            </div>
          </div>

          {/* Security & Compliance Section */}
          <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
              {tp("planes.security.title")}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Server className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {tp("planes.security.data_in_chile.title")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {tp("planes.security.data_in_chile.description")}
                </p>
              </div>
              <div className="text-center">
                <Lock className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {tp("planes.security.law_19628.title")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {tp("planes.security.law_19628.description")}
                </p>
              </div>
              <div className="text-center">
                <Shield className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {tp("planes.security.certifications.title")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {tp("planes.security.certifications.description")}
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8 mb-6">
            <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
              {tp("planes.faq.title")}
            </h2>
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {tp("planes.faq.iva_question")}
                </h3>
                <p className="text-muted-foreground">
                  {tp("planes.faq.iva_answer")}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {tp("planes.faq.semestral_calculation")}
                </h3>
                <p className="text-muted-foreground">
                  {tp("planes.faq.semestral_answer")}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {tp("planes.faq.free_trial")}
                </h3>
                <p className="text-muted-foreground">
                  {tp("planes.faq.free_trial_answer")}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {tp("planes.faq.plan_change")}
                </h3>
                <p className="text-muted-foreground">
                  {tp("planes.faq.plan_change_answer")}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {tp("planes.faq.data_after_cancel")}
                </h3>
                <p className="text-muted-foreground">
                  {tp("planes.faq.data_after_cancel_answer")}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {tp("planes.faq.support_hours")}
                </h3>
                <p className="text-muted-foreground">
                  {tp("planes.faq.support_hours_answer")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MinEducFooter />
      <CompactFooter />
    </div>
  );
}
