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
  const { userId, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedCourseId, setSelectedCourseId] =
    useState<Id<"courses"> | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>(view);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  useEffect(() => {
    setActiveTab(view);
  }, [view]);

  // Get current user - must be called before any early returns
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    userId && isLoaded && isSignedIn ? { clerkId: userId } : "skip",
  );

  // Fetch parent's courses (where their children are enrolled) - must be called before early returns
  const courses = useQuery(
    api.courses.getCoursesForParent,
    currentUser?._id
      ? {
          parentId: currentUser._id,
          academicYear: new Date().getFullYear(),
          isActive: true,
        }
      : "skip",
  );

  // Get selected course details - must be called before early returns
  const selectedCourse = useQuery(
    api.courses.getCourseById,
    selectedCourseId ? { courseId: selectedCourseId } : "skip",
  );

  // Check for tenancy errors using a debug query
  const tenancyCheck = useQuery(
    api.tenancy.getCurrentTenancy,
    currentUser?._id ? {} : "skip",
  );

  const isCurrentUserLoading = currentUser === undefined;
  const isTenancyLoading = tenancyCheck === undefined;
  const hasTenancyError = tenancyCheck && "error" in tenancyCheck;
  const isLoading =
    isCurrentUserLoading ||
    isTenancyLoading ||
    (currentUser ? courses === undefined : false);

  useEffect(() => {
    if (!isLoading) {
      setLoadingTimedOut(false);
      return;
    }

    const timeout = setTimeout(() => setLoadingTimedOut(true), 6000);
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

  // Check if user is signed in
  if (!isSignedIn || !userId) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <RoleAwareHeader
            title="Autenticación requerida"
            subtitle="Debes iniciar sesión para acceder al libro de clases"
          />
          <Card>
            <CardContent className="py-10">
              <p className="text-muted-foreground">
                Por favor, inicia sesión para continuar.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <Button onClick={() => router.push("/login")}>
                  Ir a iniciar sesión
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

  // Show tenancy error if present
  if (hasTenancyError && tenancyCheck) {
    const errorMessage =
      typeof tenancyCheck.error === "string"
        ? tenancyCheck.error
        : "Error de configuración de institución";
    return (
      <PageTransition>
        <div className="space-y-6">
          <RoleAwareHeader
            title="Configuración de institución requerida"
            subtitle="Necesitas estar asociado a una institución para usar el libro de clases"
          />
          <Card>
            <CardContent className="py-10 space-y-4">
              <p className="text-muted-foreground mb-4">{errorMessage}</p>
              {errorMessage.includes("No institution selected") && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    Para usar el libro de clases, tu cuenta debe estar asociada
                    a una institución educativa.
                  </p>
                  <p>Por favor contacta al administrador para:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Crear o asignar tu cuenta a una institución</li>
                    <li>
                      Configurar tu membresía con el rol apropiado (PARENT,
                      etc.)
                    </li>
                  </ul>
                </div>
              )}
              <div className="flex flex-wrap gap-3 mt-4">
                <Button variant="outline" onClick={() => router.refresh()}>
                  Reintentar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/contacto")}
                >
                  Contactar administrador
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  if (isLoading) {
    if (loadingTimedOut) {
      return (
        <PageTransition>
          <div className="space-y-6">
            <RoleAwareHeader
              title="Conexión con libro de clases inestable"
              subtitle="Revisa tu conexión o que el servidor de datos esté disponible"
            />
            <Card>
              <CardContent className="py-10 space-y-4">
                <p className="text-muted-foreground">
                  Aún no logramos traer la información del libro de clases. Si
                  estás trabajando en local, ejecuta el servicio Convex (`npx
                  convex dev`) junto a la app para habilitar los datos.
                </p>
                {tenancyCheck && "error" in tenancyCheck && (
                  <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm font-medium text-destructive mb-2">
                      Error detectado:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(() => {
                        const error = (
                          tenancyCheck as unknown as { error?: unknown }
                        ).error;
                        return typeof error === "string"
                          ? error
                          : "Error desconocido";
                      })()}
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
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
            title="Perfil familiar no encontrado"
            subtitle="Contacta al establecimiento para habilitar el acceso"
          />
          <Card>
            <CardContent className="py-10">
              <p className="text-muted-foreground">
                No pudimos asociar tu cuenta a un apoderado registrado. Por
                favor confirma con el colegio que tu usuario esté vinculado a un
                estudiante.
              </p>
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
                    Cursos Activos
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
                    Total Estudiantes
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
                    Año Académico
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
                    Asignaturas
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
              <h2 className="text-xl font-semibold">Seleccione un Curso</h2>
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
                              Asignaturas:
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
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No hay cursos disponibles
                    </h3>
                    <p className="text-muted-foreground">
                      No se encontraron cursos activos para sus estudiantes
                    </p>
                  </CardContent>
                </Card>
              )}
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
                      {selectedCourse?.level} | Año{" "}
                      {selectedCourse?.academicYear}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Vista de Solo Lectura
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
                      Estudiantes
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {selectedCourse?.subjects?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Asignaturas
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {selectedCourse?.teacher?.name || "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Profesor Jefe
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {selectedCourse?.academicYear}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Año Académico
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
                  Resumen
                </TabsTrigger>
                <TabsTrigger value="grades">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Calificaciones
                </TabsTrigger>
                <TabsTrigger value="attendance">
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendario
                </TabsTrigger>
                <TabsTrigger value="observations">
                  <Eye className="h-4 w-4 mr-2" />
                  Observaciones
                </TabsTrigger>
                <TabsTrigger value="meetings">
                  <Users className="h-4 w-4 mr-2" />
                  Reuniones
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Mis Estudiantes en este Curso</CardTitle>
                      <CardDescription>
                        Lista de sus estudiantes inscritos en este curso
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
                                Solo Vista
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          Ninguno de sus estudiantes está inscrito en este curso
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Asignaturas</CardTitle>
                      <CardDescription>Asignaturas del curso</CardDescription>
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
                          Vista de solo lectura - Puede ver las calificaciones
                          de sus estudiantes
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
                      <CardTitle>Calendario Académico y Asistencia</CardTitle>
                      <CardDescription>
                        Visualiza el calendario escolar completo con eventos
                        académicos, reuniones de apoderados y seguimiento de
                        asistencia de tus hijos.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border p-4">
                          <p className="text-xs uppercase text-muted-foreground">
                            Curso Actual
                          </p>
                          <p className="text-lg font-semibold">
                            {selectedCourse?.name || "Selecciona un curso"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectedCourse?.grade} {selectedCourse?.section}
                          </p>
                        </div>
                        <div className="rounded-lg border p-4">
                          <p className="text-xs uppercase text-muted-foreground">
                            Eventos del Mes
                          </p>
                          <p className="text-lg font-semibold">
                            Calendario Integrado
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Eventos académicos, reuniones y actividades
                          </p>
                        </div>
                        <div className="rounded-lg border p-4">
                          <p className="text-xs uppercase text-muted-foreground">
                            Asistencia Familiar
                          </p>
                          <p className="text-lg font-semibold">
                            Seguimiento en Tiempo Real
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Notificaciones automáticas de ausencias
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
                    <CardTitle>Observaciones y comunicaciones</CardTitle>
                    <CardDescription>
                      Accede a anotaciones positivas, acuerdos y
                      retroalimentación formativa.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border p-4">
                        <p className="text-sm font-semibold">Reconocimientos</p>
                        <p className="text-sm text-muted-foreground">
                          Registrarás felicitaciones y logros destacados
                          compartidos por el profesorado.
                        </p>
                      </div>
                      <div className="rounded-lg border p-4">
                        <p className="text-sm font-semibold">Compromisos</p>
                        <p className="text-sm text-muted-foreground">
                          Documenta acuerdos de entrevistas y planes de apoyo
                          familiar.
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Las anotaciones respetan los protocolos de convivencia
                      escolar y se sincronizan con Inspectoría General.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="meetings">
                <Card>
                  <CardHeader>
                    <CardTitle>Reuniones y entrevistas</CardTitle>
                    <CardDescription>
                      Gestiona reuniones de apoderados, entrevistas PIE y
                      compromisos pendientes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Revisa el calendario institucional y confirma asistencia a
                      entrevistas desde la sección de reuniones.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link href="/parent/reuniones" className="inline-flex">
                        <Button variant="secondary">Ir a reuniones</Button>
                      </Link>
                      <Link href="/parent/comunicacion" className="inline-flex">
                        <Button variant="outline">
                          Contactar a Inspectoría
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
