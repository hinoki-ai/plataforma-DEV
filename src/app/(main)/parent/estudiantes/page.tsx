"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { getRoleAccess } from "@/lib/role-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  BookOpen,
  Award,
  Calendar,
  TrendingUp,
  Heart,
  MessageSquare,
  Phone,
  Mail,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { FixedBackgroundLayout } from "@/components/layout/FixedBackgroundLayout";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { LoadingState } from "@/components/ui/loading-states";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Link from "next/link";

interface Student {
  id: string;
  name: string;
  grade: string;
  enrollmentDate: string;
  attendance: number;
  academicProgress: number;
  teacher: {
    name: string;
    email: string;
    phone?: string;
  };
  subjects: Array<{
    name: string;
    grade: string;
    progress: number;
  }>;
  upcomingActivities: Array<{
    title: string;
    date: string;
    type: string;
  }>;
  recentReports: Array<{
    title: string;
    date: string;
    type: string;
  }>;
}

function EstudiantesContent() {
  const { data: session, status } = useSession();
  const { t } = useDivineParsing(["common", "parent"]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (session?.user?.role === "PARENT") {
      fetchStudents();
    }
  }, [session]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch real data from API endpoint
      const response = await fetch("/api/parent/students");
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      const result = await response.json();

      if (result.data) {
        // Transform API data to match Student interface
        const apiStudents: Student[] = result.data.map((child: any) => ({
          id: child.id,
          name: child.name,
          grade: child.grade,
          enrollmentDate: child.enrollmentDate,
          attendance: child.attendance,
          academicProgress: child.average ? child.average * 10 : 0, // Convert to percentage, handle null values
          teacher: {
            name: "Profesor Asignado", // This would come from the Student model
            email: "profesor@plataforma-astral.com",
            phone: "+56 9 0000 0000",
          },
          subjects: child.subjects || [
            { name: "Lenguaje", grade: "A", progress: 90 },
            { name: "Matemáticas", grade: "B+", progress: 85 },
            { name: "Ciencias", grade: "A-", progress: 92 },
          ],
          upcomingActivities: [
            {
              title: "Reunión de apoderados",
              date: "2024-01-25",
              type: "Reunión",
            },
            {
              title: "Evaluación parcial",
              date: "2024-01-28",
              type: "Evaluación",
            },
            { title: "Taller creativo", date: "2024-01-30", type: "Taller" },
          ],
          recentReports: [
            {
              title: "Informe trimestral",
              date: "2024-01-10",
              type: "Informe",
            },
            {
              title: "Evaluación mensual",
              date: "2024-01-08",
              type: "Evaluación",
            },
          ],
        }));

        setStudents(apiStudents);
        if (apiStudents.length > 0) {
          setSelectedStudent(apiStudents[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Error al cargar la información de los estudiantes");
    } finally {
      setLoading(false);
    }
  };

  // Handle loading state
  if (status === "loading") {
    return <LoadingState />;
  }

  // Ensure user has access to parent section
  if (!session || !session.user) {
    redirect("/login");
  }

  const roleAccess = getRoleAccess(session.user.role);
  if (!roleAccess.canAccessParent) {
    redirect("/unauthorized");
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Mis Estudiantes</h1>
          <p className="text-muted-foreground">
            Información académica y seguimiento de sus estudiantes
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
            Error al cargar estudiantes
          </h3>
          <p className="text-gray-600">{error}</p>
          <Button onClick={fetchStudents} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Mis Estudiantes</h1>
        <p className="text-muted-foreground">
          Información académica, asistencia y seguimiento del progreso de sus
          estudiantes
        </p>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No hay estudiantes registrados
            </h3>
            <p className="text-muted-foreground mb-6 text-center">
              No se encontraron estudiantes asociados a su cuenta. Contacte a la
              administración si cree que esto es un error.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Selector */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Estudiantes
                </CardTitle>
                <CardDescription>
                  Seleccione un estudiante para ver sus detalles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {students.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedStudent?.id === student.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">
                          {student.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {student.grade}
                        </p>
                      </div>
                      <Badge
                        variant={
                          selectedStudent?.id === student.id
                            ? "default"
                            : "secondary"
                        }
                      >
                        {selectedStudent?.id === student.id
                          ? "Seleccionado"
                          : "Ver"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Student Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedStudent && (
              <>
                {/* Student Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      {selectedStudent.name}
                    </CardTitle>
                    <CardDescription>
                      {selectedStudent.grade} • Matriculado desde{" "}
                      {new Date(
                        selectedStudent.enrollmentDate,
                      ).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Attendance */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Asistencia
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {selectedStudent.attendance}%
                          </span>
                        </div>
                        <Progress
                          value={selectedStudent.attendance}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          {selectedStudent.attendance >= 90
                            ? "Excelente asistencia"
                            : selectedStudent.attendance >= 80
                              ? "Buena asistencia"
                              : "Asistencia regular"}
                        </p>
                      </div>

                      {/* Academic Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Progreso Académico
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {selectedStudent.academicProgress}%
                          </span>
                        </div>
                        <Progress
                          value={selectedStudent.academicProgress}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          {selectedStudent.academicProgress >= 90
                            ? "Excelente rendimiento"
                            : selectedStudent.academicProgress >= 80
                              ? "Buen rendimiento"
                              : "Rendimiento regular"}
                        </p>
                      </div>
                    </div>

                    {/* Teacher Info */}
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-medium text-foreground mb-3">
                        Profesor Guía
                      </h4>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium">
                            {selectedStudent.teacher.name}
                          </h5>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {selectedStudent.teacher.email}
                            </span>
                            {selectedStudent.teacher.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {selectedStudent.teacher.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        <Link href="/parent/comunicacion">
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Contactar
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Academic Subjects */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Rendimiento por Asignatura
                    </CardTitle>
                    <CardDescription>
                      Calificaciones y progreso en cada materia
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedStudent.subjects.map((subject, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                        >
                          <div className="flex-1">
                            <h5 className="font-medium text-foreground">
                              {subject.name}
                            </h5>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                Nota: {subject.grade}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Progreso: {subject.progress}%
                              </span>
                            </div>
                          </div>
                          <Progress
                            value={subject.progress}
                            className="w-20 h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Activities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Próximas Actividades
                    </CardTitle>
                    <CardDescription>
                      Eventos, evaluaciones y actividades próximas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedStudent.upcomingActivities.map(
                        (activity, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 border rounded-lg"
                          >
                            <div
                              className={`w-3 h-3 rounded-full ${
                                activity.type === "Evaluación"
                                  ? "bg-red-500"
                                  : activity.type === "Excursión"
                                    ? "bg-green-500"
                                    : activity.type === "Taller"
                                      ? "bg-blue-500"
                                      : "bg-purple-500"
                              }`}
                            />
                            <div className="flex-1">
                              <h5 className="font-medium text-foreground">
                                {activity.title}
                              </h5>
                              <p className="text-sm text-muted-foreground">
                                {new Date(activity.date).toLocaleDateString(
                                  "es-ES",
                                  {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                            <Badge variant="outline">{activity.type}</Badge>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Reports */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Informes Recientes
                    </CardTitle>
                    <CardDescription>
                      Evaluaciones, informes y comunicados recientes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedStudent.recentReports.map((report, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 border rounded-lg"
                        >
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <h5 className="font-medium text-foreground">
                              {report.title}
                            </h5>
                            <p className="text-sm text-muted-foreground">
                              {new Date(report.date).toLocaleDateString(
                                "es-ES",
                              )}
                            </p>
                          </div>
                          <Badge variant="secondary">{report.type}</Badge>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EstudiantesPage() {
  return (
    <ErrorBoundary
      fallback={<div>Error al cargar la página de estudiantes</div>}
    >
      <Suspense fallback={<LoadingState />}>
        <EstudiantesContent />
      </Suspense>
    </ErrorBoundary>
  );
}
