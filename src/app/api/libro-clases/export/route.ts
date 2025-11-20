/**
 * API Route for Libro de Clases PDF Export
 * Handles PDF generation for libro de clases reports
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  generateLibroClasesPDF,
  type LibroClasesData,
} from "@/lib/pdf-libro-clases";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { courseId, startDate, endDate, period, scope, studentId } = body;

    if (!courseId && !studentId) {
      return NextResponse.json(
        { error: "Either courseId or studentId is required" },
        { status: 400 },
      );
    }

    // Fetch libro de clases data from Convex
    let libroData: LibroClasesData;

    if (scope === "student") {
      return NextResponse.json(
        { error: "Student scoped exports are not supported yet" },
        { status: 400 },
      );
    }

    if (courseId) {
      // Get course-specific data
      libroData = (await convex.query(
        api.libroClasesExport.getLibroClasesForExport,
        {
          courseId,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          period: period || undefined,
        },
      )) as LibroClasesData;
    } else {
      return NextResponse.json(
        { error: "Invalid export scope" },
        { status: 400 },
      );
    }

    // Generate PDF
    const pdfBuffer = await generateLibroClasesPDF(libroData);

    const pdfData = new Uint8Array(pdfBuffer);

    // Return PDF as response
    return new NextResponse(pdfData, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="libro-clases-${Date.now()}.pdf"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate PDF" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: "Use POST method to export libro de clases" },
    { status: 405 },
  );
}
