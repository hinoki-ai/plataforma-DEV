"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageTransition } from "@/components/ui/page-transition";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { RoleAwareHeader } from "@/components/layout/RoleAwareNavigation";
import { StudentManagement } from "@/components/libro-clases/StudentManagement";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { useAuth } from "@clerk/nextjs";
import { useSession } from "next-auth/react";

export default function AdminEstudiantesPage() {
  const { userId } = useAuth();
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    new Date().getFullYear(),
  );
  const { t } = useDivineParsing(["common", "admin"]);

  // Get current user session to determine role
  const session = useSession();
  const userRole = session?.data?.user?.role;

  // Fetch courses based on user role
  const courses = useQuery(
    api.courses.getCourses,
    userId && selectedYear !== undefined
      ? userRole === "PROFESOR"
        ? {
            teacherId: userId as any,
            academicYear: selectedYear,
            isActive: true,
          }
        : { academicYear: selectedYear, isActive: true }
      : "skip",
  );

  // Fetch all available students for adding to courses (admin only)
  const allStudents = useQuery(
    api.students.getStudents,
    userRole === "ADMIN" || userRole === "MASTER" ? { isActive: true } : "skip",
  );

  // For parents, get their children and their courses
  const parentStudents = useQuery(
    api.students.getStudents,
    userId && userRole === "PARENT"
      ? { parentId: userId as any, isActive: true }
      : "skip",
  );

  // Get courses for parent's children using the proper query
  const parentCourses = useQuery(
    api.courses.getCoursesForParent,
    userId && userRole === "PARENT" && selectedYear !== undefined
      ? {
          parentId: userId as any,
          academicYear: selectedYear,
          isActive: true,
        }
      : "skip",
  );

  if (!userId) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-screen">
          <p>Cargando...</p>
        </div>
      </PageTransition>
    );
  }

  // Determine which courses and students to show based on role
  let displayCourses = courses || [];
  let displayStudents = allStudents || [];
  let pageTitle = "Gestión de Estudiantes por Curso";
  let pageSubtitle =
    "Administra la matrícula de estudiantes en cada curso del libro de clases";
  let showAddStudents = true;

  if (userRole === "PROFESOR") {
    pageTitle = "Mis Cursos - Gestión de Estudiantes";
    pageSubtitle = "Administra los estudiantes de tus cursos asignados";
    displayCourses = courses || [];
    displayStudents = []; // Teachers can't add arbitrary students
    showAddStudents = false;
  } else if (userRole === "PARENT") {
    pageTitle = "Cursos de Mis Hijos";
    pageSubtitle = "Ve los cursos y estudiantes de tus hijos";
    displayCourses = parentCourses || [];
    displayStudents = []; // Parents can't modify enrollments
    showAddStudents = false;
  }

  return (
    <RoleGuard roles={["ADMIN", "MASTER", "PROFESOR", "PARENT"]}>
      <PageTransition>
        <div className="space-y-6">
          <RoleAwareHeader
            title={pageTitle}
            subtitle={pageSubtitle}
            actions={
              <div className="flex gap-2 items-center">
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
              </div>
            }
          />

          <StudentManagement
            courses={displayCourses}
            allStudents={displayStudents}
            academicYear={selectedYear}
            userRole={userRole}
            showAddStudents={showAddStudents}
            parentStudents={parentStudents}
          />
        </div>
      </PageTransition>
    </RoleGuard>
  );
}
