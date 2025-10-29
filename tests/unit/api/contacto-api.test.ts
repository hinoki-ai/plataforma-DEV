import { beforeEach, describe, expect, it, vi } from "vitest";

const sendContactEmailMock = vi.fn();

vi.mock("@/lib/email", () => ({
  sendContactEmail: sendContactEmailMock,
}));

describe("POST /api/contacto", () => {
  beforeEach(() => {
    sendContactEmailMock.mockReset();
  });

  it("responde con éxito cuando el correo se envía", async () => {
    sendContactEmailMock.mockResolvedValue(true);
    const { POST } = await import("@/app/api/contacto/route");

    const payload = {
      firstName: "Ana",
      lastName: "Pérez",
      email: "ana@example.com",
      subject: "Consulta",
      message: "Necesito más información sobre los planes.",
    };

    const response = await POST(
      new Request("https://plataforma-astral.com/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(sendContactEmailMock).toHaveBeenCalledWith(payload);
  });

  it("devuelve 400 cuando los datos no son válidos", async () => {
    sendContactEmailMock.mockResolvedValue(true);
    const { POST } = await import("@/app/api/contacto/route");

    const invalidPayload = {
      firstName: "A",
      lastName: "",
      email: "correo-invalido",
      subject: "Hi",
      message: "Corto",
    };

    const response = await POST(
      new Request("https://plataforma-astral.com/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidPayload),
      }),
    );

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errors).toBeDefined();
    expect(sendContactEmailMock).not.toHaveBeenCalled();
  });

  it("devuelve 500 si el envío del correo falla", async () => {
    sendContactEmailMock.mockResolvedValue(false);
    const { POST } = await import("@/app/api/contacto/route");

    const payload = {
      firstName: "Carla",
      lastName: "Vergara",
      email: "carla@example.com",
      subject: "Soporte",
      message: "Mi cuenta no se está sincronizando",
    };

    const response = await POST(
      new Request("https://plataforma-astral.com/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    );

    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(sendContactEmailMock).toHaveBeenCalledWith(payload);
  });
});
