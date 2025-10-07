"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  MapPin,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageTransition } from "@/components/ui/page-transition";
import { useLanguage } from "@/components/language/LanguageContext";
import { MeetingForm } from "@/components/meetings/MeetingForm";
import { LoadingState } from "@/components/ui/loading-states";
import type { Meeting } from "@/lib/prisma-compat-types";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { toast } from "sonner";
import Link from "next/link";

interface AdminMeeting {
  id: string;
  title: string;
  description?: string;
  studentName: string;
  studentGrade: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone?: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  location: string;
  status: string;
  type: string;
  reason?: string;
  teacher: {
    id: string;
    name: string;
    email: string;
  };
}

const statusLabels = {
  SCHEDULED: "Programada",
  CONFIRMED: "Confirmada",
  IN_PROGRESS: "En Progreso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  RESCHEDULED: "Reprogramada",
};

const statusColors = {
  SCHEDULED: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  RESCHEDULED: "bg-orange-100 text-orange-800",
};

const typeLabels = {
  PARENT_TEACHER: "Padre-Profesor",
  FOLLOW_UP: "Seguimiento",
  EMERGENCY: "Emergencia",
  IEP_REVIEW: "Revisión PEI",
  GRADE_CONFERENCE: "Conferencia de Calificaciones",
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(timeString: string) {
  return timeString;
}

function ReunionesContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const [meetings, setMeetings] = useState<AdminMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<AdminMeeting | null>(
    null,
  );
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchMeetings();
    }
  }, [session, statusFilter, typeFilter]);

  // Check for create query parameter
  useEffect(() => {
    const create = searchParams.get("create");
    if (create === "true" && !loading) {
      setShowCreateDialog(true);
      router.replace("/admin/reuniones", { scroll: false });
    }
  }, [searchParams, loading, router]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (typeFilter !== "all") {
        params.append("type", typeFilter);
      }

      const response = await fetch(`/api/admin/meetings?${params}`);
      const data = await response.json();

      if (data.success) {
        setMeetings(data.data || []);
      } else {
        setError(data.error || "Error al cargar reuniones");
      }
    } catch (err) {
      console.error("Error fetching meetings:", err);
      setError("Error al cargar las reuniones");
    } finally {
      setLoading(false);
    }
  };

  const filteredMeetings = meetings.filter(
    (meeting) =>
      meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.guardianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.teacher.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreateMeeting = async (meetingData: any) => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/admin/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meetingData),
      });

      if (response.ok) {
        const data = await response.json();
        setMeetings([data.data, ...meetings]);
        setShowCreateDialog(false);
        toast.success("Reunión creada exitosamente");
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al crear reunión");
      }
    } catch (err) {
      console.error("Error creating meeting:", err);
      toast.error("Error al crear reunión");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateMeeting = async (meetingData: any) => {
    if (!selectedMeeting) return;

    try {
      const response = await fetch(
        `/api/admin/meetings/${selectedMeeting.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(meetingData),
        },
      );

      if (response.ok) {
        const data = await response.json();
        setMeetings(
          meetings.map((m) => (m.id === selectedMeeting.id ? data.data : m)),
        );
        setShowEditDialog(false);
        setSelectedMeeting(null);
        toast.success("Reunión actualizada exitosamente");
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al actualizar reunión");
      }
    } catch (err) {
      console.error("Error updating meeting:", err);
      toast.error("Error al actualizar reunión");
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar esta reunión? Esta acción no se puede deshacer.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/meetings/${meetingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMeetings(meetings.filter((m) => m.id !== meetingId));
        toast.success("Reunión eliminada exitosamente");
      } else {
        toast.error("Error al eliminar reunión");
      }
    } catch (err) {
      console.error("Error deleting meeting:", err);
      toast.error("Error al eliminar reunión");
    }
  };

  if (!session?.user?.role) {
    return <LoadingState />;
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Gestión de Reuniones
          </h1>
          <p className="text-muted-foreground">
            Administra todas las reuniones del centro educativo
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
            Error al cargar reuniones
          </h3>
          <p className="text-gray-600">{error}</p>
          <Button onClick={fetchMeetings} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Gestión de Reuniones
            </h1>
            <p className="text-muted-foreground">
              Administra todas las reuniones del centro educativo
            </p>
          </div>
          <Link href="/admin/reuniones/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Reunión
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar reuniones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="SCHEDULED">Programadas</SelectItem>
              <SelectItem value="CONFIRMED">Confirmadas</SelectItem>
              <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
              <SelectItem value="COMPLETED">Completadas</SelectItem>
              <SelectItem value="CANCELLED">Canceladas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="PARENT_TEACHER">Padre-Profesor</SelectItem>
              <SelectItem value="FOLLOW_UP">Seguimiento</SelectItem>
              <SelectItem value="EMERGENCY">Emergencia</SelectItem>
              <SelectItem value="IEP_REVIEW">Revisión PEI</SelectItem>
              <SelectItem value="GRADE_CONFERENCE">Conferencia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Meetings List */}
      {filteredMeetings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No hay reuniones
            </h3>
            <p className="text-muted-foreground mb-6 text-center">
              No se encontraron reuniones con los filtros aplicados
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Primera Reunión
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Reuniones ({filteredMeetings.length})</CardTitle>
            <CardDescription>
              Lista completa de reuniones programadas y realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Profesor</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMeetings.map((meeting) => (
                    <TableRow key={meeting.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{meeting.title}</div>
                          {meeting.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {meeting.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {meeting.studentName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {meeting.studentGrade} • {meeting.guardianName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {meeting.teacher.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {meeting.teacher.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(meeting.scheduledDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {formatTime(meeting.scheduledTime)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            statusColors[
                              meeting.status as keyof typeof statusColors
                            ] || "bg-gray-100 text-gray-800"
                          }
                        >
                          {statusLabels[
                            meeting.status as keyof typeof statusLabels
                          ] || meeting.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {typeLabels[
                            meeting.type as keyof typeof typeLabels
                          ] || meeting.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedMeeting(meeting);
                              setShowEditDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteMeeting(meeting.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Meeting Dialog */}
      <MeetingForm
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          setShowCreateDialog(false);
          fetchMeetings();
        }}
        mode="create"
      />

      {/* Edit Meeting Dialog */}
      {selectedMeeting && (
        <MeetingForm
          meeting={selectedMeeting as unknown as Meeting}
          isOpen={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setSelectedMeeting(null);
          }}
          onSuccess={() => {
            setShowEditDialog(false);
            setSelectedMeeting(null);
            fetchMeetings();
          }}
          mode="edit"
        />
      )}
    </div>
  );
}

export default function ReunionesPage() {
  return (
    <ErrorBoundary fallback={<div>Error al cargar la página de reuniones</div>}>
      <Suspense fallback={<LoadingState />}>
        <ReunionesContent />
      </Suspense>
    </ErrorBoundary>
  );
}
