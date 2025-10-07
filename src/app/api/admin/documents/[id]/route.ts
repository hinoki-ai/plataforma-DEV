import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acceso denegado - solo administradores" },
        { status: 403 },
      );
    }

    // Aquí normalmente buscarías el documento en la base de datos
    // Por ahora, simplemente devolvemos éxito

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Error al eliminar el documento" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    // Listar documentos existentes
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const files = await fs.readdir(uploadDir).catch(() => []);

    const documents = files
      .filter((file) => file.endsWith(".pdf"))
      .map((file) => {
        const match = file.match(
          /^(reglamento|plan|manual|protocolo)-(\d+)\.pdf$/,
        );
        if (!match) return null;

        return {
          id: file,
          name: file,
          type: match[1],
          number: parseInt(match[2]),
          url: `/uploads/${file}`,
          uploadDate: null,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error listing documents:", error);
    return NextResponse.json(
      { error: "Error al listar documentos" },
      { status: 500 },
    );
  }
}
