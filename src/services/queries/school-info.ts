import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getRoleFilter } from '@/lib/role-utils';
import type { ServiceResponse } from '@/lib/types/service-responses';
import { logger } from '@/lib/logger';

export async function getSchoolInfo(): Promise<ServiceResponse> {
  try {
    const session = await auth();
    const roleFilter = getRoleFilter(session?.user?.role);

    const schoolInfo = await db.schoolInfo.findFirst({
      where: roleFilter,
    });

    return { success: true, data: schoolInfo };
  } catch (error) {
    logger.error('Failed to fetch school info', error);
    return {
      success: false,
      error: 'No se pudo cargar la información de la escuela',
    };
  }
}

export async function getSchoolInfoOrCreateDefault(): Promise<ServiceResponse> {
  try {
    const result = await getSchoolInfo();

    if (result.success && result.data) {
      return result;
    }

    // Create default school info if none exists
    const schoolInfo = await db.schoolInfo.create({
      data: {
        name: 'Escuela Especial de Lenguaje Manitos Pintadas',
        mission:
          'Proporcionar una educación especializada y de calidad para niños con necesidades especiales de lenguaje, promoviendo su desarrollo integral en un ambiente cálido y acogedor.',
        vision:
          'Ser una institución líder en la región en la atención de niños con necesidades especiales de lenguaje, reconocida por nuestro enfoque innovador y resultados transformadores.',
        address: 'Dirección por definir',
        phone: '+56 9 0000 0000',
        email: 'contacto@manitospintadas.cl',
        website: 'https://manitospintadas.cl',
      },
    });

    return { success: true, data: schoolInfo };
  } catch (error) {
    logger.error('Failed to get or create school info', error);
    return {
      success: false,
      error: 'No se pudo cargar o crear la información de la escuela',
    };
  }
}

export async function createOrUpdateSchoolInfo(data: any) {
  try {
    const schoolInfo = await db.schoolInfo.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    });
    return schoolInfo;
  } catch (error) {
    logger.error('Failed to get or create school info', error);
    throw error;
  }
}
