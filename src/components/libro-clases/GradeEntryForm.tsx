"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useEnterNavigation } from "@/lib/hooks/useFocusManagement";
import {
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Chilean grading scale constants
const MIN_GRADE = 1.0;
const MAX_GRADE = 7.0;
const PASSING_GRADE = 4.0;

const gradeSchema = z
  .object({
    date: z.date({
      message: "Debe seleccionar una fecha",
    }),
    subject: z.string().min(1, "La asignatura es requerida"),
    evaluationType: z.enum(
      [
        "PRUEBA",
        "TRABAJO",
        "EXAMEN",
        "PRESENTACION",
        "PROYECTO",
        "TAREA",
        "PARTICIPACION",
        "OTRO",
      ],
      {
        message: "Debe seleccionar un tipo de evaluación",
      },
    ),
    evaluationName: z
      .string()
      .min(3, "El nombre de la evaluación debe tener al menos 3 caracteres"),
    grade: z
      .number()
      .min(MIN_GRADE, `La nota debe ser al menos ${MIN_GRADE}`)
      .max(MAX_GRADE, `La nota no puede ser mayor a ${MAX_GRADE}`),
    maxGrade: z
      .number()
      .min(MIN_GRADE, `La nota máxima debe ser al menos ${MIN_GRADE}`)
      .max(MAX_GRADE, `La nota máxima no puede ser mayor a ${MAX_GRADE}`),
    percentage: z
      .number()
      .min(0, "El porcentaje debe ser al menos 0")
      .max(100, "El porcentaje no puede ser mayor a 100")
      .optional(),
    period: z.enum(["PRIMER_SEMESTRE", "SEGUNDO_SEMESTRE", "ANUAL"], {
      message: "Debe seleccionar un período",
    }),
    comments: z.string().optional(),
  })
  .refine((data) => data.grade <= data.maxGrade, {
    message: "La nota no puede ser mayor que la nota máxima",
    path: ["grade"],
  });

type GradeFormData = z.infer<typeof gradeSchema>;

interface GradeEntryFormProps {
  courseId: Id<"courses">;
  studentId: Id<"students">;
  studentName: string;
  teacherId: Id<"users">;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EVALUATION_TYPE_LABELS = {
  PRUEBA: "Prueba",
  TRABAJO: "Trabajo",
  EXAMEN: "Examen",
  PRESENTACION: "Presentación",
  PROYECTO: "Proyecto",
  TAREA: "Tarea",
  PARTICIPACION: "Participación",
  OTRO: "Otro",
};

const PERIOD_LABELS = {
  PRIMER_SEMESTRE: "Primer Semestre",
  SEGUNDO_SEMESTRE: "Segundo Semestre",
  ANUAL: "Anual",
};

export function GradeEntryForm({
  courseId,
  studentId,
  studentName,
  teacherId,
  onSuccess,
  onCancel,
}: GradeEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useDivineParsing(["common"]);

  const fieldOrder = [
    "date",
    "subject",
    "evaluationType",
    "evaluationName",
    "grade",
    "maxGrade",
    "percentage",
    "period",
    "comments",
  ];
  const { handleKeyDown } = useEnterNavigation(fieldOrder, () => {
    const form = document.querySelector("form") as HTMLFormElement;
    form?.requestSubmit();
  });

  // Get course details to show available subjects
  const course = useQuery(api.courses.getCourseById, { courseId });

  const createGrade = useMutation(api.grades.createGrade);

  const form = useForm<GradeFormData>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      date: new Date(),
      subject: "",
      evaluationType: "PRUEBA",
      evaluationName: "",
      grade: 4.0,
      maxGrade: 7.0,
      percentage: undefined,
      period: "PRIMER_SEMESTRE",
      comments: "",
    },
  });

  const watchedGrade = form.watch("grade");
  const watchedMaxGrade = form.watch("maxGrade");

  const getGradeStatus = (grade: number) => {
    if (grade >= 6.0) {
      return { label: "Excelente", color: "text-green-600", icon: TrendingUp };
    } else if (grade >= 5.0) {
      return { label: "Bueno", color: "text-blue-600", icon: TrendingUp };
    } else if (grade >= PASSING_GRADE) {
      return { label: "Suficiente", color: "text-yellow-600", icon: Minus };
    } else {
      return {
        label: "Insuficiente",
        color: "text-red-600",
        icon: TrendingDown,
      };
    }
  };

  const gradeStatus = getGradeStatus(watchedGrade);
  const gradePercentage =
    watchedMaxGrade && watchedMaxGrade > 0
      ? Math.min((watchedGrade / watchedMaxGrade) * 100, 100)
      : 0;

  const onSubmit = async (data: GradeFormData) => {
    setIsSubmitting(true);
    try {
      await createGrade({
        studentId,
        courseId,
        subject: data.subject,
        evaluationType: data.evaluationType,
        evaluationName: data.evaluationName,
        date: data.date.setHours(0, 0, 0, 0),
        grade: data.grade,
        maxGrade: data.maxGrade,
        percentage: data.percentage,
        period: data.period,
        comments: data.comments,
        teacherId,
      });

      toast.success(t("grade.registered_success", "common"));
      form.reset({
        date: new Date(),
        subject: "",
        evaluationType: "PRUEBA",
        evaluationName: "",
        grade: 4.0,
        maxGrade: 7.0,
        percentage: undefined,
        period: "PRIMER_SEMESTRE",
        comments: "",
      });
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || t("grade.registration_error", "common"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (course === undefined) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-pulse text-muted-foreground">
          Cargando información del curso...
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center p-12 text-muted-foreground">
        Curso no encontrado
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">Registro de Calificación</h3>
            <p className="text-sm text-muted-foreground">
              Estudiante: <span className="font-medium">{studentName}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {course.name} - {course.grade} {course.section}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{watchedGrade.toFixed(1)}</div>
            <div className={cn("text-sm font-medium", gradeStatus.color)}>
              <gradeStatus.icon className="inline h-4 w-4 mr-1" />
              {gradeStatus.label}
            </div>
            <div className="text-xs text-muted-foreground">
              {gradePercentage.toFixed(0)}% del máximo
            </div>
          </div>
        </div>

        {/* Chilean Grading Scale Info */}
        <Alert>
          <AlertDescription>
            <div className="text-sm space-y-1">
              <div className="font-medium">Escala de Calificación Chilena</div>
              <div className="text-muted-foreground">
                Rango: {MIN_GRADE.toFixed(1)} - {MAX_GRADE.toFixed(1)} | Nota de
                aprobación: {PASSING_GRADE.toFixed(1)}
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Date and Subject */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Evaluación</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                        onKeyDown={(e) => handleKeyDown(e, "date")}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asignatura</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      onKeyDown={(e) => handleKeyDown(e, "subject")}
                    >
                      <SelectValue placeholder="Seleccione asignatura" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {course.subjects.map((subject: string) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Evaluation Type and Period */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="evaluationType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Evaluación</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      onKeyDown={(e) => handleKeyDown(e, "evaluationType")}
                    >
                      <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(EVALUATION_TYPE_LABELS).map(
                      ([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="period"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Período</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      onKeyDown={(e) => handleKeyDown(e, "period")}
                    >
                      <SelectValue placeholder="Seleccione período" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(PERIOD_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Evaluation Name */}
        <FormField
          control={form.control}
          name="evaluationName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Evaluación</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Prueba Unidad 3 - Fracciones"
                  {...field}
                  onKeyDown={(e) => handleKeyDown(e, "evaluationName")}
                />
              </FormControl>
              <FormDescription>
                Nombre descriptivo de la evaluación
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Grades */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nota Obtenida</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min={MIN_GRADE}
                    max={MAX_GRADE}
                    {...field}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        field.onChange(value);
                      }
                    }}
                    onKeyDown={(e) => handleKeyDown(e, "grade")}
                  />
                </FormControl>
                <FormDescription>
                  Escala {MIN_GRADE.toFixed(1)} - {MAX_GRADE.toFixed(1)}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxGrade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nota Máxima</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min={MIN_GRADE}
                    max={MAX_GRADE}
                    {...field}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        field.onChange(value);
                      }
                    }}
                    onKeyDown={(e) => handleKeyDown(e, "maxGrade")}
                  />
                </FormControl>
                <FormDescription>
                  Generalmente {MAX_GRADE.toFixed(1)}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="percentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ponderación (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    placeholder="Opcional"
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined,
                      )
                    }
                    onKeyDown={(e) => handleKeyDown(e, "percentage")}
                  />
                </FormControl>
                <FormDescription>Peso de la nota (opcional)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Visual Grade Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Rendimiento</span>
            <span className="font-medium">{gradePercentage.toFixed(0)}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden border">
            <div
              className={cn(
                "h-full transition-all duration-300 ease-out rounded-full",
                watchedGrade >= 6.0
                  ? "bg-linear-to-r from-green-400 to-green-600 shadow-sm"
                  : watchedGrade >= 5.0
                    ? "bg-linear-to-r from-blue-400 to-blue-600 shadow-sm"
                    : watchedGrade >= PASSING_GRADE
                      ? "bg-linear-to-r from-yellow-400 to-yellow-600 shadow-sm"
                      : "bg-linear-to-r from-red-400 to-red-600 shadow-sm",
              )}
              style={{ width: `${gradePercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{MIN_GRADE.toFixed(1)}</span>
            <span>{PASSING_GRADE.toFixed(1)} (aprobación)</span>
            <span>{MAX_GRADE.toFixed(1)}</span>
          </div>
        </div>

        {/* Comments */}
        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comentarios (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Comentarios sobre el desempeño del estudiante..."
                  rows={3}
                  {...field}
                  onKeyDown={(e) => handleKeyDown(e, "comments")}
                />
              </FormControl>
              <FormDescription>
                Observaciones adicionales sobre el desempeño
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Warning for failing grade */}
        {watchedGrade < PASSING_GRADE && (
          <Alert variant="destructive">
            <AlertDescription>
              Esta es una nota insuficiente (inferior a{" "}
              {PASSING_GRADE.toFixed(1)}). Considere informar al apoderado y
              ofrecer apoyo adicional al estudiante.
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Registrar Calificación"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
