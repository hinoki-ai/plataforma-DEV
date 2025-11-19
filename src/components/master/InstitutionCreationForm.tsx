"use client";

import { useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { MasterPageTemplate } from "@/components/master/MasterPageTemplate";
import {
  EducationalInstitutionType,
  INSTITUTION_TYPE_INFO,
  EDUCATIONAL_LEVELS,
  FEATURE_LABELS,
} from "@/lib/educational-system";
import { Building2, Crown, ShieldCheck, Check, Settings2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const adminSchema = z.object({
  name: z.string().min(2, "Ingrese al menos 2 caracteres"),
  email: z.string().email("Ingrese un correo válido"),
  password: z.string().min(8, "Use al menos 8 caracteres"),
  phone: z.string().optional(),
  isPrimary: z.boolean(),
});

const institutionCreationSchema = z
  .object({
    name: z.string().min(3, "Ingrese el nombre de la institución"),
    mission: z.string().min(20, "Describa la misión institucional"),
    vision: z.string().min(20, "Describa la visión institucional"),
    address: z.string().min(5, "Ingrese una dirección válida"),
    phone: z.string().min(7, "Ingrese un teléfono de contacto"),
    email: z.string().email("Ingrese un correo institucional válido"),
    website: z.string().url("Ingrese una URL válida"),
    logoUrl: z
      .string()
      .url("Ingrese una URL válida")
      .optional()
      .or(z.literal("")),
    institutionType: z.enum([
      "PRESCHOOL",
      "BASIC_SCHOOL",
      "HIGH_SCHOOL",
      "TECHNICAL_INSTITUTE",
      "TECHNICAL_CENTER",
      "UNIVERSITY",
    ] satisfies [EducationalInstitutionType, ...EducationalInstitutionType[]]),
    supportedLevels: z.array(z.string()).optional(),
    educationalConfig: z
      .object({
        maxCourses: z.coerce.number().min(1).optional(),
        maxSubjects: z.coerce.number().min(1).optional(),
        enabledFeatures: z.record(z.boolean()).optional(),
      })
      .optional(),
    admins: z.array(adminSchema).min(1, "Debe crear al menos un administrador"),
  })
  .refine((data) => data.admins.some((admin) => admin.isPrimary), {
    message: "Debe existir un administrador principal",
    path: ["admins"],
  });

type InstitutionCreationFormValues = z.infer<typeof institutionCreationSchema>;

type CreationResult = {
  institutionId: string | null;
  admins: Array<{
    email: string;
    role: string;
    isPrimary: boolean;
    userId: string;
  }>;
};

const defaultValues: InstitutionCreationFormValues = {
  name: "",
  mission: "",
  vision: "",
  address: "",
  phone: "",
  email: "",
  website: "https://",
  logoUrl: "",
  institutionType: "PRESCHOOL",
  supportedLevels: [],
  educationalConfig: {
    maxCourses: 20,
    maxSubjects: 20,
    enabledFeatures: {},
  },
  admins: [
    {
      name: "",
      email: "",
      password: "",
      phone: "",
      isPrimary: true,
    },
  ],
};

export function InstitutionCreationForm() {
  const [creationResult, setCreationResult] = useState<CreationResult | null>(
    null,
  );

  const form = useForm<InstitutionCreationFormValues>({
    resolver: zodResolver(institutionCreationSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const {
    fields: adminFields,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: "admins",
  });

  const primaryAdminIndex = form.watch("admins").findIndex((a) => a.isPrimary);
  const selectedInstitutionType = form.watch("institutionType");

  const availableLevels = useMemo(() => {
    return INSTITUTION_TYPE_INFO[selectedInstitutionType].levels;
  }, [selectedInstitutionType]);

  // Auto-select all levels when institution type changes
  useMemo(() => {
    const levels = INSTITUTION_TYPE_INFO[selectedInstitutionType].levels.map(
      (l) => l.id,
    );
    // Use setTimeout to avoid setting state during render
    setTimeout(() => {
      form.setValue("supportedLevels", levels);
    }, 0);
  }, [selectedInstitutionType, form]);

  const institutionOptions = useMemo(
    () =>
      Object.entries(INSTITUTION_TYPE_INFO).map(([key, info]) => ({
        value: key as EducationalInstitutionType,
        label: `${info.icon} ${info.chileanName}`,
        description: info.name,
      })),
    [],
  );

  const handleAddAdmin = () => {
    append({
      name: "",
      email: "",
      password: "",
      phone: "",
      isPrimary: false,
    });
  };

  const handleRemoveAdmin = (index: number) => {
    const admins = form.getValues("admins");
    if (admins.length === 1) {
      toast.error("Debe mantener al menos un administrador");
      return;
    }

    const removingPrimary = admins[index]?.isPrimary;
    remove(index);

    const updatedAdmins = form.getValues("admins");
    if (removingPrimary && updatedAdmins.length > 0) {
      form.setValue(`admins.0.isPrimary`, true, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const handleSetPrimary = (index: number) => {
    const admins = form.getValues("admins");
    admins.forEach((_, adminIndex) => {
      form.setValue(`admins.${adminIndex}.isPrimary`, adminIndex === index, {
        shouldDirty: true,
      });
    });
    form.trigger("admins");
  };

  const onSubmit = async (values: InstitutionCreationFormValues) => {
    setCreationResult(null);

    try {
      const payload = {
        institution: {
          name: values.name.trim(),
          mission: values.mission.trim(),
          vision: values.vision.trim(),
          address: values.address.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
          website: values.website.trim(),
          logoUrl: values.logoUrl?.trim() || undefined,
          institutionType: values.institutionType,
          supportedLevels: values.supportedLevels,
          educationalConfig: values.educationalConfig,
        },
        admins: values.admins.map((admin) => ({
          name: admin.name.trim(),
          email: admin.email.trim(),
          password: admin.password,
          phone: admin.phone?.trim() || undefined,
          isPrimary: admin.isPrimary,
        })),
      };

      const response = await fetch("/api/master/institutions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "No se pudo crear la institución");
      }

      toast.success("Institución creada correctamente");
      setCreationResult({
        institutionId: data.institutionId,
        admins: data.admins ?? [],
      });

      form.reset({
        ...defaultValues,
        institutionType: values.institutionType,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo crear la institución";
      toast.error(message);
    }
  };

  const adminErrors = form.formState.errors.admins;
  const adminsRootError =
    (
      adminErrors as
        | { root?: { message?: string }; message?: string }
        | undefined
    )?.root?.message ??
    (adminErrors as { message?: string } | undefined)?.message;

  return (
    <MasterPageTemplate
      title="Provisionar nueva institución"
      subtitle="Cree un tenant completo con credenciales administrativas"
      context="MASTER_INSTITUTION_CREATION"
    >
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Datos institucionales
            </CardTitle>
            <CardDescription>
              Complete la información base para inicializar el tenant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la institución</FormLabel>
                        <FormControl>
                          <Input placeholder="Colegio Astral" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="institutionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de institución</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {institutionOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                <div className="flex flex-col">
                                  <span>{option.label}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {option.description}
                                  </span>
                                </div>
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
                    name="supportedLevels"
                    render={() => (
                      <FormItem className="md:col-span-2">
                        <div className="mb-4">
                          <FormLabel className="text-base">
                            Niveles Educativos Soportados
                          </FormLabel>
                          <CardDescription>
                            Seleccione los niveles que ofrecerá esta institución
                            ({availableLevels.length} disponibles para{" "}
                            {
                              INSTITUTION_TYPE_INFO[selectedInstitutionType]
                                .chileanName
                            }
                            )
                          </CardDescription>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg p-4 bg-muted/10">
                          {availableLevels.map((level) => (
                            <FormField
                              key={level.id}
                              control={form.control}
                              name="supportedLevels"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={level.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          level.id,
                                        )}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...(field.value || []),
                                                level.id,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== level.id,
                                                ),
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="font-normal text-sm font-semibold">
                                        {level.chileanName}
                                      </FormLabel>
                                      <p className="text-xs text-muted-foreground">
                                        {level.ages} • {level.duration}
                                      </p>
                                    </div>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono institucional</FormLabel>
                        <FormControl>
                          <Input placeholder="+56 9 1234 5678" {...field} />
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
                        <FormLabel>Correo institucional</FormLabel>
                        <FormControl>
                          <Input placeholder="contacto@colegio.cl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sitio web</FormLabel>
                        <FormControl>
                          <Input placeholder="https://colegio.cl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://colegio.cl/logo.png"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Calle 123, Comuna, Región"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mission"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Misión</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describa el propósito y compromiso de la institución"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vision"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Visión</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describa el horizonte y proyección institucional"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-blue-600" />
                        Configuración Educativa
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Personalice los límites y módulos disponibles
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="educationalConfig.maxCourses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Límite de Cursos</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="educationalConfig.maxSubjects"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Límite de Asignaturas</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-3 border rounded-lg p-4 bg-muted/10">
                    <FormLabel>Módulos y Funcionalidades</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(FEATURE_LABELS).map(([key, label]) => (
                        <FormField
                          key={key}
                          control={form.control}
                          name={`educationalConfig.enabledFeatures.${key}`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal text-sm cursor-pointer">
                                {label}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-blue-600" />
                        Administradores del tenant
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Cree las credenciales maestras para ingresar al nuevo
                        tenant
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddAdmin}
                    >
                      Agregar administrador
                    </Button>
                  </div>

                  {adminsRootError && (
                    <Alert variant="destructive">
                      <AlertTitle>Error de configuración</AlertTitle>
                      <AlertDescription>{adminsRootError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    {adminFields.map((field, index) => (
                      <Card
                        key={field.id}
                        className="border-gray-200 dark:border-gray-700"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                              Administrador #{index + 1}
                            </CardTitle>
                            <div className="flex items-center gap-3">
                              {primaryAdminIndex === index ? (
                                <Badge
                                  className="bg-green-500 text-white"
                                  variant="secondary"
                                >
                                  Principal
                                </Badge>
                              ) : (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSetPrimary(index)}
                                >
                                  Marcar como principal
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveAdmin(index)}
                              >
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="grid gap-3 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name={`admins.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre completo</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nombre del administrador"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`admins.${index}.email`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Correo</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="admin@colegio.cl"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`admins.${index}.phone`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Teléfono (opcional)</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="+56 9 1234 5678"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`admins.${index}.password`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contraseña</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="Mínimo 8 caracteres"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset(defaultValues)}
                    disabled={form.formState.isSubmitting}
                  >
                    Limpiar formulario
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting
                      ? "Creando institución..."
                      : "Crear institución"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-gold-600" />
              Instrucciones MASTER
            </CardTitle>
            <CardDescription>
              Supervisión del proceso de institucionalización
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                El MASTER provisiona un tenant completo. Asegúrese de que los
                administradores registrados reciban las credenciales generadas.
              </p>
              <p>
                El administrador principal queda marcado en la membresía para
                auditoría y soporte prioritario.
              </p>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Checklist rápido</h4>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
                <li>Confirme que la institución no exista previamente</li>
                <li>Use correos institucionales verificables</li>
                <li>Comparta la contraseña por un canal seguro</li>
                <li>Solicite cambio de contraseña en el primer inicio</li>
              </ul>
            </div>
            {creationResult && (
              <Alert className="border-green-300 bg-green-50/80 dark:border-green-700 dark:bg-green-900/20">
                <AlertTitle>Tenant creado correctamente</AlertTitle>
                <AlertDescription>
                  <div className="space-y-3 text-sm">
                    <div>
                      ID Convex:{" "}
                      {creationResult.institutionId || "sincronizando..."}
                    </div>
                    <div className="space-y-1">
                      <div className="font-semibold">
                        Administradores provisionados
                      </div>
                      <ul className="list-disc pl-5 space-y-1">
                        {creationResult.admins.map((admin) => (
                          <li key={admin.userId}>
                            {admin.email} — rol {admin.role}
                            {admin.isPrimary ? " (principal)" : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </MasterPageTemplate>
  );
}
