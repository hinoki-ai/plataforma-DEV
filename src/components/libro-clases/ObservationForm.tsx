"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle,
  Info,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEnterNavigation } from "@/lib/hooks/useFocusManagement";
import { SignatureModal } from "@/components/digital-signatures/SignatureModal";

const observationSchema = z.object({
  date: z.date({
    message: "Debe seleccionar una fecha",
  }),
  type: z.enum(["POSITIVA", "NEGATIVA", "NEUTRA"], {
    message: "Debe seleccionar un tipo de observación",
  }),
  category: z.enum(
    [
      "COMPORTAMIENTO",
      "RENDIMIENTO",
      "ASISTENCIA",
      "PARTICIPACION",
      "RESPONSABILIDAD",
      "CONVIVENCIA",
      "OTRO",
    ],
    {
      message: "Debe seleccionar una categoría",
    },
  ),
  observation: z
    .string()
    .min(10, "La observación debe tener al menos 10 caracteres"),
  subject: z.string().optional(),
  severity: z.enum(["LEVE", "GRAVE", "GRAVISIMA"]).optional(),
  actionTaken: z.string().optional(),
  notifyParent: z.boolean(),
});

type ObservationFormData = z.infer<typeof observationSchema>;

interface ObservationFormProps {
  courseId: Id<"courses">;
  studentId: Id<"students">;
  studentName: string;
  teacherId: Id<"users">;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TYPE_CONFIG = {
  POSITIVA: {
    label: "Positiva",
    color: "text-green-600",
    bgColor: "bg-green-50",
    icon: CheckCircle,
  },
  NEGATIVA: {
    label: "Negativa",
    color: "text-red-600",
    bgColor: "bg-red-50",
    icon: AlertTriangle,
  },
  NEUTRA: {
    label: "Neutra",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    icon: Info,
  },
} as const;

const CATEGORY_LABELS = {
  COMPORTAMIENTO: "Comportamiento",
  RENDIMIENTO: "Rendimiento Académico",
  ASISTENCIA: "Asistencia",
  PARTICIPACION: "Participación",
  RESPONSABILIDAD: "Responsabilidad",
  CONVIVENCIA: "Convivencia Escolar",
  OTRO: "Otro",
};

const SEVERITY_CONFIG = {
  LEVE: { label: "Leve", color: "bg-yellow-100 text-yellow-800" },
  GRAVE: { label: "Grave", color: "bg-orange-100 text-orange-800" },
  GRAVISIMA: { label: "Gravísima", color: "bg-red-100 text-red-800" },
};

export function ObservationForm({
  courseId,
  studentId,
  studentName,
  teacherId,
  onSuccess,
  onCancel,
}: ObservationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [savedObservationId, setSavedObservationId] =
    useState<Id<"studentObservations"> | null>(null);

  const createObservation = useMutation(api.observations.createObservation);

  const form = useForm<ObservationFormData>({
    resolver: zodResolver(observationSchema),
    defaultValues: {
      date: new Date(),
      type: "NEUTRA",
      category: "COMPORTAMIENTO",
      observation: "",
      subject: "",
      notifyParent: false,
    },
  });

  const watchedType = form.watch("type");
  const watchedSeverity = form.watch("severity");

  // Dynamic field order based on form state
  const fieldOrder = React.useMemo(() => {
    const baseFields = ["date", "type", "category", "subject"];

    if (watchedType === "NEGATIVA") {
      baseFields.push("severity");
    }

    baseFields.push("observation");

    if (watchedSeverity === "GRAVE" || watchedSeverity === "GRAVISIMA") {
      baseFields.push("actionTaken");
    }

    baseFields.push("notifyParent");

    return baseFields;
  }, [watchedType, watchedSeverity]);

  // Enter key navigation
  const { handleKeyDown } = useEnterNavigation(fieldOrder, () => {
    // Trigger form submission when Enter is pressed on last field
    const formElement = document.querySelector("form") as HTMLFormElement;
    formElement?.requestSubmit();
  });

  const onSubmit = async (data: ObservationFormData) => {
    // Validate severity for negative observations
    if (data.type === "NEGATIVA" && !data.severity) {
      toast.error(
        "Debe seleccionar el nivel de gravedad para observaciones negativas",
      );
      return;
    }

    // Validate action taken for serious observations
    if (
      data.severity &&
      (data.severity === "GRAVE" || data.severity === "GRAVISIMA")
    ) {
      if (!data.actionTaken || data.actionTaken.trim().length === 0) {
        toast.error(
          "Debe describir las acciones tomadas para observaciones graves o gravísimas",
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const observationId = await createObservation({
        studentId,
        courseId,
        date: data.date.setHours(0, 0, 0, 0),
        type: data.type,
        category: data.category,
        observation: data.observation,
        subject: data.subject,
        severity: data.severity,
        actionTaken: data.actionTaken,
        notifyParent: data.notifyParent,
        teacherId,
      });

      if (data.notifyParent) {
        toast.success(
          "Observación registrada y notificación enviada al apoderado",
        );
      } else {
        toast.success("Observación registrada exitosamente");
      }

      // Show signature modal after saving
      setSavedObservationId(observationId);
      setShowSignatureModal(true);

      // Don't call onSuccess here - wait for signature
    } catch (error: any) {
      toast.error(error.message || "Error al registrar observación");
      setIsSubmitting(false);
    }
  };

  const typeConfig = TYPE_CONFIG[watchedType];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">Registro de Observación</h3>
            <p className="text-sm text-muted-foreground">
              Estudiante: <span className="font-medium">{studentName}</span>
            </p>
          </div>
          {typeConfig && (
            <Badge
              variant="secondary"
              className={cn(typeConfig.bgColor, typeConfig.color)}
            >
              <typeConfig.icon className="h-4 w-4 mr-1" />
              {typeConfig.label}
            </Badge>
          )}
        </div>

        {/* Date and Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha</FormLabel>
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Observación</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon
                            className={cn("h-4 w-4", config.color)}
                          />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Category and Subject */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      onKeyDown={(e) => handleKeyDown(e, "category")}
                    >
                      <SelectValue placeholder="Seleccione categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
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

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asignatura (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Matemáticas"
                    {...field}
                    onKeyDown={(e) => handleKeyDown(e, "subject")}
                  />
                </FormControl>
                <FormDescription>
                  Si aplica a una asignatura específica
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Severity (only for negative observations) */}
        {watchedType === "NEGATIVA" && (
          <FormField
            control={form.control}
            name="severity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nivel de Gravedad</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      onKeyDown={(e) => handleKeyDown(e, "severity")}
                    >
                      <SelectValue placeholder="Seleccione nivel" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <Badge variant="secondary" className={config.color}>
                          {config.label}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Requerido para observaciones negativas según reglamento
                  MINEDUC
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Observation Text */}
        <FormField
          control={form.control}
          name="observation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observación</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describa la observación de forma clara y objetiva..."
                  rows={5}
                  {...field}
                  onKeyDown={(e) => handleKeyDown(e, "observation")}
                />
              </FormControl>
              <FormDescription>
                Sea específico y objetivo. Describa hechos concretos.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Taken (required for serious observations) */}
        {watchedSeverity &&
          (watchedSeverity === "GRAVE" || watchedSeverity === "GRAVISIMA") && (
            <FormField
              control={form.control}
              name="actionTaken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acciones Tomadas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa las medidas o acciones tomadas..."
                      rows={3}
                      {...field}
                      onKeyDown={(e) => handleKeyDown(e, "actionTaken")}
                    />
                  </FormControl>
                  <FormDescription>
                    Requerido para observaciones graves y gravísimas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

        {/* Notify Parent */}
        <FormField
          control={form.control}
          name="notifyParent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notificar al Apoderado
                </FormLabel>
                <FormDescription>
                  Enviar notificación automática al apoderado del estudiante
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  onKeyDown={(e) => handleKeyDown(e, "notifyParent")}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Warning for serious observations */}
        {watchedSeverity === "GRAVISIMA" && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Observación Gravísima</AlertTitle>
            <AlertDescription>
              Las observaciones gravísimas requieren notificación obligatoria al
              apoderado y pueden requerir seguimiento adicional según el
              reglamento de convivencia escolar.
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
            {isSubmitting ? "Guardando..." : "Registrar Observación"}
          </Button>
        </div>
      </form>

      {/* Signature Modal */}
      {savedObservationId && (
        <SignatureModal
          isOpen={showSignatureModal}
          onClose={() => {
            setShowSignatureModal(false);
            setSavedObservationId(null);
            setIsSubmitting(false);
          }}
          onSuccess={() => {
            setShowSignatureModal(false);
            form.reset();
            setSavedObservationId(null);
            setIsSubmitting(false);
            onSuccess?.();
          }}
          recordType="OBSERVATION"
          recordId={savedObservationId}
          teacherId={teacherId}
          recordLabel={studentName}
        />
      )}
    </Form>
  );
}
