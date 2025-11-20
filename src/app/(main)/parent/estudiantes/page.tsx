"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { getRoleAccess } from "@/lib/role-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  BookOpen,
  Award,
  Calendar,
  TrendingUp,
  Heart,
  MessageSquare,
  Phone,
  Mail,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { FixedBackgroundLayout } from "@/components/layout/FixedBackgroundLayout";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { LoadingState } from "@/components/ui/loading-states";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Link from "next/link";

interface Student {
  id: string;
  name: string;
  grade: string;
  enrollmentDate: string;
  attendance: number;
  academicProgress: number;
  teacher: {
    name: string;
    email: string;
    phone?: string;
  };
  subjects: Array<{
    name: string;
    grade: string;
    progress: number;
  }>;
  upcomingActivities: Array<{
    title: string;
    date: string;
    type: string;
  }>;
  recentReports: Array<{
    title: string;
    date: string;
    type: string;
  }>;
}

function EstudiantesContent() {
  const { data: session, status } = useSession();
  const { t } = useDivineParsing(["common", "parent"]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (session?.user?.role === "PARENT") {
      fetchStudents();
    }
  }, [session]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch real data from API endpoint
      const response = await fetch("/api/parent/students");
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      const result = await response.json();

      if (result.data) {
        // Transform API data to match Student interface
        const apiStudents: Student[] = result.data.map((child: any) => {
          const defaultSubjects = [
            {
              name: t("common.subjects.language", "common"),
              grade: "-",
              progress: 0,
            },
            {
              name: t("common.subjects.math", "common"),
              grade: "-",
              progress: 0,
            },
            {
              name: t("common.subjects.science", "common"),
              grade: "-",
              progress: 0,
            },
          ];

          const subjects =
            Array.isArray(child.subjects) && child.subjects.length
              ? child.subjects.map((subject: any) => ({
                  name: subject.name ?? "General",
                  grade: subject.grade ?? "-",
                  progress:
                    typeof subject.progress === "number"
                      ? Math.max(0, Math.min(100, subject.progress))
                      : 0,
                }))
              : defaultSubjects;

          const upcomingActivities = Array.isArray(child.upcomingActivities)
            ? child.upcomingActivities.map((activity: any) => ({
                title: activity.title ?? t("parent.students.activity"),
                date: activity.date ?? new Date().toISOString(),
                type: activity.type ?? "General",
              }))
            : [];

          const recentReports = Array.isArray(child.recentReports)
            ? child.recentReports.map((report: any) => ({
                title: report.title ?? t("parent.students.report"),
                date: report.date ?? new Date().toISOString(),
                type: report.type ?? "General",
              }))
            : [];

          const attendance =
            typeof child.attendance === "number"
              ? Math.max(0, Math.min(100, child.attendance))
              : 0;

          const academicProgress =
            typeof child.academicProgress === "number"
              ? Math.max(0, Math.min(100, child.academicProgress))
              : 0;

          return {
            id: child.id,
            name: child.name,
            grade: child.grade ?? t("parent.students.no_grade"),
            enrollmentDate: child.enrollmentDate,
            attendance,
            academicProgress,
            teacher: {
              name:
                child.teacher?.name ?? t("parent.students.assigned_teacher"),
              email: child.teacher?.email ?? "",
              phone: child.teacher?.phone ?? undefined,
            },
            subjects,
            upcomingActivities,
            recentReports,
          } satisfies Student;
        });

        setStudents(apiStudents);
        if (apiStudents.length > 0) {
          setSelectedStudent(apiStudents[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      setError(t("parent.students.error_loading"));
    } finally {
      setLoading(false);
    }
  };

  // Handle loading state
  if (status === "loading") {
    return <LoadingState />;
  }

  // Ensure user has access to parent section
  if (!session || !session.data?.user) {
    redirect("/login");
  }

  const roleAccess = getRoleAccess(session.data?.user.role);
  if (!roleAccess.canAccessParent) {
    redirect("/unauthorized");
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("parent.students.page_title")}
          </h1>
          <p className="text-muted-foreground">
            {t("parent.students.page_description")}
          </p>
        </div>
        <div className="text-center py-16">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("parent.students.error_loading")}
          </h3>
          <p className="text-gray-600">{error}</p>
          <Button onClick={fetchStudents} className="mt-4">
            {t("parent.students.retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t("parent.students.page_title")}
        </h1>
        <p className="text-muted-foreground">
          {t("parent.students.page_description")}
        </p>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t("parent.students.no_students")}
            </h3>
            <p className="text-muted-foreground mb-6 text-center">
              {t("parent.students.no_students_desc")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Selector */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t("parent.students.students")}
                </CardTitle>
                <CardDescription>
                  {t("parent.students.select_student")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {students.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedStudent?.id === student.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">
                          {student.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {student.grade}
                        </p>
                      </div>
                      <Badge
                        variant={
                          selectedStudent?.id === student.id
                            ? "default"
                            : "secondary"
                        }
                      >
                        {selectedStudent?.id === student.id
                          ? t("parent.students.selected")
                          : t("parent.students.view")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Student Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedStudent && (
              <>
                {/* Student Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      {selectedStudent.name}
                    </CardTitle>
                    <CardDescription>
                      {selectedStudent.grade} •{" "}
                      {t("parent.students.enrolled_since")}{" "}
                      {new Date(
                        selectedStudent.enrollmentDate,
                      ).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Attendance */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {t("parent.students.attendance")}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {selectedStudent.attendance}%
                          </span>
                        </div>
                        <Progress
                          value={selectedStudent.attendance}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          {selectedStudent.attendance >= 90
                            ? t("parent.students.excellent_attendance")
                            : selectedStudent.attendance >= 80
                              ? t("parent.students.good_attendance")
                              : t("parent.students.regular_attendance")}
                        </p>
                      </div>

                      {/* Academic Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {t("parent.students.academic_progress")}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {selectedStudent.academicProgress}%
                          </span>
                        </div>
                        <Progress
                          value={selectedStudent.academicProgress}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          {selectedStudent.academicProgress >= 90
                            ? t("parent.students.excellent_performance")
                            : selectedStudent.academicProgress >= 80
                              ? t("parent.students.good_performance")
                              : t("parent.students.regular_performance")}
                        </p>
                      </div>
                    </div>

                    {/* Teacher Info */}
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-medium text-foreground mb-3">
                        {t("parent.students.guide_teacher")}
                      </h4>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium">
                            {selectedStudent.teacher.name}
                          </h5>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {selectedStudent.teacher.email}
                            </span>
                            {selectedStudent.teacher.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {selectedStudent.teacher.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        <Link href="/parent/comunicacion">
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            {t("parent.students.contact")}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Academic Subjects */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {t("parent.students.subject_performance")}
                    </CardTitle>
                    <CardDescription>
                      {t("parent.students.subject_performance_desc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedStudent.subjects.map((subject, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                        >
                          <div className="flex-1">
                            <h5 className="font-medium text-foreground">
                              {subject.name}
                            </h5>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {t("parent.students.grade")}: {subject.grade}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {t("parent.students.progress")}:{" "}
                                {subject.progress}%
                              </span>
                            </div>
                          </div>
                          <Progress
                            value={subject.progress}
                            className="w-20 h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Activities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {t("parent.students.upcoming_activities")}
                    </CardTitle>
                    <CardDescription>
                      {t("parent.students.upcoming_activities_desc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedStudent.upcomingActivities.map(
                        (activity, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 border rounded-lg"
                          >
                            <div
                              className={`w-3 h-3 rounded-full ${
                                activity.type === "Evaluación"
                                  ? "bg-red-500"
                                  : activity.type === "Excursión"
                                    ? "bg-green-500"
                                    : activity.type === "Taller"
                                      ? "bg-blue-500"
                                      : "bg-purple-500"
                              }`}
                            />
                            <div className="flex-1">
                              <h5 className="font-medium text-foreground">
                                {activity.title}
                              </h5>
                              <p className="text-sm text-muted-foreground">
                                {new Date(activity.date).toLocaleDateString(
                                  "es-ES",
                                  {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                            <Badge variant="outline">{activity.type}</Badge>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Reports */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {t("parent.students.recent_reports")}
                    </CardTitle>
                    <CardDescription>
                      {t("parent.students.recent_reports_desc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedStudent.recentReports.map((report, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 border rounded-lg"
                        >
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <h5 className="font-medium text-foreground">
                              {report.title}
                            </h5>
                            <p className="text-sm text-muted-foreground">
                              {new Date(report.date).toLocaleDateString(
                                "es-ES",
                              )}
                            </p>
                          </div>
                          <Badge variant="secondary">{report.type}</Badge>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            {t("parent.students.view_report")}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EstudiantesPage() {
  return (
    <ErrorBoundary fallback={<div>Error loading students page</div>}>
      <Suspense fallback={<LoadingState />}>
        <EstudiantesContent />
      </Suspense>
    </ErrorBoundary>
  );
}
