import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const teamMembers = [
  {
    name: 'Dra. María González',
    title: 'Psicóloga Educacional',
    description:
      'Especialista en desarrollo infantil y apoyo psicoeducativo. Trabaja con familias y niños para promover el bienestar emocional y el desarrollo integral.',
    specialties: [
      'Psicología Educacional',
      'Desarrollo Infantil',
      'Apoyo Familiar',
    ],
    imageUrl: '/icons/profesor-96x96.png',
    order: 1,
    isActive: true,
  },
  {
    name: 'Prof. Carlos Rodríguez',
    title: 'Fonoaudiólogo',
    description:
      'Especialista en comunicación y lenguaje. Apoya el desarrollo del habla y la comunicación en niños con necesidades especiales.',
    specialties: ['Fonoaudiología', 'Comunicación', 'Lenguaje'],
    imageUrl: '/icons/profesor-96x96.png',
    order: 2,
    isActive: true,
  },
  {
    name: 'Lic. Ana Martínez',
    title: 'Terapeuta Ocupacional',
    description:
      'Especialista en desarrollo de habilidades motoras y adaptativas. Ayuda a los niños a desarrollar independencia en actividades diarias.',
    specialties: [
      'Terapia Ocupacional',
      'Habilidades Motoras',
      'Independencia',
    ],
    imageUrl: '/icons/profesor-96x96.png',
    order: 3,
    isActive: true,
  },
  {
    name: 'Dr. Luis Fernández',
    title: 'Psicopedagogo',
    description:
      'Especialista en dificultades de aprendizaje. Diseña estrategias personalizadas para apoyar el desarrollo académico de cada niño.',
    specialties: [
      'Psicopedagogía',
      'Dificultades de Aprendizaje',
      'Estrategias Educativas',
    ],
    imageUrl: '/icons/profesor-96x96.png',
    order: 4,
    isActive: true,
  },
  {
    name: 'Sra. Patricia Silva',
    title: 'Asistente Social',
    description:
      'Apoya a las familias en el acceso a recursos y servicios comunitarios. Trabaja para fortalecer el vínculo entre la escuela y la familia.',
    specialties: ['Trabajo Social', 'Apoyo Familiar', 'Recursos Comunitarios'],
    imageUrl: '/icons/profesor-96x96.png',
    order: 5,
    isActive: true,
  },
];

async function seedTeamMembers() {
  try {
    console.log('🌱 Seeding team members...');

    // Clear existing team members
    await prisma.teamMember.deleteMany();

    // Create new team members
    for (const member of teamMembers) {
      await prisma.teamMember.create({
        data: {
          ...member,
          specialties: JSON.stringify(member.specialties),
        },
      });
    }

    console.log('✅ Team members seeded successfully!');
    console.log(`📊 Created ${teamMembers.length} team members`);
  } catch (error) {
    console.error('❌ Error seeding team members:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTeamMembers();
