import { NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

export const runtime = "nodejs";

/**
 * GET /api/institutions - Get all active institutions
 */
export async function GET() {
  try {
    const client = getConvexClient();
    const institutions = await client.query(
      api.schoolInfo.getAllInstitutions,
      {},
    );

    // Map to simplified structure for frontend
    const mappedInstitutions = institutions.map((inst) => ({
      _id: inst._id,
      name: inst.name,
      institutionType: inst.institutionType,
      address: inst.address,
    }));

    return NextResponse.json(
      { success: true, institutions: mappedInstitutions },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching institutions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch institutions" },
      { status: 500 },
    );
  }
}
