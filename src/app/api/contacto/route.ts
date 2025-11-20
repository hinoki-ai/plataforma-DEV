import { NextResponse } from "next/server";
import { z } from "zod";

import { sendContactEmail } from "@/lib/email";
import { contactFormSchema } from "@/lib/validation/contact";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const data = contactFormSchema.parse(payload);

    const success = await sendContactEmail(data);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No fue posible enviar tu mensaje en este momento. Por favor inténtalo nuevamente en unos minutos.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          errors: error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Ocurrió un error inesperado al procesar tu mensaje.",
      },
      { status: 500 },
    );
  }
}
