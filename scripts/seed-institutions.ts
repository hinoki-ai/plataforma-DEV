/**
 * Seed Institutions Script
 * Adds 10 diverse Chilean educational institutions to the database
 */

import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

interface InstitutionData {
  name: string;
  mission: string;
  vision: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  institutionType:
    | "PRESCHOOL"
    | "BASIC_SCHOOL"
    | "HIGH_SCHOOL"
    | "TECHNICAL_INSTITUTE"
    | "TECHNICAL_CENTER"
    | "UNIVERSITY";
}

const institutions: InstitutionData[] = [
  {
    name: "Jardín Infantil Los Pequeños Soñadores",
    mission:
      "Brindar educación preescolar de calidad que fomente el desarrollo integral de los niños en un ambiente seguro y amoroso.",
    vision:
      "Ser un referente en educación inicial que prepare a los niños para una transición exitosa hacia la educación básica.",
    address: "Av. Providencia 1234, Santiago, Región Metropolitana",
    phone: "+56 2 2345 6789",
    email: "contacto@pequenosssoadores.cl",
    website: "https://www.pequenosssoadores.cl",
    institutionType: "PRESCHOOL",
  },
  {
    name: "Colegio San Francisco de Asís",
    mission:
      "Formar integralmente a los estudiantes desde la educación básica, promoviendo valores cristianos y excelencia académica.",
    vision:
      "Ser una institución educativa líder que forme ciudadanos comprometidos con su comunidad y el desarrollo del país.",
    address: "Calle San Francisco 567, Viña del Mar, Región de Valparaíso",
    phone: "+56 32 2345 6789",
    email: "info@sanfrancisco.cl",
    website: "https://www.sanfrancisco.cl",
    institutionType: "BASIC_SCHOOL",
  },
  {
    name: "Liceo Nacional José Manuel Balmaceda",
    mission:
      "Proporcionar educación secundaria de calidad que prepare a los jóvenes para la educación superior y el mundo laboral.",
    vision:
      "Formar líderes éticos y competentes que contribuyan al progreso de Chile.",
    address: "Av. Balmaceda 890, Concepción, Región del Biobío",
    phone: "+56 41 2345 6789",
    email: "liceobalmaceda@liceos.cl",
    website: "https://www.liceobalmaceda.cl",
    institutionType: "HIGH_SCHOOL",
  },
  {
    name: "Escuela Básica República de Chile",
    mission:
      "Ofrecer educación básica inclusiva que promueva el aprendizaje significativo y el desarrollo de habilidades para la vida.",
    vision:
      "Ser una escuela modelo que garantice educación de calidad para todos los niños de la comunidad.",
    address: "Calle República 1122, La Serena, Región de Coquimbo",
    phone: "+56 51 2345 6789",
    email: "contacto@escuelarepublica.cl",
    website: "https://www.escuelarepublica.cl",
    institutionType: "BASIC_SCHOOL",
  },
  {
    name: "Centro de Formación Técnica INACAP Santiago",
    mission:
      "Entregar formación técnica de excelencia que responda a las necesidades del mercado laboral nacional e internacional.",
    vision:
      "Ser el referente en formación técnica profesional que impulse el desarrollo económico y social de Chile.",
    address: "Av. Vitacura 12901, Santiago, Región Metropolitana",
    phone: "+56 2 3456 7890",
    email: "admisión@inacap.cl",
    website: "https://www.inacap.cl",
    institutionType: "UNIVERSITY",
  },
  {
    name: "Jardín Infantil Mi Primer Paso",
    mission:
      "Acompañar el desarrollo temprano de los niños a través de experiencias educativas lúdicas y significativas.",
    vision:
      "Crear las bases sólidas para que cada niño alcance su máximo potencial desde sus primeros años.",
    address: "Calle Los Aromos 456, Temuco, Región de La Araucanía",
    phone: "+56 45 2345 6789",
    email: "info@primerpaso.cl",
    website: "https://www.primerpaso.cl",
    institutionType: "PRESCHOOL",
  },
  {
    name: "Colegio Santa María de Los Ángeles",
    mission:
      "Educar con valores cristianos, promoviendo el desarrollo académico, espiritual y social de nuestros estudiantes.",
    vision:
      "Formar personas íntegras que sean luz en la sociedad y contribuyan al bien común.",
    address: "Av. Los Ángeles 789, Los Ángeles, Región del Biobío",
    phone: "+56 43 2345 6789",
    email: "colegio@santamaria.cl",
    website: "https://www.santamariadelosangeles.cl",
    institutionType: "BASIC_SCHOOL",
  },
  {
    name: "Liceo Politécnico Arturo Prat",
    mission:
      "Proporcionar educación técnico-profesional que combine formación académica con preparación laboral especializada.",
    vision:
      "Ser un liceo técnico líder que forme profesionales competentes y emprendedores.",
    address: "Calle Prat 1011, Iquique, Región de Tarapacá",
    phone: "+56 57 2345 6789",
    email: "liceoprat@liceos.cl",
    website: "https://www.liceoprat.cl",
    institutionType: "HIGH_SCHOOL",
  },
  {
    name: "Escuela Básica Gabriela Mistral",
    mission:
      "Fomentar el aprendizaje significativo y el desarrollo de competencias que permitan a los estudiantes enfrentar los desafíos del siglo XXI.",
    vision:
      "Ser una institución educativa innovadora que inspire y motive a sus estudiantes a ser ciudadanos activos y responsables.",
    address:
      "Av. Mistral 1213, Rancagua, Región del Libertador Bernardo O'Higgins",
    phone: "+56 72 2345 6789",
    email: "escuela@gabrielamistral.cl",
    website: "https://www.gabrielamistral.cl",
    institutionType: "BASIC_SCHOOL",
  },
  {
    name: "Centro de Formación Técnica DUOC UC",
    mission:
      "Ofrecer formación técnica superior de calidad que integre teoría y práctica para formar profesionales competentes.",
    vision:
      "Ser el centro de formación técnica más innovador y conectado con el mundo laboral chileno.",
    address: "Av. Plaza 680, Santiago, Región Metropolitana",
    phone: "+56 2 4567 8901",
    email: "admision@duoc.cl",
    website: "https://www.duoc.cl",
    institutionType: "UNIVERSITY",
  },
];

async function seedInstitutions() {
  console.log("🌱 Starting institutions seeding...");

  try {
    const client = getConvexClient();

    // Check if institutions already exist
    const existingInstitutions = await client.query(
      api.institutionInfo.getAllInstitutions,
      {},
    );
    if (existingInstitutions.length > 1) {
      // More than just the demo one
      console.log(
        "⚠️ Institutions already exist in database. Skipping seeding.",
      );
      console.log(`Found ${existingInstitutions.length} institutions.`);
      return;
    }

    console.log("📚 Creating 10 diverse Chilean educational institutions...");

    for (const institution of institutions) {
      try {
        const institutionId = await client.mutation(
          api.institutionInfo.createInstitution,
          institution,
        );
        console.log(
          `✅ Created: ${institution.name} (${institution.institutionType})`,
        );
      } catch (error) {
        console.error(`❌ Failed to create ${institution.name}:`, error);
      }
    }

    console.log("🎉 Successfully seeded 10 institutions!");

    // Verify the institutions were created
    const allInstitutions = await client.query(
      api.institutionInfo.getAllInstitutions,
      {},
    );
    console.log(`📊 Total institutions in database: ${allInstitutions.length}`);

    const institutionsByType = allInstitutions.reduce(
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
    console.error("❌ Error seeding institutions:", error);
    process.exit(1);
  }
}

// Run the seeding function
seedInstitutions().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
