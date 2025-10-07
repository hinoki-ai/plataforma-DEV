"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useLanguage } from "@/components/language/LanguageContext";

// Password strength validation
const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
  .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula")
  .regex(/[0-9]/, "La contraseña debe contener al menos un número")
  .regex(
    /[^a-zA-Z0-9]/,
    "La contraseña debe contener al menos un carácter especial",
  );

// Parent creation schema with student information
const createParentSchema = z.object({
  // Parent information
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingrese un email válido"),
  password: passwordSchema,
  phone: z.string().optional(),
  // Student information
  studentName: z.string().min(2, "El nombre del estudiante es requerido"),
  studentGrade: z.string().min(1, "El grado del estudiante es requerido"),
  studentEmail: z
    .string()
    .email("El email del estudiante debe ser válido")
    .optional()
    .or(z.literal("")),
  guardianPhone: z.string().optional(),
  relationship: z.string().min(1, "La relación familiar es requerida"),
});

type ParentFormData = z.infer<typeof createParentSchema>;

interface ParentCreationFormProps {
  onSubmit: (data: ParentFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

const gradeOptions = [
  "Pre-Kinder",
  "Kinder",
  "1° Básico",
  "2° Básico",
  "3° Básico",
  "4° Básico",
  "5° Básico",
  "6° Básico",
  "7° Básico",
  "8° Básico",
  "1° Medio",
  "2° Medio",
  "3° Medio",
  "4° Medio",
];

const relationshipOptions = [
  "Padre",
  "Madre",
  "Tutor Legal",
  "Abuelo/a",
  "Tío/a",
  "Otro Familiar",
];

export function ParentCreationForm({
  onSubmit,
  onCancel,
  isLoading = false,
  title = "Crear Usuario Padre",
  description = "Registra un nuevo usuario padre con información del estudiante",
}: ParentCreationFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useLanguage();

  const form = useForm<ParentFormData>({
    resolver: zodResolver(createParentSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      studentName: "",
      studentGrade: "",
      studentEmail: "",
      guardianPhone: "",
      relationship: "",
    },
  });

  const handleSubmit = async (data: ParentFormData) => {
    // Clean up empty optional fields
    const cleanedData = {
      ...data,
      studentEmail: data.studentEmail || undefined,
      phone: data.phone || undefined,
      guardianPhone: data.guardianPhone || undefined,
    };
    await onSubmit(cleanedData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Parent Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">
                Información del Padre/Tutor
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: María González" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="padre@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+569 1234 5678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relación Familiar</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione relación" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {relationshipOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Contraseña segura"
                          {...field}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      La contraseña debe tener al menos 8 caracteres, incluyendo
                      mayúsculas, minúsculas, números y caracteres especiales
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Student Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">
                Información del Estudiante
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="studentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Estudiante</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Juan Pérez" {...field} />
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
                      <FormLabel>Grado/Curso</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione grado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {gradeOptions.map((grade) => (
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
                  name="studentEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email del Estudiante (Opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="estudiante@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guardianPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Teléfono de Contacto Adicional (Opcional)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="+569 8765 4321" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creando..." : "Crear Usuario Padre"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
