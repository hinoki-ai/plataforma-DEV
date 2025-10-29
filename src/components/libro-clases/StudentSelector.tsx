"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  UserPlus,
  Users,
  GraduationCap,
  Filter,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface StudentSelectorProps {
  course: any;
  allStudents: any[];
  onStudentSelect: (studentId: string) => void;
  onClose: () => void;
}

export function StudentSelector({
  course,
  allStudents,
  onStudentSelect,
  onClose,
}: StudentSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set(),
  );

  // Get enrolled student IDs
  const enrolledStudentIds = new Set(
    course.students?.map((enrollment: any) => enrollment.studentId) || [],
  );

  // Filter available students (not already enrolled)
  const availableStudents = allStudents.filter(
    (student) => !enrolledStudentIds.has(student._id),
  );

  // Get unique grades for filtering
  const availableGrades = useMemo(() => {
    const grades = new Set(availableStudents.map((student) => student.grade));
    return Array.from(grades).sort();
  }, [availableStudents]);

  // Filter students based on search and grade
  const filteredStudents = availableStudents.filter((student) => {
    const matchesSearch =
      searchQuery === "" ||
      student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${student.firstName} ${student.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesGrade =
      selectedGrade === "" || student.grade === selectedGrade;

    return matchesSearch && matchesGrade;
  });

  const handleStudentToggle = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleBulkEnroll = async () => {
    if (selectedStudents.size === 0) {
      toast.error("Selecciona al menos un estudiante");
      return;
    }

    try {
      // Enroll all selected students
      for (const studentId of selectedStudents) {
        await onStudentSelect(studentId);
      }

      toast.success(
        `${selectedStudents.size} estudiantes matriculados exitosamente`,
      );
      setSelectedStudents(new Set());
      onClose();
    } catch (error: any) {
      toast.error("Error al matricular estudiantes");
    }
  };

  const handleSingleEnroll = async (studentId: string) => {
    try {
      await onStudentSelect(studentId);
      toast.success("Estudiante matriculado exitosamente");
      onClose();
    } catch (error: any) {
      toast.error("Error al matricular estudiante");
    }
  };

  return (
    <div className="space-y-6">
      {/* Course Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            {course.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Grado</p>
              <p className="font-medium">{course.grade}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Sección</p>
              <p className="font-medium">{course.section}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Estudiantes Actuales</p>
              <p className="font-medium">
                {course.students?.length || 0}
                {course.maxStudents && ` / ${course.maxStudents}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar estudiantes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por grado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los grados</SelectItem>
            {availableGrades.map((grade) => (
              <SelectItem key={grade} value={grade}>
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selection Summary */}
      {selectedStudents.size > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {selectedStudents.size} estudiante
                  {selectedStudents.size !== 1 ? "s" : ""} seleccionado
                  {selectedStudents.size !== 1 ? "s" : ""}
                </span>
              </div>
              <Button onClick={handleBulkEnroll} size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Matricular Seleccionados
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Students List */}
      <div className="border rounded-lg">
        <div className="p-4 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">
              Estudiantes Disponibles ({filteredStudents.length})
            </h3>
            {filteredStudents.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const allIds = filteredStudents.map((s) => s._id);
                  setSelectedStudents(new Set(allIds));
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                Seleccionar Todos
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No se encontraron estudiantes disponibles</p>
              <p className="text-sm mt-1">
                {searchQuery || selectedGrade
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Todos los estudiantes están matriculados en este curso"}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredStudents.map((student) => (
                <div
                  key={student._id}
                  className="p-4 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedStudents.has(student._id)}
                        onCheckedChange={() => handleStudentToggle(student._id)}
                      />
                      <div>
                        <p className="font-medium">
                          {student.firstName} {student.lastName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {student.grade}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            ID: {student._id.slice(-8)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSingleEnroll(student._id)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Matricular
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
}
