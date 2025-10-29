/**
 * 🎓 Educational System Configuration API
 * Handles institution type configuration for the school management system
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/server-auth";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { EducationalInstitutionType } from "@/lib/educational-system";

// GET /api/educational-system - Fetch current institution configuration
export async function GET() {
  try {
    const client = getConvexClient();

    // Get current institution configuration from school info
    const schoolInfo = await client.query(
      api.institutionInfo.getSchoolInfo,
      {},
    );

    if (!schoolInfo) {
      // Return default configuration if no school info exists
      return NextResponse.json({
        success: true,
        institutionType: "PRESCHOOL" as EducationalInstitutionType,
        message: "Using default preschool configuration",
      });
    }

    return NextResponse.json({
      success: true,
      institutionType: schoolInfo.institutionType,
      supportedLevels: schoolInfo.supportedLevels,
      customGrades: schoolInfo.customGrades,
      customSubjects: schoolInfo.customSubjects,
      educationalConfig: schoolInfo.educationalConfig,
      message: "Institution configuration retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching educational system configuration:", error);

    // Return default configuration on error
    return NextResponse.json({
      success: true,
      institutionType: "PRESCHOOL" as EducationalInstitutionType,
      message: "Using default configuration due to system error",
    });
  }
}

// POST /api/educational-system - Update institution configuration
export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin permissions
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required. Please log in as an administrator.",
        },
        { status: 401 },
      );
    }

    // Check if user is admin or master
    if (!["ADMIN", "MASTER"].includes(session.user.role)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Insufficient permissions. Only administrators can modify institution configuration.",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { institutionType } = body;

    // Validate institution type
    if (
      !institutionType ||
      ![
        "PRESCHOOL",
        "BASIC_SCHOOL",
        "HIGH_SCHOOL",
        "TECHNICAL_INSTITUTE",
        "TECHNICAL_CENTER",
        "UNIVERSITY",
      ].includes(institutionType)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid institution type. Must be one of: PRESCHOOL, BASIC_SCHOOL, HIGH_SCHOOL, TECHNICAL_INSTITUTE, TECHNICAL_CENTER, UNIVERSITY",
        },
        { status: 400 },
      );
    }

    const client = getConvexClient();

    // Update or create school info with new institution type
    await client.mutation(api.institutionInfo.createOrUpdateSchoolInfo, {
      name: "Manitos Pintadas Educational Institution",
      mission: "Educating and nurturing young minds",
      vision: "A leading educational institution in our community",
      address: "To be configured",
      phone: "To be configured",
      email: "To be configured",
      website: "To be configured",
      institutionType: institutionType as EducationalInstitutionType,
      supportedLevels: [],
      customGrades: [],
      customSubjects: [],
      educationalConfig: {},
    });

    return NextResponse.json({
      success: true,
      institutionType: institutionType,
      message: `Institution type successfully updated to ${institutionType}`,
    });
  } catch (error) {
    console.error("Error updating educational system configuration:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update institution configuration. Please try again.",
      },
      { status: 500 },
    );
  }
}
