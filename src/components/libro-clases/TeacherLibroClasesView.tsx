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
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { AttendanceRecorder } from "@/components/libro-clases/AttendanceRecorder";
import { ClassContentForm } from "@/components/libro-clases/ClassContentForm";
import { ObservationForm } from "@/components/libro-clases/ObservationForm";
import { GradeEntryForm } from "@/components/libro-clases/GradeEntryForm";
import { GradesTable } from "@/components/libro-clases/GradesTable";
import { ParentMeetingTracker } from "@/components/libro-clases/ParentMeetingTracker";
import { Id } from "@/convex/_generated/dataModel";
import { usePathname, useRouter } from "next/navigation";

type TabValue =
  | "overview"
  | "attendance"
  | "content"
  | "observations"
  | "grades"
  | "meetings";

interface TeacherLibroClasesViewProps {
  view?: TabValue;
}

const TEACHER_TAB_ROUTES: Record<TabValue, string> = {
  overview: "/profesor/libro-clases",
  attendance: "/profesor/libro-clases/asistencia",
  content: "/profesor/libro-clases/contenidos",
  observations: "/profesor/libro-clases/observaciones",
  grades: "/profesor/libro-clases/calificaciones",
  meetings: "/profesor/libro-clases/reuniones",
};

const TEACHER_TAB_HEADERS: Record<
  TabValue,
  { title: string; subtitle: string }
> = {
  overview: {
    title: "Mis Libros de Clases",
    subtitle:
      "Gestión diaria de asistencia, contenidos, observaciones y calificaciones",
  },
  attendance: {
    title: "Registro de Asistencia",
    subtitle: "Control diario de asistencia, atrasos y justificaciones",
  },
  content: {
    title: "Contenidos y Planificación",
    subtitle: "Documenta la cobertura curricular y los objetivos abordados",
  },
  observations: {
    title: "Observaciones y Retroalimentación",
    subtitle: "Registra anotaciones formativas y comunicaciones a familias",
  },
  grades: {
    title: "Calificaciones del Curso",
    subtitle: "Gestiona evaluaciones, notas y promedios",
  },
  meetings: {
    title: "Reuniones con Apoderados",
    subtitle: "Agenda compromisos y seguimiento de reuniones",
  },
};

export function TeacherLibroClasesView({
  view = "overview",
}: TeacherLibroClasesViewProps) {
  const { userId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedCourseId, setSelectedCourseId] =
    useState<Id<"courses"> | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>(view);
  const [isObservationDialogOpen, setIsObservationDialogOpen] = useState(false);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] =
    useState<Id<"students"> | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string>("");

  useEffect(() => {
    setActiveTab(view);
  }, [view]);

  const header = TEACHER_TAB_HEADERS[activeTab] ?? TEACHER_TAB_HEADERS.overview;

  // Get current user
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    userId ? { clerkId: userId } : "skip",
  );

  // Fetch teacher's courses
  const courses = useQuery(
    api.courses.getCourses,
    currentUser?._id
      ? {
          teacherId: currentUser._id,
          academicYear: new Date().getFullYear(),
          isActive: true,
        }
      : "skip",
  );

  // Get selected course details
  const selectedCourse = useQuery(
    api.courses.getCourseById,
    selectedCourseId ? { courseId: selectedCourseId } : "skip",
  );

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

  // Loading state
  if (!currentUser || courses === undefined) {
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
                      No tiene cursos asignados
                    </h3>
                    <p className="text-muted-foreground">
                      Contacte al administrador para que le asigne cursos
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
                    ← Volver a Cursos
                  </Button>
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
                          {selectedCourse.students.map((enrollment) => (
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
                                  Observación
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
                                  Nota
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No hay estudiantes inscritos
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
                        {selectedCourse?.subjects?.map((subject, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-sm py-2 px-3"
                          >
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="attendance">
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
                  <ClassContentForm
                    courseId={selectedCourseId}
                    teacherId={currentUser._id}
                    onSuccess={() => toast.success("Contenido guardado")}
                  />
                )}
              </TabsContent>

              <TabsContent value="observations">
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

              <TabsContent value="grades">
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
              <DialogTitle>Nueva Observación</DialogTitle>
              <DialogDescription>
                Registrar observación para {selectedStudentName}
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
                  toast.success("Observación registrada");
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
              <DialogTitle>Registrar Calificación</DialogTitle>
              <DialogDescription>
                Registrar nota para {selectedStudentName}
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
                  toast.success("Calificación registrada");
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
