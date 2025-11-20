"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageTransition } from "@/components/ui/page-transition";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { RoleAwareHeader } from "@/components/layout/RoleAwareNavigation";
import { StudentManagement } from "@/components/libro-clases/StudentManagement";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { useAuth } from "@clerk/nextjs";
import { useSession } from "@/lib/auth-client";

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
          <p>{t("admin.libro_clases.estudiantes.loading", "admin")}</p>
        </div>
      </PageTransition>
    );
  }

  // Determine which courses and students to show based on role
  let displayCourses = courses || [];
  let displayStudents = allStudents || [];
  let pageTitle = t("admin.libro_clases.estudiantes.title", "admin");
  let pageSubtitle = t("admin.libro_clases.estudiantes.subtitle", "admin");
  let showAddStudents = true;

  if (userRole === "PROFESOR") {
    pageTitle = t("admin.libro_clases.estudiantes.profesor.title", "admin");
    pageSubtitle = t(
      "admin.libro_clases.estudiantes.profesor.subtitle",
      "admin",
    );
    displayCourses = courses || [];
    displayStudents = []; // Teachers can't add arbitrary students
    showAddStudents = false;
  } else if (userRole === "PARENT") {
    pageTitle = t("admin.libro_clases.estudiantes.parent.title", "admin");
    pageSubtitle = t("admin.libro_clases.estudiantes.parent.subtitle", "admin");
    displayCourses = parentCourses || [];
    displayStudents = []; // Parents can't modify enrollments
    showAddStudents = false;
  }

  return (
    <RoleGuard roles={["ADMIN", "MASTER", "PROFESOR", "PARENT"]}>
      <PageTransition>
        <div className="space-y-6">
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
