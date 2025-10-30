"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { User } from "@/lib/types";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { passwordSchema } from "@/lib/user-creation";
import { useEnterNavigation } from "@/lib/hooks/useFocusManagement";
import { useAriaLive } from "@/lib/hooks/useAriaLive";

// Function to create schema with translated messages
const createUserSchema = (t: (key: string, namespace?: string) => string) =>
  z.object({
    name: z.string().min(2, t("validation.name.min", "common")),
    email: z.string().email(t("validation.email.invalid", "common")),
    password: passwordSchema,
    role: z.enum(["admin", "profesor", "parent"]),
    isActive: z.boolean(),
  });

type UserFormData = z.infer<ReturnType<typeof createUserSchema>>;

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
}

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useDivineParsing(["common"]);
  const { announce } = useAriaLive();

  const userSchema = createUserSchema(t);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      role:
        (user?.role?.toLowerCase() as "admin" | "profesor" | "parent") ||
        "profesor",
      isActive: user?.isActive ?? true,
    },
  });

  // Define field order - password is conditional for new users only
  const fieldOrder = user
    ? ["name", "email", "role", "isActive"]
    : ["name", "email", "password", "role", "isActive"];

  const { handleKeyDown } = useEnterNavigation(fieldOrder, () => {
    const form = document.querySelector("form") as HTMLFormElement;
    form?.requestSubmit();
  });

  const handleSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    announce(user ? "Actualizando usuario..." : "Creando usuario...", "polite");
    try {
      await onSubmit(data);
      announce(
        user
          ? "Usuario actualizado exitosamente"
          : "Usuario creado exitosamente",
        "polite",
      );
    } catch (error) {
      announce(
        "Error al guardar el usuario. Por favor intenta nuevamente.",
        "assertive",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("user.name.label", "common")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("user.name.placeholder", "common")}
                  {...field}
                  onKeyDown={(e) => handleKeyDown(e, "name")}
                />
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
              <FormLabel>{t("common.email", "common")}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t("user.email.placeholder", "common")}
                  {...field}
                  disabled={!!user}
                  onKeyDown={(e) => handleKeyDown(e, "email")}
                />
              </FormControl>
              <FormDescription>
                {user
                  ? t("user.email.immutable", "common")
                  : t("user.email.description", "common")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {!user && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("user.password.label", "common") || "Contraseña"}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={
                        t("user.password.placeholder", "common") ||
                        "Ingrese una contraseña"
                      }
                      {...field}
                      className="pr-10"
                      onKeyDown={(e) => handleKeyDown(e, "password")}
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
                  {t("user.password.description", "common") ||
                    "La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("user.role.label", "common")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger onKeyDown={(e) => handleKeyDown(e, "role")}>
                    <SelectValue
                      placeholder={t("user.role.placeholder", "common")}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="profesor">
                    {t("user.role.profesor", "common")}
                  </SelectItem>
                  <SelectItem value="admin">
                    {t("user.role.admin", "common")}
                  </SelectItem>
                  <SelectItem value="parent">
                    {t("user.role.parent", "common")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {t("user.role.description", "common")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t("user.active.label", "common")}
                </FormLabel>
                <FormDescription>
                  {t("user.active.description", "common")}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  onKeyDown={(e) => handleKeyDown(e, "isActive")}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("common.cancel", "common")}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t("user.saving", "common")
              : user
                ? t("user.update", "common")
                : t("user.create", "common")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
