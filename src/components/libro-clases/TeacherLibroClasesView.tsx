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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RoleAwareHeader } from "@/components/layout/RoleAwareNavigation";
import {
  BookOpen,
  Calendar,
  Users,
  FileText,
  ClipboardCheck,
  MessageSquare,
  TrendingUp,
  BookOpenCheck,
  Target,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { AttendanceRecorder } from "@/components/libro-clases/AttendanceRecorder";
import { ClassContentForm } from "@/components/libro-clases/ClassContentForm";
import { ClassContentList } from "@/components/libro-clases/ClassContentList";
import { ObservationForm } from "@/components/libro-clases/ObservationForm";
import { GradeEntryForm } from "@/components/libro-clases/GradeEntryForm";
import { GradesTable } from "@/components/libro-clases/GradesTable";
import { ParentMeetingTracker } from "@/components/libro-clases/ParentMeetingTracker";
import { CurriculumCoverageDashboard } from "@/components/libro-clases/CurriculumCoverageDashboard";
import { PdfExportButton } from "@/components/libro-clases/PdfExportButton";
import { Id } from "@/convex/_generated/dataModel";
import { usePathname, useRouter } from "next/navigation";
// Removed complex language hook - using hardcoded Spanish strings for performance

type TabValue =
  | "overview"
  | "attendance"
  | "content"
  | "observations"
  | "grades"
  | "meetings"
  | "coverage";

interface TeacherLibroClasesViewProps {
  view?: TabValue;
}

type CourseEnrollment = {
  _id: Id<"courseStudents">;
  studentId: Id<"students">;
  student?: {
    firstName?: string;
    lastName?: string;
    grade?: string | null;
  } | null;
};

const TEACHER_TAB_ROUTES: Record<TabValue, string> = {
  overview: "/profesor/libro-clases",
  attendance: "/profesor/libro-clases/asistencia",
  content: "/profesor/libro-clases/contenidos",
  observations: "/profesor/libro-clases/observaciones",
  grades: "/profesor/libro-clases/calificaciones",
  meetings: "/profesor/libro-clases/reuniones",
  coverage: "/profesor/libro-clases/cobertura",
};

// Tab headers are now handled through i18n keys directly in the component
export function TeacherLibroClasesView({
  view = "overview",
}: TeacherLibroClasesViewProps) {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  // Simplified translation function for performance
  const t = (key: string) => {
    const translations: Record<string, string> = {
      "profesor.libro_clases.title": "Libro de Clases del Profesor",
      "profesor.libro_clases.tab_descriptions.overview": "Resumen general del curso y estudiantes",
      "profesor.libro_clases.tabs.attendance": "Asistencia",
      "profesor.libro_clases.tab_descriptions.attendance": "Registro de asistencia diaria",
      "profesor.libro_clases.tabs.content": "Contenidos",
      "profesor.libro_clases.tab_descriptions.content": "Planificación y registro de contenidos",
      "profesor.libro_clases.tabs.observations": "Observaciones",
      "profesor.libro_clases.tab_descriptions.observations": "Anotaciones sobre estudiantes",
      "profesor.libro_clases.tabs.grades": "Calificaciones",
      "profesor.libro_clases.tab_descriptions.grades": "Registro de notas y evaluaciones",
      "profesor.libro_clases.tabs.meetings": "Reuniones",
      "profesor.libro_clases.tab_descriptions.meetings": "Entrevistas con apoderados",
      "profesor.libro_clases.tabs.coverage": "Cobertura",
      "profesor.libro_clases.tab_descriptions.coverage": "Cobertura curricular",
      "profesor.libro_clases.select_course": "Seleccionar Curso",
      "profesor.libro_clases.overview.back_to_courses": "Volver a cursos",
      "profesor.libro_clases.overview.observation_button": "Observación",
      "profesor.libro_clases.overview.grade_button": "Calificar",
      "profesor.libro_clases.overview.no_students_enrolled": "No hay estudiantes inscritos",
      "profesor.libro_clases.observations.add_observation": "Agregar Observación",
      "profesor.libro_clases.observations.register_for_student": "Registrar observación para",
      "profesor.libro_clases.observations.observation_saved": "Observación guardada",
      "profesor.libro_clases.grades.enter_grades": "Ingresar Calificaciones",
      "profesor.libro_clases.grades.register_grade_for_student": "Registrar calificación para",
      "profesor.libro_clases.grades.grade_saved": "Calificación guardada",
      "profesor.libro_clases.content.add_content": "Agregar Contenido",
      "profesor.libro_clases.content.view_content": "Ver Contenidos",
    };
    return translations[key] || key;
  };
  const [selectedCourseId, setSelectedCourseId] =
    useState<Id<"courses"> | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>(view);
  const [isObservationDialogOpen, setIsObservationDialogOpen] = useState(false);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] =
    useState<Id<"students"> | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string>("");
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  useEffect(() => {
    setActiveTab(view);
  }, [view]);

  // Get current user first
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    userId && isLoaded && isSignedIn ? { clerkId: userId } : "skip",
  );

  // Fetch teacher's courses - simplified logic
  const courses = useQuery(
    api.courses.getCourses,
    currentUser?._id ? {
      teacherId: currentUser._id,
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

  const getTabHeader = (tab: TabValue) => {
    const tabKeys = {
      overview: {
        title: "profesor.libro_clases.title",
        subtitle: "profesor.libro_clases.tab_descriptions.overview",
      },
      attendance: {
        title: "profesor.libro_clases.tabs.attendance",
        subtitle: "profesor.libro_clases.tab_descriptions.attendance",
      },
      content: {
        title: "profesor.libro_clases.tabs.content",
        subtitle: "profesor.libro_clases.tab_descriptions.content",
      },
      observations: {
        title: "profesor.libro_clases.tabs.observations",
        subtitle: "profesor.libro_clases.tab_descriptions.observations",
      },
      grades: {
        title: "profesor.libro_clases.tabs.grades",
        subtitle: "profesor.libro_clases.tab_descriptions.grades",
      },
      meetings: {
        title: "profesor.libro_clases.tabs.meetings",
        subtitle: "profesor.libro_clases.tab_descriptions.meetings",
      },
      coverage: {
        title: "profesor.libro_clases.tabs.coverage",
        subtitle: "profesor.libro_clases.tab_descriptions.coverage",
      },
    };
    return tabKeys[tab] || tabKeys.overview;
  };

  const headerConfig = getTabHeader(activeTab);
  const header = {
    title: t(headerConfig.title),
    subtitle: t(headerConfig.subtitle),
  };

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
    const target = TEACHER_TAB_ROUTES[tab];
    if (target && target !== pathname) {
      router.push(target);
    }
  };

  const handleObservationClick = (
    studentId: Id<"students">,
    studentName: string,
  ) => {
    setSelectedStudentId(studentId);
    setSelectedStudentName(studentName);
    setIsObservationDialogOpen(true);
  };

  const handleGradeClick = (studentId: Id<"students">, studentName: string) => {
    setSelectedStudentId(studentId);
    setSelectedStudentName(studentName);
    setIsGradeDialogOpen(true);
  };

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
                  Seguimos intentando conectar con el libro de clases pero no
                  hay respuesta. Si estás trabajando en local, asegúrate de
                  tener el servicio Convex ejecutándose (`npm run dev` también
                  necesita `npx convex dev`).
                </p>
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
            title="Perfil docente no encontrado"
            subtitle="Contacta al administrador para completar tu registro"
          />
          <Card>
            <CardContent className="py-10">
              <p className="text-muted-foreground mb-4">
                No pudimos encontrar tu perfil en el libro de clases. Por favor
                verifica que tu cuenta esté asociada a un usuario docente en la
                plataforma.
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
            subtitle="No se pudieron cargar tus cursos asignados"
          />
          <Card>
            <CardContent className="py-10">
              <p className="text-muted-foreground mb-4">
                No se encontraron cursos asignados a tu cuenta docente. Esto puede deberse a:
              </p>
              <ul className="text-muted-foreground text-sm space-y-2 mb-6">
                <li>• No tienes cursos asignados este año académico</li>
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
                    {courses?.reduce((acc, course) => {
                      // Count students if available in course data
                      return acc + (course.maxStudents || 0);
                    }, 0) || 0}
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
              <h2 className="text-xl font-semibold">
                {t("profesor.libro_clases.select_course")}
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
                      No tienes cursos asignados
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      No se encontraron cursos asignados para el año académico actual.
                      Contacta al administrador para asignarte cursos.
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
                      {selectedCourse?.level} | Año{" "}
                      {selectedCourse?.academicYear}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <PdfExportButton
                      courseId={selectedCourseId}
                      academicYear={
                        selectedCourse?.academicYear || new Date().getFullYear()
                      }
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCourseId(null);
                        setActiveTab(view);
                        const target = TEACHER_TAB_ROUTES[view];
                        if (target && target !== pathname) {
                          router.push(target);
                        }
                      }}
                    >
                      ← {t("profesor.libro_clases.overview.back_to_courses")}
                    </Button>
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
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="overview">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Resumen
                </TabsTrigger>
                <TabsTrigger value="attendance">
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Asistencia
                </TabsTrigger>
                <TabsTrigger value="content">
                  <BookOpenCheck className="h-4 w-4 mr-2" />
                  Contenidos
                </TabsTrigger>
                <TabsTrigger value="observations">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Observaciones
                </TabsTrigger>
                <TabsTrigger value="grades">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Calificaciones
                </TabsTrigger>
                <TabsTrigger value="meetings">
                  <Users className="h-4 w-4 mr-2" />
                  Reuniones
                </TabsTrigger>
                <TabsTrigger value="coverage">
                  <Target className="h-4 w-4 mr-2" />
                  Cobertura
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Estudiantes del Curso</CardTitle>
                      <CardDescription>
                        Lista de estudiantes inscritos
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedCourse?.students &&
                      selectedCourse.students.length > 0 ? (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                          {(selectedCourse.students as CourseEnrollment[]).map(
                            (enrollment) => (
                              <div
                                key={enrollment._id}
                                className="flex items-center justify-between p-3 border rounded-lg"
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
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleObservationClick(
                                        enrollment.studentId,
                                        `${enrollment.student?.firstName} ${enrollment.student?.lastName}`,
                                      )
                                    }
                                  >
                                    {t(
                                      "profesor.libro_clases.overview.observation_button",
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleGradeClick(
                                        enrollment.studentId,
                                        `${enrollment.student?.firstName} ${enrollment.student?.lastName}`,
                                      )
                                    }
                                  >
                                    {t(
                                      "profesor.libro_clases.overview.grade_button",
                                    )}
                                  </Button>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          {t(
                            "profesor.libro_clases.overview.no_students_enrolled",
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {t("profesor.libro_clases.overview.subjects_title")}
                      </CardTitle>
                      <CardDescription>
                        {t(
                          "profesor.libro_clases.overview.subjects_description",
                        )}
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

              <TabsContent value="attendance" data-tour="attendance-section">
                {selectedCourseId && currentUser?._id && (
                  <AttendanceRecorder
                    courseId={selectedCourseId}
                    teacherId={currentUser._id}
                    onSuccess={() => toast.success("Asistencia guardada")}
                  />
                )}
              </TabsContent>

              <TabsContent value="content">
                {selectedCourseId && currentUser?._id && (
                  <div className="space-y-6">
                    <Tabs defaultValue="form" className="w-full">
                      <TabsList>
                        <TabsTrigger value="form">
                          {t("profesor.libro_clases.content.add_content")}
                        </TabsTrigger>
                        <TabsTrigger value="list">
                          {t("profesor.libro_clases.content.view_content")}
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="form" className="mt-4">
                        <ClassContentForm
                          courseId={selectedCourseId}
                          teacherId={currentUser._id}
                          onSuccess={() => {
                            toast.success("Contenido guardado");
                            // Refresh the list if it's being viewed
                          }}
                        />
                      </TabsContent>
                      <TabsContent value="list" className="mt-4">
                        <ClassContentList
                          courseId={selectedCourseId}
                          teacherId={currentUser._id}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </TabsContent>

              <TabsContent
                value="observations"
                data-tour="observations-section"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Observaciones de Estudiantes</CardTitle>
                    <CardDescription>
                      Seleccione un estudiante del resumen para registrar una
                      observación
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      Vaya a la pestaña &quot;Resumen&quot; para seleccionar un
                      estudiante
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="grades" data-tour="grades-section">
                {selectedCourseId && currentUser?._id && (
                  <GradesTable
                    courseId={selectedCourseId}
                    teacherId={currentUser._id}
                  />
                )}
              </TabsContent>

              <TabsContent value="meetings">
                {selectedCourseId && currentUser?._id && (
                  <ParentMeetingTracker
                    courseId={selectedCourseId}
                    teacherId={currentUser._id}
                  />
                )}
              </TabsContent>

              <TabsContent value="coverage">
                {selectedCourseId && (
                  <CurriculumCoverageDashboard courseId={selectedCourseId} />
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Observation Dialog */}
        <Dialog
          open={isObservationDialogOpen}
          onOpenChange={setIsObservationDialogOpen}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {t("profesor.libro_clases.observations.add_observation")}
              </DialogTitle>
              <DialogDescription>
                {t("profesor.libro_clases.observations.register_for_student", {
                  studentName: selectedStudentName,
                })}
              </DialogDescription>
            </DialogHeader>
            {selectedCourseId && selectedStudentId && currentUser?._id && (
              <ObservationForm
                courseId={selectedCourseId}
                studentId={selectedStudentId}
                studentName={selectedStudentName}
                teacherId={currentUser._id}
                onSuccess={() => {
                  setIsObservationDialogOpen(false);
                  toast.success(
                    t("profesor.libro_clases.observations.observation_saved"),
                  );
                }}
                onCancel={() => setIsObservationDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Grade Dialog */}
        <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {t("profesor.libro_clases.grades.enter_grades")}
              </DialogTitle>
              <DialogDescription>
                {t("profesor.libro_clases.grades.register_grade_for_student", {
                  studentName: selectedStudentName,
                })}
              </DialogDescription>
            </DialogHeader>
            {selectedCourseId && selectedStudentId && currentUser?._id && (
              <GradeEntryForm
                courseId={selectedCourseId}
                studentId={selectedStudentId}
                studentName={selectedStudentName}
                teacherId={currentUser._id}
                onSuccess={() => {
                  setIsGradeDialogOpen(false);
                  toast.success(t("profesor.libro_clases.grades.grade_saved"));
                }}
                onCancel={() => setIsGradeDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
