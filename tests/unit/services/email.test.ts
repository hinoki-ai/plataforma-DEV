import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("nodemailer", () => {
  const sendMailMock = vi.fn();
  const createTransportMock = vi.fn(() => ({ sendMail: sendMailMock }));

  return {
    __esModule: true,
    default: {
      createTransport: createTransportMock,
    },
    createTransport: createTransportMock,
    __mock: {
      sendMailMock,
      createTransportMock,
    },
  };
});

vi.mock("@/lib/convex", () => ({
  getConvexClient: vi.fn(() => ({
    query: vi.fn(),
  })),
}));

describe("email service", () => {
  const originalEnv = { ...process.env };

  beforeEach(async () => {
    vi.resetModules();

    process.env = {
      ...originalEnv,
      CONTACT_FORM_RECIPIENTS:
        "contacto@plataforma-astral.com,soporte@plataforma-astral.com",
      EMAIL_FROM: "noreply@plataforma-astral.com",
      APP_URL: "https://plataforma-astral.com",
      NODE_ENV: "test",
    };

    const nodemailer = (await import("nodemailer")) as unknown as {
      __mock: {
        sendMailMock: ReturnType<typeof vi.fn>;
        createTransportMock: ReturnType<typeof vi.fn>;
      };
    };

    nodemailer.__mock.sendMailMock.mockReset();
    nodemailer.__mock.createTransportMock.mockReset();
    nodemailer.__mock.sendMailMock.mockResolvedValue({
      messageId: "mocked-message",
      envelope: { to: ["contacto@plataforma-astral.com"] },
    });
    nodemailer.__mock.createTransportMock.mockImplementation(() => ({
      sendMail: nodemailer.__mock.sendMailMock,
    }));
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("envía un correo cuando el mensaje de contacto es válido", async () => {
    const { sendContactEmail } = await import("@/lib/email");
    const nodemailer = (await import("nodemailer")) as unknown as {
      __mock: {
        sendMailMock: ReturnType<typeof vi.fn>;
        createTransportMock: ReturnType<typeof vi.fn>;
      };
    };

    const result = await sendContactEmail({
      firstName: "Ana",
      lastName: "Pérez",
      email: "ana@example.com",
      subject: "Consulta de matrícula",
      message: "Hola, quisiera saber más sobre el proceso de matrícula.",
    });

    expect(result).toBe(true);
    expect(nodemailer.__mock.createTransportMock).toHaveBeenCalledTimes(1);
    expect(nodemailer.__mock.sendMailMock).toHaveBeenCalledTimes(1);

    const payload = nodemailer.__mock.sendMailMock.mock.calls[0]?.[0];

    expect(payload).toMatchObject({
      from: "noreply@plataforma-astral.com",
      replyTo: "ana@example.com",
    });
    expect(payload.to).toEqual([
      "contacto@plataforma-astral.com",
      "soporte@plataforma-astral.com",
    ]);
    expect(payload.subject).toContain("[Contacto]");
    expect(typeof payload.html).toBe("string");
    expect(typeof payload.text).toBe("string");
  });

  it("devuelve false cuando el transporte falla", async () => {
    const nodemailer = (await import("nodemailer")) as unknown as {
      __mock: {
        sendMailMock: ReturnType<typeof vi.fn>;
      };
    };

    nodemailer.__mock.sendMailMock.mockRejectedValueOnce(
      new Error("SMTP indisponible"),
    );

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { sendContactEmail } = await import("@/lib/email");

    const result = await sendContactEmail({
      firstName: "Luis",
      lastName: "González",
      email: "luis@example.com",
      subject: "Soporte técnico",
      message: "Estoy experimentando un problema con la plataforma.",
    });

    expect(result).toBe(false);
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});
