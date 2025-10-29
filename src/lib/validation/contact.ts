import { z } from "zod";

export const contactFormSchema = z.object({
  firstName: z.string().trim().min(2, "Ingresa al menos 2 caracteres").max(60),
  lastName: z.string().trim().min(2, "Ingresa al menos 2 caracteres").max(60),
  email: z
    .string()
    .trim()
    .email("Ingresa un correo válido")
    .max(254, "El correo excede el largo permitido"),
  subject: z
    .string()
    .trim()
    .min(3, "Ingresa un asunto descriptivo")
    .max(120, "El asunto excede el máximo permitido"),
  message: z
    .string()
    .trim()
    .min(10, "El mensaje debe contener al menos 10 caracteres")
    .max(2000, "El mensaje excede el máximo permitido"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
