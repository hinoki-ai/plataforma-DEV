import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission, Permissions } from "@/lib/authorization";
import { z } from "zod";
import {
  getClerkUserById,
  updateClerkUser,
  deleteClerkUser,
  type UpdateClerkUserData,
} from "@/services/actions/clerk-users";
import { hashUserPassword } from "@/lib/user-creation";
import { clerkClient } from "@clerk/nextjs/server";

export const runtime = "nodejs";

// Validation schemas
const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(["ADMIN", "PROFESOR", "PARENT"]).optional(),
  isActive: z.boolean().optional(),
});

const resetPasswordSchema = z.object({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// GET /api/admin/users/[id] - Get specific user (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session || session.data?.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await getClerkUserById(id);

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    // Map to expected structure
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      image: user.image,
      provider: user.provider,
      isOAuthUser: user.isOAuthUser,
      createdAt: user.createdAt.getTime(),
      updatedAt: user.updatedAt.getTime(),
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Error al obtener usuario" },
      { status: 500 },
    );
  }
}

// PUT /api/admin/users/[id] - Update user (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session || session.data?.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    // Prevent admin from demoting themselves
    if (
      id === session.data?.user.id &&
      validatedData.role &&
      validatedData.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "No puedes cambiar tu propio rol" },
        { status: 400 },
      );
    }

    const updateData: UpdateClerkUserData = {
      name: validatedData.name,
      role: validatedData.role,
      isActive: validatedData.isActive,
    };

    const user = await updateClerkUser(id, updateData);

    // Map to expected structure
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      image: user.image,
      provider: user.provider,
      isOAuthUser: user.isOAuthUser,
      createdAt: user.createdAt.getTime(),
      updatedAt: user.updatedAt.getTime(),
    };

    return NextResponse.json(userData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/users/[id] - Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session || session.data?.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Prevent admin from deleting themselves
    if (id === session.data?.user.id) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propia cuenta" },
        { status: 400 },
      );
    }

    const user = await getClerkUserById(id);

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    await deleteClerkUser(id);

    return NextResponse.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Error al eliminar usuario" },
      { status: 500 },
    );
  }
}

// POST /api/admin/users/[id]/reset-password - Reset user password (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session || session.data?.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { password } = resetPasswordSchema.parse(body);

    // Use Clerk to update password
    const client = await clerkClient();
    await client.users.updateUser(id, {
      password,
    });

    return NextResponse.json({
      message: "Contraseña restablecida exitosamente",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Contraseña inválida", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Error al restablecer contraseña" },
      { status: 500 },
    );
  }
}
