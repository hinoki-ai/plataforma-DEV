"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { getRoleAccess } from "@/lib/role-utils";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Send, Mail } from "lucide-react";
import Link from "next/link";
import { FixedBackgroundLayout } from "@/components/layout/FixedBackgroundLayout";

interface Contact {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function NuevoMensajePage() {
  const { data: session, status } = useSession();
  const { t } = useDivineParsing(["common", "parent"]);
  const router = useRouter();

  const [formData, setFormData] = useState({
    to: "",
    subject: "",
    message: "",
    priority: "normal",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Mock contacts for demonstration
  const contacts: Contact[] = [
    {
      id: "1",
      name: "Dirección",
      email: "direccion@plataforma-astral.com",
      role: "Admin",
    },
    {
      id: "2",
      name: "Profesor Jefe",
      email: "profesor@plataforma-astral.com",
      role: "Teacher",
    },
    {
      id: "3",
      name: "Coordinación PIE",
      email: "pie@plataforma-astral.com",
      role: "Specialist",
    },
    {
      id: "4",
      name: "Psicopedagoga",
      email: "psicopedagoga@plataforma-astral.com",
      role: "Specialist",
    },
  ];

  // Handle loading state
  if (status === "loading") {
    return (
      <FixedBackgroundLayout backgroundImage="/images/backgrounds/communication-bg.jpg">
        <div className="flex items-center justify-center min-h-screen">
          <div>{t("parent.students.loading")}</div>
        </div>
      </FixedBackgroundLayout>
    );
  }

  // Ensure user has access to parent section
  if (!session || !session.user) {
    redirect("/login");
  }

  const roleAccess = getRoleAccess(session.user.role);
  if (!roleAccess.canAccessParent) {
    redirect("/unauthorized");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.to || !formData.subject || !formData.message) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/parent/communications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: formData.to,
          subject: formData.subject,
          message: formData.message,
          priority: formData.priority,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/parent/comunicacion");
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al enviar el mensaje");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  if (success) {
    return (
      <FixedBackgroundLayout backgroundImage="/images/backgrounds/communication-bg.jpg">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    ¡Mensaje enviado exitosamente!
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Tu mensaje ha sido enviado y será respondido pronto.
                  </p>
                  <Button onClick={() => router.push("/parent/comunicacion")}>
                    Volver a Comunicación
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </FixedBackgroundLayout>
    );
  }

  return (
    <FixedBackgroundLayout backgroundImage="/images/backgrounds/communication-bg.jpg">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/parent/comunicacion">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Nuevo Mensaje
            </h1>
            <p className="text-muted-foreground">
              Envía un mensaje a la dirección o profesores del establecimiento
            </p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Redactar Mensaje
              </CardTitle>
              <CardDescription>
                Completa todos los campos para enviar tu mensaje
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {/* Recipient */}
                <div className="space-y-2">
                  <Label htmlFor="to">Destinatario</Label>
                  <Select
                    value={formData.to}
                    onValueChange={(value) => handleInputChange("to", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un destinatario" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.email}>
                          {contact.name} ({contact.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      handleInputChange("priority", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Asunto</Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="Escribe el asunto del mensaje"
                    value={formData.subject}
                    onChange={(e) =>
                      handleInputChange("subject", e.target.value)
                    }
                    required
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    placeholder="Escribe tu mensaje aquí..."
                    rows={8}
                    value={formData.message}
                    onChange={(e) =>
                      handleInputChange("message", e.target.value)
                    }
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Mensaje
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/parent/comunicacion")}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </FixedBackgroundLayout>
  );
}
