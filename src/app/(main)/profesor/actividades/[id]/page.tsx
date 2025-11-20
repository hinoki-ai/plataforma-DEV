"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/loading-states";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Users,
  MapPin,
  BookOpen,
  Target,
  FileText,
  StickyNote,
} from "lucide-react";
import { useDivineParsing } from "@/components/language/useDivineLanguage";

const activityTypeLabels = {
  CLASS: "Clase",
  EVENT: "Evento",
  WORKSHOP: "Taller",
  EXCURSION: "Excursión",
  MEETING: "Reunión",
  OTHER: "Otro",
};

const activityTypeColors = {
  CLASS: "bg-blue-100 text-blue-800",
  EVENT: "bg-purple-100 text-purple-800",
  WORKSHOP: "bg-green-100 text-green-800",
  EXCURSION: "bg-orange-100 text-orange-800",
  MEETING: "bg-red-100 text-red-800",
  OTHER: "bg-gray-100 text-gray-800",
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

function formatTime(timeString: string) {
  return timeString;
}

function isUpcoming(dateString: string, timeString: string) {
  const activityDateTime = new Date(`${dateString}T${timeString}`);
  return activityDateTime > new Date();
}

function VerActividadContent() {
  const { t } = useDivineParsing(["common", "profesor"]);
  const router = useRouter();
  const params = useParams();
  const activityId = params.id as string;

  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivity();
  }, [activityId]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/profesor/activities/${activityId}`);
      const data = await response.json();

      if (data.success) {
        setActivity(data.data);
      } else {
        setError(data.error || "Error al cargar la actividad");
      }
    } catch (err) {
      console.error("Error fetching activity:", err);
      setError("Error al cargar la actividad");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async () => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar esta actividad? Esta acción no se puede deshacer.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/profesor/activities/${activityId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/profesor/actividades");
      } else {
        alert(t("profesor.activities.delete_error", "profesor"));
      }
    } catch (err) {
      console.error("Error deleting activity:", err);
      alert("Error al eliminar la actividad");
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error || !activity) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("profesor.activities.back", "profesor")}
          </Button>
        </div>
        <div className="text-center py-16">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {error || "Actividad no encontrada"}
          </h3>
          <Button onClick={() => router.back()}>
            {t("profesor.activities.back_to_activities", "profesor")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge
                className={
                  activityTypeColors[
                    activity.type as keyof typeof activityTypeColors
                  ] || "bg-gray-100 text-gray-800"
                }
              >
                {activityTypeLabels[
                  activity.type as keyof typeof activityTypeLabels
                ] || activity.type}
              </Badge>
              <Badge
                variant={
                  isUpcoming(activity.scheduledDate, activity.scheduledTime)
                    ? "default"
                    : "secondary"
                }
              >
                {isUpcoming(activity.scheduledDate, activity.scheduledTime)
                  ? t("profesor.activities.status.upcoming_short", "profesor")
                  : t("profesor.activities.status.completed_short", "profesor")}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/profesor/actividades/${activityId}/editar`)
              }
            >
              <Edit className="mr-2 h-4 w-4" />
              {t("profesor.activities.edit_button", "profesor")}
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteActivity}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("profesor.activities.delete_button", "profesor")}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t("profesor.activities.description_title", "profesor")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {activity.description}
              </p>
            </CardContent>
          </Card>

          {/* Schedule Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Detalles del Horario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <div className="font-medium">Fecha</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(activity.scheduledDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <div className="font-medium">Hora</div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(activity.scheduledTime)} ({activity.duration}{" "}
                      minutos)
                    </div>
                  </div>
                </div>
              </div>

              {activity.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <div className="font-medium">Ubicación</div>
                    <div className="text-sm text-muted-foreground">
                      {activity.location}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Objectives */}
          {activity.objectives && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Objetivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {activity.objectives}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Materials */}
          {activity.materials && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Materiales Necesarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {activity.materials}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {activity.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StickyNote className="h-5 w-5" />
                  Notas Adicionales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {activity.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Activity Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la Actividad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Materia
                </div>
                <div className="text-sm">{activity.subject}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Grado/Curso
                </div>
                <div className="text-sm">{activity.grade}</div>
              </div>

              {activity.maxParticipants && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Máximo Participantes
                  </div>
                  <div className="text-sm">{activity.maxParticipants}</div>
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Profesor
                </div>
                <div className="text-sm">
                  {activity.teacher?.name || "No especificado"}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Creada
                </div>
                <div className="text-sm">
                  {new Date(activity.createdAt).toLocaleDateString("es-ES")}
                </div>
              </div>

              {activity.updatedAt !== activity.createdAt && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Última modificación
                  </div>
                  <div className="text-sm">
                    {new Date(activity.updatedAt).toLocaleDateString("es-ES")}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() =>
                  router.push(`/profesor/actividades/${activityId}/editar`)
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                {t("profesor.activities.edit_button", "profesor")} Actividad
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={handleDeleteActivity}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("profesor.activities.delete_button", "profesor")} Actividad
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function VerActividadPage() {
  return (
    <ErrorBoundary
      fallback={<div>Error al cargar la página de ver actividad</div>}
    >
      <Suspense fallback={<LoadingState />}>
        <VerActividadContent />
      </Suspense>
    </ErrorBoundary>
  );
}
