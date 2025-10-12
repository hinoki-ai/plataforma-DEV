import { NextResponse } from "next/server";
import { registerParentComplete } from "@/services/actions/unified-registration";
import {
  checkRateLimit,
  getRateLimitHeaders,
  RATE_LIMITS,
} from "@/lib/rate-limiter";
import { sanitizeFormData, SANITIZATION_SCHEMAS } from "@/lib/sanitization";

export async function POST(request: Request) {
  try {
    // Rate limiting for registration attempts
    if (
      checkRateLimit(
        request,
        RATE_LIMITS.AUTH_ACTIONS.limit,
        RATE_LIMITS.AUTH_ACTIONS.windowMs,
        "register",
      )
    ) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(
            request,
            RATE_LIMITS.AUTH_ACTIONS.limit,
            RATE_LIMITS.AUTH_ACTIONS.windowMs,
            "register",
          ),
        },
      );
    }

    const formData = await request.formData();
    // Sanitize form data before processing
    const sanitizedData = sanitizeFormData(
      formData,
      SANITIZATION_SCHEMAS.USER_PROFILE,
    );

    // Extract all form fields for complete parent registration
    const data = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      rut: formData.get("rut") as string,
      childName: formData.get("childName") as string,
      childGrade: formData.get("childGrade") as string,
      relationship: formData.get("relationship") as string,
      address: formData.get("address") as string,
      region: formData.get("region") as string,
      comuna: formData.get("comuna") as string,
      emergencyContact: formData.get("emergencyContact") as string,
      emergencyPhone: formData.get("emergencyPhone") as string,
      password: formData.get("password") as string | undefined,
      provider: formData.get("provider") as string | undefined,
      isOAuthUser: formData.get("provider") ? true : false,
    };

    // Validate required fields
    const requiredFields = [
      "fullName", "email", "phone", "rut", "childName", "childGrade",
      "relationship", "address", "region", "comuna", "emergencyContact", "emergencyPhone"
    ];
    
    for (const field of requiredFields) {
      if (!data[field as keyof typeof data]) {
        return NextResponse.json(
          { success: false, error: `Campo requerido faltante: ${field}` },
          { status: 400 }
        );
      }
    }

    const result = await registerParentComplete(data);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
