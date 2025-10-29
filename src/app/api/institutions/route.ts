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
      api.institutionInfo.getAllInstitutions,
      {},
    );

    // Fallback institutions if database is empty
    const fallbackInstitutions = [
      {
        _id: "real-1",
        name: "Escuela Especial de Lenguaje Manitos Pintadas",
        institutionType: "PRESCHOOL",
        address: "Anibal Pinto Nº 160, Los Sauces, Chile",
      },
      {
        _id: "fallback-1",
        name: "Jardín Infantil Los Pequeños Soñadores",
        institutionType: "PRESCHOOL",
        address: "Av. Providencia 1234, Santiago, Región Metropolitana",
      },
      {
        _id: "fallback-2",
        name: "Colegio San Francisco de Asís",
        institutionType: "BASIC_SCHOOL",
        address: "Calle San Francisco 567, Viña del Mar, Región de Valparaíso",
      },
      {
        _id: "fallback-3",
        name: "Liceo Nacional José Manuel Balmaceda",
        institutionType: "HIGH_SCHOOL",
        address: "Av. Balmaceda 890, Concepción, Región del Biobío",
      },
      {
        _id: "fallback-4",
        name: "Escuela Básica República de Chile",
        institutionType: "BASIC_SCHOOL",
        address: "Calle República 1122, La Serena, Región de Coquimbo",
      },
      {
        _id: "fallback-5",
        name: "Centro de Formación Técnica INACAP Santiago",
        institutionType: "COLLEGE",
        address: "Av. Vitacura 12901, Santiago, Región Metropolitana",
      },
      {
        _id: "fallback-6",
        name: "Jardín Infantil Mi Primer Paso",
        institutionType: "PRESCHOOL",
        address: "Calle Los Aromos 456, Temuco, Región de La Araucanía",
      },
      {
        _id: "fallback-7",
        name: "Colegio Santa María de Los Ángeles",
        institutionType: "BASIC_SCHOOL",
        address: "Av. Los Ángeles 789, Los Ángeles, Región del Biobío",
      },
      {
        _id: "fallback-8",
        name: "Liceo Politécnico Arturo Prat",
        institutionType: "HIGH_SCHOOL",
        address: "Calle Prat 1011, Iquique, Región de Tarapacá",
      },
      {
        _id: "fallback-9",
        name: "Escuela Básica Gabriela Mistral",
        institutionType: "BASIC_SCHOOL",
        address: "Av. Mistral 1213, Rancagua, Región del Libertador Bernardo O'Higgins",
      },
      {
        _id: "fallback-10",
        name: "Centro de Formación Técnica DUOC UC",
        institutionType: "COLLEGE",
        address: "Av. Plaza 680, Santiago, Región Metropolitana",
      },
    ];

    // Map to simplified structure for frontend
    const mappedInstitutions = institutions.map((inst) => ({
      _id: inst._id,
      name: inst.name,
      institutionType: inst.institutionType,
      address: inst.address,
    }));

    // Use database institutions if available, otherwise use fallbacks
    const finalInstitutions = mappedInstitutions.length > 0
      ? mappedInstitutions
      : fallbackInstitutions;

    return NextResponse.json(
      { success: true, institutions: finalInstitutions },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching institutions:", error);

    // Return fallback institutions even on error
    const fallbackInstitutions = [
      {
        _id: "real-1",
        name: "Escuela Especial de Lenguaje Manitos Pintadas",
        institutionType: "PRESCHOOL",
        address: "Anibal Pinto Nº 160, Los Sauces, Chile",
      },
      {
        _id: "fallback-2",
        name: "Colegio San Francisco de Asís",
        institutionType: "BASIC_SCHOOL",
        address: "Calle San Francisco 567, Viña del Mar, Región de Valparaíso",
      },
      {
        _id: "fallback-3",
        name: "Liceo Nacional José Manuel Balmaceda",
        institutionType: "HIGH_SCHOOL",
        address: "Av. Balmaceda 890, Concepción, Región del Biobío",
      },
      {
        _id: "fallback-4",
        name: "Escuela Básica República de Chile",
        institutionType: "BASIC_SCHOOL",
        address: "Calle República 1122, La Serena, Región de Coquimbo",
      },
      {
        _id: "fallback-5",
        name: "Centro de Formación Técnica INACAP Santiago",
        institutionType: "COLLEGE",
        address: "Av. Vitacura 12901, Santiago, Región Metropolitana",
      },
      {
        _id: "fallback-6",
        name: "Jardín Infantil Mi Primer Paso",
        institutionType: "PRESCHOOL",
        address: "Calle Los Aromos 456, Temuco, Región de La Araucanía",
      },
      {
        _id: "fallback-7",
        name: "Colegio Santa María de Los Ángeles",
        institutionType: "BASIC_SCHOOL",
        address: "Av. Los Ángeles 789, Los Ángeles, Región del Biobío",
      },
      {
        _id: "fallback-8",
        name: "Liceo Politécnico Arturo Prat",
        institutionType: "HIGH_SCHOOL",
        address: "Calle Prat 1011, Iquique, Región de Tarapacá",
      },
      {
        _id: "fallback-9",
        name: "Escuela Básica Gabriela Mistral",
        institutionType: "BASIC_SCHOOL",
        address: "Av. Mistral 1213, Rancagua, Región del Libertador Bernardo O'Higgins",
      },
      {
        _id: "fallback-10",
        name: "Centro de Formación Técnica DUOC UC",
        institutionType: "COLLEGE",
        address: "Av. Plaza 680, Santiago, Región Metropolitana",
      },
    ];

    return NextResponse.json(
      { success: true, institutions: fallbackInstitutions },
      { status: 200 },
    );
  }
}
