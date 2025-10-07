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
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);

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
        toast.success("✅ Registro exitoso", {
          description:
            "Tu cuenta será verificada por el personal de la escuela",
        });
      } else {
        const error = await response.json();
        toast.error("❌ Error en el registro", {
          description:
            error.error || "Por favor verifica los datos e intenta nuevamente",
        });
      }
    } catch (error) {
      console.error("Error registering parent:", error);
      toast.error("❌ Error en el registro", {
        description: "Por favor intenta nuevamente",
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
                ¡Registro Completado!
              </CardTitle>
              <CardDescription className="text-lg">
                Tu solicitud de registro ha sido enviada exitosamente
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">
                  ¿Qué sucede ahora?
                </h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• El personal de la escuela verificará tu información</li>
                  <li>• Recibirás un email cuando tu cuenta sea activada</li>
                  <li>
                    • Una vez activada, podrás acceder con tu email y contraseña
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">
                  Información Registrada
                </h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>
                    <strong>Nombre:</strong> {registrationData.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {registrationData.email}
                  </p>
                  <p>
                    <strong>Estudiante:</strong>{" "}
                    {registrationData.studentInfo.studentName}
                  </p>
                  <p>
                    <strong>Grado:</strong>{" "}
                    {registrationData.studentInfo.studentGrade}
                  </p>
                  <p>
                    <strong>Relación:</strong>{" "}
                    {registrationData.studentInfo.relationship}
                  </p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  ¿Tienes alguna pregunta? Contacta con la secretaría de la
                  escuela.
                </p>

                <div className="flex gap-3 justify-center">
                  <Button asChild variant="outline">
                    <Link href="/">Ir al Inicio</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/auth/login">Ir a Iniciar Sesión</Link>
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
              Volver al Inicio
            </Button>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <UserPlus className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Registro de Padres</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Regístrate como padre o tutor para acceder al sistema escolar.
                Tu cuenta será verificada por el personal de la escuela antes de
                ser activada.
              </p>
            </div>
          </div>

          <ParentCreationForm
            onSubmit={handleRegister}
            onCancel={handleCancel}
            isLoading={isRegistering}
            title="Registro de Padre/Tutor"
            description="Completa tu información y la de tu estudiante para registrarte en el sistema"
          />

          {/* Additional Information */}
          <Card className="mt-8 max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">Proceso de Verificación</CardTitle>
              <CardDescription>
                Información sobre cómo funciona el registro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-primary">Registro</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Completa toda la información requerida</li>
                    <li>• Proporciona datos de contacto válidos</li>
                    <li>• Incluye información completa del estudiante</li>
                    <li>• Crea una contraseña segura</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-primary">Verificación</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• El personal verifica tu relación familiar</li>
                    <li>• Se confirma la información del estudiante</li>
                    <li>• Recibes confirmación por email</li>
                    <li>• Tu cuenta es activada</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-6">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  ⚠️ Importante
                </h4>
                <p className="text-sm text-yellow-700">
                  Solo puedes registrarte si eres padre, madre o tutor legal de
                  un estudiante matriculado en la escuela. La información
                  proporcionada será verificada por el personal administrativo.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
