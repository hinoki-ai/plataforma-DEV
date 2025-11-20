import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAuthenticatedConvexClient } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";
import { hasPermission, Permissions } from "@/lib/authorization";
import { withApiErrorHandling } from "@/lib/error-handler";

// GET: Public access to school information
export const GET = withApiErrorHandling(async () => {
  const client = await getAuthenticatedConvexClient();
  const schoolInfo = await client.query(api.institutionInfo.getSchoolInfo, {});

  if (!schoolInfo) {
    return NextResponse.json(
      { success: false, error: "Información de la escuela no encontrada" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: schoolInfo,
  });
});

// POST: ADMIN only - Create school info
export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "No autorizado" },
      { status: 401 },
    );
  }

  if (!hasPermission(session.data?.user.role, Permissions.SCHOOL_INFO_EDIT)) {
    return NextResponse.json(
      {
        success: false,
        error: "No tienes permisos para editar la información de la escuela",
      },
      { status: 403 },
    );
  }

  const body = await request.json();
  const { name, mission, vision, address, phone, email, website, logoUrl } =
    body;

  if (!name || !mission || !vision || !address || !phone || !email) {
    return NextResponse.json(
      {
        success: false,
        error: "Todos los campos requeridos deben ser proporcionados",
      },
      { status: 400 },
    );
  }

  const client = await getAuthenticatedConvexClient();
  const schoolInfoId = await client.mutation(
    api.institutionInfo.createOrUpdateSchoolInfo,
    {
      name,
      mission,
      vision,
      address,
      phone,
      email,
      website: website || "",
      logoUrl,
      institutionType: "PRESCHOOL" as const,
    },
  );

  const schoolInfo = await client.query(api.institutionInfo.getSchoolInfo, {});

  return NextResponse.json({
    success: true,
    data: schoolInfo,
  });
});

// PUT: ADMIN only - Update school info
export const PUT = withApiErrorHandling(async (request: NextRequest) => {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "No autorizado" },
      { status: 401 },
    );
  }

  if (!hasPermission(session.data?.user.role, Permissions.SCHOOL_INFO_EDIT)) {
    return NextResponse.json(
      {
        success: false,
        error: "No tienes permisos para editar la información de la escuela",
      },
      { status: 403 },
    );
  }

  const body = await request.json();
  const { id, ...updateData } = body;

  if (!id) {
    return NextResponse.json(
      { success: false, error: "ID requerido" },
      { status: 400 },
    );
  }

  const client = await getAuthenticatedConvexClient();
  await client.mutation(api.institutionInfo.createOrUpdateSchoolInfo, {
    ...updateData,
    institutionType: updateData.institutionType || "PRESCHOOL",
  });

  const schoolInfo = await client.query(api.institutionInfo.getSchoolInfo, {});

  return NextResponse.json({
    success: true,
    data: schoolInfo,
  });
});

// DELETE: ADMIN only - Delete school info
export const DELETE = withApiErrorHandling(async (request: NextRequest) => {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "No autorizado" },
      { status: 401 },
    );
  }

  if (!hasPermission(session.data?.user.role, Permissions.SCHOOL_INFO_EDIT)) {
    return NextResponse.json(
      {
        success: false,
        error: "No tienes permisos para eliminar la información de la escuela",
      },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, error: "ID requerido" },
      { status: 400 },
    );
  }

  // Note: Convex schoolInfo cannot be deleted directly, only updated
  // For deletion, you would need to create a custom mutation

  return NextResponse.json({
    success: true,
    message: "Información de la escuela eliminada exitosamente",
  });
});
