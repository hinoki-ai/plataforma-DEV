/**
 * 🎓 Comprehensive Educational System Configuration
 * Supporting Chilean and International (ISCED) Educational Standards
 * From Pre-school to University Level
 */

export type EducationalInstitutionType =
  | "PRESCHOOL" // Educación Parvularia
  | "BASIC_SCHOOL" // Educación Básica
  | "HIGH_SCHOOL" // Educación Media
  | "COLLEGE"; // Educación Superior

export type ISCEDLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// Chilean Educational System Mapping to ISCED
export interface EducationalLevel {
  id: string;
  name: string;
  chileanName: string;
  ages: string;
  isced: ISCEDLevel;
  institutionTypes: EducationalInstitutionType[];
  grades?: string[];
  description: string;
}

export const EDUCATIONAL_LEVELS: EducationalLevel[] = [
  // ISCED 0 - Early Childhood Education
  {
    id: "sala_cuna",
    name: "Nursery",
    chileanName: "Sala Cuna",
    ages: "3 meses - 2 años",
    isced: 0,
    institutionTypes: ["PRESCHOOL"],
    description: "Atención y cuidado temprano para lactantes y bebés",
  },
  {
    id: "nivel_medio_menor",
    name: "Pre-nursery",
    chileanName: "Nivel Medio Menor",
    ages: "2 - 3 años",
    isced: 0,
    institutionTypes: ["PRESCHOOL"],
    description: "Desarrollo inicial de habilidades sociales y motoras",
  },
  {
    id: "nivel_medio_mayor",
    name: "Junior Pre-K",
    chileanName: "Nivel Medio Mayor",
    ages: "3 - 4 años",
    isced: 0,
    institutionTypes: ["PRESCHOOL"],
    description: "Preparación para niveles de transición",
  },
  {
    id: "nt1",
    name: "Pre-Kindergarten",
    chileanName: "NT1 (Primer Nivel de Transición)",
    ages: "4 - 5 años",
    isced: 0,
    institutionTypes: ["PRESCHOOL"],
    description: "Desarrollo de habilidades comunicativas y sociales",
  },
  {
    id: "nt2",
    name: "Kindergarten",
    chileanName: "NT2 (Segundo Nivel de Transición)",
    ages: "5 - 6 años",
    isced: 0,
    institutionTypes: ["PRESCHOOL"],
    description: "Preparación para educación básica",
  },

  // ISCED 1 - Primary Education
  {
    id: "basic_primary",
    name: "Primary Education",
    chileanName: "Educación Básica Primaria",
    ages: "6 - 12 años",
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
    description:
      "Educación fundamental: lectura, escritura, matemáticas básicas",
  },

  // ISCED 2 - Lower Secondary Education
  {
    id: "basic_secondary",
    name: "Lower Secondary Education",
    chileanName: "Educación Básica Secundaria",
    ages: "12 - 14 años",
    isced: 2,
    institutionTypes: ["BASIC_SCHOOL"],
    grades: ["7° Básico", "8° Básico"],
    description:
      "Consolidación de conocimientos básicos y preparación para educación media",
  },

  // ISCED 3 - Upper Secondary Education
  {
    id: "high_school_scientific",
    name: "Scientific-Humanistic Secondary",
    chileanName: "Educación Media Científico-Humanista",
    ages: "14 - 18 años",
    isced: 3,
    institutionTypes: ["HIGH_SCHOOL"],
    grades: ["1° Medio", "2° Medio", "3° Medio", "4° Medio"],
    description: "Preparación para educación superior universitaria",
  },
  {
    id: "high_school_technical",
    name: "Technical-Professional Secondary",
    chileanName: "Educación Media Técnico-Profesional",
    ages: "14 - 18 años",
    isced: 3,
    institutionTypes: ["HIGH_SCHOOL"],
    grades: ["1° Medio TP", "2° Medio TP", "3° Medio TP", "4° Medio TP"],
    description: "Formación técnica especializada para inserción laboral",
  },

  // ISCED 4 - Post-Secondary Non-Tertiary
  {
    id: "post_secondary_technical",
    name: "Post-Secondary Technical",
    chileanName: "Educación Post-Secundaria Técnica",
    ages: "18+ años",
    isced: 4,
    institutionTypes: ["COLLEGE"],
    description: "Especialización técnica post-secundaria",
  },

  // ISCED 5 - Short-cycle Tertiary Education
  {
    id: "technical_professional",
    name: "Technical Professional",
    chileanName: "Técnico Profesional",
    ages: "18+ años",
    isced: 5,
    institutionTypes: ["COLLEGE"],
    description: "Formación técnica superior (2-3 años)",
  },

  // ISCED 6 - Bachelor's Level
  {
    id: "undergraduate",
    name: "Undergraduate / Bachelor's",
    chileanName: "Educación Universitaria (Pregrado)",
    ages: "18+ años",
    isced: 6,
    institutionTypes: ["COLLEGE"],
    description: "Educación universitaria de pregrado (4-6 años)",
  },

  // ISCED 7 - Master's Level
  {
    id: "masters",
    name: "Master's Level",
    chileanName: "Magíster",
    ages: "22+ años",
    isced: 7,
    institutionTypes: ["COLLEGE"],
    description: "Estudios de postgrado nivel magíster (1-2 años)",
  },

  // ISCED 8 - Doctoral Level
  {
    id: "doctoral",
    name: "Doctoral Level",
    chileanName: "Doctorado",
    ages: "24+ años",
    isced: 8,
    institutionTypes: ["COLLEGE"],
    description: "Estudios de postgrado nivel doctorado (3-5 años)",
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
  COLLEGE: {
    name: "College/University",
    chileanName: "Educación Superior",
    description: "Educación terciaria y universitaria desde 18 años",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: "🏛️",
    levels: EDUCATIONAL_LEVELS.filter((l) =>
      l.institutionTypes.includes("COLLEGE"),
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
  COLLEGE: [
    // These would be highly specialized by career/program
    "Especialización por Carrera",
    "Metodología de Investigación",
    "Tesis/Proyecto de Título",
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
    academic_planning: ["BASIC_SCHOOL", "HIGH_SCHOOL", "COLLEGE"],
    grading_system: ["BASIC_SCHOOL", "HIGH_SCHOOL", "COLLEGE"],
    daycare_features: ["PRESCHOOL"],
    university_features: ["COLLEGE"],
    technical_training: ["HIGH_SCHOOL", "COLLEGE"],
    thesis_management: ["COLLEGE"],
    play_based_learning: ["PRESCHOOL"],
    career_guidance: ["HIGH_SCHOOL", "COLLEGE"],
    research_projects: ["COLLEGE"],
  };

  return featureMatrix[feature]?.includes(institutionType) ?? true;
}
