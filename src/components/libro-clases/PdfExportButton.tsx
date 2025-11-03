/**
 * PDF Export Button Component for Libro de Clases
 * Provides export functionality with scope and period selection
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface PdfExportButtonProps {
  courseId?: string;
  studentId?: string;
  academicYear: number;
  availablePeriods?: Array<"PRIMER_SEMESTRE" | "SEGUNDO_SEMESTRE" | "ANUAL">;
}

type ExportScope =
  | "full_year"
  | "semester"
  | "student"
  | "course"
  | "date_range";

type Period = "PRIMER_SEMESTRE" | "SEGUNDO_SEMESTRE" | "ANUAL";

export function PdfExportButton({
  courseId,
  studentId,
  academicYear,
  availablePeriods = ["PRIMER_SEMESTRE", "SEGUNDO_SEMESTRE", "ANUAL"],
}: PdfExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scope, setScope] = useState<ExportScope>("full_year");
  const [period, setPeriod] = useState<Period>(
    availablePeriods[0] || "PRIMER_SEMESTRE",
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!courseId && !studentId) {
      toast.error("Debe especificar un curso o estudiante");
      return;
    }

    // Validate date range if selected
    if (scope === "date_range") {
      if (!startDate || !endDate) {
        toast.error("Debe seleccionar un rango de fechas");
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        toast.error("La fecha de inicio debe ser anterior a la fecha de fin");
        return;
      }
    }

    setIsExporting(true);
    const toastId = toast.loading("Generando PDF...");

    try {
      // Prepare export parameters
      const params: any = {
        scope:
          studentId || scope === "student"
            ? "student"
            : scope === "semester"
              ? "course"
              : "course",
      };

      if (courseId) params.courseId = courseId;
      if (studentId) params.studentId = studentId;

      if (scope === "semester") {
        params.period = period;
      } else if (scope === "date_range") {
        params.startDate = new Date(startDate).getTime();
        params.endDate = new Date(endDate).getTime();
      }

      // Call API to generate PDF
      const response = await fetch("/api/libro-clases/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al generar el PDF");
      }

      // Download PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `libro-clases-${academicYear}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("PDF exportado correctamente", { id: toastId });
      setIsOpen(false);
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(error.message || "Error al exportar el PDF", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const quickExport = async (quickScope: "full_year" | "semester") => {
    if (!courseId && !studentId) {
      toast.error("Debe especificar un curso o estudiante");
      return;
    }

    setIsExporting(true);
    const toastId = toast.loading("Generando PDF...");

    try {
      const params: any = {
        scope: studentId ? "student" : "course",
      };

      if (courseId) params.courseId = courseId;
      if (studentId) params.studentId = studentId;

      if (quickScope === "semester") {
        params.period = period;
      }

      const response = await fetch("/api/libro-clases/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al generar el PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `libro-clases-${academicYear}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("PDF exportado correctamente", { id: toastId });
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(error.message || "Error al exportar el PDF", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Exportar PDF
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Exportar Libro de Clases</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => quickExport("full_year")}
            disabled={isExporting}
          >
            <FileText className="mr-2 h-4 w-4" />
            Año completo
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => quickExport("semester")}
            disabled={isExporting}
          >
            <FileText className="mr-2 h-4 w-4" />
            Semestre actual
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsOpen(true)}
            disabled={isExporting}
          >
            <FileText className="mr-2 h-4 w-4" />
            Opciones avanzadas...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Opciones de Exportación</DialogTitle>
            <DialogDescription>
              Configure los parámetros para la exportación del Libro de Clases
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="scope">Alcance de la exportación</Label>
              <Select
                value={scope}
                onValueChange={(value: ExportScope) => setScope(value)}
              >
                <SelectTrigger id="scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_year">Año completo</SelectItem>
                  <SelectItem value="semester">Semestre</SelectItem>
                  <SelectItem value="date_range">Rango de fechas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {scope === "semester" && (
              <div className="grid gap-2">
                <Label htmlFor="period">Período</Label>
                <Select
                  value={period}
                  onValueChange={(value: Period) => setPeriod(value)}
                >
                  <SelectTrigger id="period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePeriods.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p === "PRIMER_SEMESTRE"
                          ? "Primer Semestre"
                          : p === "SEGUNDO_SEMESTRE"
                            ? "Segundo Semestre"
                            : "Anual"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {scope === "date_range" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Fecha de inicio</Label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    aria-label="Fecha de inicio"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">Fecha de fin</Label>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    aria-label="Fecha de fin"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
