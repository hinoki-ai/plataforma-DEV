/**
 * Add Real Institution Script
 * Adds the actual "Escuela Especial de Lenguaje Plataforma Astral" to the database
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;
if (!CONVEX_URL) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL is not set");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

const realInstitution = {
  name: "Escuela Especial de Lenguaje Plataforma Astral",
  mission:
    "Queremos que cada niño y niña crezca feliz, aprenda y se desarrolle en un ambiente de respeto y cariño. Buscamos que todos puedan aprender, convivir y prepararse para la vida, valorando siempre la alegría y la sencillez.",
  vision:
    "Soñamos con ser una escuelita reconocida por su trabajo en equipo, donde cada estudiante es valorado y apoyado. Queremos que nuestros estudiantes sean personas responsables, creativas y alegres, preparadas para aportar a su comunidad y al mundo.",
  address: "Anibal Pinto Nº 160, Los Sauces, Chile",
  phone: "+56 45 278 3486",
  email: "contacto@plataformaastral.cl",
  website: "https://plataforma-astral.vercel.app",
  institutionType: "PRESCHOOL" as const, // For children 3-6 years old
};

async function addRealInstitution() {
  console.log(
    "🏫 Adding real institution: Escuela Especial de Lenguaje Plataforma Astral",
  );

  try {
    // Check if institution already exists
    const existingInstitutions = await client.query(
      api.institutionInfo.getAllInstitutions,
      {},
    );
    const existingNames = existingInstitutions.map((inst) =>
      inst.name.toLowerCase(),
    );

    if (existingNames.includes(realInstitution.name.toLowerCase())) {
      console.log("⚠️ Institution already exists in database");
      return;
    }

    // Create the institution
    const result = await client.mutation(
      api.institutionInfo.createInstitution,
      realInstitution,
    );

    console.log("✅ Successfully created real institution!");
    console.log(`📝 Name: ${realInstitution.name}`);
    console.log(`🏢 Type: ${realInstitution.institutionType}`);
    console.log(`📍 Address: ${realInstitution.address}`);
    console.log(`📧 Email: ${realInstitution.email}`);
    console.log(`🌐 Website: ${realInstitution.website}`);

    // Verify it was created
    const allInstitutions = await client.query(
      api.institutionInfo.getAllInstitutions,
      {},
    );
    console.log(`📊 Total institutions in database: ${allInstitutions.length}`);
  } catch (error) {
    console.error("❌ Failed to create institution:", error);
    process.exit(1);
  }
}

addRealInstitution();
