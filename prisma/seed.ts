import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/crypto';

const prisma = new PrismaClient();

async function main() {
  // Hash passwords
  const masterPassword = await hashPassword('master123');
  const adminPassword = await hashPassword('admin123');
  const profesorPassword = await hashPassword('profesor123');

  // Create master user
  const master = await prisma.user.upsert({
    where: { email: 'master@manitospintadas.cl' },
    update: {},
    create: {
      email: 'master@manitospintadas.cl',
      name: 'Master Administrator',
      password: masterPassword,
      role: 'MASTER',
    },
  });

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@manitospintadas.cl' },
    update: {},
    create: {
      email: 'admin@manitospintadas.cl',
      name: 'Administrador Manitos Pintadas',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create profesor user
  const profesor = await prisma.user.upsert({
    where: { email: 'profesor@manitospintadas.cl' },
    update: {},
    create: {
      email: 'profesor@manitospintadas.cl',
      name: 'María González',
      password: profesorPassword,
      role: 'PROFESOR',
    },
  });

  // Create school information
  const schoolInfo = await prisma.schoolInfo.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Escuela Especial de Lenguaje Manitos Pintadas',
      mission:
        'Formar estudiantes integrales, críticos y comprometidos con su entorno, brindando una educación de calidad que potencie sus habilidades académicas, sociales y emocionales para enfrentar los desafíos del siglo XXI.',
      vision:
        'Ser reconocidos como una institución educativa líder en innovación pedagógica, que forma ciudadanos responsables, creativos y preparados para contribuir positivamente a la sociedad global.',
      address: 'Anibal Pinto Nº 160, Los Sauces, Chile',
      phone: '(45) 278 3486',
      email: 'contacto@manitospintadas.cl',
      website: 'https://manitospintadas.cl',
    },
  });

  // Create sample planning document
  const planningDoc = await prisma.planningDocument.create({
    data: {
      title: 'Planificación de Matemáticas - Unidad 1',
      content: `
# Unidad 1: Números y Operaciones

## Objetivos de Aprendizaje
- Comprender el sistema de numeración decimal
- Realizar operaciones básicas con números naturales
- Resolver problemas aplicando las operaciones aprendidas

## Actividades
1. Introducción a los números naturales
2. Ejercicios de suma y resta
3. Problemas de aplicación
4. Evaluación formativa

## Recursos
- Texto de estudio
- Material concreto
- Calculadora
- Fichas de trabajo

## Evaluación
- Evaluación diagnóstica (semana 1)
- Evaluación formativa (semana 2)
- Evaluación sumativa (semana 3)
      `.trim(),
      subject: 'Matemáticas',
      grade: '4° Básico',
      authorId: profesor.id,
    },
  });

  // Create team members
  const teamMembers = await Promise.all([
    prisma.teamMember.upsert({
      where: { id: 'team-1' },
      update: {},
      create: {
        id: 'team-1',
        name: 'Dra. Ana María Pérez',
        title: 'Psicóloga Educacional',
        description:
          'Especialista en evaluación y apoyo psicológico para niños con necesidades educativas especiales. Más de 15 años de experiencia en educación especial.',
        specialties: [
          'Evaluación Psicopedagógica',
          'Intervención Temprana',
          'TDAH',
          'Autismo',
        ],
        imageUrl: '/team/ana-perez.jpg',
        order: 1,
        isActive: true,
      },
    }),
    prisma.teamMember.upsert({
      where: { id: 'team-2' },
      update: {},
      create: {
        id: 'team-2',
        name: 'Lic. Carlos Rodríguez',
        title: 'Terapeuta del Lenguaje',
        description:
          'Especializado en trastornos del lenguaje y comunicación. Experta en terapia fonológica y desarrollo del habla.',
        specialties: [
          'Terapia del Lenguaje',
          'Fonoaudiología',
          'Dislalias',
          'Tartamudez',
        ],
        imageUrl: '/team/carlos-rodriguez.jpg',
        order: 2,
        isActive: true,
      },
    }),
    prisma.teamMember.upsert({
      where: { id: 'team-3' },
      update: {},
      create: {
        id: 'team-3',
        name: 'Sra. María González',
        title: 'Docente Especialista',
        description:
          'Educadora diferencial con especialización en niños con necesidades educativas especiales. Experta en adaptaciones curriculares.',
        specialties: [
          'Educación Diferencial',
          'Adaptaciones Curriculares',
          'Evaluación Formativa',
          'Inclusión',
        ],
        imageUrl: '/team/maria-gonzalez.jpg',
        order: 3,
        isActive: true,
      },
    }),
    prisma.teamMember.upsert({
      where: { id: 'team-4' },
      update: {},
      create: {
        id: 'team-4',
        name: 'Ps. Roberto Silva',
        title: 'Psicólogo Clínico',
        description:
          'Especialista en salud mental infantil y apoyo emocional. Trabaja en intervención temprana y terapia familiar.',
        specialties: [
          'Salud Mental Infantil',
          'Terapia Familiar',
          'Ansiedad Infantil',
          'Intervención Temprana',
        ],
        imageUrl: '/team/roberto-silva.jpg',
        order: 4,
        isActive: true,
      },
    }),
    prisma.teamMember.upsert({
      where: { id: 'team-5' },
      update: {},
      create: {
        id: 'team-5',
        name: 'Srta. Patricia Muñoz',
        title: 'Terapeuta Ocupacional',
        description:
          'Especializada en desarrollo de habilidades motoras y sensoriales. Experta en integración sensorial y terapia ocupacional pediátrica.',
        specialties: [
          'Terapia Ocupacional',
          'Integración Sensorial',
          'Motricidad Fina',
          'Desarrollo Sensorial',
        ],
        imageUrl: '/team/patricia-munoz.jpg',
        order: 5,
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${teamMembers.length} team members`);

  // Data seeding completed successfully
}

main()
  .catch(e => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
