/**
 * Planning Document Types and Constants
 * Separated from actions to allow use in both server and client code
 */

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

