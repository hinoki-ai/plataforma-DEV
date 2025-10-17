import type { Session } from "@/lib/auth-client";

export class AuthError extends Error {
  public readonly name = "AuthError";
  constructor(
    public code: string,
    message?: string,
  ) {
    super(message ?? code);
  }
}

export type { Session };
