"use client";

import { useState } from "react";
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
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { GradesTable } from "@/components/libro-clases/GradesTable";
import { Id } from "@/convex/_generated/dataModel";
import { RoleAwareHeader } from "@/components/layout/RoleAwareNavigation";

type TabValue = "overview" | "grades";

export default function ParentLibroClasesPage() {
  const { userId } = useAuth();
  const [selectedCourseId, setSelectedCourseId] =
    useState<Id<"courses"> | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>("overview");
  const { t } = useDivineParsing(["common", "profesor"]);

  // Get current user
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    userId ? { clerkId: userId } : "skip",
  );

  // Fetch parent's courses (where their children are enrolled)
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

  // Get selected course details
  const selectedCourse = useQuery(
    api.courses.getCourseById,
    selectedCourseId ? { courseId: selectedCourseId } : "skip",
  );

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
        <RoleAwareHeader
          title="Calificaciones de Mis Hijos"
          subtitle="Seguimiento académico de las asignaturas y evaluaciones"
        />

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
                      No se encontraron cursos activos para sus hijos
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
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as TabValue)}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Resumen
                </TabsTrigger>
                <TabsTrigger value="grades">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Calificaciones
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Mis Hijos en este Curso</CardTitle>
                      <CardDescription>
                        Lista de sus hijos inscritos en este curso
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedCourse?.students &&
                      selectedCourse.students.length > 0 ? (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                          {selectedCourse.students
                            .filter(
                              (enrollment) =>
                                // Only show parent's children
                                enrollment.student?.parentId ===
                                currentUser._id,
                            )
                            .map((enrollment) => (
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
                          Ninguno de sus hijos está inscrito en este curso
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

              <TabsContent value="grades">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">
                          Vista de solo lectura - Puede ver las calificaciones
                          de sus hijos
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
            </Tabs>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
