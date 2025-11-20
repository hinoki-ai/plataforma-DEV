"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
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
import { PageTransition } from "@/components/ui/page-transition";
import { LoadingState } from "@/components/ui/loading-states";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ArrowLeft, Save, Clock, Users, MapPin } from "lucide-react";

const activityTypes = [
  { value: "class", label: "Clase" },
  { value: "event", label: "Evento" },
  { value: "workshop", label: "Taller" },
  { value: "excursion", label: "Excursión" },
  { value: "meeting", label: "Reunión" },
  { value: "other", label: "Otro" },
];

const subjects = [
  "Matemáticas",
  "Lenguaje",
  "Ciencias",
  "Historia",
  "Geografía",
  "Inglés",
  "Artes",
  "Educación Física",
  "Música",
  "Religión",
  "Otro",
];

const grades = [
  // Pre-school
  "Sala Cuna Menor (3-12 meses)",
  "Sala Cuna Mayor (1-2 años)",
  "Nivel Medio Menor (2-3 años)",
  "Nivel Medio Mayor (3-4 años)",
  "Pre-Kinder",
  "Kinder",

  // Basic School
  "1° Básico",
  "2° Básico",
  "3° Básico",
  "4° Básico",
  "5° Básico",
  "6° Básico",
  "7° Básico",
  "8° Básico",

  // High School
  "1° Medio",
  "2° Medio",
  "3° Medio",
  "4° Medio",
  "1° Medio TP",
  "2° Medio TP",
  "3° Medio TP",
  "4° Medio TP",

  // Higher Education
  "1° Año Técnico",
  "2° Año Técnico",
  "3° Año Técnico",
  "Técnico de Nivel Superior",
  "1° Año CFT",
  "2° Año CFT",
  "3° Año CFT",
  "Certificación Técnica",
  "1° Año Licenciatura",
  "2° Año Licenciatura",
  "3° Año Licenciatura",
  "4° Año Licenciatura",
  "1° Año Título Profesional",
  "2° Año Título Profesional",
  "3° Año Título Profesional",
  "4° Año Título Profesional",
  "5° Año Título Profesional",
  "6° Año Título Profesional",
  "Magíster 1° Año",
  "Magíster 2° Año",
  "Doctorado 1° Año",
  "Doctorado 2° Año",
  "Doctorado 3° Año",
  "Doctorado 4° Año",
];

function CrearActividadContent() {
  const { t } = useDivineParsing(["common", "profesor"]);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    subject: "",
    grade: "",
    scheduledDate: "",
    scheduledTime: "",
    duration: "",
    location: "",
    maxParticipants: "",
    materials: "",
    objectives: "",
    notes: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.type ||
      !formData.subject ||
      !formData.grade ||
      !formData.scheduledDate ||
      !formData.scheduledTime ||
      !formData.duration
    ) {
      setError("Por favor completa todos los campos requeridos");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/profesor/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          duration: parseInt(formData.duration),
          maxParticipants: formData.maxParticipants
            ? parseInt(formData.maxParticipants)
            : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/profesor/actividades");
      } else {
        setError(data.error || "Error al crear la actividad");
      }
    } catch (err) {
      setError("Error al crear la actividad");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <p className="text-muted-foreground">
          Completa la información para crear una nueva actividad educativa
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("activity.main_info", "common")}</CardTitle>
                <CardDescription>
                  Detalles básicos de la actividad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Ej: Clase de Matemáticas - Fracciones"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">
                    {t("activity.description.label", "common")}
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe la actividad en detalle..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">
                      {t("activity.type.label", "common")}
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        handleInputChange("type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {activityTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">
                      {t("activity.subject.label", "common")}
                    </Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) =>
                        handleInputChange("subject", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar materia" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="grade">
                    {t("activity.grade.label", "common")}
                  </Label>
                  <Select
                    value={formData.grade}
                    onValueChange={(value) => handleInputChange("grade", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar grado" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Horario y Duración
                </CardTitle>
                <CardDescription>
                  {t("activity.scheduling", "common")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduledDate">
                      {t("activity.date.label", "common")}
                    </Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) =>
                        handleInputChange("scheduledDate", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="scheduledTime">
                      {t("activity.time.label", "common")}
                    </Label>
                    <Input
                      id="scheduledTime"
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) =>
                        handleInputChange("scheduledTime", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">
                      {t("activity.duration.label", "common")}
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      min="15"
                      max="480"
                      value={formData.duration}
                      onChange={(e) =>
                        handleInputChange("duration", e.target.value)
                      }
                      placeholder="60"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">
                      {t("activity.location.label", "common")}
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      placeholder="Ej: Sala 101, Patio, etc."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("activity.additional_details", "common")}
                </CardTitle>
                <CardDescription>
                  Información complementaria (opcional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="objectives">
                    {t("activity.objectives.label", "common")}
                  </Label>
                  <Textarea
                    id="objectives"
                    value={formData.objectives}
                    onChange={(e) =>
                      handleInputChange("objectives", e.target.value)
                    }
                    placeholder="¿Qué se espera lograr con esta actividad?"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="materials">
                    {t("activity.materials.label", "common")}
                  </Label>
                  <Textarea
                    id="materials"
                    value={formData.materials}
                    onChange={(e) =>
                      handleInputChange("materials", e.target.value)
                    }
                    placeholder="Lista de materiales, recursos, etc."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">
                    {t("activity.notes.label", "common")}
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Información adicional, observaciones, etc."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="maxParticipants">
                    Máximo de Participantes
                  </Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    min="1"
                    value={formData.maxParticipants}
                    onChange={(e) =>
                      handleInputChange("maxParticipants", e.target.value)
                    }
                    placeholder="Ej: 25"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Deja vacío si no hay límite
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="text-red-600 text-sm">{error}</div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Card>
              <CardContent className="pt-6">
                <Button type="submit" className="w-full" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Creando..." : "Crear Actividad"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CrearActividadPage() {
  return (
    <ErrorBoundary fallback={<div>Error al cargar la página</div>}>
      <Suspense fallback={<LoadingState />}>
        <CrearActividadContent />
      </Suspense>
    </ErrorBoundary>
  );
}
