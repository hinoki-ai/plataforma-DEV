"use client";

import { useMemo, useState } from "react";
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
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { CourseForm } from "@/components/libro-clases/CourseForm";
import { CourseManagementDashboard } from "@/components/libro-clases/CourseManagementDashboard";

type AdminView =
  | "overview"
  | "attendance"
  | "grades"
  | "observations"
  | "students";

interface AdminLibroClasesViewProps {
  view?: AdminView;
}

const ADMIN_HEADERS: Record<AdminView, { title: string; subtitle: string }> = {
  overview: {
    title: "Libro de Clases - Administración",
    subtitle: "Gestión centralizada de libros de clases de toda la institución",
  },
  attendance: {
    title: "Asistencia Institucional",
    subtitle:
      "Supervisa inasistencias, atrasos y justificativos en todos los cursos",
  },
  grades: {
    title: "Calificaciones Institucionales",
    subtitle: "Controla notas, promedios y tendencias académicas",
  },
  observations: {
    title: "Observaciones y Convivencia Escolar",
    subtitle: "Revisa anotaciones positivas, medidas formativas y protocolos",
  },
  students: {
    title: "Gestión de Estudiantes",
    subtitle: "Administra matrículas, traslados y cupos disponibles por curso",
  },
};

const ADMIN_VIEW_ACTIONS: Partial<
  Record<AdminView, { label: string; toast: string }>
> = {
  attendance: {
    label: "Descargar reporte general",
    toast:
      "Generaremos un reporte consolidado de asistencia cuando cierres el periodo.",
  },
  grades: {
    label: "Exportar libro de notas",
    toast:
      "La exportación consolidada permitirá compartir calificaciones con supervisión.",
  },
  observations: {
    label: "Exportar anotaciones",
    toast:
      "Próximamente podrás descargar registros de convivencia y comunicaciones.",
  },
  students: {
    label: "Sincronizar con SIGE",
    toast:
      "La integración SIGE estará disponible para sincronizar matrículas oficiales.",
  },
};

export function AdminLibroClasesView({
  view = "overview",
}: AdminLibroClasesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    new Date().getFullYear(),
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const header = ADMIN_HEADERS[view];
  const secondaryAction = ADMIN_VIEW_ACTIONS[view];

  // Fetch courses
  const courses = useQuery(
    api.courses.getCourses,
    selectedYear !== undefined
      ? { academicYear: selectedYear, isActive: true }
      : "skip",
  );

  const filteredCourses = useMemo(() => {
    if (!courses) {
      return [];
    }
    const query = searchQuery.toLowerCase();
    return courses.filter((course) => {
      return (
        course.name.toLowerCase().includes(query) ||
        course.grade.toLowerCase().includes(query) ||
        course.section.toLowerCase().includes(query) ||
        course.level?.toLowerCase().includes(query)
      );
    });
  }, [courses, searchQuery]);

  const metrics = useMemo(() => {
    const dataset = filteredCourses;
    const totalCourses = dataset.length;
    const activeCourses = dataset.filter((course) => course.isActive).length;
    const plannedCapacity = dataset.reduce(
      (acc, course) => acc + (course.maxStudents || 0),
      0,
    );
    const distinctLevels = new Set(
      dataset.map((course) => course.level || "Sin nivel"),
    ).size;

    return {
      totalCourses,
      activeCourses,
      plannedCapacity,
      distinctLevels,
    };
  }, [filteredCourses]);

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

  const createCourseAction = (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
  );

  const headerActions = (
    <div className="flex flex-wrap gap-2 justify-end">
      {secondaryAction && (
        <Button
          key="secondary-action"
          variant="outline"
          onClick={() => toast.info(secondaryAction.toast)}
        >
          {secondaryAction.label}
        </Button>
      )}
      {createCourseAction}
    </div>
  );

  const renderViewSummary = () => {
    if (view === "overview") {
      return null;
    }

    let summaryTitle = "";
    let summaryDescription = "";
    let highlights: string[] = [];

    switch (view) {
      case "attendance":
        summaryTitle = "Monitoreo de asistencia";
        summaryDescription =
          "Coordina el registro diario del Libro de Clases Digital y activa alertas preventivas.";
        highlights = [
          "Detecta cursos con ausentismo reiterado sobre el 15% y deriva a inspectoría.",
          "Integra justificativos, licencias médicas y retiros anticipados según normativa MINEDUC.",
          "Comparte reportes semanales con UTP y equipos de convivencia escolar.",
        ];
        break;
      case "grades":
        summaryTitle = "Seguimiento de calificaciones";
        summaryDescription =
          "Consolida evaluaciones en escala chilena 1.0 - 7.0 y verifica promedios por asignatura.";
        highlights = [
          "Permite validar cierres de periodo y actas oficiales de promoción.",
          "Visibiliza ramos con promedios críticos para planes de reforzamiento.",
          "Sincroniza criterios de evaluación con decretos 67 y 83.",
        ];
        break;
      case "observations":
        summaryTitle = "Convivencia y observaciones";
        summaryDescription =
          "Centraliza anotaciones positivas, medidas formativas y protocolos de convivencia.";
        highlights = [
          "Clasifica registros según circulares de convivencia escolar y PIE.",
          "Envía notificaciones inmediatas a apoderados y equipos de apoyo.",
          "Documenta acuerdos de entrevistas y compromisos de retroalimentación.",
        ];
        break;
      case "students":
        summaryTitle = "Matrícula y cupos";
        summaryDescription =
          "Administra matrículas, traslados y sincronización próxima con SIGE.";
        highlights = [
          "Controla cupos disponibles por curso y nivel educativo.",
          "Registra apoyos PIE y necesidades específicas para coordinaciones UTP.",
          "Prepara reportes oficiales para sostenedor y supervisión MINEDUC.",
        ];
        break;
      default:
        break;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>{summaryTitle}</CardTitle>
          <CardDescription>{summaryDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-dashed p-4">
              <p className="text-xs uppercase text-muted-foreground">Cursos</p>
              <p className="text-2xl font-semibold">{metrics.totalCourses}</p>
              <p className="text-xs text-muted-foreground">
                En la vista filtrada actual
              </p>
            </div>
            <div className="rounded-lg border border-dashed p-4">
              <p className="text-xs uppercase text-muted-foreground">Activos</p>
              <p className="text-2xl font-semibold">{metrics.activeCourses}</p>
              <p className="text-xs text-muted-foreground">
                Cursos con libro operativo
              </p>
            </div>
            <div className="rounded-lg border border-dashed p-4">
              <p className="text-xs uppercase text-muted-foreground">
                Cupos planificados
              </p>
              <p className="text-2xl font-semibold">
                {metrics.plannedCapacity}
              </p>
              <p className="text-xs text-muted-foreground">
                Proyección total de estudiantes
              </p>
            </div>
          </div>

          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4">
            {highlights.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <RoleAwareHeader
          title={header.title}
          subtitle={header.subtitle}
          actions={headerActions}
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
                Cursos en Vista
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalCourses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cursos Activos
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeCourses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Año en Foco</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedYear ?? "Todos"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Niveles Escolares
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.distinctLevels}</div>
            </CardContent>
          </Card>
        </div>

        {renderViewSummary()}

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
        {filteredCourses.length > 0 && (
          <CourseManagementDashboard courses={filteredCourses} />
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
