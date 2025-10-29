"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Check, CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ATTENDANCE_STATUS = {
  PRESENTE: { label: "Presente", color: "bg-green-500", icon: CheckCircle },
  AUSENTE: { label: "Ausente", color: "bg-red-500", icon: X },
  ATRASADO: { label: "Atrasado", color: "bg-yellow-500", icon: CalendarIcon },
  JUSTIFICADO: { label: "Justificado", color: "bg-blue-500", icon: Check },
  RETIRADO: { label: "Retirado", color: "bg-orange-500", icon: CalendarIcon },
} as const;

type AttendanceStatus = keyof typeof ATTENDANCE_STATUS;

interface AttendanceRecord {
  studentId: Id<"students">;
  status: AttendanceStatus;
  observation?: string;
}

interface AttendanceRecorderProps {
  courseId: Id<"courses">;
  teacherId: Id<"users">;
  onSuccess?: () => void;
}

export function AttendanceRecorder({
  courseId,
  teacherId,
  onSuccess,
}: AttendanceRecorderProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<
    Map<Id<"students">, AttendanceRecord>
  >(new Map());
  const [isSaving, setIsSaving] = useState(false);

  // Get attendance for selected date
  const existingAttendance = useQuery(api.attendance.getAttendanceByDate, {
    courseId,
    date: selectedDate.setHours(0, 0, 0, 0),
  });

  const recordAttendance = useMutation(api.attendance.recordAttendance);

  // Initialize attendance records from existing data
  useEffect(() => {
    if (existingAttendance) {
      const newRecords = new Map<Id<"students">, AttendanceRecord>();
      existingAttendance.forEach((record) => {
        if (record.attendance && record.studentId) {
          newRecords.set(record.studentId, {
            studentId: record.studentId,
            status: record.attendance.status as AttendanceStatus,
            observation: record.attendance.observation,
          });
        }
      });
      setAttendanceRecords(newRecords);
    }
  }, [existingAttendance]);

  const updateAttendance = (
    studentId: Id<"students">,
    status: AttendanceStatus,
    observation?: string,
  ) => {
    setAttendanceRecords((prev) => {
      const newRecords = new Map(prev);
      newRecords.set(studentId, {
        studentId,
        status,
        observation: observation || prev.get(studentId)?.observation,
      });
      return newRecords;
    });
  };

  const markAllAsPresent = () => {
    if (!existingAttendance) return;

    setAttendanceRecords((prev) => {
      const newRecords = new Map(prev);
      existingAttendance.forEach((record) => {
        if (record.studentId) {
          newRecords.set(record.studentId, {
            studentId: record.studentId,
            status: "PRESENTE",
          });
        }
      });
      return newRecords;
    });
    toast.success("Todos los estudiantes marcados como presentes");
  };

  const handleSave = async () => {
    if (attendanceRecords.size === 0) {
      toast.error("Debe marcar al menos un estudiante");
      return;
    }

    setIsSaving(true);
    try {
      const records = Array.from(attendanceRecords.values()).map((record) => ({
        studentId: record.studentId,
        status: record.status,
        observation: record.observation,
      }));

      await recordAttendance({
        courseId,
        date: selectedDate.setHours(0, 0, 0, 0),
        attendanceRecords: records,
        registeredBy: teacherId,
      });

      toast.success("Asistencia registrada exitosamente");
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Error al registrar asistencia");
    } finally {
      setIsSaving(false);
    }
  };

  if (existingAttendance === undefined) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">
              Cargando estudiantes...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const presentCount = Array.from(attendanceRecords.values()).filter(
    (r) => r.status === "PRESENTE" || r.status === "JUSTIFICADO",
  ).length;
  const absentCount = Array.from(attendanceRecords.values()).filter(
    (r) => r.status === "AUSENTE",
  ).length;
  const totalStudents = existingAttendance?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header with Date Picker */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registro de Asistencia</CardTitle>
              <CardDescription>
                Marque la asistencia de los estudiantes del curso
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP", { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    locale={es}
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Statistics */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{totalStudents}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {presentCount}
              </div>
              <div className="text-sm text-muted-foreground">Presentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {absentCount}
              </div>
              <div className="text-sm text-muted-foreground">Ausentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {attendanceRecords.size}
              </div>
              <div className="text-sm text-muted-foreground">Registrados</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsPresent}
              disabled={!existingAttendance || existingAttendance.length === 0}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Marcar Todos Presentes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      <Card>
        <CardContent className="pt-6">
          {existingAttendance && existingAttendance.length > 0 ? (
            <div className="space-y-3">
              {existingAttendance.map((record) => {
                if (!record.student) return null;

                const currentRecord = attendanceRecords.get(record.studentId);
                const status = currentRecord?.status;

                return (
                  <div
                    key={record.studentId}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-1">
                        <div className="font-medium">
                          {record.student.firstName} {record.student.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {record.student.grade}
                        </div>
                      </div>

                      {status && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            ATTENDANCE_STATUS[status].color,
                            "text-white",
                          )}
                        >
                          {ATTENDANCE_STATUS[status].label}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        value={status}
                        onValueChange={(value) =>
                          updateAttendance(
                            record.studentId,
                            value as AttendanceStatus,
                          )
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ATTENDANCE_STATUS).map(
                            ([key, value]) => (
                              <SelectItem key={key} value={key}>
                                {value.label}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>

                      {status &&
                        (status === "AUSENTE" || status === "ATRASADO") && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm">
                                Observación
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-2">
                                <Label>Observación (opcional)</Label>
                                <Textarea
                                  placeholder="Agregar observación..."
                                  value={currentRecord?.observation || ""}
                                  onChange={(e) =>
                                    updateAttendance(
                                      record.studentId,
                                      status,
                                      e.target.value,
                                    )
                                  }
                                  rows={3}
                                />
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No hay estudiantes inscritos en este curso
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      {existingAttendance && existingAttendance.length > 0 && (
        <div className="flex justify-end gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving || attendanceRecords.size === 0}
            size="lg"
          >
            {isSaving ? "Guardando..." : "Guardar Asistencia"}
          </Button>
        </div>
      )}
    </div>
  );
}
