"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageTransition } from "@/components/ui/page-transition";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Calendar,
  Users,
  FileText,
  TrendingUp,
  Eye,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { GradesTable } from "@/components/libro-clases/GradesTable";
import UnifiedCalendarView from "@/components/calendar/UnifiedCalendarView";
import { Id } from "@/convex/_generated/dataModel";
import { RoleAwareHeader } from "@/components/layout/RoleAwareNavigation";
import { usePathname, useRouter } from "next/navigation";
// Removed complex connection hook for simplicity
// Removed complex language hook - using hardcoded Spanish strings for performance
import Link from "next/link";

type TabValue =
  | "overview"
  | "grades"
  | "attendance"
  | "observations"
  | "meetings"
  | "calendar";

type CourseEnrollment = {
  _id: Id<"courseStudents">;
  student?: {
    parentId?: Id<"users"> | null;
    firstName?: string;
    lastName?: string;
    grade?: string | null;
  } | null;
};

interface ParentLibroClasesViewProps {
  view?: TabValue;
}

const PARENT_TAB_ROUTES: Record<TabValue, string> = {
  overview: "/parent/libro-clases",
  attendance: "/parent/libro-clases/asistencia",
  grades: "/parent/libro-clases/calificaciones",
  observations: "/parent/libro-clases/observaciones",
  meetings: "/parent/libro-clases/reuniones",
  calendar: "/parent/calendario-escolar",
};

const PARENT_TAB_HEADERS: Record<
  TabValue,
  { title: string; subtitle: string }
> = {
  overview: {
    title: "Libro de Clases Familiar",
    subtitle: "Monitorea el progreso integral de tus hijos",
  },
  attendance: {
    title: "Calendario Académico",
    subtitle:
      "Calendario escolar completo con eventos, reuniones y seguimiento de asistencia",
  },
  grades: {
    title: "Calificaciones y Evaluaciones",
    subtitle: "Consulta notas por asignatura y promedios ponderados",
  },
  observations: {
    title: "Observaciones y Comunicaciones",
    subtitle: "Accede a anotaciones formativas, reconocimientos y compromisos",
  },
  meetings: {
    title: "Reuniones y Entrevistas",
    subtitle: "Confirma y registra acuerdos con profesorado e inspectoría",
  },
  calendar: {
    title: "Calendario Escolar",
    subtitle:
      "Visualiza eventos escolares, reuniones y actividades programadas",
  },
};

export function ParentLibroClasesView({
  view = "overview",
}: ParentLibroClasesViewProps) {
  // Simplified translation function for performance
  const t = (key: string) => {
    const translations: Record<string, string> = {
      "parent.libro_clases.errors.auth_required": "Autenticación requerida",
      "parent.libro_clases.errors.auth_required_desc": "Debes iniciar sesión para acceder al libro de clases",
      "parent.libro_clases.errors.login": "Ir a iniciar sesión",
      "parent.libro_clases.errors.tenancy_error": "Error de configuración institucional",
      "parent.libro_clases.errors.tenancy_error_desc": "Problema con la configuración de la institución",
      "parent.libro_clases.errors.institution_selection_desc": "Contacta al administrador para configurar tu institución",
      "parent.libro_clases.errors.retry": "Reintentar",
      "parent.libro_clases.errors.contact_admin": "Contactar administrador",
      "parent.libro_clases.loading.connection_error": "Conexión inestable",
      "parent.libro_clases.loading.connection_error_desc": "Revisa tu conexión o que el servidor esté disponible",
      "parent.libro_clases.loading.connection_error_detail": "Detalles del error de conexión",
      "parent.libro_clases.loading.reload_page": "Recargar página",
      "parent.libro_clases.loading.reconnect": "Reconectar",
      "parent.libro_clases.loading.development_info": "Información de desarrollo",
      "parent.libro_clases.loading.convex_dev_note": "Asegúrate de que npx convex dev esté ejecutándose",
      "parent.libro_clases.loading.connection_status": "Estado de conexión",
      "parent.libro_clases.loading.connected": "Conectado",
      "parent.libro_clases.loading.disconnected": "Desconectado",
      "parent.libro_clases.loading.configured": "Configurado",
      "parent.libro_clases.loading.not_configured": "No configurado",
      "parent.libro_clases.errors.profile_not_found": "Perfil no encontrado",
      "parent.libro_clases.errors.profile_not_found_desc": "Contacta al administrador para completar tu registro",
      "parent.libro_clases.course_selection.active_courses": "Cursos Activos",
      "parent.libro_clases.course_selection.total_students": "Total Estudiantes",
      "parent.libro_clases.course_selection.academic_year": "Año Académico",
      "parent.libro_clases.course_selection.subjects": "Asignaturas",
      "parent.libro_clases.course_selection.select_course": "Seleccionar Curso",
      "parent.libro_clases.course_selection.no_courses": "No hay cursos disponibles",
      "parent.libro_clases.course_selection.no_courses_desc": "No tienes hijos inscritos en cursos activos",
      "parent.libro_clases.course_details.students": "Estudiantes",
      "parent.libro_clases.course_details.subjects": "Asignaturas",
      "parent.libro_clases.course_details.head_teacher": "Profesor Jefe",
      "parent.libro_clases.course_details.academic_year": "Año Académico",
      "parent.libro_clases.status.read_only": "Solo lectura",
      "parent.libro_clases.overview.my_students": "Mis Hijos",
      "parent.libro_clases.overview.my_students_desc": "Estudiantes a tu cargo",
      "parent.libro_clases.overview.subjects": "Asignaturas",
      "parent.libro_clases.overview.subjects_desc": "Materias del curso",
      "parent.libro_clases.overview.no_students": "No hay estudiantes inscritos",
      "parent.libro_clases.tabs.overview": "Resumen",
      "parent.libro_clases.tabs.grades": "Calificaciones",
      "parent.libro_clases.tabs.attendance": "Asistencia",
      "parent.libro_clases.tabs.observations": "Observaciones",
      "parent.libro_clases.tabs.meetings": "Reuniones",
      "parent.libro_clases.grades.read_only_notice": "Vista de solo lectura - las calificaciones son gestionadas por el profesor",
      "parent.libro_clases.attendance.calendar_title": "Calendario Académico",
      "parent.libro_clases.attendance.calendar_desc": "Calendario escolar completo con eventos y seguimiento de asistencia",
      "parent.libro_clases.attendance.current_course": "Curso Actual",
      "parent.libro_clases.attendance.events_this_month": "Eventos este mes",
      "parent.libro_clases.attendance.integrated_calendar": "Calendario Integrado",
      "parent.libro_clases.attendance.academic_events": "Eventos académicos",
      "parent.libro_clases.attendance.family_attendance": "Asistencia Familiar",
      "parent.libro_clases.attendance.real_time_tracking": "Seguimiento en Tiempo Real",
      "parent.libro_clases.attendance.automatic_notifications": "Notificaciones Automáticas",
      "parent.libro_clases.observations.title": "Observaciones y Comunicaciones",
      "parent.libro_clases.observations.desc": "Accede a anotaciones formativas, reconocimientos y compromisos",
      "parent.libro_clases.observations.recognitions": "Reconocimientos",
      "parent.libro_clases.observations.recognitions_desc": "Logros y reconocimientos destacados",
      "parent.libro_clases.observations.commitments": "Compromisos",
      "parent.libro_clases.observations.commitments_desc": "Acuerdos y compromisos asumidos",
      "parent.libro_clases.observations.school_regulations": "Todas las observaciones cumplen con las normativas escolares vigentes",
      "parent.libro_clases.meetings.title": "Reuniones y Entrevistas",
      "parent.libro_clases.meetings.desc": "Confirma y registra acuerdos con profesorado e inspectoría",
      "parent.libro_clases.meetings.calendar_access": "Accede al calendario completo de reuniones programadas",
      "parent.libro_clases.meetings.actions.go_to_meetings": "Ir a Reuniones",
      "parent.libro_clases.meetings.actions.contact_inspection": "Contactar Inspectoría",
    };
    return translations[key] || key;
  };
  const { userId, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedCourseId, setSelectedCourseId] =
    useState<Id<"courses"> | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>(view);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  // Simplified connection logic - assume connection is working

  useEffect(() => {
    setActiveTab(view);
  }, [view]);

  // DEV MODE: Use mock user ID for testing
  const mockUserId = isDev ? "dev-parent-user" : userId;

  // Get current user
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    (mockUserId || userId) && (isLoaded || isDev) && (isSignedIn || isDev)
      ? { clerkId: mockUserId || userId }
      : "skip",
  );

  // Fetch parent's courses (where their children are enrolled)
  const courses = useQuery(
    api.courses.getCoursesForParent,
    currentUser?._id ? {
      parentId: currentUser._id,
      academicYear: new Date().getFullYear(),
      isActive: true,
    } : "skip",
  );

  // Get selected course details
  const selectedCourse = useQuery(
    api.courses.getCourseById,
    selectedCourseId ? { courseId: selectedCourseId } : "skip",
  );

  // Simplified loading logic
  const isLoading = currentUser === undefined || courses === undefined || (selectedCourseId && selectedCourse === undefined);

  useEffect(() => {
    if (!isLoading) {
      setLoadingTimedOut(false);
      return;
    }

    const timeout = setTimeout(() => setLoadingTimedOut(true), 10000); // Increased timeout
    return () => clearTimeout(timeout);
  }, [isLoading]);

  const header = PARENT_TAB_HEADERS[activeTab] ?? PARENT_TAB_HEADERS.overview;

  // Wait for Clerk auth to load
  if (!isLoaded) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  // DEV MODE: Allow access on localhost even without Clerk auth
  const isDev =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  // Check if user is signed in
  if (!isDev && (!isSignedIn || !userId)) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <RoleAwareHeader
            title={t("parent.libro_clases.errors.auth_required")}
            subtitle={t("parent.libro_clases.errors.auth_required_desc")}
          />
          <Card>
            <CardContent className="py-10">
              <p className="text-muted-foreground">
                {t("parent.libro_clases.errors.auth_required_desc")}
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <Button onClick={() => router.push("/login")}>
                  {t("parent.libro_clases.errors.login")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  const handleTabChange = (value: string) => {
    const tab = value as TabValue;
    setActiveTab(tab);
    const target = PARENT_TAB_ROUTES[tab];
    if (target && target !== pathname) {
      router.push(target);
    }
  };


  if (isLoading) {
    if (loadingTimedOut) {
      return (
        <PageTransition>
          <div className="space-y-6">
            <RoleAwareHeader
              title="Cargando Libro de Clases"
              subtitle="Los datos están tardando más de lo esperado. Revisa tu conexión."
            />
            <Card>
              <CardContent className="py-10 space-y-4">
                <p className="text-muted-foreground mb-4">
                  Estamos intentando cargar tu libro de clases. Si persiste el problema:
                </p>
                <ul className="text-muted-foreground text-sm space-y-2 mb-6">
                  <li>• Verifica tu conexión a internet</li>
                  <li>• Asegúrate de estar autenticado</li>
                  <li>• Contacta al administrador si el problema continúa</li>
                </ul>
                <div className="flex flex-wrap gap-3 mt-6">
                  <Button onClick={() => typeof window !== "undefined" && window.location.reload()}>
                    Recargar página
                  </Button>
                  <Button variant="outline" onClick={() => router.refresh()}>
                    Reintentar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </PageTransition>
      );
    }

    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!currentUser) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <RoleAwareHeader
            title="Perfil de apoderado no encontrado"
            subtitle="Contacta al administrador para completar tu registro"
          />
          <Card>
            <CardContent className="py-10">
              <p className="text-muted-foreground mb-4">
                No pudimos encontrar tu perfil de apoderado en la plataforma.
                Por favor verifica que tu cuenta esté correctamente configurada.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => router.refresh()}>
                  Reintentar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/contacto")}
                >
                  Contactar soporte
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  if (!courses) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <RoleAwareHeader
            title="Cursos no encontrados"
            subtitle="No se pudieron cargar los cursos de tus hijos"
          />
          <Card>
            <CardContent className="py-10">
              <p className="text-muted-foreground mb-4">
                No se encontraron cursos asociados a tus hijos. Esto puede deberse a:
              </p>
              <ul className="text-muted-foreground text-sm space-y-2 mb-6">
                <li>• Tus hijos no están inscritos en cursos activos</li>
                <li>• Hay un problema con la configuración de tu institución</li>
                <li>• Los datos están siendo sincronizados</li>
              </ul>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => router.refresh()}>
                  Reintentar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/contacto")}
                >
                  Contactar soporte
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  const parentEnrollments: CourseEnrollment[] =
    (selectedCourse?.students as CourseEnrollment[] | undefined)?.filter(
      (enrollment) => enrollment.student?.parentId === currentUser?._id,
    ) ?? [];

  return (
    <PageTransition>
      <div className="space-y-6">
        <RoleAwareHeader title={header.title} subtitle={header.subtitle} />

        {/* Course Selection */}
        {!selectedCourseId ? (
          <div className="space-y-6">
            {/* Statistics */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("parent.libro_clases.course_selection.active_courses")}
                  </CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {courses?.length || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("parent.libro_clases.course_selection.total_students")}
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {/* Count courses the parent has access to */}
                    {courses?.length || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("parent.libro_clases.course_selection.academic_year")}
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Date().getFullYear()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("parent.libro_clases.course_selection.subjects")}
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Set(courses?.flatMap((c) => c.subjects) || []).size}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Course List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                {t("parent.libro_clases.course_selection.select_course")}
              </h2>
              {courses && courses.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {courses.map((course) => (
                    <Card
                      key={course._id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedCourseId(course._id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">
                              {course.name}
                            </CardTitle>
                          </div>
                          <Badge variant="default">Activo</Badge>
                        </div>
                        <CardDescription>
                          {course.grade} {course.section} - {course.level}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {t(
                                "parent.libro_clases.course_selection.subjects",
                              )}
                              :
                            </span>
                            <span className="font-medium">
                              {course.subjects.length}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {course.subjects.slice(0, 3).map((subject, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs"
                              >
                                {subject}
                              </Badge>
                            ))}
                            {course.subjects.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{course.subjects.length - 3}
                              </Badge>
                            )}
                          </div>
                          {/* Note: Student details shown when course is selected */}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No hay cursos disponibles
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      No se encontraron cursos asociados a tus hijos para el año académico actual.
                      Esto puede deberse a que tus hijos no están inscritos en cursos activos.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Button variant="outline" onClick={() => router.refresh()}>
                        Reintentar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push("/contacto")}
                      >
                        Contactar soporte
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
        ) : (
          // Course Management View
          <div className="space-y-6">
            {/* Course Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {selectedCourse?.name}
                    </CardTitle>
                    <CardDescription>
                      {selectedCourse?.grade} {selectedCourse?.section} -{" "}
                      {selectedCourse?.level} |{" "}
                      {t("parent.libro_clases.course_selection.academic_year")}{" "}
                      {selectedCourse?.academicYear}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {t("parent.libro_clases.course_details.read_only_view")}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {selectedCourse?.students?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("parent.libro_clases.course_details.students")}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {selectedCourse?.subjects?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("parent.libro_clases.course_details.subjects")}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {selectedCourse?.teacher?.name || "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("parent.libro_clases.course_details.head_teacher")}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {selectedCourse?.academicYear}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("parent.libro_clases.course_details.academic_year")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for Different Functions */}
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">
                  <BookOpen className="h-4 w-4 mr-2" />
                  {t("parent.libro_clases.tabs.overview")}
                </TabsTrigger>
                <TabsTrigger value="grades">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {t("parent.libro_clases.tabs.grades")}
                </TabsTrigger>
                <TabsTrigger value="attendance">
                  <Calendar className="h-4 w-4 mr-2" />
                  {t("parent.libro_clases.tabs.attendance")}
                </TabsTrigger>
                <TabsTrigger value="observations">
                  <Eye className="h-4 w-4 mr-2" />
                  {t("parent.libro_clases.tabs.observations")}
                </TabsTrigger>
                <TabsTrigger value="meetings">
                  <Users className="h-4 w-4 mr-2" />
                  {t("parent.libro_clases.tabs.meetings")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {t("parent.libro_clases.overview.my_students")}
                      </CardTitle>
                      <CardDescription>
                        {t("parent.libro_clases.overview.my_students_desc")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {parentEnrollments.length > 0 ? (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                          {parentEnrollments.map((enrollment) => (
                            <div
                              key={enrollment._id}
                              className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                            >
                              <div>
                                <div className="font-medium">
                                  {enrollment.student?.firstName}{" "}
                                  {enrollment.student?.lastName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {enrollment.student?.grade}
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                <Eye className="h-3 w-3 mr-1" />
                                {t("parent.libro_clases.status.read_only")}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          {t("parent.libro_clases.overview.no_students")}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {t("parent.libro_clases.overview.subjects")}
                      </CardTitle>
                      <CardDescription>
                        {t("parent.libro_clases.overview.subjects_desc")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedCourse?.subjects?.map(
                          (subject: string, idx: number) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-sm py-2 px-3"
                            >
                              {subject}
                            </Badge>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="grades">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">
                          {t("parent.libro_clases.grades.read_only_notice")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  {selectedCourseId && currentUser?._id && (
                    <GradesTable
                      courseId={selectedCourseId}
                      teacherId={currentUser._id}
                      isParentView={true}
                    />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="attendance">
                <div className="space-y-6">
                  {/* Course Context Header */}
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {t("parent.libro_clases.attendance.calendar_title")}
                      </CardTitle>
                      <CardDescription>
                        {t("parent.libro_clases.attendance.calendar_desc")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border p-4">
                          <p className="text-xs uppercase text-muted-foreground">
                            {t("parent.libro_clases.attendance.current_course")}
                          </p>
                          <p className="text-lg font-semibold">
                            {selectedCourse?.name ||
                              t(
                                "parent.libro_clases.course_selection.select_course",
                              )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectedCourse?.grade} {selectedCourse?.section}
                          </p>
                        </div>
                        <div className="rounded-lg border p-4">
                          <p className="text-xs uppercase text-muted-foreground">
                            {t(
                              "parent.libro_clases.attendance.events_this_month",
                            )}
                          </p>
                          <p className="text-lg font-semibold">
                            {t(
                              "parent.libro_clases.attendance.integrated_calendar",
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t(
                              "parent.libro_clases.attendance.academic_events",
                            )}
                          </p>
                        </div>
                        <div className="rounded-lg border p-4">
                          <p className="text-xs uppercase text-muted-foreground">
                            {t(
                              "parent.libro_clases.attendance.family_attendance",
                            )}
                          </p>
                          <p className="text-lg font-semibold">
                            {t(
                              "parent.libro_clases.attendance.real_time_tracking",
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t(
                              "parent.libro_clases.attendance.automatic_notifications",
                            )}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Integrated Calendar */}
                  <div className="rounded-lg border bg-card">
                    <UnifiedCalendarView
                      mode="full"
                      showAdminControls={false}
                      showExport={true}
                      initialCategories={[
                        "ACADEMIC",
                        "HOLIDAY",
                        "SPECIAL",
                        "PARENT",
                        "MEETING",
                        "EXAM",
                      ]}
                      userRole="PARENT"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="observations">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t("parent.libro_clases.observations.title")}
                    </CardTitle>
                    <CardDescription>
                      {t("parent.libro_clases.observations.desc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border p-4">
                        <p className="text-sm font-semibold">
                          {t("parent.libro_clases.observations.recognitions")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t(
                            "parent.libro_clases.observations.recognitions_desc",
                          )}
                        </p>
                      </div>
                      <div className="rounded-lg border p-4">
                        <p className="text-sm font-semibold">
                          {t("parent.libro_clases.observations.commitments")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t(
                            "parent.libro_clases.observations.commitments_desc",
                          )}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {t("parent.libro_clases.observations.school_regulations")}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="meetings">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t("parent.libro_clases.meetings.title")}
                    </CardTitle>
                    <CardDescription>
                      {t("parent.libro_clases.meetings.desc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {t("parent.libro_clases.meetings.calendar_access")}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link href="/parent/reuniones" className="inline-flex">
                        <Button variant="secondary">
                          {t(
                            "parent.libro_clases.meetings.actions.go_to_meetings",
                          )}
                        </Button>
                      </Link>
                      <Link href="/parent/comunicacion" className="inline-flex">
                        <Button variant="outline">
                          {t(
                            "parent.libro_clases.meetings.actions.contact_inspection",
                          )}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
