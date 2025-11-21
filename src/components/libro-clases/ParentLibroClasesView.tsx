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
import { useConvexConnection } from "@/hooks/useConvexConnection";
import { useLanguage } from "@/components/language/useDivineLanguage";
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
  const { t } = useLanguage();
  const { userId, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedCourseId, setSelectedCourseId] =
    useState<Id<"courses"> | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>(view);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const { isConnected, connectionError, hasConnectionIssue } =
    useConvexConnection();

  useEffect(() => {
    setActiveTab(view);
  }, [view]);

  // DEV MODE: Use mock user ID for testing
  const mockUserId = isDev ? "dev-parent-user" : userId;

  // Get current user - must be called before any early returns
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    (mockUserId || userId) && (isLoaded || isDev) && (isSignedIn || isDev)
      ? { clerkId: mockUserId || userId }
      : "skip",
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

  // DEV MODE: Allow access on localhost even without Clerk auth
  const isDev =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  // Check if user is signed in
  if (!isDev && (!isSignedIn || !userId)) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <RoleAwareHeader
            title={t("parent.libro_clases.errors.auth_required")}
            subtitle={t("parent.libro_clases.errors.auth_required_desc")}
          />
          <Card>
            <CardContent className="py-10">
              <p className="text-muted-foreground">
                {t("parent.libro_clases.errors.auth_required_desc")}
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <Button onClick={() => router.push("/login")}>
                  {t("parent.libro_clases.errors.login")}
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
            title={t("parent.libro_clases.errors.tenancy_error")}
            subtitle={t("parent.libro_clases.errors.tenancy_error_desc")}
          />
          <Card>
            <CardContent className="py-10 space-y-4">
              <p className="text-muted-foreground mb-4">{errorMessage}</p>
              {errorMessage.includes("No institution selected") && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    {t("parent.libro_clases.errors.institution_selection_desc")}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap gap-3 mt-4">
                <Button variant="outline" onClick={() => router.refresh()}>
                  {t("parent.libro_clases.errors.retry")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/contacto")}
                >
                  {t("parent.libro_clases.errors.contact_admin")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  if (isLoading) {
    if (loadingTimedOut || hasConnectionIssue) {
      return (
        <PageTransition>
          <div className="space-y-6">
            <RoleAwareHeader
              title={t("parent.libro_clases.loading.connection_error")}
              subtitle={t("parent.libro_clases.loading.connection_error_desc")}
            />
            <Card>
              <CardContent className="py-10 space-y-4">
                <p className="text-muted-foreground mb-4">
                  {t("parent.libro_clases.loading.connection_error_desc")}
                </p>
                {connectionError && (
                  <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm font-medium text-destructive mb-2">
                      {t("parent.libro_clases.loading.connection_error_detail")}
                      :
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {connectionError}
                    </p>
                  </div>
                )}
                {tenancyCheck && "error" in tenancyCheck && (
                  <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm font-medium text-destructive mb-2">
                      {t("parent.libro_clases.errors.tenancy_error")}:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(() => {
                        const error = (
                          tenancyCheck as unknown as { error?: unknown }
                        ).error;
                        return typeof error === "string"
                          ? error
                          : t("parent.libro_clases.errors.tenancy_error");
                      })()}
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap gap-3 mt-6">
                  <Button
                    onClick={() =>
                      typeof window !== "undefined" && window.location.reload()
                    }
                  >
                    {t("parent.libro_clases.loading.reload_page")}
                  </Button>
                  <Button variant="outline" onClick={() => router.refresh()}>
                    {t("parent.libro_clases.loading.reconnect")}
                  </Button>
                </div>
                {process.env.NODE_ENV === "development" && (
                  <div className="mt-4 p-4 bg-muted rounded-lg text-xs space-y-2">
                    <p className="font-medium mb-2">
                      {t("parent.libro_clases.loading.development_info")}:
                    </p>
                    <p>{t("parent.libro_clases.loading.convex_dev_note")}</p>
                    <p className="mt-2">
                      {t("parent.libro_clases.loading.connection_status")}:{" "}
                      <span
                        className={
                          isConnected
                            ? "text-green-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {isConnected
                          ? t("parent.libro_clases.loading.connected")
                          : t("parent.libro_clases.loading.disconnected")}
                      </span>
                    </p>
                    <p>
                      {t("parent.libro_clases.loading.next_public_convex")}:{" "}
                      {process.env.NEXT_PUBLIC_CONVEX_URL
                        ? `✅ ${t("parent.libro_clases.loading.configured")}`
                        : `❌ ${t("parent.libro_clases.loading.not_configured")}`}
                    </p>
                  </div>
                )}
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
            title={t("parent.libro_clases.errors.profile_not_found")}
            subtitle={t("parent.libro_clases.errors.profile_not_found_desc")}
          />
          <Card>
            <CardContent className="py-10">
              <p className="text-muted-foreground">
                {t("parent.libro_clases.errors.profile_not_found_desc")}
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
                    {t("parent.libro_clases.course_selection.active_courses")}
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
                    {t("parent.libro_clases.course_selection.total_students")}
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
                    {t("parent.libro_clases.course_selection.academic_year")}
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
                    {t("parent.libro_clases.course_selection.subjects")}
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
                {t("parent.libro_clases.course_selection.select_course")}
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
                              {t(
                                "parent.libro_clases.course_selection.subjects",
                              )}
                              :
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
                      {t("parent.libro_clases.course_selection.no_courses")}
                    </h3>
                    <p className="text-muted-foreground">
                      {t(
                        "parent.libro_clases.course_selection.no_courses_desc",
                      )}
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
                      {selectedCourse?.level} |{" "}
                      {t("parent.libro_clases.course_selection.academic_year")}{" "}
                      {selectedCourse?.academicYear}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {t("parent.libro_clases.course_details.read_only_view")}
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
                      {t("parent.libro_clases.course_details.students")}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {selectedCourse?.subjects?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("parent.libro_clases.course_details.subjects")}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {selectedCourse?.teacher?.name || "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("parent.libro_clases.course_details.head_teacher")}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {selectedCourse?.academicYear}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("parent.libro_clases.course_details.academic_year")}
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
                  {t("parent.libro_clases.tabs.overview")}
                </TabsTrigger>
                <TabsTrigger value="grades">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {t("parent.libro_clases.tabs.grades")}
                </TabsTrigger>
                <TabsTrigger value="attendance">
                  <Calendar className="h-4 w-4 mr-2" />
                  {t("parent.libro_clases.tabs.attendance")}
                </TabsTrigger>
                <TabsTrigger value="observations">
                  <Eye className="h-4 w-4 mr-2" />
                  {t("parent.libro_clases.tabs.observations")}
                </TabsTrigger>
                <TabsTrigger value="meetings">
                  <Users className="h-4 w-4 mr-2" />
                  {t("parent.libro_clases.tabs.meetings")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {t("parent.libro_clases.overview.my_students")}
                      </CardTitle>
                      <CardDescription>
                        {t("parent.libro_clases.overview.my_students_desc")}
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
                                {t("parent.libro_clases.status.read_only")}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          {t("parent.libro_clases.overview.no_students")}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {t("parent.libro_clases.overview.subjects")}
                      </CardTitle>
                      <CardDescription>
                        {t("parent.libro_clases.overview.subjects_desc")}
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

              <TabsContent value="grades">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">
                          {t("parent.libro_clases.grades.read_only_notice")}
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
                      <CardTitle>
                        {t("parent.libro_clases.attendance.calendar_title")}
                      </CardTitle>
                      <CardDescription>
                        {t("parent.libro_clases.attendance.calendar_desc")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border p-4">
                          <p className="text-xs uppercase text-muted-foreground">
                            {t("parent.libro_clases.attendance.current_course")}
                          </p>
                          <p className="text-lg font-semibold">
                            {selectedCourse?.name ||
                              t(
                                "parent.libro_clases.course_selection.select_course",
                              )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectedCourse?.grade} {selectedCourse?.section}
                          </p>
                        </div>
                        <div className="rounded-lg border p-4">
                          <p className="text-xs uppercase text-muted-foreground">
                            {t(
                              "parent.libro_clases.attendance.events_this_month",
                            )}
                          </p>
                          <p className="text-lg font-semibold">
                            {t(
                              "parent.libro_clases.attendance.integrated_calendar",
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t(
                              "parent.libro_clases.attendance.academic_events",
                            )}
                          </p>
                        </div>
                        <div className="rounded-lg border p-4">
                          <p className="text-xs uppercase text-muted-foreground">
                            {t(
                              "parent.libro_clases.attendance.family_attendance",
                            )}
                          </p>
                          <p className="text-lg font-semibold">
                            {t(
                              "parent.libro_clases.attendance.real_time_tracking",
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t(
                              "parent.libro_clases.attendance.automatic_notifications",
                            )}
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
                    <CardTitle>
                      {t("parent.libro_clases.observations.title")}
                    </CardTitle>
                    <CardDescription>
                      {t("parent.libro_clases.observations.desc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border p-4">
                        <p className="text-sm font-semibold">
                          {t("parent.libro_clases.observations.recognitions")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t(
                            "parent.libro_clases.observations.recognitions_desc",
                          )}
                        </p>
                      </div>
                      <div className="rounded-lg border p-4">
                        <p className="text-sm font-semibold">
                          {t("parent.libro_clases.observations.commitments")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t(
                            "parent.libro_clases.observations.commitments_desc",
                          )}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {t("parent.libro_clases.observations.school_regulations")}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="meetings">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t("parent.libro_clases.meetings.title")}
                    </CardTitle>
                    <CardDescription>
                      {t("parent.libro_clases.meetings.desc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {t("parent.libro_clases.meetings.calendar_access")}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link href="/parent/reuniones" className="inline-flex">
                        <Button variant="secondary">
                          {t(
                            "parent.libro_clases.meetings.actions.go_to_meetings",
                          )}
                        </Button>
                      </Link>
                      <Link href="/parent/comunicacion" className="inline-flex">
                        <Button variant="outline">
                          {t(
                            "parent.libro_clases.meetings.actions.contact_inspection",
                          )}
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
