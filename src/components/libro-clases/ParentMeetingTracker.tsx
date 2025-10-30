"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
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
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  Users,
  FileText,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ParentMeetingTrackerProps {
  courseId: Id<"courses">;
  teacherId: Id<"users">;
}

export function ParentMeetingTracker({
  courseId,
  teacherId,
}: ParentMeetingTrackerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { t } = useDivineParsing(["common"]);
  const [meetingNumber, setMeetingNumber] = useState<number>(1);
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Set<Id<"students">>>(
    new Set(),
  );
  const [attendanceData, setAttendanceData] = useState<
    Map<
      Id<"students">,
      {
        attended: boolean;
        representativeName?: string;
        relationship?: string;
        observations?: string;
        agreements?: string;
      }
    >
  >(new Map());

  // Get course with enrolled students
  const course = useQuery(api.courses.getCourseById, { courseId });

  // Get meeting attendance for this course
  const meetingAttendance = useQuery(
    api.parentMeetings.getCourseMeetingAttendance,
    { courseId },
  );

  // Get statistics
  const meetingStats = useQuery(api.parentMeetings.getMeetingStatistics, {
    courseId,
  });

  const recordMeetingAttendance = useMutation(
    api.parentMeetings.recordMeetingAttendance,
  );
  const bulkRecordAttendance = useMutation(
    api.parentMeetings.bulkRecordMeetingAttendance,
  );

  const updateAttendance = (
    studentId: Id<"students">,
    attended: boolean,
    data?: Partial<{
      representativeName: string;
      relationship: string;
      observations: string;
      agreements: string;
    }>,
  ) => {
    setAttendanceData((prev) => {
      const newData = new Map(prev);
      newData.set(studentId, {
        attended,
        ...data,
        ...prev.get(studentId),
      });
      return newData;
    });
  };

  const handleBulkSave = async () => {
    if (!selectedDate) {
      toast.error(t("grade.select_date", "common"));
      return;
    }

    if (attendanceData.size === 0) {
      toast.error(t("grade.select_student", "common"));
      return;
    }

    try {
      const records = Array.from(attendanceData.entries()).map(
        ([studentId, data]) => {
          // Find student to get parentId
          const student = course?.students?.find(
            (s) => s.studentId === studentId,
          )?.student;

          return {
            studentId,
            parentId: student?.parentId || ("" as Id<"users">),
            attended: data.attended,
            representativeName: data.representativeName,
            relationship: data.relationship,
            observations: data.observations,
            agreements: data.agreements,
          };
        },
      );

      await bulkRecordAttendance({
        courseId,
        meetingDate: selectedDate.setHours(0, 0, 0, 0),
        meetingNumber,
        attendanceRecords: records,
        registeredBy: teacherId,
      });

      toast.success(t("meeting.attendance_registered", "common"));
      setAttendanceData(new Map());
      setIsRecordDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Error al registrar asistencia");
    }
  };

  const markAllPresent = () => {
    if (!course?.students) return;

    setAttendanceData((prev) => {
      const newData = new Map(prev);
      course.students.forEach((enrollment) => {
        newData.set(enrollment.studentId, {
          attended: true,
        });
      });
      return newData;
    });
    toast.success(t("meeting.all_present", "common"));
  };

  if (course === undefined || meetingAttendance === undefined) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">
              Cargando información...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalStudents = course?.students?.length || 0;
  const totalMeetings = meetingStats?.totalMeetings || 0;
  const averageAttendance = meetingStats?.averageAttendance || 0;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Estudiantes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reuniones Realizadas
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMeetings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Asistencia Promedio
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageAttendance.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nueva Reunión</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Dialog
              open={isRecordDialogOpen}
              onOpenChange={setIsRecordDialogOpen}
            >
              <DialogTrigger asChild>
                <Button size="sm" className="w-full">
                  Registrar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Registrar Asistencia a Reunión</DialogTitle>
                  <DialogDescription>
                    Registre la asistencia de los apoderados a la reunión
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Meeting Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha de la Reunión</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
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
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                            locale={es}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Número de Reunión</Label>
                      <Input
                        type="number"
                        value={meetingNumber}
                        onChange={(e) =>
                          setMeetingNumber(parseInt(e.target.value))
                        }
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={markAllPresent}
                      type="button"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar Todos Presentes
                    </Button>
                  </div>

                  {/* Student List */}
                  <div className="space-y-3">
                    <Label>Asistencia por Estudiante</Label>
                    {course?.students && course.students.length > 0 ? (
                      <div className="space-y-2">
                        {course.students.map((enrollment) => {
                          if (!enrollment.student) return null;

                          const studentData = attendanceData.get(
                            enrollment.studentId,
                          );
                          const attended = studentData?.attended || false;

                          return (
                            <div
                              key={enrollment.studentId}
                              className="border rounded-lg p-4 space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    checked={attended}
                                    onCheckedChange={(checked: boolean) =>
                                      updateAttendance(
                                        enrollment.studentId,
                                        checked as boolean,
                                      )
                                    }
                                  />
                                  <div>
                                    <div className="font-medium">
                                      {enrollment.student.firstName}{" "}
                                      {enrollment.student.lastName}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {enrollment.student.grade}
                                    </div>
                                  </div>
                                </div>
                                {attended ? (
                                  <Badge variant="default">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Asistió
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    No asistió
                                  </Badge>
                                )}
                              </div>

                              {attended && (
                                <div className="grid grid-cols-2 gap-3 pl-8">
                                  <div className="space-y-1">
                                    <Label className="text-xs">
                                      Nombre del Apoderado
                                    </Label>
                                    <Input
                                      placeholder="Nombre completo"
                                      value={
                                        studentData?.representativeName || ""
                                      }
                                      onChange={(e) =>
                                        updateAttendance(
                                          enrollment.studentId,
                                          true,
                                          {
                                            representativeName: e.target.value,
                                          },
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">
                                      Parentesco
                                    </Label>
                                    <Select
                                      value={studentData?.relationship || ""}
                                      onValueChange={(value: string) =>
                                        updateAttendance(
                                          enrollment.studentId,
                                          true,
                                          {
                                            relationship: value,
                                          },
                                        )
                                      }
                                    >
                                      <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Seleccionar" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="padre">
                                          Padre
                                        </SelectItem>
                                        <SelectItem value="madre">
                                          Madre
                                        </SelectItem>
                                        <SelectItem value="apoderado">
                                          Apoderado
                                        </SelectItem>
                                        <SelectItem value="tutor">
                                          Tutor
                                        </SelectItem>
                                        <SelectItem value="abuelo">
                                          Abuelo/a
                                        </SelectItem>
                                        <SelectItem value="otro">
                                          Otro
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No hay estudiantes inscritos en este curso
                      </div>
                    )}
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setIsRecordDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleBulkSave}>Guardar Asistencia</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Meeting History */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Reuniones</CardTitle>
          <CardDescription>
            Registro de asistencia a reuniones de apoderados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {meetingAttendance && meetingAttendance.length > 0 ? (
            <div className="space-y-4">
              {meetingAttendance.slice(0, 10).map((record) => (
                <div
                  key={record._id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">
                        Reunión #{record.meetingNumber}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(record.meetingDate), "PPP", {
                          locale: es,
                        })}
                      </div>
                      {record.student && (
                        <div className="text-xs text-muted-foreground">
                          {record.student.firstName} {record.student.lastName}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    {record.attended ? (
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Asistió
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        No asistió
                      </Badge>
                    )}
                    {record.representativeName && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {record.representativeName}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No hay reuniones registradas aún
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
