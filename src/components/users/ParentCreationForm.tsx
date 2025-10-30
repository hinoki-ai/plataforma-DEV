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
import { Eye, EyeOff, UserPlus, ChevronRight, ChevronLeft } from "lucide-react";
import { useLanguage } from "@/components/language/LanguageContext";
import { cn } from "@/lib/utils";

// Import standardized password schema
import { passwordSchema } from "@/lib/user-creation";

// Parent creation schema with student information
const createParentSchema = z
  .object({
    // Parent information
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Ingrese un email válido"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirma la contraseña"),
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
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
      });
    }
  });

type ParentFormValues = z.infer<typeof createParentSchema>;
type ParentFormOutput = Omit<ParentFormValues, "confirmPassword">;

interface ParentCreationFormProps {
  onSubmit: (data: ParentFormOutput) => void;
  onCancel: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  className?: string;
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

interface StepIndicatorProps {
  currentStep: number;
}

const StepIndicator = ({ currentStep }: StepIndicatorProps) => (
  <div className="flex items-center justify-center mb-8">
    {[1, 2, 3, 4].map((step) => (
      <div key={step} className="flex items-center">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2",
            currentStep >= step
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110 border-primary"
              : "bg-muted text-muted-foreground border-muted-foreground/30",
          )}
        >
          {step}
        </div>
        {step < 4 && (
          <div
            className={cn(
              "w-12 h-1 mx-2 transition-all duration-300 rounded-full",
              currentStep > step ? "bg-primary shadow-sm" : "bg-muted",
            )}
          />
        )}
      </div>
    ))}
  </div>
);

export function ParentCreationForm({
  onSubmit,
  onCancel,
  isLoading = false,
  title = "Crear Usuario Padre",
  description = "Registra un nuevo usuario padre con información del estudiante",
  className,
}: ParentCreationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { t } = useLanguage();

  const form = useForm<ParentFormValues>({
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
      confirmPassword: "",
    },
  });

  const validateStep = (step: number): boolean => {
    const values = form.getValues();

    switch (step) {
      case 1:
        // Validate parent basic info
        return !!(
          values.name &&
          values.email &&
          values.phone &&
          values.relationship
        );
      case 2:
        // Validate password creation
        return !!(
          values.password && passwordSchema.safeParse(values.password).success
        );
      case 3:
        // Validate password confirmation
        return !!(
          values.confirmPassword && values.password === values.confirmPassword
        );
      case 4:
        // Validate student info
        return !!(values.studentName && values.studentGrade);
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    } else {
      form.trigger();
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (data: ParentFormValues) => {
    // Clean up empty optional fields
    const { confirmPassword: _confirmPassword, ...formValues } = data;
    const cleanedData = {
      ...formValues,
      studentEmail: data.studentEmail || undefined,
      phone: data.phone || undefined,
      guardianPhone: data.guardianPhone || undefined,
    } satisfies ParentFormOutput;
    await onSubmit(cleanedData);
  };

  const stepTitles = [
    "Información Personal",
    "Crear Contraseña",
    "Verificar Contraseña",
    "Datos del Estudiante",
  ];

  const stepDescriptions = [
    "Tus datos básicos de contacto",
    "Crea una contraseña segura",
    "Confirma tu contraseña",
    "Información de tu estudiante",
  ];

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <StepIndicator currentStep={currentStep} />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {currentStep === 1 && (
              <div className="space-y-4">
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
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crear Contraseña</FormLabel>
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
                        La contraseña debe tener al menos 8 caracteres,
                        incluyendo mayúsculas, minúsculas, números y caracteres
                        especiales
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirma la contraseña"
                            {...field}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            aria-label={
                              showConfirmPassword
                                ? "Ocultar confirmación de contraseña"
                                : "Mostrar confirmación de contraseña"
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
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
            )}

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                )}
              </div>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creando..." : "Crear Usuario Padre"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
