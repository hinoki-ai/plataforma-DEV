import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const teamMembers = [
  {
    name: "Dra. María González",
    title: "Psicóloga Educacional",
    description:
      "Especialista en desarrollo infantil y apoyo psicoeducativo. Trabaja con familias y niños para promover el bienestar emocional y el desarrollo integral.",
    specialties: [
      "Psicología Educacional",
      "Desarrollo Infantil",
      "Apoyo Familiar",
    ],
    imageUrl: "/icons/profesor-96x96.png",
    order: 1,
  },
  {
    name: "Prof. Carlos Rodríguez",
    title: "Fonoaudiólogo",
    description:
      "Especialista en comunicación y lenguaje. Apoya el desarrollo del habla y la comunicación en niños con necesidades especiales.",
    specialties: ["Fonoaudiología", "Comunicación", "Lenguaje"],
    imageUrl: "/icons/profesor-96x96.png",
    order: 2,
  },
  {
    name: "Lic. Ana Martínez",
    title: "Terapeuta Ocupacional",
    description:
      "Especialista en desarrollo de habilidades motoras y adaptativas. Ayuda a los niños a desarrollar independencia en actividades diarias.",
    specialties: [
      "Terapia Ocupacional",
      "Habilidades Motoras",
      "Independencia",
    ],
    imageUrl: "/icons/profesor-96x96.png",
    order: 3,
  },
  {
    name: "Dr. Luis Fernández",
    title: "Psicopedagogo",
    description:
      "Especialista en dificultades de aprendizaje. Diseña estrategias personalizadas para apoyar el desarrollo académico de cada niño.",
    specialties: [
      "Psicopedagogía",
      "Dificultades de Aprendizaje",
      "Estrategias Educativas",
    ],
    imageUrl: "/icons/profesor-96x96.png",
    order: 4,
  },
  {
    name: "Sra. Patricia Silva",
    title: "Asistente Social",
    description:
      "Apoya a las familias en el acceso a recursos y servicios comunitarios. Trabaja para fortalecer el vínculo entre la escuela y la familia.",
    specialties: ["Trabajo Social", "Apoyo Familiar", "Recursos Comunitarios"],
    imageUrl: "/icons/profesor-96x96.png",
    order: 5,
  },
];

async function seedTeamMembers() {
  try {
    console.log("🌱 Seeding team members...");

    const deploymentUrl = process.env.CONVEX_URL;
    if (!deploymentUrl) {
      throw new Error("CONVEX_URL environment variable is not set");
    }

    const client = new ConvexHttpClient(deploymentUrl);

    // Clear existing team members first
    const existingMembers = await client.query(
      api.teamMembers.getTeamMembers,
      {},
    );
    for (const member of existingMembers) {
      await client.mutation(api.teamMembers.deleteTeamMember, {
        id: member._id,
      });
    }

    // Create new team members
    for (const member of teamMembers) {
      await client.mutation(api.teamMembers.createTeamMember, member);
    }

    console.log("✅ Team members seeded successfully!");
    console.log(`📊 Created ${teamMembers.length} team members`);
  } catch (error) {
    console.error("❌ Error seeding team members:", error);
  }
}

seedTeamMembers();
