"use client";

import { useState } from "react";
import { UnifiedSignupForm } from "@/components/UnifiedSignupForm";
import { PageTransition } from "@/components/ui/page-transition";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { AdaptiveErrorBoundary } from "@/components/ui/adaptive-error-boundary";
import { useLanguage } from "@/components/language/LanguageContext";

type ParentRegistrationSuccessData = {
  name: string;
  email: string;
  message?: string;
  success?: boolean;
  studentInfo?: {
    studentName: string;
    studentGrade: string;
    relationship: string;
    studentEmail?: string;
    guardianPhone?: string;
  };
};

export default function ParentRegistrationPage() {
  return (
    <AdaptiveErrorBoundary context="auth" showRetry={true} showHome={true}>
      <ParentRegistrationContent />
    </AdaptiveErrorBoundary>
  );
}

function ParentRegistrationContent() {
  const { t } = useLanguage();

  // Check for success query parameter during initial render
  const urlParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const isSuccessRedirect = urlParams?.get("success") === "true";

  const [registrationComplete, setRegistrationComplete] =
    useState(isSuccessRedirect);
  const [registrationData, setRegistrationData] =
    useState<ParentRegistrationSuccessData | null>(
      isSuccessRedirect
        ? {
            name: urlParams?.get("name") || "",
            email: urlParams?.get("email") || "",
            message: "Registro completado exitosamente",
            success: true,
          }
        : null,
    );

  const successBadgeRaw = t("parent_registration.success_badge", "common");
  const successBadgeText =
    successBadgeRaw !== "parent_registration.success_badge"
      ? successBadgeRaw
      : t("parent_registration.success_title", "common");

  if (registrationComplete && registrationData) {
    return (
      <PageTransition skeletonType="page" duration={700}>
        <div className="fixed inset-0 bg-responsive-desktop bg20 -z-50"></div>
        <div className="min-h-screen flex flex-col relative z-0">
          <div className="container mx-auto px-4 py-16 flex-1">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="mx-auto w-fit rounded-full border border-white/50 bg-white/60 px-4 py-1 text-sm font-medium text-slate-700 shadow-sm backdrop-blur supports-backdrop-filter:bg-white/45 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100">
                {successBadgeText}
              </div>

              <Card className="glass-panel mx-auto w-full max-w-2xl text-slate-900 dark:text-slate-100">
                <CardHeader className="space-y-4 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 dark:bg-emerald-400/20 dark:text-emerald-200">
                    <CheckCircle className="h-10 w-10" />
                  </div>
                  <CardTitle className="text-3xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-300">
                    {t("parent_registration.success_title", "common")}
                  </CardTitle>
                  <CardDescription className="text-base text-slate-600 dark:text-slate-200">
                    {t("parent_registration.success_description", "common")}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/80 p-5 text-left shadow-sm dark:border-emerald-400/30 dark:bg-emerald-500/10">
                    <h3 className="mb-2 font-semibold text-emerald-700 dark:text-emerald-200">
                      {t("parent_registration.next_steps_title", "common")}
                    </h3>
                    <ul className="space-y-2 text-sm text-emerald-700 dark:text-emerald-100">
                      <li>
                        • {t("parent_registration.next_step_1", "common")}
                      </li>
                      <li>
                        • {t("parent_registration.next_step_2", "common")}
                      </li>
                      <li>
                        • {t("parent_registration.next_step_3", "common")}
                      </li>
                    </ul>
                  </div>

                  {registrationData.studentInfo && (
                    <div className="rounded-xl border border-sky-500/30 bg-sky-50/80 p-5 shadow-sm dark:border-sky-400/30 dark:bg-sky-500/10">
                      <h3 className="mb-2 font-semibold text-sky-700 dark:text-sky-200">
                        {t(
                          "parent_registration.registered_info_title",
                          "common",
                        )}
                      </h3>
                      <div className="space-y-1.5 text-sm text-sky-700 dark:text-sky-100">
                        <p>
                          <strong>
                            {t("parent_registration.registered_name", "common")}
                            :
                          </strong>{" "}
                          {registrationData.name}
                        </p>
                        <p>
                          <strong>
                            {t(
                              "parent_registration.registered_email",
                              "common",
                            )}
                            :
                          </strong>{" "}
                          {registrationData.email}
                        </p>
                        <p>
                          <strong>
                            {t(
                              "parent_registration.registered_student",
                              "common",
                            )}
                            :
                          </strong>{" "}
                          {registrationData.studentInfo.studentName}
                        </p>
                        <p>
                          <strong>
                            {t(
                              "parent_registration.registered_grade",
                              "common",
                            )}
                            :
                          </strong>{" "}
                          {registrationData.studentInfo.studentGrade}
                        </p>
                        {registrationData.studentInfo.studentEmail && (
                          <p>
                            <strong>
                              {t(
                                "parent_registration.registered_student_email",
                                "common",
                              )}
                              :
                            </strong>{" "}
                            {registrationData.studentInfo.studentEmail}
                          </p>
                        )}
                        <p>
                          <strong>
                            {t(
                              "parent_registration.registered_relationship",
                              "common",
                            )}
                            :
                          </strong>{" "}
                          {registrationData.studentInfo.relationship}
                        </p>
                        {registrationData.studentInfo.guardianPhone && (
                          <p>
                            <strong>
                              {t(
                                "parent_registration.registered_guardian_phone",
                                "common",
                              )}
                              :
                            </strong>{" "}
                            {registrationData.studentInfo.guardianPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-200">
                      {t("parent_registration.contact_question", "common")}
                    </p>

                    <div className="flex justify-center gap-3">
                      <Button
                        asChild
                        variant="outline"
                        className="rounded-full border-white/60 bg-white/70 px-6 text-slate-700 shadow-sm transition hover:bg-white/80 dark:border-white/15 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900/70"
                      >
                        <Link href="/">
                          {t("parent_registration.go_home", "common")}
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="rounded-full bg-linear-to-r from-primary-400 via-primary-500 to-primary-600 px-6 font-semibold shadow-lg shadow-primary/25 transition hover:from-primary-500 hover:via-primary-600 hover:to-primary-700"
                      >
                        <Link href="/auth/login">
                          {t("parent_registration.go_login", "common")}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition skeletonType="page" duration={700}>
      <div className="fixed inset-0 bg-responsive-desktop bg20 -z-50"></div>
      <div className="min-h-screen flex flex-col relative z-0">
        <div className="container mx-auto px-4 py-16 flex-1">
          <div className="max-w-5xl mx-auto">
            <div className="text-center">
              <div className="mb-8">
                <div className="backdrop-blur-md bg-white/5 dark:bg-black/20 rounded-2xl border border-white/10 dark:border-white/5 shadow-2xl px-4 pt-1 pb-2 mx-auto inline-block -mt-64">
                  <h1 className="text-center text-2xl font-bold leading-tight text-gray-900 dark:text-white drop-shadow-2xl transition-all duration-700 ease-out sm:text-3xl md:text-4xl lg:text-5xl">
                    <div className="block animate-fade-in-up">
                      CPMA Centro de Padres, Madres{" "}
                    </div>
                    <div className="block animate-fade-in-up animation-delay-200 bg-linear-to-r from-pink-300 to-purple-300 dark:from-pink-200 dark:to-purple-200 bg-clip-text text-transparent">
                      y Apoderados
                    </div>
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <UnifiedSignupForm />
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
