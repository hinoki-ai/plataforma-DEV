import { PrismaClient, MeetingStatus, MeetingType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMeetings() {
  console.log('🌱 Starting to seed meetings...');

  // Get existing users
  const users = await prisma.user.findMany({
    where: { role: { in: ['PROFESOR', 'ADMIN'] } },
  });

  if (users.length === 0) {
    console.log('❌ No users found. Please run npm run db:seed first.');
    return;
  }

  const sampleMeetings = [
    {
      title: 'Reunión Padres - María González',
      description: 'Revisión del progreso académico y comportamiento',
      studentName: 'María González',
      studentGrade: 'Pre-Kinder',
      guardianName: 'Ana María González',
      guardianEmail: 'ana.gonzalez@email.com',
      guardianPhone: '+56912345678',
      scheduledDate: new Date('2025-07-28T10:00:00'),
      scheduledTime: '10:00',
      duration: 30,
      location: 'Sala de Reuniones 1',
      status: MeetingStatus.SCHEDULED,
      type: MeetingType.PARENT_TEACHER,
      assignedTo: users[0].id,
    },
    {
      title: 'Seguimiento IEP - Carlos López',
      description: 'Revisión del plan de educación individualizada',
      studentName: 'Carlos López',
      studentGrade: 'Kinder',
      guardianName: 'Pedro López',
      guardianEmail: 'pedro.lopez@email.com',
      guardianPhone: '+56987654321',
      scheduledDate: new Date('2025-07-29T15:30:00'),
      scheduledTime: '15:30',
      duration: 45,
      location: 'Sala de Reuniones 2',
      status: MeetingStatus.CONFIRMED,
      type: MeetingType.IEP_REVIEW,
      assignedTo: users[1]?.id || users[0].id,
    },
    {
      title: 'Reunión Urgente - Sofía Martínez',
      description: 'Discusión sobre incidente reciente',
      studentName: 'Sofía Martínez',
      studentGrade: 'Pre-Kinder',
      guardianName: 'Lucía Martínez',
      guardianEmail: 'lucia.martinez@email.com',
      guardianPhone: '+56911223344',
      scheduledDate: new Date('2025-07-30T09:00:00'),
      scheduledTime: '09:00',
      duration: 30,
      location: 'Sala de Reuniones 1',
      status: MeetingStatus.SCHEDULED,
      type: MeetingType.EMERGENCY,
      assignedTo: users[0].id,
    },
    {
      title: 'Seguimiento Semanal - Diego Torres',
      description: 'Seguimiento del comportamiento y adaptación',
      studentName: 'Diego Torres',
      studentGrade: 'Kinder',
      guardianName: 'María Torres',
      guardianEmail: 'maria.torres@email.com',
      guardianPhone: '+56955443322',
      scheduledDate: new Date('2025-08-01T14:00:00'),
      scheduledTime: '14:00',
      duration: 30,
      location: 'Sala de Profesores',
      status: MeetingStatus.SCHEDULED,
      type: MeetingType.FOLLOW_UP,
      assignedTo: users[1]?.id || users[0].id,
    },
    {
      title: 'Reunión Final de Año - Valentina Silva',
      description: 'Evaluación final y recomendaciones',
      studentName: 'Valentina Silva',
      studentGrade: 'Pre-Kinder',
      guardianName: 'Carlos Silva',
      guardianEmail: 'carlos.silva@email.com',
      guardianPhone: '+56999887766',
      scheduledDate: new Date('2025-08-05T11:00:00'),
      scheduledTime: '11:00',
      duration: 45,
      location: 'Sala de Reuniones 1',
      status: MeetingStatus.SCHEDULED,
      type: MeetingType.GRADE_CONFERENCE,
      assignedTo: users[0].id,
    },
  ];

  for (const meeting of sampleMeetings) {
    try {
      await prisma.meeting.create({
        data: meeting,
      });
      console.log(`✅ Created meeting: ${meeting.title}`);
    } catch (error) {
      console.error(`❌ Error creating meeting: ${meeting.title}`, error);
    }
  }

  console.log('✅ Seeding completed!');
}

// Run the seeding
if (require.main === module) {
  seedMeetings()
    .catch(e => {
      console.error('❌ Error during seeding:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedMeetings };
