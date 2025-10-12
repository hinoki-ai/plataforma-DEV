"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ParentCreationForm } from "@/components/users/ParentCreationForm";
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

type ParentFormData = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  studentName: string;
  studentGrade: string;
  studentEmail?: string;
  guardianPhone?: string;
  relationship: string;
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
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationData, setRegistrationData] = useState<{
    name: string;
    email: string;
    studentInfo: {
      studentName: string;
      studentGrade: string;
      relationship: string;
    };
  } | null>(null);

  const handleRegister = async (data: ParentFormData) => {
    setIsRegistering(true);
    try {
      const response = await fetch("/api/auth/register-parent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setRegistrationData(result);
        setRegistrationComplete(true);
        toast.success(
          `✅ ${t("parent_registration.success_toast", "common")}`,
          {
            description: t("parent_registration.success_toast_desc", "common"),
          },
        );
      } else {
        const error = await response.json();
        toast.error(`❌ ${t("parent_registration.error_toast", "common")}`, {
          description:
            error.error || t("parent_registration.error_toast_desc", "common"),
        });
      }
    } catch (error) {
      console.error("Error registering parent:", error);
      toast.error(`❌ ${t("parent_registration.error_toast", "common")}`, {
        description: t("parent_registration.error_retry", "common"),
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  if (registrationComplete && registrationData) {
    return (
      <PageTransition skeletonType="page" duration={700}>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-green-700">
                {t("parent_registration.success_title", "common")}
              </CardTitle>
              <CardDescription className="text-lg">
                {t("parent_registration.success_description", "common")}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">
                  {t("parent_registration.next_steps_title", "common")}
                </h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• {t("parent_registration.next_step_1", "common")}</li>
                  <li>• {t("parent_registration.next_step_2", "common")}</li>
                  <li>• {t("parent_registration.next_step_3", "common")}</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">
                  {t("parent_registration.registered_info_title", "common")}
                </h3>
                <div className="text-sm text-blue-700 space-y-1">
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
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  {t("parent_registration.contact_question", "common")}
                </p>

                <div className="flex gap-3 justify-center">
                  <Button asChild variant="outline">
                    <Link href="/">
                      {t("parent_registration.go_home", "common")}
                    </Link>
                  </Button>
                  <Button asChild>
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
    <PageTransition skeletonType="page" duration={700}>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("parent_registration.back_home", "common")}
            </Button>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <UserPlus className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {t("parent_registration.title", "common")}
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("parent_registration.subtitle", "common")}
              </p>
            </div>
          </div>

          <ParentCreationForm
            onSubmit={handleRegister}
            onCancel={handleCancel}
            isLoading={isRegistering}
            title={t("parent_registration.form_title", "common")}
            description={t("parent_registration.form_description", "common")}
          />

          {/* Additional Information */}
          <Card className="mt-8 max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">
                {t("parent_registration.verification_title", "common")}
              </CardTitle>
              <CardDescription>
                {t("parent_registration.verification_subtitle", "common")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-primary">
                    {t("parent_registration.registration_section", "common")}
                  </h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>
                      • {t("parent_registration.registration_step_1", "common")}
                    </li>
                    <li>
                      • {t("parent_registration.registration_step_2", "common")}
                    </li>
                    <li>
                      • {t("parent_registration.registration_step_3", "common")}
                    </li>
                    <li>
                      • {t("parent_registration.registration_step_4", "common")}
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-primary">
                    {t("parent_registration.verification_section", "common")}
                  </h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>
                      • {t("parent_registration.verification_step_1", "common")}
                    </li>
                    <li>
                      • {t("parent_registration.verification_step_2", "common")}
                    </li>
                    <li>
                      • {t("parent_registration.verification_step_3", "common")}
                    </li>
                    <li>
                      • {t("parent_registration.verification_step_4", "common")}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-6">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  ⚠️ {t("parent_registration.important_title", "common")}
                </h4>
                <p className="text-sm text-yellow-700">
                  {t("parent_registration.important_message", "common")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
