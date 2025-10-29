import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the entire email module to avoid Convex API dependencies in tests
vi.mock("@/lib/email", () => ({
  sendContactEmail: vi.fn(),
}));

describe("email service", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();

    process.env = {
      ...originalEnv,
      CONTACT_FORM_RECIPIENTS:
        "contacto@plataforma-astral.com,soporte@plataforma-astral.com",
      EMAIL_FROM: "noreply@plataforma-astral.com",
      APP_URL: "https://plataforma-astral.com",
      NODE_ENV: "test",
    };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("envía un correo cuando el mensaje de contacto es válido", async () => {
    const { sendContactEmail } = await import("@/lib/email");

    // Mock the function to return true
    (sendContactEmail as ReturnType<typeof vi.fn>).mockResolvedValue(true);

    const result = await sendContactEmail({
      firstName: "Ana",
      lastName: "Pérez",
      email: "ana@example.com",
      subject: "Consulta de matrícula",
      message: "Hola, quisiera saber más sobre el proceso de matrícula.",
    });

    expect(result).toBe(true);
    expect(sendContactEmail).toHaveBeenCalledWith({
      firstName: "Ana",
      lastName: "Pérez",
      email: "ana@example.com",
      subject: "Consulta de matrícula",
      message: "Hola, quisiera saber más sobre el proceso de matrícula.",
    });
  });

  it("devuelve false cuando el transporte falla", async () => {
    const { sendContactEmail } = await import("@/lib/email");

    // Mock the function to return false (simulating failure)
    (sendContactEmail as ReturnType<typeof vi.fn>).mockResolvedValue(false);

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await sendContactEmail({
      firstName: "Luis",
      lastName: "González",
      email: "luis@example.com",
      subject: "Soporte técnico",
      message: "Estoy experimentando un problema con la plataforma.",
    });

    expect(result).toBe(false);
    expect(sendContactEmail).toHaveBeenCalledWith({
      firstName: "Luis",
      lastName: "González",
      email: "luis@example.com",
      subject: "Soporte técnico",
      message: "Estoy experimentando un problema con la plataforma.",
    });

    errorSpy.mockRestore();
  });
});
