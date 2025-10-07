import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canAccessProfesor } from "@/lib/role-utils";

export const runtime = "nodejs";

// Educational resources data
const educationalResources = {
  digitalLibrary: {
    title: "Biblioteca Digital",
    description:
      "Accede a miles de libros, artículos científicos y recursos educativos digitales.",
    items: [
      {
        title: "Biblioteca Nacional Digital",
        description:
          "Recursos educativos gratuitos de la Biblioteca Nacional de Chile",
        url: "https://www.bibliotecanacionaldigital.cl/",
        type: "library",
      },
      {
        title: "Google Books",
        description: "Millones de libros disponibles para lectura y descarga",
        url: "https://books.google.com/",
        type: "library",
      },
      {
        title: "Project Gutenberg",
        description: "Libros clásicos en dominio público",
        url: "https://www.gutenberg.org/",
        type: "library",
      },
    ],
  },
  teachingMaterials: {
    title: "Materiales Didácticos",
    description:
      "Herramientas y materiales para el desarrollo de clases interactivas.",
    items: [
      {
        title: "Khan Academy",
        description: "Recursos educativos gratuitos para todas las materias",
        url: "https://es.khanacademy.org/",
        type: "educational",
      },
      {
        title: "TED-Ed",
        description: "Lecciones animadas sobre diversos temas",
        url: "https://ed.ted.com/",
        type: "videos",
      },
      {
        title: "Duolingo",
        description: "Aprendizaje de idiomas de forma interactiva",
        url: "https://www.duolingo.com/",
        type: "language",
      },
    ],
  },
  multimediaResources: {
    title: "Recursos Multimedia",
    description: "Videos, imágenes y contenido multimedia educativo.",
    items: [
      {
        title: "YouTube Education",
        description: "Canal oficial de YouTube con contenido educativo",
        url: "https://www.youtube.com/channel/UC6uOvU7nWJVEwqyE6VNXSaA",
        type: "videos",
      },
      {
        title: "Pixabay",
        description: "Imágenes y videos gratuitos para uso educativo",
        url: "https://pixabay.com/",
        type: "images",
      },
      {
        title: "Unsplash",
        description: "Fotografías de alta calidad gratuitas",
        url: "https://unsplash.com/",
        type: "images",
      },
    ],
  },
  pedagogicalTools: {
    title: "Herramientas Pedagógicas",
    description:
      "Herramientas digitales para mejorar el proceso de enseñanza-aprendizaje.",
    items: [
      {
        title: "Google Classroom",
        description: "Plataforma para gestionar clases y asignaciones",
        url: "https://classroom.google.com/",
        type: "tool",
      },
      {
        title: "Kahoot!",
        description: "Herramienta para crear quizzes interactivos",
        url: "https://kahoot.com/",
        type: "assessment",
      },
      {
        title: "Padlet",
        description: "Pizarras digitales colaborativas",
        url: "https://padlet.com/",
        type: "collaboration",
      },
    ],
  },
  assessments: {
    title: "Evaluaciones",
    description: "Herramientas para crear y gestionar evaluaciones.",
    items: [
      {
        title: "Google Forms",
        description: "Crear formularios y encuestas",
        url: "https://forms.google.com/",
        type: "assessment",
      },
      {
        title: "Quizizz",
        description: "Plataforma para crear quizzes interactivos",
        url: "https://quizizz.com/",
        type: "assessment",
      },
      {
        title: "Socrative",
        description: "Herramientas de evaluación en tiempo real",
        url: "https://www.socrative.com/",
        type: "assessment",
      },
    ],
  },
  community: {
    title: "Comunidad Educativa",
    description: "Conecta con otros educadores y comparte experiencias.",
    items: [
      {
        title: "Reddit r/education",
        description: "Comunidad de educadores y profesionales de la educación",
        url: "https://www.reddit.com/r/education/",
        type: "community",
      },
      {
        title: "Edmodo",
        description: "Red social para educadores y estudiantes",
        url: "https://www.edmodo.com/",
        type: "social",
      },
      {
        title: "Teachers Pay Teachers",
        description: "Mercado de recursos educativos creados por profesores",
        url: "https://www.teacherspayteachers.com/",
        type: "marketplace",
      },
    ],
  },
};

// GET /api/profesor/resources - Get educational resources
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.role) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Check if user can access profesor resources
    if (!canAccessProfesor(session.user.role)) {
      return NextResponse.json(
        {
          error: "No tienes permisos para acceder a estos recursos",
        },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    if (category && category in educationalResources) {
      return NextResponse.json({
        success: true,
        data: educationalResources[
          category as keyof typeof educationalResources
        ],
      });
    }

    // Return all resources if no category specified
    return NextResponse.json({
      success: true,
      data: educationalResources,
    });
  } catch (error) {
    console.error("Error fetching educational resources:", error);
    return NextResponse.json(
      { error: "Error al obtener recursos educativos" },
      { status: 500 },
    );
  }
}
