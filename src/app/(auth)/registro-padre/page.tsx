"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, UserPlus, CheckCircle } from "lucide-react";
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
  const router = useRouter();
  const { t } = useLanguage();
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationData, setRegistrationData] =
    useState<ParentRegistrationSuccessData | null>(null);

  // Check for success query parameter or success state
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("success") === "true") {
      // If redirected from CPA success page, show success
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRegistrationComplete(true);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRegistrationData({
        name: urlParams.get("name") || "",
        email: urlParams.get("email") || "",
        message: "Registro completado exitosamente",
        success: true,
      });
    }
  }, []);

  const successBadgeRaw = t("parent_registration.success_badge", "common");
  const successBadgeText =
    successBadgeRaw !== "parent_registration.success_badge"
      ? successBadgeRaw
      : t("parent_registration.success_title", "common");

  if (registrationComplete && registrationData) {
    return (
      <PageTransition
        skeletonType="page"
        duration={700}
        className="public-page-shell bg-responsive-desktop bg-home-page"
      >
        <div className="public-page-content public-page-content--narrow space-y-6">
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
                  <li>• {t("parent_registration.next_step_1", "common")}</li>
                  <li>• {t("parent_registration.next_step_2", "common")}</li>
                  <li>• {t("parent_registration.next_step_3", "common")}</li>
                </ul>
              </div>

              {registrationData.studentInfo && (
                <div className="rounded-xl border border-sky-500/30 bg-sky-50/80 p-5 shadow-sm dark:border-sky-400/30 dark:bg-sky-500/10">
                  <h3 className="mb-2 font-semibold text-sky-700 dark:text-sky-200">
                    {t("parent_registration.registered_info_title", "common")}
                  </h3>
                  <div className="space-y-1.5 text-sm text-sky-700 dark:text-sky-100">
                    <p>
                      <strong>
                        {t("parent_registration.registered_name", "common")}:
                      </strong>{" "}
                      {registrationData.name}
                    </p>
                    <p>
                      <strong>
                        {t("parent_registration.registered_email", "common")}:
                      </strong>{" "}
                      {registrationData.email}
                    </p>
                    <p>
                      <strong>
                        {t("parent_registration.registered_student", "common")}:
                      </strong>{" "}
                      {registrationData.studentInfo.studentName}
                    </p>
                    <p>
                      <strong>
                        {t("parent_registration.registered_grade", "common")}:
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
      </PageTransition>
    );
  }

  return (
    <PageTransition
      skeletonType="page"
      duration={700}
      className="public-page-shell bg-responsive-desktop bg-home-page"
    >
      <div className="public-page-content">
        <div className="mx-auto w-full max-w-5xl space-y-8 px-3 sm:px-6">
          <div className="flex flex-col items-center gap-6 text-center">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="self-start rounded-full border-white/60 bg-white/65 px-5 py-2 text-slate-700 shadow-sm transition hover:bg-white/80 dark:border-white/15 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900/70"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("parent_registration.back_home", "common")}
            </Button>

            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/60 bg-white/60 text-primary shadow-sm backdrop-blur supports-backdrop-filter:bg-white/45 dark:border-white/15 dark:bg-slate-900/60 dark:text-primary-200">
              <UserPlus className="h-7 w-7" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                {t("parent_registration.title", "common")}
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-200">
                {t("parent_registration.subtitle", "common")}
              </p>
            </div>
          </div>

          <div className="w-full flex justify-center">
            <UnifiedSignupForm />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
