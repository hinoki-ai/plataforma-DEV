"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/lib/validation/contact";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { useEnterNavigation } from "@/lib/hooks/useFocusManagement";
import { useAriaLive } from "@/lib/hooks/useAriaLive";

export function ContactForm() {
  const { t } = useDivineParsing(["common"]);
  const { announce } = useAriaLive();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  // Enter key navigation
  const { handleKeyDown } = useEnterNavigation(
    ["firstName", "lastName", "email", "subject", "message"],
    () => {
      // Trigger form submission when Enter is pressed on last field
      const form = document.querySelector("form") as HTMLFormElement;
      form?.requestSubmit();
    },
  );

  const onSubmit = handleSubmit(async (values) => {
    announce("Enviando mensaje...", "polite");
    try {
      const response = await fetch("/api/contacto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json().catch(() => ({ success: false }));

      if (!response.ok) {
        if (response.status === 400 && result?.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            const message = Array.isArray(messages) ? messages[0] : undefined;
            if (message) {
              setError(field as keyof ContactFormValues, {
                type: "server",
                message,
              });
            }
          });

          toast.error(t("form.error.validation", "contacto"));
          announce(
            "Hay errores de validación en el formulario. Por favor revisa los campos marcados.",
            "assertive",
          );
          return;
        }

        toast.error(result?.error || t("form.error.api", "contacto"));
        announce(
          "Error al enviar el mensaje. Por favor intenta nuevamente.",
          "assertive",
        );
        return;
      }

      if (!result?.success) {
        toast.error(result?.error || t("form.error.api", "contacto"));
        announce(
          "Error al procesar la solicitud. Por favor intenta nuevamente.",
          "assertive",
        );
        return;
      }

      toast.success(t("form.success.title", "contacto"), {
        description: t("form.success.description", "contacto"),
      });
      announce(
        "Mensaje enviado exitosamente. Gracias por contactarnos.",
        "polite",
      );
      reset();
    } catch (error) {
      toast.error(t("form.error.general", "contacto"));
      announce(
        "Error de conexión. Por favor verifica tu conexión a internet e intenta nuevamente.",
        "assertive",
      );
    }
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="firstName" className="text-foreground">
            {t("form.firstName.label", "contacto")}
          </Label>
          <Input
            id="firstName"
            {...register("firstName")}
            aria-invalid={Boolean(errors.firstName)}
            placeholder={t("form.firstName.placeholder", "contacto")}
            disabled={isSubmitting}
            onKeyDown={(e) => handleKeyDown(e, "firstName")}
            className="mt-1 border border-input bg-background text-foreground"
          />
          {errors.firstName ? (
            <p className="mt-1 text-sm text-red-400">
              {errors.firstName.message}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="lastName" className="text-foreground">
            {t("form.lastName.label", "contacto")}
          </Label>
          <Input
            id="lastName"
            {...register("lastName")}
            aria-invalid={Boolean(errors.lastName)}
            placeholder={t("form.lastName.placeholder", "contacto")}
            disabled={isSubmitting}
            onKeyDown={(e) => handleKeyDown(e, "lastName")}
            className="mt-1 border border-input bg-background text-foreground"
          />
          {errors.lastName ? (
            <p className="mt-1 text-sm text-red-400">
              {errors.lastName.message}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <Label htmlFor="email" className="text-foreground">
          {t("form.email.label", "contacto")}
        </Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          aria-invalid={Boolean(errors.email)}
          placeholder={t("form.email.placeholder", "contacto")}
          disabled={isSubmitting}
          onKeyDown={(e) => handleKeyDown(e, "email")}
          className="mt-1 border border-input bg-background text-foreground"
        />
        {errors.email ? (
          <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="subject" className="text-foreground">
          {t("form.subject.label", "contacto")}
        </Label>
        <Input
          id="subject"
          {...register("subject")}
          aria-invalid={Boolean(errors.subject)}
          placeholder={t("form.subject.placeholder", "contacto")}
          disabled={isSubmitting}
          onKeyDown={(e) => handleKeyDown(e, "subject")}
          className="mt-1 border border-input bg-background text-foreground"
        />
        {errors.subject ? (
          <p className="mt-1 text-sm text-red-400">{errors.subject.message}</p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="message" className="text-foreground">
          {t("form.message.label", "contacto")}
        </Label>
        <Textarea
          id="message"
          rows={5}
          {...register("message")}
          aria-invalid={Boolean(errors.message)}
          placeholder={t("form.message.placeholder", "contacto")}
          disabled={isSubmitting}
          onKeyDown={(e) => handleKeyDown(e, "message")}
          className="mt-1 border border-input bg-background text-foreground"
        />
        {errors.message ? (
          <p className="mt-1 text-sm text-red-400">{errors.message.message}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting
          ? t("form.submitting", "contacto")
          : t("form.submit", "contacto")}
      </Button>
    </form>
  );
}
