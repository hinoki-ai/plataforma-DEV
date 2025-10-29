"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Plus,
  Minus,
  UserPlus,
  UserMinus,
  BookOpen,
  GraduationCap,
  Search,
} from "lucide-react";
import { StudentSelector } from "./StudentSelector";
import { toast } from "sonner";

interface StudentManagementProps {
  courses: any[];
  allStudents: any[];
  academicYear?: number;
  userRole?: string;
  showAddStudents?: boolean;
  parentStudents?: any[];
}

export function StudentManagement({
  courses,
  allStudents,
  academicYear,
  userRole,
  showAddStudents = true,
  parentStudents,
}: StudentManagementProps) {
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Mutations
  const enrollStudent = useMutation(api.courses.enrollStudent);
  const removeStudent = useMutation(api.courses.removeStudent);
  const bulkEnrollStudents = useMutation(api.courses.bulkEnrollStudents);
  const bulkRemoveStudents = useMutation(api.courses.bulkRemoveStudents);

  const handleEnrollStudent = async (courseId: string, studentId: string) => {
    try {
      await enrollStudent({
        courseId: courseId as any,
        studentId: studentId as any,
      });
      toast.success("Estudiante matriculado exitosamente");
    } catch (error: any) {
      toast.error(error.message || "Error al matricular estudiante");
    }
  };

  const handleRemoveStudent = async (courseId: string, studentId: string) => {
    try {
      await removeStudent({
        courseId: courseId as any,
        studentId: studentId as any,
      });
      toast.success("Estudiante removido exitosamente");
    } catch (error: any) {
      toast.error(error.message || "Error al remover estudiante");
    }
  };

  // Filter courses by search query
  const filteredCourses =
    courses?.filter(
      (course) =>
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.teacher?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  if (!courses || courses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No hay cursos disponibles
          </h3>
          <p className="text-muted-foreground">
            {academicYear
              ? `No se encontraron cursos para el año académico ${academicYear}`
              : "No hay cursos registrados en el sistema"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar cursos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm"
        />
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
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
              {courses.reduce(
                (acc, course) => acc + (course.students?.length || 0),
                0,
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Capacidad Total
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.reduce(
                (acc, course) => acc + (course.maxStudents || 0),
                0,
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Llenos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                courses.filter(
                  (course) =>
                    course.maxStudents &&
                    course.students?.length >= course.maxStudents,
                ).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No se encontraron cursos
            </h3>
            <p className="text-muted-foreground">
              Intenta ajustar los filtros de búsqueda
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseStudentCard
              key={course._id}
              course={course}
              onAddStudent={
                showAddStudents
                  ? () => {
                      setSelectedCourse(course);
                      setIsAddDialogOpen(true);
                    }
                  : undefined
              }
              onRemoveStudent={
                showAddStudents ? handleRemoveStudent : undefined
              }
              allStudents={allStudents}
              userRole={userRole}
              parentStudents={parentStudents}
            />
          ))}
        </div>
      )}

      {/* Add Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Agregar Estudiantes - {selectedCourse?.name}
            </DialogTitle>
            <DialogDescription>
              Selecciona los estudiantes que deseas matricular en este curso
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <StudentSelector
              course={selectedCourse}
              allStudents={allStudents}
              onStudentSelect={(studentId) =>
                handleEnrollStudent(selectedCourse._id, studentId)
              }
              onClose={() => setIsAddDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CourseStudentCardProps {
  course: any;
  onAddStudent?: () => void;
  onRemoveStudent?: (courseId: string, studentId: string) => void;
  allStudents: any[];
  userRole?: string;
  parentStudents?: any[];
}

function CourseStudentCard({
  course,
  onAddStudent,
  onRemoveStudent,
  allStudents,
  userRole,
  parentStudents,
}: CourseStudentCardProps) {
  const enrolledStudentIds = new Set(
    course.students?.map((enrollment: any) => enrollment.studentId) || [],
  );

  // For parents, highlight their children
  const parentStudentIds = new Set(
    parentStudents?.map((student: any) => student._id) || [],
  );

  // Check if user can modify enrollments
  const canModifyEnrollments = userRole === "ADMIN" || userRole === "MASTER";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">{course.name}</CardTitle>
              <CardDescription>
                {course.grade} {course.section} - {course.level}
              </CardDescription>
            </div>
          </div>
          <Badge variant={course.isActive ? "default" : "secondary"}>
            {course.isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Course Info */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Profesor</p>
              <p className="font-medium">
                {course.teacher?.name || "Sin asignar"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Estudiantes</p>
              <p className="font-medium">
                {course.students?.length || 0}
                {course.maxStudents && ` / ${course.maxStudents}`}
              </p>
            </div>
          </div>

          {/* Student List */}
          <div className="border rounded-md p-3 bg-muted/20">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">
                {userRole === "PARENT"
                  ? "Estudiantes en el Curso"
                  : "Estudiantes Matriculados"}
              </h4>
              {canModifyEnrollments && onAddStudent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddStudent}
                  className="h-7 px-2"
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  Agregar
                </Button>
              )}
            </div>

            {course.students && course.students.length > 0 ? (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {course.students.map((enrollment: any) => {
                  const isParentChild = parentStudentIds.has(
                    enrollment.studentId,
                  );
                  return (
                    <div
                      key={enrollment._id}
                      className={`flex items-center justify-between py-1 px-2 rounded text-sm ${
                        isParentChild
                          ? "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
                          : "bg-background"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>
                          {enrollment.student?.firstName}{" "}
                          {enrollment.student?.lastName}
                        </span>
                        {isParentChild && (
                          <Badge variant="secondary" className="text-xs">
                            Mi Hijo/a
                          </Badge>
                        )}
                      </div>
                      {canModifyEnrollments && onRemoveStudent && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-destructive/10"
                            >
                              <UserMinus className="h-3 w-3 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Remover Estudiante
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                ¿Estás seguro de que quieres remover a{" "}
                                {enrollment.student?.firstName}{" "}
                                {enrollment.student?.lastName} del curso{" "}
                                {course.name}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  onRemoveStudent(
                                    course._id,
                                    enrollment.studentId,
                                  )
                                }
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay estudiantes matriculados
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
