import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

/**
 * Public API endpoint to get latest CPA documents
 * This endpoint is public and doesn't require authentication
 * Returns the latest reglamento and propuesta_tecnica PDFs
 */
export async function GET(request: NextRequest) {
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const files = await fs.readdir(uploadDir).catch(() => []);

    // Find latest reglamento
    const reglamentos = files
      .filter((file) => file.startsWith("reglamento-") && file.endsWith(".pdf"))
      .map((file) => {
        const match = file.match(/^reglamento-(\d+)\.pdf$/);
        if (!match) return null;
        return {
          number: parseInt(match[1]),
          file,
          url: `/uploads/${file}`,
        };
      })
      .filter(
        (item): item is { number: number; file: string; url: string } =>
          item !== null,
      )
      .sort((a, b) => b.number - a.number); // Sort descending to get latest

    // Find latest propuesta_tecnica
    const propuestas = files
      .filter(
        (file) =>
          file.startsWith("propuesta_tecnica-") && file.endsWith(".pdf"),
      )
      .map((file) => {
        const match = file.match(/^propuesta_tecnica-(\d+)\.pdf$/);
        if (!match) return null;
        return {
          number: parseInt(match[1]),
          file,
          url: `/uploads/${file}`,
        };
      })
      .filter(
        (item): item is { number: number; file: string; url: string } =>
          item !== null,
      )
      .sort((a, b) => b.number - a.number); // Sort descending to get latest

    return NextResponse.json({
      success: true,
      documents: {
        reglamento: reglamentos.length > 0 ? reglamentos[0] : null,
        propuesta_tecnica: propuestas.length > 0 ? propuestas[0] : null,
      },
    });
  } catch (error) {
    console.error("Error fetching CPA documents:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener documentos",
        documents: {
          reglamento: null,
          propuesta_tecnica: null,
        },
      },
      { status: 500 },
    );
  }
}
