"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { useEnterNavigation } from "@/lib/hooks/useFocusManagement";
import { useLanguage } from "@/components/language/useDivineLanguage";

const courseSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre del curso debe tener al menos 3 caracteres"),
  level: z.enum(["BASICA", "MEDIA"], {
    message: "Debe seleccionar un nivel",
  }),
  grade: z.string().min(1, "El grado es requerido"),
  section: z.string().min(1, "La sección es requerida"),
  academicYear: z.number().min(2020).max(2030),
  teacherId: z.string().min(1, "Debe seleccionar un profesor"),
  subjects: z
    .array(z.string())
    .min(1, "Debe seleccionar al menos una asignatura"),
  maxStudents: z.number().optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: any;
}

export function CourseForm({
  onSuccess,
  onCancel,
  initialData,
}: CourseFormProps) {
  const { t } = useLanguage();
  const { userId } = useAuth();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    initialData?.subjects || [],
  );
  const [subjectInput, setSubjectInput] = useState("");

  const fieldOrder = [
    "name",
    "level",
    "grade",
    "section",
    "academicYear",
    "teacherId",
    "subjects",
    "maxStudents",
  ];
  const { handleKeyDown } = useEnterNavigation(fieldOrder, () => {
    const form = document.querySelector("form") as HTMLFormElement;
    form?.requestSubmit();
  });

  // Get teachers
  const teachers = useQuery(api.users.getUsersByRole, { role: "PROFESOR" });

  const createCourse = useMutation(api.courses.createCourse);
  const updateCourse = useMutation(api.courses.updateCourse);

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: initialData?.name || "",
      level: initialData?.level || "BASICA",
      grade: initialData?.grade || "",
      section: initialData?.section || "",
      academicYear: initialData?.academicYear || new Date().getFullYear(),
      teacherId: initialData?.teacherId || "",
      subjects: initialData?.subjects || [],
      maxStudents: initialData?.maxStudents,
    },
  });

  const onSubmit = async (data: CourseFormData) => {
    try {
      if (!userId) {
        toast.error("Debe estar autenticado para crear un curso");
        return;
      }

      // Find teacher ID from userId (need to get user by clerkId)
      const user = await fetch(`/api/users/by-clerk/${userId}`)
        .then((res) => res.json())
        .catch(() => null);

      if (!user?.id) {
        toast.error("No se pudo identificar al usuario");
        return;
      }

      const courseData = {
        ...data,
        teacherId: data.teacherId as any,
        subjects: selectedSubjects,
      };

      if (initialData) {
        await updateCourse({
          courseId: initialData._id,
          ...courseData,
        });
        toast.success("Curso actualizado exitosamente");
      } else {
        await createCourse(courseData);
        toast.success("Curso creado exitosamente");
      }

      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el curso");
    }
  };

  const addSubject = () => {
    if (
      subjectInput.trim() &&
      !selectedSubjects.includes(subjectInput.trim())
    ) {
      setSelectedSubjects([...selectedSubjects, subjectInput.trim()]);
      setSubjectInput("");
      form.setValue("subjects", [...selectedSubjects, subjectInput.trim()]);
    }
  };

  const removeSubject = (subject: string) => {
    const updated = selectedSubjects.filter((s) => s !== subject);
    setSelectedSubjects(updated);
    form.setValue("subjects", updated);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Curso</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Matemáticas 8° Básico"
                  {...field}
                  onKeyDown={(e) => handleKeyDown(e, "name")}
                />
              </FormControl>
              <FormDescription>
                Nombre completo del curso o asignatura
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nivel</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger onKeyDown={(e) => handleKeyDown(e, "level")}>
                      <SelectValue placeholder="Seleccione nivel" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="BASICA">Básica</SelectItem>
                    <SelectItem value="MEDIA">Media</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grado</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: 8vo, 1ro Medio"
                    {...field}
                    onKeyDown={(e) => handleKeyDown(e, "grade")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="section"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sección</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: A, B, C"
                    {...field}
                    onKeyDown={(e) => handleKeyDown(e, "section")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="academicYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Año Académico</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    onKeyDown={(e) => handleKeyDown(e, "academicYear")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="teacherId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profesor Jefe</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger
                    onKeyDown={(e) => handleKeyDown(e, "teacherId")}
                  >
                    <SelectValue placeholder="Seleccione profesor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {teachers?.map((teacher) => (
                    <SelectItem key={teacher._id} value={teacher._id}>
                      {teacher.name || teacher.email}
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
          name="subjects"
          render={() => (
            <FormItem>
              <FormLabel>Asignaturas</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Ej: Matemáticas"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "subjects")}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSubject();
                    }
                  }}
                />
                <Button type="button" onClick={addSubject} variant="outline">
                  Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedSubjects.map((subject) => (
                  <div
                    key={subject}
                    className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded text-sm"
                  >
                    {subject}
                    <button
                      type="button"
                      onClick={() => removeSubject(subject)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxStudents"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Máximo de Estudiantes (Opcional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                  onKeyDown={(e) => handleKeyDown(e, "maxStudents")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {t("common.cancel")}
            </Button>
          )}
          <Button type="submit">
            {initialData ? t("common.update") : t("common.create")}{" "}
            {t("libro-clases.create.course").split(" ")[1]}
          </Button>
        </div>
      </form>
    </Form>
  );
}
