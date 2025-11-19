/**
 * Add Manitos Pintadas Institution Script
 * Adds the "Manitos Pintadas" institution to the database
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;
if (!CONVEX_URL) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL is not set");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

const manitosPintadasInstitution = {
  name: "Manitos Pintadas",
  mission:
    "Brindar educación preescolar de calidad que fomente el desarrollo integral de los niños y niñas en un ambiente seguro, amoroso y estimulante.",
  vision:
    "Ser reconocidos como una institución educativa que prepara a los niños y niñas para una transición exitosa hacia la educación básica, desarrollando sus potencialidades y habilidades sociales.",
  address: "Dirección a configurar",
  phone: "Teléfono a configurar",
  email: "contacto@manitospintadas.cl",
  website: "https://plataforma-astral.vercel.app",
  institutionType: "PRESCHOOL" as const,
};

async function addManitosPintadas() {
  console.log("🏫 Adding institution: Manitos Pintadas");

  try {
    // Check if institution already exists
    const existingInstitutions = await client.query(
      api.institutionInfo.getAllInstitutions,
      {},
    );
    const existingNames = existingInstitutions.map((inst) =>
      inst.name.toLowerCase(),
    );

    if (existingNames.includes(manitosPintadasInstitution.name.toLowerCase())) {
      console.log(
        "⚠️ Institution 'Manitos Pintadas' already exists in database",
      );
      const existing = existingInstitutions.find(
        (inst) =>
          inst.name.toLowerCase() ===
          manitosPintadasInstitution.name.toLowerCase(),
      );
      if (existing) {
        console.log(`📝 Existing institution ID: ${existing._id}`);
        console.log(`📍 Address: ${existing.address}`);
        console.log(`📧 Email: ${existing.email}`);
      }
      return existing?._id;
    }

    // Create the institution
    const institutionId = await client.mutation(
      api.institutionInfo.createInstitution,
      manitosPintadasInstitution,
    );

    console.log("✅ Successfully created 'Manitos Pintadas' institution!");
    console.log(`📝 Name: ${manitosPintadasInstitution.name}`);
    console.log(`🏢 Type: ${manitosPintadasInstitution.institutionType}`);
    console.log(`📍 Address: ${manitosPintadasInstitution.address}`);
    console.log(`📧 Email: ${manitosPintadasInstitution.email}`);
    console.log(`🌐 Website: ${manitosPintadasInstitution.website}`);
    console.log(`🆔 Institution ID: ${institutionId}`);

    // Verify it was created
    const allInstitutions = await client.query(
      api.institutionInfo.getAllInstitutions,
      {},
    );
    console.log(`📊 Total institutions in database: ${allInstitutions.length}`);

    // List all institutions
    console.log("\n📋 All institutions:");
    allInstitutions.forEach((inst) => {
      console.log(
        `  - ${inst.name} (${inst.institutionType}) - ID: ${inst._id}`,
      );
    });

    return institutionId;
  } catch (error) {
    console.error("❌ Failed to create institution:", error);
    process.exit(1);
  }
}

addManitosPintadas();
