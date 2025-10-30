"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
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
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEnterNavigation } from "@/lib/hooks/useFocusManagement";

const classContentSchema = z.object({
  date: z.date({
    message: "Debe seleccionar una fecha",
  }),
  subject: z.string().min(1, "La asignatura es requerida"),
  topic: z.string().min(3, "El tema debe tener al menos 3 caracteres"),
  objectives: z
    .string()
    .min(10, "Los objetivos deben tener al menos 10 caracteres"),
  content: z.string().min(20, "El contenido debe tener al menos 20 caracteres"),
  activities: z.string().optional(),
  resources: z.string().optional(),
  homework: z.string().optional(),
  period: z.string().optional(),
});

type ClassContentFormData = z.infer<typeof classContentSchema>;

interface ClassContentFormProps {
  courseId: Id<"courses">;
  teacherId: Id<"users">;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: any;
}

export function ClassContentForm({
  courseId,
  teacherId,
  onSuccess,
  onCancel,
  initialData,
}: ClassContentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get course details to show available subjects
  const course = useQuery(api.courses.getCourseById, { courseId });

  const createContent = useMutation(api.classContent.createClassContent);
  const updateContent = useMutation(api.classContent.updateClassContent);

  // Define field order for Enter key navigation
  const fieldOrder = [
    "date",
    "subject",
    "period",
    "topic",
    "objectives",
    "content",
    "activities",
    "resources",
    "homework",
  ];

  const { handleKeyDown } = useEnterNavigation(fieldOrder, () => {
    const form = document.querySelector("form") as HTMLFormElement;
    form?.requestSubmit();
  });

  const form = useForm<ClassContentFormData>({
    resolver: zodResolver(classContentSchema),
    defaultValues: {
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      subject: initialData?.subject || "",
      topic: initialData?.topic || "",
      objectives: initialData?.objectives || "",
      content: initialData?.content || "",
      activities: initialData?.activities || "",
      resources: initialData?.resources || "",
      homework: initialData?.homework || "",
      period: initialData?.period || "",
    },
  });

  const onSubmit = async (data: ClassContentFormData) => {
    setIsSubmitting(true);
    try {
      const contentData = {
        courseId,
        date: data.date.setHours(0, 0, 0, 0),
        subject: data.subject,
        topic: data.topic,
        objectives: data.objectives,
        content: data.content,
        activities: data.activities,
        resources: data.resources,
        homework: data.homework,
        period: data.period,
        teacherId,
      };

      if (initialData) {
        await updateContent({
          contentId: initialData._id,
          ...contentData,
        });
        toast.success("Contenido actualizado exitosamente");
      } else {
        await createContent(contentData);
        toast.success("Contenido registrado exitosamente");
      }

      form.reset();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el contenido");
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
        <div className="flex items-center gap-3 pb-4 border-b">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              Registro de Contenido de Clase
            </h3>
            <p className="text-sm text-muted-foreground">
              {course.name} - {course.grade} {course.section}
            </p>
          </div>
        </div>

        {/* Date and Subject Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de la Clase</FormLabel>
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
                <FormDescription>
                  No se puede registrar contenido para fechas futuras
                </FormDescription>
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

        {/* Period (optional) */}
        <FormField
          control={form.control}
          name="period"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Período (Opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: 1ra hora, 3ro-4to bloque"
                  {...field}
                  onKeyDown={(e) => handleKeyDown(e, "period")}
                />
              </FormControl>
              <FormDescription>
                Especifique el bloque o período horario de la clase
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Topic */}
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tema de la Clase</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Fracciones equivalentes y simplificación"
                  {...field}
                  onKeyDown={(e) => handleKeyDown(e, "topic")}
                />
              </FormControl>
              <FormDescription>
                Tema principal abordado en la clase
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Objectives */}
        <FormField
          control={form.control}
          name="objectives"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objetivos de Aprendizaje</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ej: OA 5: Demostrar que comprenden las fracciones con denominadores 100, 12, 10, 8, 6, 5, 4, 3, 2..."
                  rows={3}
                  {...field}
                  onKeyDown={(e) => handleKeyDown(e, "objectives")}
                />
              </FormControl>
              <FormDescription>
                Objetivos de aprendizaje según curriculum MINEDUC
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Content */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenido Desarrollado</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describa el contenido tratado en la clase..."
                  rows={5}
                  {...field}
                  onKeyDown={(e) => handleKeyDown(e, "content")}
                />
              </FormControl>
              <FormDescription>
                Detalle del contenido y conceptos desarrollados
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Activities */}
        <FormField
          control={form.control}
          name="activities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Actividades Realizadas (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ej: Ejercicios en pizarra, trabajo en grupos, resolución de guía..."
                  rows={3}
                  {...field}
                  onKeyDown={(e) => handleKeyDown(e, "activities")}
                />
              </FormControl>
              <FormDescription>
                Actividades pedagógicas realizadas durante la clase
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Resources */}
        <FormField
          control={form.control}
          name="resources"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recursos Utilizados (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ej: PowerPoint, video educativo, material concreto, guía impresa..."
                  rows={2}
                  {...field}
                  onKeyDown={(e) => handleKeyDown(e, "resources")}
                />
              </FormControl>
              <FormDescription>
                Materiales y recursos didácticos utilizados
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Homework */}
        <FormField
          control={form.control}
          name="homework"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tarea para la Casa (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ej: Realizar ejercicios página 45, estudiar para prueba..."
                  rows={2}
                  {...field}
                  onKeyDown={(e) => handleKeyDown(e, "homework")}
                />
              </FormControl>
              <FormDescription>
                Tareas o actividades asignadas para realizar fuera del aula
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
            {isSubmitting
              ? "Guardando..."
              : initialData
                ? "Actualizar Contenido"
                : "Registrar Contenido"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
