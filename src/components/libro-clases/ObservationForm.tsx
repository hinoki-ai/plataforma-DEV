"use client";

import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { useLanguage } from "@/components/language/LanguageContext";

// Schema and types will be defined inside the component

interface ObservationFormProps {
  courseId: Id<"courses">;
  studentId: Id<"students">;
  studentName: string;
  teacherId: Id<"users">;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Constants will be defined inside the component

export function ObservationForm({
  courseId,
  studentId,
  studentName,
  teacherId,
  onSuccess,
  onCancel,
}: ObservationFormProps) {
  const { t } = useLanguage();

  const observationSchema = z.object({
    date: z.date({
      message: t("libro-clases.observations.form.validation.date_required"),
    }),
    type: z.enum(["POSITIVA", "NEGATIVA", "NEUTRA"], {
      message: t("libro-clases.observations.form.validation.type_required"),
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
        message: t("libro-clases.observations.form.validation.category_required"),
      },
    ),
    observation: z
      .string()
      .min(10, t("libro-clases.observations.form.validation.observation_min_length")),
    subject: z.string().optional(),
    severity: z.enum(["LEVE", "GRAVE", "GRAVISIMA"]).optional(),
    actionTaken: z.string().optional(),
    notifyParent: z.boolean(),
  });

  type ObservationFormData = z.infer<typeof observationSchema>;

  const TYPE_CONFIG = {
    POSITIVA: {
      label: t("libro-clases.observations.types.positive"),
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: CheckCircle,
    },
    NEGATIVA: {
      label: t("libro-clases.observations.types.negative"),
      color: "text-red-600",
      bgColor: "bg-red-50",
      icon: AlertTriangle,
    },
    NEUTRA: {
      label: t("libro-clases.observations.types.neutral"),
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: Info,
    },
  } as const;

  const CATEGORY_LABELS = {
    COMPORTAMIENTO: t("libro-clases.observations.categories.behavior"),
    RENDIMIENTO: t("libro-clases.observations.categories.academic_performance"),
    ASISTENCIA: t("libro-clases.observations.categories.attendance"),
    PARTICIPACION: t("libro-clases.observations.categories.participation"),
    RESPONSABILIDAD: t("libro-clases.observations.categories.responsibility"),
    CONVIVENCIA: t("libro-clases.observations.categories.school_coexistence"),
    OTRO: t("libro-clases.observations.categories.other"),
  };

  const SEVERITY_CONFIG = {
    LEVE: { label: t("libro-clases.observations.severity.label_leve"), color: "bg-yellow-100 text-yellow-800" },
    GRAVE: { label: t("libro-clases.observations.severity.label_grave"), color: "bg-orange-100 text-orange-800" },
    GRAVISIMA: { label: t("libro-clases.observations.severity.label_gravisima"), color: "bg-red-100 text-red-800" },
  };

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

  const watchedType = useWatch({
    control: form.control,
    name: "type",
  });
  const watchedSeverity = useWatch({
    control: form.control,
    name: "severity",
  });

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
        t("libro-clases.observations.form.validation.severity_required_negative"),
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
          t("libro-clases.observations.form.validation.actions_required_serious"),
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
          t("libro-clases.observations.form.success_with_notification"),
        );
      } else {
        toast.success(t("libro-clases.observations.form.success_message"));
      }

      // Show signature modal after saving
      setSavedObservationId(observationId);
      setShowSignatureModal(true);

      // Don't call onSuccess here - wait for signature
    } catch (error: any) {
      toast.error(error.message || t("libro-clases.observations.form.error_save"));
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
            <h3 className="text-lg font-semibold">{t("libro-clases.observations.form.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("libro-clases.observations.form.student_label")}: <span className="font-medium">{studentName}</span>
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
                <FormLabel>{t("libro-clases.observations.form.date_label")}</FormLabel>
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
                          <span>{t("libro-clases.observations.form.date_placeholder")}</span>
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
                <FormLabel>{t("libro-clases.observations.form.type_label")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("libro-clases.observations.form.type_placeholder")} />
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
                <FormLabel>{t("libro-clases.observations.form.category_label")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      onKeyDown={(e) => handleKeyDown(e, "category")}
                    >
                      <SelectValue placeholder={t("libro-clases.observations.form.category_placeholder")} />
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
                <FormLabel>{t("libro-clases.observations.form.subject_label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("libro-clases.observations.form.subject_placeholder")}
                    {...field}
                    onKeyDown={(e) => handleKeyDown(e, "subject")}
                  />
                </FormControl>
                <FormDescription>
                  {t("libro-clases.observations.form.subject_description")}
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
                <FormLabel>{t("libro-clases.observations.form.severity_label")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      onKeyDown={(e) => handleKeyDown(e, "severity")}
                    >
                      <SelectValue placeholder={t("libro-clases.observations.form.severity_placeholder")} />
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
                  {t("libro-clases.observations.form.severity_description")}
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
              <FormLabel>{t("libro-clases.observations.form.observation_label")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("libro-clases.observations.form.observation_placeholder")}
                  rows={5}
                  {...field}
                  onKeyDown={(e) => handleKeyDown(e, "observation")}
                />
              </FormControl>
              <FormDescription>
                {t("libro-clases.observations.form.observation_description")}
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
                  <FormLabel>{t("libro-clases.observations.form.actions_taken_label")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("libro-clases.observations.form.actions_taken_placeholder")}
                      rows={3}
                      {...field}
                      onKeyDown={(e) => handleKeyDown(e, "actionTaken")}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("libro-clases.observations.form.actions_taken_description")}
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
                  {t("libro-clases.observations.form.notify_parent_label")}
                </FormLabel>
                <FormDescription>
                  {t("libro-clases.observations.form.notify_parent_description")}
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
            <AlertTitle>{t("libro-clases.observations.alerts.serious_observation_title")}</AlertTitle>
            <AlertDescription>
              {t("libro-clases.observations.alerts.serious_observation_description")}
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
              {t("libro-clases.observations.form.cancel_button")}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("libro-clases.observations.form.saving_button") : t("libro-clases.observations.form.save_button")}
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
