/**
 * Check current institutions in database
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;
if (!CONVEX_URL) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL is not set");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function checkInstitutions() {
  try {
    const institutions = await client.query(
      api.institutionInfo.getAllInstitutions,
      {},
    );
    console.log("📚 Current institutions in database:");
    institutions.forEach((inst) =>
      console.log(`- ${inst.name} (${inst.institutionType})`),
    );
    console.log(`📊 Total: ${institutions.length}`);

    const institutionsByType = institutions.reduce(
      (acc, inst) => {
        acc[inst.institutionType] = (acc[inst.institutionType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log("📈 Institutions by type:");
    Object.entries(institutionsByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
  } catch (error) {
    console.error("❌ Error checking institutions:", error);
    process.exit(1);
  }
}

checkInstitutions();
