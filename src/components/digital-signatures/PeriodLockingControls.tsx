"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Lock,
  Unlock,
  AlertTriangle,
  Info,
  Calendar,
  FileText,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/components/language/useDivineLanguage";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface PeriodLockingControlsProps {
  userId: Id<"users">;
}

export function PeriodLockingControls({ userId }: PeriodLockingControlsProps) {
  const [selectedCourseId, setSelectedCourseId] =
    useState<Id<"courses"> | null>(null);
  const { t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState<
    "PRIMER_SEMESTRE" | "SEGUNDO_SEMESTRE" | "ANUAL"
  >("PRIMER_SEMESTRE");
  const [selectedRecordType, setSelectedRecordType] = useState<
    "ATTENDANCE" | "GRADE" | "CLASS_CONTENT" | "ALL"
  >("ALL");
  const [lockReason, setLockReason] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  // Get all courses
  const courses = useQuery(api.courses.getCourses, {
    academicYear: new Date().getFullYear(),
    isActive: true,
  });

  // Get current locks for selected course
  const currentLocks = useQuery(
    api.digitalSignatures.getRecordLocks,
    selectedCourseId
      ? {
          courseId: selectedCourseId,
          period: selectedPeriod,
        }
      : "skip",
  );

  const lockRecords = useMutation(api.digitalSignatures.lockRecords);
  const unlockRecords = useMutation(api.digitalSignatures.unlockRecords);

  const handleLockRecords = async () => {
    if (!selectedCourseId) {
      toast.error(t("digital-signatures.period_locking.select_course"));
      return;
    }

    setIsLocking(true);
    try {
      await lockRecords({
        courseId: selectedCourseId,
        period: selectedPeriod,
        recordType: selectedRecordType,
        lockedBy: userId,
        reason: lockReason,
      });

      toast.success(t("digital-signatures.period_locking.lock_success"));
      setLockReason("");
      setShowConfirmDialog(false);
    } catch (error: any) {
      toast.error(error.message || t("digital-signatures.period_locking.lock_error"));
    } finally {
      setIsLocking(false);
    }
  };

  const handleUnlockRecords = async (lockId: Id<"recordLocks">) => {
    setIsLocking(true);
    try {
      await unlockRecords({
        lockId,
        unlockedBy: userId,
        reason: lockReason,
      });

      toast.success(t("digital-signatures.period_locking.unlock_success"));
      setLockReason("");
    } catch (error: any) {
      toast.error(error.message || t("digital-signatures.period_locking.unlock_error"));
    } finally {
      setIsLocking(false);
    }
  };

  const getRecordTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      ATTENDANCE: "Asistencia",
      GRADE: "Calificaciones",
      CLASS_CONTENT: "Contenidos",
      ALL: "Todos los Registros",
    };
    return labels[type];
  };

  const getPeriodLabel = (period: string): string => {
    const labels: Record<string, string> = {
      PRIMER_SEMESTRE: "Primer Semestre",
      SEGUNDO_SEMESTRE: "Segundo Semestre",
      ANUAL: "Anual",
    };
    return labels[period];
  };

  const selectedCourse = courses?.find((c) => c._id === selectedCourseId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Control de Bloqueo de Períodos
          </h2>
          <p className="text-muted-foreground">
            Bloqueo de registros por período para cierre semestral según
            Circular N°30
          </p>
        </div>
      </div>

      {/* Warning Alert */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Advertencia Importante</AlertTitle>
        <AlertDescription>
          El bloqueo de períodos restringe la edición de registros históricos.
          Esta acción debe realizarse solo durante el cierre de períodos y es
          irreversible sin permisos de administrador.
        </AlertDescription>
      </Alert>

      {/* Lock Creation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Crear Bloqueo de Registros</CardTitle>
          <CardDescription>
            Seleccione el curso, período y tipo de registro a bloquear
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Curso</Label>
              <Select
                value={selectedCourseId || ""}
                onValueChange={(value) =>
                  setSelectedCourseId(value as Id<"courses">)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.name} - {course.grade} {course.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Período</Label>
              <Select
                value={selectedPeriod}
                onValueChange={(value) => setSelectedPeriod(value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIMER_SEMESTRE">
                    Primer Semestre
                  </SelectItem>
                  <SelectItem value="SEGUNDO_SEMESTRE">
                    Segundo Semestre
                  </SelectItem>
                  <SelectItem value="ANUAL">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Registro</Label>
              <Select
                value={selectedRecordType}
                onValueChange={(value) => setSelectedRecordType(value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los Registros</SelectItem>
                  <SelectItem value="ATTENDANCE">Asistencias</SelectItem>
                  <SelectItem value="GRADE">Calificaciones</SelectItem>
                  <SelectItem value="CLASS_CONTENT">Contenidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Motivo del Bloqueo (Requerido)</Label>
            <Textarea
              placeholder="Ej: Cierre del primer semestre académico 2025"
              value={lockReason}
              onChange={(e) => setLockReason(e.target.value)}
              rows={3}
            />
          </div>

          <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={!selectedCourseId || !lockReason || isLocking}
                className="w-full"
              >
                <Lock className="h-4 w-4 mr-2" />
                Bloquear Registros
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Confirmar Bloqueo de Registros
                </DialogTitle>
                <DialogDescription>
                  ¿Está seguro de que desea bloquear estos registros? Esta
                  acción restringirá la edición de los registros seleccionados.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium">Curso:</span>
                  <span>{selectedCourse?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Período:</span>
                  <span>{getPeriodLabel(selectedPeriod)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tipo:</span>
                  <span>{getRecordTypeLabel(selectedRecordType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Motivo:</span>
                  <span className="text-sm">{lockReason}</span>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={isLocking}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleLockRecords}
                  disabled={isLocking}
                >
                  {isLocking ? "Bloqueando..." : "Confirmar Bloqueo"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Current Locks */}
      <Card>
        <CardHeader>
          <CardTitle>Bloqueos Activos</CardTitle>
          <CardDescription>
            Lista de períodos bloqueados actualmente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentLocks === undefined ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-muted-foreground">
                Cargando bloqueos...
              </div>
            </div>
          ) : currentLocks && currentLocks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Bloqueado Por</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentLocks.map((lock) => (
                  <TableRow key={lock._id}>
                    <TableCell>
                      {/* Course info would need to be fetched */}
                      {lock.courseId}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getPeriodLabel(lock.period)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getRecordTypeLabel(lock.recordType)}</TableCell>
                    <TableCell>
                      {lock.lockedByUser?.name ||
                        lock.lockedByUser?.email ||
                        "Desconocido"}
                    </TableCell>
                    <TableCell>
                      {format(lock.lockedAt, "dd/MM/yyyy HH:mm", {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {lock.reason || "-"}
                    </TableCell>
                    <TableCell>
                      {lock.isLocked ? (
                        <Badge className="bg-red-500">
                          <Lock className="h-3 w-3 mr-1" />
                          Bloqueado
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500">
                          <Unlock className="h-3 w-3 mr-1" />
                          Desbloqueado
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {lock.isLocked && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnlockRecords(lock._id)}
                          disabled={isLocking}
                        >
                          <Unlock className="h-4 w-4 mr-2" />
                          Desbloquear
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Sin bloqueos activos</p>
              <p className="text-sm">No hay períodos bloqueados actualmente</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
