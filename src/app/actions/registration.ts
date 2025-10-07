"use server";

import { z } from "zod";

const registrationSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(["CENTRO_CONSEJO"]),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export async function registerCentroConsejoMember(data: RegistrationInput) {
  const validated = registrationSchema.parse(data);

  // Mock implementation - replace with actual logic
  return {
    success: true,
    userId: Math.random().toString(36).substring(7),
    ...validated,
  };
}
