/**
 * School Info Queries - Convex Implementation
 */

import { getConvexClient } from "@/lib/convex";
import { api } from "../../../convex/_generated/api";

export async function getSchoolInfo() {
  try {
    const client = getConvexClient();
    const info = await client.query(api.schoolInfo.getSchoolInfo, {});

    if (!info) {
      return { success: false, error: "Información escolar no encontrada" };
    }

    return { success: true, data: info };
  } catch (error) {
    console.error("Failed to fetch school info:", error);
    return {
      success: false,
      error: "No se pudo cargar la información escolar",
    };
  }
}
