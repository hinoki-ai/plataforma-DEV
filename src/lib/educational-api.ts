/**
 * 🎓 Educational System API Functions
 * Server-side functions for managing educational institution configuration
 */

import { PrismaClient } from '@prisma/client';
import { EducationalInstitutionType, INSTITUTION_TYPE_INFO, EDUCATIONAL_LEVELS } from './educational-system';

const prisma = new PrismaClient();

export interface InstitutionSettings {
  id?: string;
  institutionType: EducationalInstitutionType;
  supportedLevels: string[];
  customGrades: string[];
  customSubjects: string[];
  featuresEnabled: Record<string, boolean>;
  academicYearConfig?: any;
  gradingSystem?: any;
}

/**
 * Get current institution configuration
 */
export async function getCurrentInstitutionType(): Promise<EducationalInstitutionType> {
  try {
    const schoolInfo = await prisma.schoolInfo.findFirst();
    return schoolInfo?.institutionType || 'PRESCHOOL';
  } catch (error) {
    console.error('Error getting institution type:', error);
    return 'PRESCHOOL'; // Default fallback
  }
}

/**
 * Update institution type and configuration
 */
export async function updateInstitutionType(
  newType: EducationalInstitutionType
): Promise<{ success: boolean; message: string }> {
  try {
    // Update school info
    const schoolInfo = await prisma.schoolInfo.findFirst();
    
    if (schoolInfo) {
      await prisma.schoolInfo.update({
        where: { id: schoolInfo.id },
        data: {
          institutionType: newType,
          supportedLevels: INSTITUTION_TYPE_INFO[newType].levels.map(l => l.isced.toString()),
          customGrades: INSTITUTION_TYPE_INFO[newType].levels.flatMap(l => l.grades || []),
          educationalConfig: {
            changedAt: new Date().toISOString(),
            previousType: schoolInfo.institutionType,
            newType: newType,
          }
        }
      });
    } else {
      // Create new school info if none exists
      await prisma.schoolInfo.create({
        data: {
          name: 'Institución Educativa',
          mission: 'Excelencia educativa',
          vision: 'Formación integral',
          address: 'Dirección por definir',
          phone: 'Teléfono por definir', 
          email: 'email@institucion.cl',
          website: 'https://institucion.cl',
          institutionType: newType,
          supportedLevels: INSTITUTION_TYPE_INFO[newType].levels.map(l => l.isced.toString()),
          customGrades: INSTITUTION_TYPE_INFO[newType].levels.flatMap(l => l.grades || []),
        }
      });
    }

    // Update or create institution settings
    await prisma.$executeRaw`
      INSERT INTO institution_settings (id, institution_type, supported_levels, custom_grades, custom_subjects, features_enabled)
      VALUES (${newType.toLowerCase() + '_config'}, ${newType}, 
              ${JSON.stringify(INSTITUTION_TYPE_INFO[newType].levels.map(l => `LEVEL_${l.isced}`))},
              ${JSON.stringify(INSTITUTION_TYPE_INFO[newType].levels.flatMap(l => l.grades || []))},
              ${JSON.stringify([])}, 
              ${JSON.stringify({})})
      ON CONFLICT (id) DO UPDATE SET
        institution_type = EXCLUDED.institution_type,
        supported_levels = EXCLUDED.supported_levels,
        custom_grades = EXCLUDED.custom_grades,
        updated_at = CURRENT_TIMESTAMP
    `;

    return {
      success: true,
      message: `Institución configurada exitosamente como: ${INSTITUTION_TYPE_INFO[newType].chileanName}`
    };

  } catch (error) {
    console.error('Error updating institution type:', error);
    return {
      success: false,
      message: 'Error al actualizar la configuración institucional'
    };
  }
}

/**
 * Get institution settings
 */
export async function getInstitutionSettings(type?: EducationalInstitutionType): Promise<InstitutionSettings | null> {
  try {
    const institutionType = type || await getCurrentInstitutionType();
    
    const settings = await prisma.$queryRaw`
      SELECT * FROM institution_settings 
      WHERE institution_type = ${institutionType}
      ORDER BY updated_at DESC
      LIMIT 1
    ` as any[];

    if (settings.length > 0) {
      return settings[0];
    }

    // Return default settings if none found
    return {
      institutionType,
      supportedLevels: INSTITUTION_TYPE_INFO[institutionType].levels.map(l => `LEVEL_${l.isced}`),
      customGrades: INSTITUTION_TYPE_INFO[institutionType].levels.flatMap(l => l.grades || []),
      customSubjects: [],
      featuresEnabled: {}
    };

  } catch (error) {
    console.error('Error getting institution settings:', error);
    return null;
  }
}

/**
 * Get educational levels for current institution
 */
export async function getEducationalLevelsForInstitution(): Promise<typeof EDUCATIONAL_LEVELS> {
  try {
    const institutionType = await getCurrentInstitutionType();
    return EDUCATIONAL_LEVELS.filter(level => 
      level.institutionTypes.includes(institutionType)
    );
  } catch (error) {
    console.error('Error getting educational levels:', error);
    return EDUCATIONAL_LEVELS.filter(level => 
      level.institutionTypes.includes('PRESCHOOL')
    );
  }
}

/**
 * Check if feature should be enabled for current institution
 */
export async function isFeatureEnabled(feature: string): Promise<boolean> {
  try {
    const institutionType = await getCurrentInstitutionType();
    
    // Default feature matrix
    const featureMatrix: Record<string, EducationalInstitutionType[]> = {
      'parent_meetings': ['PRESCHOOL', 'BASIC_SCHOOL', 'HIGH_SCHOOL'],
      'academic_planning': ['BASIC_SCHOOL', 'HIGH_SCHOOL', 'COLLEGE'],
      'grading_system': ['BASIC_SCHOOL', 'HIGH_SCHOOL', 'COLLEGE'],
      'daycare_features': ['PRESCHOOL'],
      'university_features': ['COLLEGE'],
      'technical_training': ['HIGH_SCHOOL', 'COLLEGE'],
      'thesis_management': ['COLLEGE'],
      'play_based_learning': ['PRESCHOOL'],
      'career_guidance': ['HIGH_SCHOOL', 'COLLEGE'],
      'research_projects': ['COLLEGE'],
    };

    return featureMatrix[feature]?.includes(institutionType) ?? true;

  } catch (error) {
    console.error('Error checking feature availability:', error);
    return true; // Default to enabled
  }
}