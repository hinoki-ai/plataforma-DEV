"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, type Doc } from "@/convex/_generated/dataModel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Users,
  BookOpen,
  Star,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

interface GradesTableProps {
  courseId: Id<"courses">;
  teacherId: Id<"users">;
  isParentView?: boolean;
}

type GradeOverviewEntry = {
  studentId: Id<"students">;
  student: {
    firstName: string;
    lastName: string;
    grade?: string | null;
  };
  subjectAverages: Record<
    string,
    {
      average: number;
      weightedAverage: number | null;
      count: number;
      passing: boolean;
      grades: Doc<"classGrades">[];
    }
  >;
  overallAverage: number;
  overallWeightedAverage: number | null;
  totalGrades: number;
  passingSubjects: number;
  totalSubjects: number;
};

type CourseStudentEntry = {
  studentId: Id<"students">;
  student?: {
    parentId?: Id<"users"> | null;
    firstName?: string;
    lastName?: string;
    grade?: string | null;
  } | null;
};

type CourseDetails = {
  name: string;
  grade?: string | null;
  section?: string | null;
  subjects: string[];
  students?: CourseStudentEntry[];
};

type Period = "PRIMER_SEMESTRE" | "SEGUNDO_SEMESTRE" | "ANUAL";

const PERIOD_LABELS = {
  PRIMER_SEMESTRE: "Primer Semestre",
  SEGUNDO_SEMESTRE: "Segundo Semestre",
  ANUAL: "Anual",
};

// Chilean grading constants
const PASSING_GRADE = 4.0;

function getGradeColor(grade: number): string {
  if (grade >= 7.0) {
    return "text-purple-700 bg-purple-100 border-purple-300";
  } else if (grade >= 6.0) {
    return "text-blue-700 bg-blue-100 border-blue-300";
  } else if (grade >= PASSING_GRADE) {
    return "text-green-700 bg-green-100 border-green-300";
  } else {
    return "text-red-700 bg-red-100 border-red-300";
  }
}

function getGradeIcon(grade: number) {
  if (grade >= 7.0) {
    return Star;
  } else if (grade >= 6.0) {
    return TrendingUp;
  } else if (grade >= PASSING_GRADE) {
    return Minus;
  } else {
    return TrendingDown;
  }
}

export function GradesTable({
  courseId,
  teacherId,
  isParentView = false,
}: GradesTableProps) {
  const { userId } = useAuth();
  const [selectedPeriod, setSelectedPeriod] =
    useState<Period>("PRIMER_SEMESTRE");

  // Get course details
  const courseData = useQuery(api.courses.getCourseById, { courseId });

  // Get current user if parent view
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    isParentView && userId ? { clerkId: userId } : "skip",
  );

  // Get grade overview
  const gradeOverview = useQuery(api.grades.getCourseGradeOverview, {
    courseId,
    period: selectedPeriod,
  });

  if (!courseData || gradeOverview === undefined) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48 mx-auto" />
            <div className="h-4 bg-muted rounded w-64 mx-auto" />
            <div className="h-32 bg-muted rounded w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!courseData) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Curso no encontrado</h3>
          <p>El curso seleccionado no existe o no está disponible.</p>
        </CardContent>
      </Card>
    );
  }

  const typedCourse = courseData as CourseDetails;
  const gradeOverviewData = gradeOverview as GradeOverviewEntry[];

  // Filter gradeOverview for parent view - only show their children
  let filteredGradeOverview: GradeOverviewEntry[] = gradeOverviewData;
  if (isParentView && currentUser) {
    filteredGradeOverview = gradeOverviewData.filter(
      (student: GradeOverviewEntry) => {
        // Get the student details from the course to check parentId
        const courseStudent = typedCourse.students?.find(
          (s: CourseStudentEntry) => s.studentId === student.studentId,
        );
        return courseStudent?.student?.parentId === currentUser._id;
      },
    );
  }

  if (!filteredGradeOverview || filteredGradeOverview.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Calificaciones del Curso
          </CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select
                value={selectedPeriod}
                onValueChange={(value: Period) => setSelectedPeriod(value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIMER_SEMESTRE">
                    {PERIOD_LABELS.PRIMER_SEMESTRE}
                  </SelectItem>
                  <SelectItem value="SEGUNDO_SEMESTRE">
                    {PERIOD_LABELS.SEGUNDO_SEMESTRE}
                  </SelectItem>
                  <SelectItem value="ANUAL">{PERIOD_LABELS.ANUAL}</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground">
                {typedCourse.name} - {typedCourse.grade} {typedCourse.section}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No hay calificaciones registradas
          </h3>
          <p>
            No se han encontrado calificaciones para el período seleccionado.
          </p>
        </CardContent>
      </Card>
    );
  }

  const averageGrade =
    filteredGradeOverview.reduce((acc, student: GradeOverviewEntry) => {
      const avg = student.overallWeightedAverage ?? student.overallAverage;
      return acc + avg;
    }, 0) / filteredGradeOverview.length;

  const passingRate =
    (filteredGradeOverview.filter((student: GradeOverviewEntry) => {
      const avg = student.overallWeightedAverage ?? student.overallAverage;
      return avg >= PASSING_GRADE;
    }).length /
      filteredGradeOverview.length) *
    100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {isParentView
            ? "Calificaciones de Mis Hijos"
            : "Calificaciones del Curso"}
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isParentView && (
              <Select
                value={selectedPeriod}
                onValueChange={(value: Period) => setSelectedPeriod(value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIMER_SEMESTRE">
                    {PERIOD_LABELS.PRIMER_SEMESTRE}
                  </SelectItem>
                  <SelectItem value="SEGUNDO_SEMESTRE">
                    {PERIOD_LABELS.SEGUNDO_SEMESTRE}
                  </SelectItem>
                  <SelectItem value="ANUAL">{PERIOD_LABELS.ANUAL}</SelectItem>
                </SelectContent>
              </Select>
            )}
            <div className="text-sm text-muted-foreground">
              {typedCourse.name} - {typedCourse.grade} {typedCourse.section}
              {isParentView && ` | ${PERIOD_LABELS[selectedPeriod]}`}
            </div>
          </div>
          {!isParentView && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Promedio curso:</span>
                <Badge
                  variant="secondary"
                  className={cn("font-mono", getGradeColor(averageGrade))}
                >
                  {averageGrade.toFixed(1)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Aprobación:</span>
                <Badge
                  variant="outline"
                  className={cn(
                    passingRate >= 70
                      ? "text-green-600 border-green-200"
                      : passingRate >= 50
                        ? "text-yellow-600 border-yellow-200"
                        : "text-red-600 border-red-200",
                  )}
                >
                  {passingRate.toFixed(0)}%
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-64">Estudiante</TableHead>
                {typedCourse.subjects.map((subject: string) => (
                  <TableHead key={subject} className="text-center min-w-24">
                    {subject}
                  </TableHead>
                ))}
                <TableHead className="text-center min-w-32 font-bold">
                  Promedio General
                </TableHead>
                <TableHead className="text-center min-w-24">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGradeOverview.map((student: GradeOverviewEntry) => {
                const overallAvg =
                  student.overallWeightedAverage ?? student.overallAverage;
                const GradeIcon = getGradeIcon(overallAvg);

                return (
                  <TableRow key={student.studentId}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">
                          {student.student.firstName} {student.student.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {student.student.grade}
                        </div>
                      </div>
                    </TableCell>
                    {typedCourse.subjects.map((subject: string) => {
                      const subjectData = student.subjectAverages[subject];
                      if (!subjectData || subjectData.count === 0) {
                        return (
                          <TableCell
                            key={subject}
                            className="text-center text-muted-foreground"
                          >
                            <span className="text-xs">-</span>
                          </TableCell>
                        );
                      }

                      const subjectAvg =
                        subjectData.weightedAverage ?? subjectData.average;
                      const SubjectIcon = getGradeIcon(subjectAvg);

                      return (
                        <TableCell key={subject} className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-mono text-xs",
                                getGradeColor(subjectAvg),
                              )}
                            >
                              {subjectAvg.toFixed(1)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {subjectData.count} notas
                            </span>
                          </div>
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center">
                      <Badge
                        variant="default"
                        className={cn(
                          "font-mono font-bold",
                          getGradeColor(overallAvg),
                        )}
                      >
                        <GradeIcon className="h-4 w-4 mr-1" />
                        {overallAvg.toFixed(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Badge
                          variant={
                            overallAvg >= PASSING_GRADE
                              ? "default"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {overallAvg >= PASSING_GRADE
                            ? "Aprobado"
                            : "Reprobado"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {student.passingSubjects}/{student.totalSubjects}{" "}
                          asignaturas
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Legend - Only show for teachers */}
        {!isParentView && (
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span>Reprobado (&lt; {PASSING_GRADE})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span>Aprobado (≥ {PASSING_GRADE})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
              <span>Bueno (≥ 6.0)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
              <span>Excelente (≥ 7.0)</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
