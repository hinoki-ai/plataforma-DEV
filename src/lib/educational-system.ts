/**
 * 🎓 SISTEMA EDUCATIVO CHILENO COMPLETO - IMPLEMENTACIÓN PERFECTA
 * Basado en estándares oficiales del Ministerio de Educación de Chile
 * Desde educación parvularia hasta educación superior
 */

export type EducationalInstitutionType =
  | "PRESCHOOL"           // Educación Parvularia
  | "BASIC_SCHOOL"        // Educación Básica
  | "HIGH_SCHOOL"         // Educación Media
  | "TECHNICAL_INSTITUTE" // Institutos Profesionales
  | "TECHNICAL_CENTER"    // Centros de Formación Técnica
  | "UNIVERSITY";         // Universidades

export type ISCEDLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// Sistema Educativo Chileno Completo mapeado a ISCED
export interface EducationalLevel {
  id: string;
  name: string;
  chileanName: string;
  ages: string;
  isced: ISCEDLevel;
  institutionTypes: EducationalInstitutionType[];
  grades?: string[];
  description: string;
  duration?: string; // Duración típica
}

export const EDUCATIONAL_LEVELS: EducationalLevel[] = [
  // ISCED 0 - EDUCACIÓN PARVULARIA (Early Childhood Education)
  {
    id: "sala_cuna_menor",
    name: "Infant Nursery",
    chileanName: "Sala Cuna Menor",
    ages: "3-12 meses",
    isced: 0,
    institutionTypes: ["PRESCHOOL"],
    description: "Cuidado y atención temprana para lactantes",
    duration: "3-12 meses",
  },
  {
    id: "sala_cuna_mayor",
    name: "Toddler Nursery",
    chileanName: "Sala Cuna Mayor",
    ages: "1-2 años",
    isced: 0,
    institutionTypes: ["PRESCHOOL"],
    description: "Desarrollo inicial psicomotor y social",
    duration: "1 año",
  },
  {
    id: "nivel_medio_menor",
    name: "Pre-nursery",
    chileanName: "Nivel Medio Menor",
    ages: "2-3 años",
    isced: 0,
    institutionTypes: ["PRESCHOOL"],
    description: "Transición a educación estructurada",
    duration: "1 año",
  },
  {
    id: "nivel_medio_mayor",
    name: "Junior Pre-K",
    chileanName: "Nivel Medio Mayor",
    ages: "3-4 años",
    isced: 0,
    institutionTypes: ["PRESCHOOL"],
    description: "Desarrollo de habilidades pre-académicas",
    duration: "1 año",
  },
  {
    id: "nt1_prekinder",
    name: "Pre-Kindergarten",
    chileanName: "NT1 - Primer Nivel de Transición",
    ages: "4-5 años",
    isced: 0,
    institutionTypes: ["PRESCHOOL"],
    description: "Preparación para educación formal",
    duration: "1 año",
  },
  {
    id: "nt2_kinder",
    name: "Kindergarten",
    chileanName: "NT2 - Segundo Nivel de Transición",
    ages: "5-6 años",
    isced: 0,
    institutionTypes: ["PRESCHOOL"],
    description: "Transición final a educación básica",
    duration: "1 año",
  },

  // ISCED 1 - EDUCACIÓN BÁSICA PRIMARIA (Primary Education)
  {
    id: "educacion_basica_primaria",
    name: "Primary Basic Education",
    chileanName: "Educación Básica Primaria",
    ages: "6-12 años",
    isced: 1,
    institutionTypes: ["BASIC_SCHOOL"],
    grades: [
      "1° Básico",
      "2° Básico",
      "3° Básico",
      "4° Básico",
      "5° Básico",
      "6° Básico",
    ],
    description: "Enseñanza fundamental: lenguaje, matemáticas, ciencias naturales",
    duration: "6 años",
  },

  // ISCED 2 - EDUCACIÓN BÁSICA SECUNDARIA (Lower Secondary Education)
  {
    id: "educacion_basica_secundaria",
    name: "Secondary Basic Education",
    chileanName: "Educación Básica Secundaria",
    ages: "12-14 años",
    isced: 2,
    institutionTypes: ["BASIC_SCHOOL"],
    grades: ["7° Básico", "8° Básico"],
    description: "Consolidación de conocimientos y preparación para enseñanza media",
    duration: "2 años",
  },

  // ISCED 3 - EDUCACIÓN MEDIA (Upper Secondary Education)
  {
    id: "ensenanza_media_humanista_cientifica",
    name: "Scientific-Humanistic Secondary Education",
    chileanName: "Enseñanza Media Humanístico-Científica",
    ages: "14-18 años",
    isced: 3,
    institutionTypes: ["HIGH_SCHOOL"],
    grades: ["1° Medio", "2° Medio", "3° Medio", "4° Medio"],
    description: "Preparación para educación superior universitaria",
    duration: "4 años",
  },
  {
    id: "ensenanza_media_tecnico_profesional",
    name: "Technical-Professional Secondary Education",
    chileanName: "Enseñanza Media Técnico-Profesional",
    ages: "14-18 años",
    isced: 3,
    institutionTypes: ["HIGH_SCHOOL"],
    grades: ["1° Medio TP", "2° Medio TP", "3° Medio TP", "4° Medio TP"],
    description: "Formación técnica especializada para inserción laboral inmediata",
    duration: "4 años",
  },

  // ISCED 4 - EDUCACIÓN POST-SECUNDARIA NO TERCIARIA
  {
    id: "tecnico_de_nivel_superior",
    name: "Higher Level Technician",
    chileanName: "Técnico de Nivel Superior",
    ages: "18+ años",
    isced: 4,
    institutionTypes: ["TECHNICAL_INSTITUTE", "TECHNICAL_CENTER"],
    description: "Especialización técnica post-secundaria",
    duration: "1-2 años",
  },

  // ISCED 5 - EDUCACIÓN TERCIARIA DE CICLO CORTO
  {
    id: "tecnico_profesional",
    name: "Technical Professional",
    chileanName: "Técnico Profesional",
    ages: "18+ años",
    isced: 5,
    institutionTypes: ["TECHNICAL_INSTITUTE", "TECHNICAL_CENTER"],
    description: "Formación técnica superior con título profesional",
    duration: "2-3 años",
  },

  // ISCED 6 - LICENCIATURA O EQUIVALENTE
  {
    id: "licenciatura",
    name: "Licentiate Degree",
    chileanName: "Licenciatura",
    ages: "18+ años",
    isced: 6,
    institutionTypes: ["UNIVERSITY"],
    description: "Título profesional universitario de 4 años",
    duration: "4 años",
  },
  {
    id: "titulo_profesional",
    name: "Professional Title",
    chileanName: "Título Profesional",
    ages: "18+ años",
    isced: 6,
    institutionTypes: ["UNIVERSITY"],
    description: "Título profesional universitario de 5-6 años",
    duration: "5-6 años",
  },

  // ISCED 7 - MAGÍSTER
  {
    id: "magister",
    name: "Master's Degree",
    chileanName: "Magíster",
    ages: "22+ años",
    isced: 7,
    institutionTypes: ["UNIVERSITY"],
    description: "Estudios de postgrado nivel magíster",
    duration: "1-2 años",
  },

  // ISCED 8 - DOCTORADO
  {
    id: "doctorado",
    name: "Doctoral Degree",
    chileanName: "Doctorado",
    ages: "24+ años",
    isced: 8,
    institutionTypes: ["UNIVERSITY"],
    description: "Estudios de postgrado nivel doctorado",
    duration: "3-5 años",
  },
];

export const INSTITUTION_TYPE_INFO = {
  PRESCHOOL: {
    name: "Pre-school",
    chileanName: "Educación Parvularia",
    description: "Educación inicial desde 3 meses hasta 6 años",
    color: "bg-pink-100 text-pink-800 border-pink-200",
    icon: "🧸",
    levels: EDUCATIONAL_LEVELS.filter((l) =>
      l.institutionTypes.includes("PRESCHOOL"),
    ),
  },
  BASIC_SCHOOL: {
    name: "Basic School",
    chileanName: "Educación Básica",
    description: "Educación primaria y básica desde 6 hasta 14 años",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "📚",
    levels: EDUCATIONAL_LEVELS.filter((l) =>
      l.institutionTypes.includes("BASIC_SCHOOL"),
    ),
  },
  HIGH_SCHOOL: {
    name: "High School",
    chileanName: "Educación Media",
    description: "Educación secundaria desde 14 hasta 18 años",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: "🎓",
    levels: EDUCATIONAL_LEVELS.filter((l) =>
      l.institutionTypes.includes("HIGH_SCHOOL"),
    ),
  },
  TECHNICAL_INSTITUTE: {
    name: "Professional Institute",
    chileanName: "Instituto Profesional",
    description: "Instituciones de educación superior técnica especializada",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: "🔧",
    levels: EDUCATIONAL_LEVELS.filter((l) =>
      l.institutionTypes.includes("TECHNICAL_INSTITUTE"),
    ),
  },
  TECHNICAL_CENTER: {
    name: "Technical Training Center",
    chileanName: "Centro de Formación Técnica",
    description: "Centros de formación técnica del SENCE y estatales",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: "⚙️",
    levels: EDUCATIONAL_LEVELS.filter((l) =>
      l.institutionTypes.includes("TECHNICAL_CENTER"),
    ),
  },
  UNIVERSITY: {
    name: "University",
    chileanName: "Universidad",
    description: "Educación universitaria de pre y postgrado",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: "🏛️",
    levels: EDUCATIONAL_LEVELS.filter((l) =>
      l.institutionTypes.includes("UNIVERSITY"),
    ),
  },
} as const;

// Subject areas by educational level
export const SUBJECTS_BY_LEVEL = {
  PRESCHOOL: [
    "Desarrollo Personal y Social",
    "Comunicación Integral",
    "Relación con el Medio Natural y Cultural",
    "Lenguajes Artísticos",
    "Educación Física y Bienestar",
  ],
  BASIC_SCHOOL: [
    "Lenguaje y Comunicación",
    "Matemática",
    "Historia, Geografía y Ciencias Sociales",
    "Ciencias Naturales",
    "Inglés",
    "Educación Física y Salud",
    "Artes Visuales",
    "Música",
    "Orientación",
    "Religión",
  ],
  HIGH_SCHOOL: [
    "Lengua y Literatura",
    "Matemática",
    "Historia, Geografía y Ciencias Sociales",
    "Filosofía",
    "Biología",
    "Química",
    "Física",
    "Inglés",
    "Educación Física y Salud",
    "Artes",
    "Música",
    "Orientación",
    "Religión",
    // Technical subjects for TP
    "Formación Técnico-Profesional",
    "Especialidades Técnicas",
  ],
  TECHNICAL_INSTITUTE: [
    "Especialización Técnica",
    "Metodología de Investigación Aplicada",
    "Práctica Profesional",
    "Proyecto de Título Técnico",
    "Especialidades por Carrera",
  ],
  TECHNICAL_CENTER: [
    "Formación Técnica Especializada",
    "Prácticas Laborales",
    "Certificación Técnica",
    "Especialidades Técnicas",
    "Proyecto Integrador",
  ],
  UNIVERSITY: [
    "Especialización por Carrera",
    "Metodología de Investigación",
    "Tesis/Proyecto de Título",
    "Práctica Profesional",
    "Seminario de Título",
    "Electivos",
  ],
} as const;

// Get all grades for an institution type
export function getGradesForInstitutionType(
  type: EducationalInstitutionType,
): string[] {
  const levels = INSTITUTION_TYPE_INFO[type].levels;
  return levels.reduce((grades: string[], level) => {
    if (level.grades) {
      return [...grades, ...level.grades];
    }
    return grades;
  }, []);
}

// Get subjects for an institution type
export function getSubjectsForInstitutionType(
  type: EducationalInstitutionType,
): string[] {
  return [...(SUBJECTS_BY_LEVEL[type] || [])];
}

// Check if current system should show certain features based on institution type
export function shouldShowFeature(
  feature: string,
  institutionType: EducationalInstitutionType,
): boolean {
  const featureMatrix: Record<string, EducationalInstitutionType[]> = {
    parent_meetings: ["PRESCHOOL", "BASIC_SCHOOL", "HIGH_SCHOOL"],
    academic_planning: ["BASIC_SCHOOL", "HIGH_SCHOOL", "TECHNICAL_INSTITUTE", "TECHNICAL_CENTER", "UNIVERSITY"],
    grading_system: ["BASIC_SCHOOL", "HIGH_SCHOOL", "TECHNICAL_INSTITUTE", "TECHNICAL_CENTER", "UNIVERSITY"],
    daycare_features: ["PRESCHOOL"],
    university_features: ["UNIVERSITY"],
    technical_training: ["HIGH_SCHOOL", "TECHNICAL_INSTITUTE", "TECHNICAL_CENTER", "UNIVERSITY"],
    thesis_management: ["TECHNICAL_INSTITUTE", "TECHNICAL_CENTER", "UNIVERSITY"],
    play_based_learning: ["PRESCHOOL"],
    career_guidance: ["HIGH_SCHOOL", "TECHNICAL_INSTITUTE", "TECHNICAL_CENTER", "UNIVERSITY"],
    research_projects: ["TECHNICAL_INSTITUTE", "TECHNICAL_CENTER", "UNIVERSITY"],
    laboratory_access: ["HIGH_SCHOOL", "TECHNICAL_INSTITUTE", "TECHNICAL_CENTER", "UNIVERSITY"],
    certification_programs: ["TECHNICAL_INSTITUTE", "TECHNICAL_CENTER"],
    postgraduate_programs: ["UNIVERSITY"],
    technical_specialization: ["TECHNICAL_INSTITUTE", "TECHNICAL_CENTER"],
  };

  return featureMatrix[feature]?.includes(institutionType) ?? true;
}
