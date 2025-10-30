"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { requestMeeting } from "@/services/actions/meetings";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { useEnterNavigation } from "@/lib/hooks/useFocusManagement";

const meetingRequestSchema = z.object({
  studentName: z.string().min(2, "El nombre del estudiante es requerido"),
  studentGrade: z.string().min(1, "El grado del estudiante es requerido"),
  guardianName: z.string().min(2, "El nombre del apoderado es requerido"),
  guardianEmail: z.string().email("Email inválido"),
  guardianPhone: z.string().min(9, "El teléfono debe tener al menos 9 dígitos"),
  preferredDate: z.date({
    message: "La fecha es requerida",
  }),
  preferredTime: z.string().min(1, "La hora es requerida"),
  reason: z.string().min(10, "El motivo debe tener al menos 10 caracteres"),
  type: z.enum([
    "PARENT_TEACHER",
    "FOLLOW_UP",
    "EMERGENCY",
    "IEP_REVIEW",
    "GRADE_CONFERENCE",
  ]),
});

type MeetingRequestData = z.infer<typeof meetingRequestSchema>;

interface ParentMeetingRequestProps {
  userId: string;
}

const grades = [
  "Pre-Kinder",
  "Kinder",
  "1º Básico",
  "2º Básico",
  "3º Básico",
  "4º Básico",
  "5º Básico",
  "6º Básico",
  "7º Básico",
  "8º Básico",
];

const timeSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

export function ParentMeetingRequest({ userId }: ParentMeetingRequestProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useDivineParsing(["common"]);

  const fieldOrder = [
    "studentName",
    "studentGrade",
    "preferredDate",
    "preferredTime",
    "reason",
  ];
  const { handleKeyDown } = useEnterNavigation(fieldOrder, () => {
    const form = document.querySelector("form") as HTMLFormElement;
    form?.requestSubmit();
  });

  const form = useForm<MeetingRequestData>({
    resolver: zodResolver(meetingRequestSchema),
    defaultValues: {
      studentName: "",
      studentGrade: "",
      guardianName: "",
      guardianEmail: "",
      guardianPhone: "",
      preferredDate: undefined,
      preferredTime: "",
      reason: "",
      type: "PARENT_TEACHER",
    },
  });

  const onSubmit = async (data: MeetingRequestData) => {
    setIsSubmitting(true);
    try {
      const result = await requestMeeting(data);

      if (result.success) {
        toast.success(t("meeting.request.success"));
        form.reset();
      } else {
        toast.error(result.error || t("meeting.request.error"));
      }
    } catch (error) {
      toast.error(t("meeting.request.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitar Reunión</CardTitle>
        <p className="text-muted-foreground">
          Completa el formulario para solicitar una reunión con los profesores
          de tu estudiante. Te contactaremos para confirmar la fecha y hora.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="studentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Estudiante</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("user.name.placeholder", "common")}
                        {...field}
                        onKeyDown={(e) => handleKeyDown(e, "studentName")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="studentGrade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grado del Estudiante</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          onKeyDown={(e) => handleKeyDown(e, "studentGrade")}
                        >
                          <SelectValue placeholder="Selecciona el grado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {grades.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="preferredDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha Preferida</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                            onKeyDown={(e) => handleKeyDown(e, "preferredDate")}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Selecciona una fecha</span>
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
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora Preferida</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          onKeyDown={(e) => handleKeyDown(e, "preferredTime")}
                        >
                          <SelectValue placeholder="Selecciona la hora" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo de la Reunión</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el motivo de la reunión..."
                      className="min-h-[100px]"
                      {...field}
                      onKeyDown={(e) => handleKeyDown(e, "reason")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional notes field removed - not supported by current schema */}

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Solicitar Reunión"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
