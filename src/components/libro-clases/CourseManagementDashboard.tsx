"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
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
import { Users, BookOpen, Calendar } from "lucide-react";

interface CourseManagementDashboardProps {
  courses: any[];
}

export function CourseManagementDashboard({
  courses,
}: CourseManagementDashboardProps) {
  if (!courses || courses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No hay cursos para mostrar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {courses.map((course) => (
        <Card key={course._id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{course.name}</CardTitle>
                <CardDescription>
                  {course.grade} {course.section} - {course.level} | Año{" "}
                  {course.academicYear}
                </CardDescription>
              </div>
              <Badge variant={course.isActive ? "default" : "secondary"}>
                {course.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Course Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Profesor</p>
                  <p className="font-medium">
                    {course.teacher?.name || "Sin asignar"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estudiantes</p>
                  <p className="font-medium">
                    {course.students?.length || 0}
                    {course.maxStudents && ` / ${course.maxStudents}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Asignaturas</p>
                  <p className="font-medium">{course.subjects.length}</p>
                </div>
              </div>

              {/* Students List */}
              {course.students && course.students.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Estudiantes</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Grado</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {course.students.map((enrollment: any) => (
                        <TableRow key={enrollment._id}>
                          <TableCell>
                            {enrollment.student?.firstName}{" "}
                            {enrollment.student?.lastName}
                          </TableCell>
                          <TableCell>
                            {enrollment.student?.grade || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                enrollment.isActive ? "default" : "secondary"
                              }
                            >
                              {enrollment.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Subjects List */}
              {course.subjects && course.subjects.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Asignaturas</h3>
                  <div className="flex flex-wrap gap-2">
                    {course.subjects.map((subject: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
