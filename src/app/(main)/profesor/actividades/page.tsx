"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageTransition } from "@/components/ui/page-transition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { useState, useEffect, Suspense } from "react";
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Filter,
  Edit,
  Eye,
  Trash2,
} from "lucide-react";
import { LoadingState } from "@/components/ui/loading-states";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Activity {
  id: string;
  title: string;
  description: string;
  type: string;
  subject: string;
  grade: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  location?: string;
  maxParticipants?: number;
  teacher: {
    name: string;
  };
}

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
  });
}

function formatTime(timeString: string) {
  return timeString;
}

function isUpcoming(dateString: string, timeString: string) {
  const activityDateTime = new Date(`${dateString}T${timeString}`);
  return activityDateTime > new Date();
}

function ActividadesContent() {
  const { t } = useDivineParsing(["common", "profesor"]);
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");

  useEffect(() => {
    fetchActivities();
  }, [filter]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filter !== "all") {
        params.append("status", filter);
      }

      const response = await fetch(`/api/profesor/activities?${params}`);
      const data = await response.json();

      if (data.success) {
        setActivities(data.data || []);
      } else {
        setError(data.error || "Error al cargar actividades");
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("Error al cargar las actividades");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta actividad?")) {
      return;
    }

    try {
      const response = await fetch(`/api/profesor/activities/${activityId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setActivities(
          activities.filter((activity) => activity.id !== activityId),
        );
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("profesor.activities.title", "Actividades")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "profesor.activities.description",
              "Gestiona tus actividades educativas",
            )}
          </p>
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
            {t("profesor.activities.error_loading", "profesor")}
          </h3>
          <p className="text-gray-600">{error}</p>
          <Button onClick={fetchActivities} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const upcomingActivities = activities.filter((activity) =>
    isUpcoming(activity.scheduledDate, activity.scheduledTime),
  );
  const completedActivities = activities.filter(
    (activity) => !isUpcoming(activity.scheduledDate, activity.scheduledTime),
  );

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t("profesor.activities.title", "Actividades")}
            </h1>
            <p className="text-muted-foreground">
              {t(
                "profesor.activities.description",
                "Gestiona tus actividades educativas",
              )}
            </p>
          </div>
          <Link href="/profesor/actividades/crear">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("profesor.activities.new_activity", "profesor")}
            </Button>
          </Link>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            <Filter className="mr-2 h-4 w-4" />
            {t("profesor.activities.filter.all", "profesor")} (
            {activities.length})
          </Button>
          <Button
            variant={filter === "upcoming" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("upcoming")}
          >
            {t("profesor.activities.filter.upcoming", "profesor")} (
            {upcomingActivities.length})
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("completed")}
          >
            {t("profesor.activities.filter.completed", "profesor")} (
            {completedActivities.length})
          </Button>
        </div>
      </div>

      {/* Activities List */}
      {activities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No hay actividades
              </h3>
              <p className="text-muted-foreground mb-6">
                Crea tu primera actividad para comenzar
              </p>
              <Link href="/profesor/actividades/crear">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primera Actividad
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <Card
              key={activity.id}
              className="hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {activity.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {activity.subject} • {activity.grade}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2 ml-2">
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
                        isUpcoming(
                          activity.scheduledDate,
                          activity.scheduledTime,
                        )
                          ? "default"
                          : "secondary"
                      }
                    >
                      {isUpcoming(
                        activity.scheduledDate,
                        activity.scheduledTime,
                      )
                        ? "Próxima"
                        : "Completada"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    {formatDate(activity.scheduledDate)}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                    {formatTime(activity.scheduledTime)} ({activity.duration}{" "}
                    min)
                  </div>
                  {activity.maxParticipants && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                      Máx. {activity.maxParticipants} participantes
                    </div>
                  )}
                  {activity.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      📍 {activity.location}
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {activity.description}
                </p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      router.push(`/profesor/actividades/${activity.id}`)
                    }
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      router.push(`/profesor/actividades/${activity.id}/editar`)
                    }
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteActivity(activity.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ActividadesPage() {
  return (
    <ErrorBoundary
      fallback={<div>Error al cargar la página de actividades</div>}
    >
      <Suspense fallback={<LoadingState />}>
        <ActividadesContent />
      </Suspense>
    </ErrorBoundary>
  );
}
