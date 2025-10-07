import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import { Logger } from "@/lib/logger";
import { z } from "zod";

const logger = Logger.getInstance("PasswordChange");

// Rate limiting storage (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Validation schema
const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(128, "Password must be less than 128 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number",
      ),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Rate limiting function
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + WINDOW_MS });
    return true;
  }

  if (userLimit.count >= MAX_ATTEMPTS) {
    return false;
  }

  userLimit.count++;
  return true;
}

// Password strength validation (basic - in production, use zxcvbn or similar)
function isPasswordStrong(password: string): boolean {
  // Check for common weak passwords
  const commonPasswords = [
    "password",
    "123456",
    "123456789",
    "qwerty",
    "abc123",
    "password123",
    "admin",
    "letmein",
    "welcome",
    "monkey",
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    return false;
  }

  // Check for sequential characters
  if (/(.)\1{2,}/.test(password)) {
    return false; // Repeated characters
  }

  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await auth();
    if (!session?.user?.id) {
      logger.warn("Unauthorized password change attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Rate limiting check
    if (!checkRateLimit(userId)) {
      logger.warn("Rate limit exceeded for password change", { userId });
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 },
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const validationResult = passwordChangeSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn("Password change validation failed", {
        userId,
        errors: validationResult.error.issues,
      });
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

    // Additional password strength check
    if (!isPasswordStrong(newPassword)) {
      logger.warn("Weak password detected", { userId });
      return NextResponse.json(
        {
          error: "Password is too weak. Please choose a stronger password.",
        },
        { status: 400 },
      );
    }

    // Fetch user with password
    const client = getConvexClient();
    const user = await client.query(api.users.getUserById, {
      userId: userId as any,
    });

    if (!user) {
      logger.error("User not found", { userId });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.password) {
      logger.warn(
        "Password change attempted for user without password (likely OAuth)",
        { userId },
      );
      return NextResponse.json(
        { error: "Password change is not available for this account type" },
        { status: 400 },
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      logger.warn("Invalid current password for password change", { userId });

      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      );
    }

    // Check if new password is different from current
    const isSamePassword = await verifyPassword(newPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { error: "New password must be different from current password" },
        { status: 400 },
      );
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password and log the change
    await client.mutation(api.users.updateUser, {
      id: userId as any,
      password: hashedNewPassword,
    });

    const updatedUser = await client.query(api.users.getUserById, {
      userId: userId as any,
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found after update" },
        { status: 404 },
      );
    }

    // Clear rate limit on successful change
    rateLimitStore.delete(userId);

    // Log successful password change
    logger.info("Password changed successfully", {
      userId,
      email: user.email,
      role: user.role,
    });

    // Note: Session cleanup is handled by NextAuth automatically

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    logger.error("Password change error", { error });

    // Don't expose internal errors
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET endpoint for password policy information
export async function GET() {
  return NextResponse.json({
    policy: {
      minLength: 8,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false, // Made optional for better UX
      preventCommonPasswords: true,
      preventSequentialChars: true,
    },
    rateLimit: {
      maxAttempts: MAX_ATTEMPTS,
      windowMinutes: WINDOW_MS / (60 * 1000),
    },
  });
}
