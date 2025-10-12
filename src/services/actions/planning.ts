/**
 * Planning Document Actions (Mutations) - Convex Implementation
 */

import { getConvexClient } from "@/lib/convex";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export async function createPlanningDocument(data: {
  title: string;
  content: string;
  subject: string;
  grade: string;
  authorId: string;
  attachments?: Array<{ name: string; url: string }>;
}) {
  try {
    const client = getConvexClient();

    const docId = await client.mutation(api.planning.createPlanningDocument, {
      ...data,
      authorId: data.authorId as Id<"users">,
    });

    return { success: true, data: { id: docId } };
  } catch (error) {
    console.error("Failed to create planning document:", error);
    return { success: false, error: "No se pudo crear el documento" };
  }
}

export async function updatePlanningDocument(
  id: string,
  data: {
    title?: string;
    content?: string;
    subject?: string;
    grade?: string;
    attachments?: Array<{ name: string; url: string }>;
  },
) {
  try {
    const client = getConvexClient();

    await client.mutation(api.planning.updatePlanningDocument, {
      id: id as Id<"planningDocuments">,
      ...data,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update planning document:", error);
    return { success: false, error: "No se pudo actualizar el documento" };
  }
}

export async function deletePlanningDocument(id: string) {
  try {
    const client = getConvexClient();
    await client.mutation(api.planning.deletePlanningDocument, {
      id: id as Id<"planningDocuments">,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to delete planning document:", error);
    return { success: false, error: "No se pudo eliminar el documento" };
  }
}

// Template functions for planning documents
export interface PlanningTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  grade: string;
  template: {
    title: string;
    content: string;
  };
}

export const PLANNING_TEMPLATES: PlanningTemplate[] = [
  {
    id: "lesson-plan-basic",
    name: "Plan de Clase Básico",
    description: "Plantilla básica para planificar una clase",
    subject: "General",
    grade: "General",
    template: {
      title: "Plan de Clase",
      content: `# Plan de Clase

## Objetivos de Aprendizaje
- Objetivo 1
- Objetivo 2

## Materiales Necesarios
- Material 1
- Material 2

## Desarrollo de la Clase
### Introducción (10 min)
Contenido de introducción

### Desarrollo Principal (30 min)
Contenido principal de la clase

### Cierre (10 min)
Conclusión y evaluación

## Evaluación
Criterios de evaluación`,
    },
  },
  {
    id: "math-lesson",
    name: "Lección de Matemáticas",
    description: "Plantilla específica para clases de matemáticas",
    subject: "Mathematics",
    grade: "General",
    template: {
      title: "Lección de Matemáticas",
      content: `# Lección de Matemáticas

## Tema
[Tema de la lección]

## Objetivos
- Comprender [concepto]
- Aplicar [técnica/habilidad]

## Ejercicios
### Ejercicio 1
[Descripción del ejercicio]

### Ejercicio 2
[Descripción del ejercicio]

## Problemas de Aplicación
[Problemas del mundo real]`,
    },
  },
  {
    id: "science-experiment",
    name: "Experimento Científico",
    description: "Plantilla para experimentos de ciencias",
    subject: "Science",
    grade: "General",
    template: {
      title: "Experimento Científico",
      content: `# Experimento Científico

## Hipótesis
[¿Qué crees que sucederá?]

## Materiales
- [Lista de materiales]

## Procedimiento
1. Paso 1
2. Paso 2
3. Paso 3

## Observaciones
[Qué observaste durante el experimento]

## Conclusión
[¿Qué aprendiste? ¿Se confirmó tu hipótesis?]`,
    },
  },
];

export async function getPlanningTemplates(): Promise<PlanningTemplate[]> {
  // Return available templates
  return PLANNING_TEMPLATES;
}

export async function createPlanningDocumentFromTemplate(
  templateId: string,
  authorId: string,
  customizations?: {
    title?: string;
    subject?: string;
    grade?: string;
  },
) {
  try {
    const template = PLANNING_TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      throw new Error("Plantilla no válida");
    }

    const client = getConvexClient();

    const docId = await client.mutation(api.planning.createPlanningDocument, {
      title: customizations?.title || template.template.title,
      content: template.template.content,
      subject: customizations?.subject || template.subject,
      grade: customizations?.grade || template.grade,
      authorId: authorId as Id<"users">,
    });

    return { success: true, data: { id: docId } };
  } catch (error) {
    console.error("Failed to create document from template:", error);
    if (error instanceof Error && error.message === "Plantilla no válida") {
      throw error;
    }
    return { success: false, error: "No se pudo crear el documento desde la plantilla" };
  }
}
