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

export function ContactForm() {
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

  const onSubmit = handleSubmit(async (values) => {
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

          toast.error("Revisa los datos del formulario");
          return;
        }

        toast.error(
          result?.error ||
            "No pudimos enviar tu mensaje en este momento. Inténtalo nuevamente más tarde.",
        );
        return;
      }

      if (!result?.success) {
        toast.error(
          result?.error ||
            "No pudimos enviar tu mensaje en este momento. Inténtalo nuevamente más tarde.",
        );
        return;
      }

      toast.success("Mensaje enviado", {
        description:
          "Gracias por escribirnos. Nos pondremos en contacto contigo pronto.",
      });
      reset();
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error(
        "Ocurrió un error inesperado al enviar tu mensaje. Por favor, vuelve a intentarlo.",
      );
    }
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="firstName" className="text-foreground">
            Nombre
          </Label>
          <Input
            id="firstName"
            {...register("firstName")}
            aria-invalid={Boolean(errors.firstName)}
            placeholder="Tu nombre"
            disabled={isSubmitting}
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
            Apellido
          </Label>
          <Input
            id="lastName"
            {...register("lastName")}
            aria-invalid={Boolean(errors.lastName)}
            placeholder="Tu apellido"
            disabled={isSubmitting}
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
          Correo electrónico
        </Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          aria-invalid={Boolean(errors.email)}
          placeholder="nombre@correo.cl"
          disabled={isSubmitting}
          className="mt-1 border border-input bg-background text-foreground"
        />
        {errors.email ? (
          <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="subject" className="text-foreground">
          Asunto
        </Label>
        <Input
          id="subject"
          {...register("subject")}
          aria-invalid={Boolean(errors.subject)}
          placeholder="¿Cómo podemos ayudarte?"
          disabled={isSubmitting}
          className="mt-1 border border-input bg-background text-foreground"
        />
        {errors.subject ? (
          <p className="mt-1 text-sm text-red-400">{errors.subject.message}</p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="message" className="text-foreground">
          Mensaje
        </Label>
        <Textarea
          id="message"
          rows={5}
          {...register("message")}
          aria-invalid={Boolean(errors.message)}
          placeholder="Cuéntanos más sobre tu consulta"
          disabled={isSubmitting}
          className="mt-1 border border-input bg-background text-foreground"
        />
        {errors.message ? (
          <p className="mt-1 text-sm text-red-400">{errors.message.message}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Enviando mensaje..." : "Enviar mensaje"}
      </Button>
    </form>
  );
}
