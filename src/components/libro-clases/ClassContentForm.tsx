"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { OASelector } from "./OASelector";
import { SignatureModal } from "@/components/digital-signatures/SignatureModal";
import { useLanguage } from "@/components/language/LanguageContext";

type ClassContentFormData = {
  date: Date;
  subject: string;
  topic: string;
  objectives: string;
  content: string;
  activities?: string;
  resources?: string;
  homework?: string;
  period?: string;
  selectedOAIds?: string[];
};

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
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [savedContentId, setSavedContentId] =
    useState<Id<"classContent"> | null>(null);

  // Get course details to show available subjects
  const course = useQuery(api.courses.getCourseById, { courseId });

  // Define schema with translations
  const classContentSchema = z.object({
    date: z.date({
      message: t("form.validation.date_required"),
    }),
    subject: z.string().min(1, t("form.validation.subject_required")),
    topic: z.string().min(3, t("form.validation.topic_min_length")),
    objectives: z
      .string()
      .min(10, t("form.validation.objectives_min_length")),
    content: z.string().min(20, t("form.validation.content_min_length")),
    activities: z.string().optional(),
    resources: z.string().optional(),
    homework: z.string().optional(),
    period: z.string().optional(),
    selectedOAIds: z.array(z.string()).optional(), // OA IDs as strings for form
  });

  const createContent = useMutation(api.classContent.createClassContent);
  const updateContent = useMutation(api.classContent.updateClassContent);
  const linkContentToOA = useMutation(
    api.learningObjectives.linkClassContentToOA,
  );

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
      selectedOAIds: [],
    },
  });

  const watchedSubject = useWatch({
    control: form.control,
    name: "subject",
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

      let contentId: Id<"classContent">;

      if (initialData) {
        await updateContent({
          contentId: initialData._id,
          ...contentData,
        });
        contentId = initialData._id;
        toast.success("Contenido actualizado exitosamente");
      } else {
        contentId = await createContent(contentData);
        toast.success("Contenido registrado exitosamente");
      }

      // Link selected OA to the class content
      if (data.selectedOAIds && data.selectedOAIds.length > 0) {
        try {
          for (const oaId of data.selectedOAIds) {
            await linkContentToOA({
              classContentId: contentId,
              learningObjectiveId: oaId as Id<"learningObjectives">,
              coverage: "PARCIAL", // Default to partial, can be updated later
            });
          }
          toast.success(
            `${data.selectedOAIds.length} OA vinculado${
              data.selectedOAIds.length > 1 ? "s" : ""
            } exitosamente`,
          );
        } catch (oaError: any) {
          console.error("Error linking OA:", oaError);
          toast.error(
            "Contenido guardado, pero hubo un error al vincular algunos OA",
          );
        }
      }

      // Show signature modal for new content only
      if (!initialData) {
        setSavedContentId(contentId);
        setShowSignatureModal(true);
        // Don't call onSuccess here - wait for signature
      } else {
        form.reset();
        onSuccess?.();
        setIsSubmitting(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el contenido");
      setIsSubmitting(false);
    }
  };

  const handleSignatureComplete = () => {
    setShowSignatureModal(false);
    form.reset();
    onSuccess?.();
    setSavedContentId(null);
    setIsSubmitting(false);
  };

  const handleSignatureCancel = () => {
    setShowSignatureModal(false);
    setSavedContentId(null);
    setIsSubmitting(false);
  };

  if (course === undefined) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-pulse text-muted-foreground">
          {t("libro-clases.form.class_content.loading_course")}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center p-12 text-muted-foreground">
        {t("libro-clases.form.class_content.course_not_found")}
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
              {t("libro-clases.form.class_content.title")}
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
                <FormLabel>{t("libro-clases.form.class_content.date_label")}</FormLabel>
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
                          <span>{t("libro-clases.form.class_content.date_placeholder")}</span>
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
                  {t("libro-clases.form.class_content.date_description")}
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
                <FormLabel>{t("libro-clases.form.class_content.subject_label")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      onKeyDown={(e) => handleKeyDown(e, "subject")}
                    >
                      <SelectValue placeholder={t("libro-clases.form.class_content.subject_placeholder")} />
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

        {/* Objectives (Text field - kept for compatibility) */}
        <FormField
          control={form.control}
          name="objectives"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objetivos de Aprendizaje (Texto)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ej: OA 5: Demostrar que comprenden las fracciones con denominadores 100, 12, 10, 8, 6, 5, 4, 3, 2..."
                  rows={3}
                  {...field}
                  onKeyDown={(e) => handleKeyDown(e, "objectives")}
                />
              </FormControl>
              <FormDescription>
                Descripción textual de objetivos (se mantiene para
                compatibilidad)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* OA Selector - New structured OA selection */}
        <FormField
          control={form.control}
          name="selectedOAIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Seleccionar Objetivos de Aprendizaje (OA) - Decreto 67
              </FormLabel>
              <FormControl>
                <OASelector
                  courseId={courseId}
                  subject={watchedSubject}
                  value={(field.value || []).map(
                    (id) => id as Id<"learningObjectives">,
                  )}
                  onChange={(ids) => {
                    field.onChange(ids.map((id) => id.toString()));
                  }}
                  disabled={!watchedSubject}
                />
              </FormControl>
              <FormDescription>
                Seleccione los OA abordados en esta clase. Esto permite el
                seguimiento automático de la cobertura curricular según Decreto
                67.
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

      {/* Signature Modal */}
      {savedContentId && (
        <SignatureModal
          isOpen={showSignatureModal}
          onClose={handleSignatureCancel}
          onSuccess={handleSignatureComplete}
          recordType="CLASS_CONTENT"
          recordId={savedContentId}
          teacherId={teacherId}
          recordLabel={course?.name}
        />
      )}
    </Form>
  );
}
