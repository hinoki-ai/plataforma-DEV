"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { Meeting, MeetingType } from "@/lib/prisma-compat-types";
import { createMeeting, updateMeeting } from "@/services/actions/meetings";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { useEnterNavigation } from "@/lib/hooks/useFocusManagement";
import { useAriaLive } from "@/lib/hooks/useAriaLive";

const MEETING_TYPES = [
  "PARENT_TEACHER",
  "FOLLOW_UP",
  "EMERGENCY",
  "IEP_REVIEW",
  "GRADE_CONFERENCE",
] as const;

// Schema validation messages will use translations dynamically
const getMeetingFormSchema = (t: (key: string, ns?: string) => string) =>
  z.object({
    title: z.string().min(3, t("form.validation.title.min", "meetings")),
    description: z.string().optional(),
    studentName: z
      .string()
      .min(2, t("form.validation.student_name.min", "meetings")),
    studentGrade: z
      .string()
      .min(1, t("form.validation.student_grade.required", "meetings")),
    guardianName: z
      .string()
      .min(2, t("form.validation.guardian_name.min", "meetings")),
    guardianEmail: z
      .string()
      .email(t("form.validation.guardian_email.invalid", "meetings")),
    guardianPhone: z
      .string()
      .min(8, t("form.validation.guardian_phone.min", "meetings")),
    scheduledDate: z.date({
      message: t("form.validation.date.required", "meetings"),
    }),
    scheduledTime: z
      .string()
      .min(1, t("form.validation.time.required", "meetings")),
    duration: z.number().min(15).max(120),
    location: z.string(),
    type: z.enum(MEETING_TYPES),
    assignedTo: z
      .string()
      .uuid(t("form.validation.professor.required", "meetings")),
  });

type MeetingFormData = z.infer<ReturnType<typeof getMeetingFormSchema>>;

interface MeetingFormProps {
  meeting?: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode: "create" | "edit";
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
  "18:00",
  "18:30",
];

export function MeetingForm({
  meeting,
  isOpen,
  onClose,
  onSuccess,
  mode,
}: MeetingFormProps) {
  const [users, setUsers] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useDivineParsing(["meetings", "common"]);
  const { announce } = useAriaLive();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        console.log("Fetching professors...");
        const response = await fetch("/api/profesores");
        console.log("Response status:", response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Failed to fetch users:", response.status, errorText);
          throw new Error(`Failed to fetch users: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched users data:", data);
        setUsers(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const meetingFormSchema = getMeetingFormSchema(t);
  const form = useForm<MeetingFormData>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: {
      title: "",
      description: "",
      studentName: "",
      studentGrade: "",
      guardianName: "",
      guardianEmail: "",
      guardianPhone: "",
      scheduledDate: new Date(),
      scheduledTime: "",
      duration: 30,
      location: "Sala de Reuniones",
      type: "PARENT_TEACHER" as MeetingType,
      assignedTo: "",
    },
  });

  // Enter key navigation
  const { handleKeyDown } = useEnterNavigation(
    [
      "title",
      "description",
      "type",
      "studentName",
      "studentGrade",
      "guardianName",
      "guardianEmail",
      "guardianPhone",
      "scheduledDate",
      "scheduledTime",
      "duration",
      "location",
      "assignedTo",
    ],
    () => {
      // Trigger form submission when Enter is pressed on last field
      form.handleSubmit(onSubmit)();
    },
  );

  useEffect(() => {
    if (meeting && mode === "edit") {
      form.reset({
        title: meeting.title,
        description: meeting.description || "",
        studentName: meeting.studentName,
        studentGrade: meeting.studentGrade,
        guardianName: meeting.guardianName,
        guardianEmail: meeting.guardianEmail,
        guardianPhone: meeting.guardianPhone,
        scheduledDate: new Date(meeting.scheduledDate),
        scheduledTime: meeting.scheduledTime,
        duration: meeting.duration,
        location: meeting.location,
        type: (meeting.meetingType || "PARENT_TEACHER") as MeetingType,
        assignedTo: meeting.assignedTo,
      });
    }
  }, [meeting, mode, form]);

  const onSubmit = async (data: MeetingFormData) => {
    setIsSubmitting(true);
    announce(
      mode === "create"
        ? t("form.creating", "meetings")
        : t("form.updating", "meetings"),
      "polite",
    );
    try {
      if (mode === "create") {
        await createMeeting(data);
      } else if (meeting) {
        await updateMeeting(meeting.id, data);
      }
      announce(
        mode === "create"
          ? t("form.success.create", "meetings")
          : t("form.success.update", "meetings"),
        "polite",
      );
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving meeting:", error);
      announce(t("form.error", "meetings"), "assertive");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? t("form.title.create", "meetings")
              : t("form.title.edit", "meetings")}
          </DialogTitle>
          <DialogDescription>
            {t("form.description.placeholder", "meetings")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.title.label", "meetings")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.title.placeholder", "meetings")}
                      onKeyDown={(e) => handleKeyDown(e, "title")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("form.description.label", "meetings")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        "form.description.placeholder",
                        "meetings",
                      )}
                      onKeyDown={(e) => handleKeyDown(e, "description")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.type.label", "meetings")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        onKeyDown={(e) => handleKeyDown(e, "type")}
                      >
                        <SelectValue
                          placeholder={t("form.type.label", "meetings")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PARENT_TEACHER">
                        {t("form.type.parent_teacher", "meetings")}
                      </SelectItem>
                      <SelectItem value="FOLLOW_UP">
                        {t("form.type.follow_up", "meetings")}
                      </SelectItem>
                      <SelectItem value="EMERGENCY">
                        {t("form.type.emergency", "meetings")}
                      </SelectItem>
                      <SelectItem value="IEP_REVIEW">
                        {t("form.type.iep_review", "meetings")}
                      </SelectItem>
                      <SelectItem value="GRADE_CONFERENCE">
                        {t("form.type.grade_conference", "meetings")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="studentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("user.name.label", "common")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("user.name.placeholder", "common")}
                        onKeyDown={(e) => handleKeyDown(e, "studentName")}
                        {...field}
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
                    <FormLabel>
                      {t("form.student_grade.label", "meetings")}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          onKeyDown={(e) => handleKeyDown(e, "studentGrade")}
                        >
                          <SelectValue
                            placeholder={t(
                              "form.student_grade.placeholder",
                              "meetings",
                            )}
                          />
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
                name="guardianName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("form.guardian_name.label", "meetings")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "form.guardian_name.placeholder",
                          "meetings",
                        )}
                        onKeyDown={(e) => handleKeyDown(e, "guardianName")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guardianEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("form.guardian_email.label", "meetings")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t(
                          "form.guardian_email.placeholder",
                          "meetings",
                        )}
                        onKeyDown={(e) => handleKeyDown(e, "guardianEmail")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="guardianPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("form.guardian_phone.label", "meetings")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        "form.guardian_phone.placeholder",
                        "meetings",
                      )}
                      onKeyDown={(e) => handleKeyDown(e, "guardianPhone")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                            onKeyDown={(e) => handleKeyDown(e, "scheduledDate")}
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
                          disabled={(date) =>
                            date < new Date() || date < new Date("1900-01-01")
                          }
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
                name="scheduledTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          onKeyDown={(e) => handleKeyDown(e, "scheduledTime")}
                        >
                          <SelectValue
                            placeholder={t("select.time", "common")}
                          />
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

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("form.duration.label", "meetings")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={15}
                        max={120}
                        onKeyDown={(e) => handleKeyDown(e, "duration")}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.location.label", "meetings")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.location.placeholder", "meetings")}
                      onKeyDown={(e) => handleKeyDown(e, "location")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("form.assigned_to.label", "meetings")}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        onKeyDown={(e) => handleKeyDown(e, "assignedTo")}
                      >
                        <SelectValue
                          placeholder={t(
                            "form.assigned_to.placeholder",
                            "meetings",
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {usersLoading ? (
                        <SelectItem value="loading" disabled>
                          {t("common.loading", "common")}
                        </SelectItem>
                      ) : (
                        Array.isArray(users) &&
                        users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name || user.email}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {t("form.cancel", "meetings")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t("form.creating", "meetings")
                  : mode === "create"
                    ? t("form.title.create", "meetings")
                    : t("form.title.edit", "meetings")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
