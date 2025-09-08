/**
 * 🎓 Educational Constants - Comprehensive System
 * Updated to support multiple educational institution types
 */

import { 
  EducationalInstitutionType, 
  getGradesForInstitutionType, 
  getSubjectsForInstitutionType 
} from './educational-system';

// Legacy support - maintain backwards compatibility
export const SUBJECTS = [
  'Lenguaje y Comunicación',
  'Matemática',
  'Historia, Geografía y Ciencias Sociales', 
  'Ciencias Naturales',
  'Inglés',
  'Educación Física y Salud',
  'Artes Visuales',
  'Música',
  'Orientación',
  'Religión',
] as const;

export const GRADES = [
  '1° Básico',
  '2° Básico', 
  '3° Básico',
  '4° Básico',
  '5° Básico',
  '6° Básico',
  '7° Básico',
  '8° Básico',
] as const;

// Enhanced educational constants supporting all institution types
export function getSubjectsForCurrentInstitution(type?: EducationalInstitutionType): string[] {
  if (!type) return [...SUBJECTS]; // Fallback to legacy
  return getSubjectsForInstitutionType(type);
}

export function getGradesForCurrentInstitution(type?: EducationalInstitutionType): string[] {
  if (!type) return [...GRADES]; // Fallback to legacy
  return getGradesForInstitutionType(type);
}

// Extended subjects by institution type
export const PRESCHOOL_SUBJECTS = [
  'Desarrollo Personal y Social',
  'Comunicación Integral',
  'Relación con el Medio Natural y Cultural',
  'Lenguajes Artísticos',
  'Educación Física y Bienestar',
] as const;

export const BASIC_SCHOOL_SUBJECTS = [
  'Lenguaje y Comunicación',
  'Matemática',
  'Historia, Geografía y Ciencias Sociales',
  'Ciencias Naturales',
  'Inglés',
  'Educación Física y Salud',
  'Artes Visuales',
  'Música',
  'Orientación',
  'Religión',
] as const;

export const HIGH_SCHOOL_SUBJECTS = [
  'Lengua y Literatura',
  'Matemática',
  'Historia, Geografía y Ciencias Sociales',
  'Filosofía',
  'Biología',
  'Química', 
  'Física',
  'Inglés',
  'Educación Física y Salud',
  'Artes',
  'Música',
  'Orientación',
  'Religión',
  // Technical subjects
  'Formación Técnico-Profesional',
  'Especialidades Técnicas',
] as const;

export const COLLEGE_SUBJECTS = [
  'Especialización por Carrera',
  'Metodología de Investigación',
  'Tesis/Proyecto de Título',
  'Práctica Profesional',
  'Seminario de Título',
] as const;

// Expanded grades for all educational levels
export const PRESCHOOL_GRADES = [
  'Sala Cuna Menor (3-12 meses)',
  'Sala Cuna Mayor (1-2 años)',
  'Nivel Medio Menor (2-3 años)',
  'Nivel Medio Mayor (3-4 años)',
  'NT1 - Pre-Kinder (4-5 años)',
  'NT2 - Kinder (5-6 años)',
] as const;

export const BASIC_SCHOOL_GRADES = [
  '1° Básico',
  '2° Básico',
  '3° Básico', 
  '4° Básico',
  '5° Básico',
  '6° Básico',
  '7° Básico',
  '8° Básico',
] as const;

export const HIGH_SCHOOL_GRADES = [
  '1° Medio',
  '2° Medio',
  '3° Medio',
  '4° Medio',
  // Technical-Professional variants
  '1° Medio TP',
  '2° Medio TP', 
  '3° Medio TP',
  '4° Medio TP',
] as const;

export const COLLEGE_GRADES = [
  '1° Año',
  '2° Año',
  '3° Año',
  '4° Año',
  '5° Año',
  '6° Año',
  // Graduate levels
  'Magíster 1° Año',
  'Magíster 2° Año',
  'Doctorado 1° Año',
  'Doctorado 2° Año',
  'Doctorado 3° Año',
  'Doctorado 4° Año',
] as const;

// Meeting status labels - maintain compatibility
export const MEETING_STATUS_LABELS = {
  SCHEDULED: 'Programada',
  CONFIRMED: 'Confirmada', 
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  RESCHEDULED: 'Reprogramada',
} as const;