import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  try {
    if (!JWT_SECRET) {
      return NextResponse.redirect(
        new URL("/login?error=configuration", request.url),
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
    };

    const client = getConvexClient();

    // Find user
    const user = await client.query(api.users.getUserByEmail, {
      email: decoded.email,
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/login?error=invalid", request.url),
      );
    }

    // Create session
    if (!JWT_SECRET) {
      return NextResponse.redirect(
        new URL("/login?error=configuration", request.url),
      );
    }

    const sessionToken = jwt.sign(
      {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      JWT_SECRET,
      { expiresIn: "365d" }, // Permanent session
    );

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("authjs.session-token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });

    // Redirect based on role
    const redirectUrl =
      user.role === "ADMIN"
        ? "/admin"
        : user.role === "PROFESOR"
          ? "/profesor"
          : "/cpma";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    // Production: Silently handle magic login errors
    return NextResponse.redirect(new URL("/login?error=expired", request.url));
  }
}
