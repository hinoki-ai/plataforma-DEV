import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acceso denegado - solo administradores" },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const number = formData.get("number") as string;

    if (!file || !type || !number) {
      return NextResponse.json(
        { error: "Archivo, tipo y número son requeridos" },
        { status: 400 },
      );
    }

    // Validar tipo de archivo
    if (
      ![
        "reglamento",
        "plan",
        "manual",
        "protocolo",
        "propuesta_tecnica",
      ].includes(type)
    ) {
      return NextResponse.json(
        { error: "Tipo de documento inválido" },
        { status: 400 },
      );
    }

    // Validar extensión
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Solo se permiten archivos PDF" },
        { status: 400 },
      );
    }

    // Validar tamaño (15MB máximo)
    const maxSize = 15 * 1024 * 1024; // 15MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "El archivo excede el tamaño máximo de 15MB" },
        { status: 400 },
      );
    }

    // Crear directorio si no existe
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Generar nombre de archivo
    const fileName = `${type}-${number}.pdf`;
    const filePath = path.join(uploadDir, fileName);

    // Guardar archivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      document: {
        id: uuidv4(),
        name: fileName,
        type,
        number: parseInt(number),
        url: `/uploads/${fileName}`,
        uploadDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: "Error al procesar el archivo" },
      { status: 500 },
    );
  }
}
