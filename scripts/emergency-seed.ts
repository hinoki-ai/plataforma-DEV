#!/usr/bin/env tsx
/**
 * Emergency Seed Script for Production Deployment
 * Creates essential test users for client testing
 * Environment-aware and safe for production use
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/crypto';

const prisma = new PrismaClient();

// Environment-aware configuration
const getCredentials = () => {
  const adminEmail =
    process.env.DEFAULT_ADMIN_EMAIL || 'admin@manitospintadas.cl';
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
  const teacherEmail =
    process.env.DEFAULT_TEACHER_EMAIL || 'profesor@manitospintadas.cl';
  const teacherPassword = process.env.DEFAULT_TEACHER_PASSWORD || 'profesor123';

  return {
    admin: { email: adminEmail, password: adminPassword },
    teacher: { email: teacherEmail, password: teacherPassword },
  };
};

async function emergencySeed() {
  console.log('🚨 EMERGENCY SEED: Creating production test credentials...');
  console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
  const dbType =
    process.env.DATABASE_URL?.startsWith('postgresql://') ||
    process.env.DATABASE_URL?.startsWith('postgres://')
      ? 'PostgreSQL'
      : 'PostgreSQL';
  console.log('�� Database:', dbType);

  try {
    const credentials = getCredentials();

    // Hash passwords securely
    const adminPasswordHash = await hashPassword(credentials.admin.password);
    const teacherPasswordHash = await hashPassword(
      credentials.teacher.password
    );

    // Create/update admin user
    const admin = await prisma.user.upsert({
      where: { email: credentials.admin.email },
      update: {
        password: adminPasswordHash,
        isActive: true,
        name: 'Administrador Manitos Pintadas',
      },
      create: {
        email: credentials.admin.email,
        name: 'Administrador Manitos Pintadas',
        password: adminPasswordHash,
        role: 'ADMIN',
        isActive: true,
      },
    });

    // Create/update teacher user
    const teacher = await prisma.user.upsert({
      where: { email: credentials.teacher.email },
      update: {
        password: teacherPasswordHash,
        isActive: true,
        name: 'María González - Profesora',
      },
      create: {
        email: credentials.teacher.email,
        name: 'María González - Profesora',
        password: teacherPasswordHash,
        role: 'PROFESOR',
        isActive: true,
      },
    });

    // Create/update school information
    await prisma.schoolInfo.upsert({
      where: { id: 'default' },
      update: {
        name: 'Escuela Especial de Lenguaje Manitos Pintadas',
        address: 'Anibal Pinto Nº 160, Los Sauces, Chile',
        phone: '(45) 278 3486',
        email: 'contacto@manitospintadas.cl',
      },
      create: {
        id: 'default',
        name: 'Escuela Especial de Lenguaje Manitos Pintadas',
        mission:
          'Formar estudiantes integrales, críticos y comprometidos con su entorno, brindando una educación de calidad que potencie sus habilidades académicas, sociales y emocionales.',
        vision:
          'Ser reconocidos como una institución educativa líder en innovación pedagógica, que forma ciudadanos responsables, creativos y preparados para contribuir positivamente a la sociedad.',
        address: 'Anibal Pinto Nº 160, Los Sauces, Chile',
        phone: '(45) 278 3486',
        email: 'contacto@manitospintadas.cl',
        website: 'https://manitospintadas.cl',
      },
    });

    console.log('✅ Emergency seed completed successfully!');
    console.log('📧 Test Credentials Created:');
    console.log(
      `   Admin: ${credentials.admin.email} / ${credentials.admin.password}`
    );
    console.log(
      `   Teacher: ${credentials.teacher.email} / ${credentials.teacher.password}`
    );
    console.log('🔒 Passwords are securely hashed in database');
    console.log('🎯 Ready for client testing!');

    return { admin, teacher };
  } catch (error) {
    console.error('❌ Emergency seed failed:', error);

    // Provide helpful debugging information
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.error(
          '🔍 Database connection refused. Check DATABASE_URL environment variable.'
        );
      } else if (error.message.includes('schema')) {
        console.error(
          '🔍 Database schema issue. Run: npm run db:generate && npm run db:push'
        );
      }
    }

    throw error;
  }
}

// Execute if called directly
if (require.main === module) {
  emergencySeed()
    .catch(error => {
      console.error('Fatal error during emergency seed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default emergencySeed;
