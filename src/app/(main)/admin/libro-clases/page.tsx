"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RoleAwareHeader } from "@/components/layout/RoleAwareNavigation";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Users,
  Calendar,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { toast } from "sonner";
import { CourseForm } from "@/components/libro-clases/CourseForm";
import { CourseManagementDashboard } from "@/components/libro-clases/CourseManagementDashboard";
import { useAuth } from "@clerk/nextjs";

export default function AdminLibroClasesPage() {
  const { userId } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    new Date().getFullYear(),
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { t } = useDivineParsing(["common", "admin"]);

  // Fetch courses
  const courses = useQuery(
    api.courses.getCourses,
    selectedYear !== undefined
      ? { academicYear: selectedYear, isActive: true }
      : "skip",
  );

  // Loading state
  if (courses === undefined) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  // Filter courses by search query
  const filteredCourses =
    courses?.filter(
      (course) =>
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.section.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  return (
    <PageTransition>
      <div className="space-y-6">
        <RoleAwareHeader
          title="Libro de Clases - Administración"
          subtitle="Gestión centralizada de libros de clases de toda la institución"
          actions={
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Curso
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Curso</DialogTitle>
                  <DialogDescription>
                    Complete la información para crear un nuevo libro de clases
                  </DialogDescription>
                </DialogHeader>
                <CourseForm
                  onSuccess={() => {
                    setIsCreateDialogOpen(false);
                    toast.success("Curso creado exitosamente");
                  }}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          }
        />

        {/* Search and Filters */}
        <div className="flex gap-4 items-center flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar cursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedYear || ""}
              onChange={(e) =>
                setSelectedYear(
                  e.target.value ? parseInt(e.target.value) : undefined,
                )
              }
              className="px-3 py-2 border border-input rounded-md bg-background text-sm"
              aria-label="Año académico"
              title="Año académico"
            >
              <option value="">Todos los años</option>
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
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
                {courses?.filter((c) => c.isActive).length || 0}
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
                {courses?.reduce(
                  (acc, course) => acc + (course.maxStudents || 0),
                  0,
                ) || 0}
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
                {selectedYear || "Todos"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Niveles Escolares
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(courses?.map((c) => c.level)).size || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No hay cursos disponibles
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "No se encontraron cursos que coincidan con la búsqueda"
                  : "Cree un nuevo curso para comenzar"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Curso
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}

        {/* Course Management Dashboard */}
        {courses && courses.length > 0 && (
          <CourseManagementDashboard courses={courses} />
        )}
      </div>
    </PageTransition>
  );
}

function CourseCard({ course }: { course: any }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const courseData = useQuery(
    api.courses.getCourseById,
    isDialogOpen ? { courseId: course._id } : "skip",
  );

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{course.name}</CardTitle>
          </div>
          <Badge variant={course.isActive ? "default" : "secondary"}>
            {course.isActive ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <XCircle className="h-3 w-3 mr-1" />
            )}
            {course.isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>
        <CardDescription>
          {course.grade} {course.section} - {course.level}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Profesor:</span>
            <span className="font-medium">
              {course.teacher?.name || "Sin asignar"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estudiantes:</span>
            <span className="font-medium">
              {courseData?.students?.length || 0}
              {course.maxStudents && ` / ${course.maxStudents}`}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Asignaturas:</span>
            <span className="font-medium">{course.subjects.length}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setIsDialogOpen(true)}
          >
            Ver Detalles
          </Button>
        </div>
      </CardContent>

      {/* Course Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Curso</DialogTitle>
            <DialogDescription>
              Información completa del curso y estudiantes
            </DialogDescription>
          </DialogHeader>
          {courseData && <CourseManagementDashboard courses={[courseData]} />}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
