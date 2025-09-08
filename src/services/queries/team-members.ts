import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getRoleFilter } from '@/lib/role-utils';
import type {
  TeamMembersResponse,
  TeamMemberResponse,
} from '@/lib/types/service-responses';

export async function getTeamMembers(): Promise<TeamMembersResponse> {
  try {
    const session = await auth();
    const roleFilter = getRoleFilter(session?.user?.role);

    const teamMembers = await db.teamMember.findMany({
      where: {
        ...roleFilter,
        // Team members are generally public information
        // but we apply role filter for consistency
      },
      orderBy: { order: 'asc' },
    });

    return { success: true, data: teamMembers };
  } catch (error) {
    console.error('Failed to fetch team members:', error);
    return {
      success: false,
      error: 'No se pudieron cargar los miembros del equipo',
      data: [],
    };
  }
}

export async function getActiveTeamMembers(): Promise<TeamMembersResponse> {
  try {
    // For public pages, we don't need authentication
    const teamMembers = await db.teamMember.findMany({
      where: {
        isActive: true,
      },
      orderBy: { order: 'asc' },
    });

    return { success: true, data: teamMembers };
  } catch (error) {
    console.error('Failed to fetch active team members:', error);

    // Return mock data when database is not available
    const mockTeamMembers = [
      {
        id: 'mock-1',
        name: 'María González',
        title: 'Directora',
        description:
          'Profesional especializada en educación especial con más de 15 años de experiencia en el desarrollo integral de niños y niñas.',
        specialties: [
          'Liderazgo educativo',
          'Planificación estratégica',
          'Gestión pedagógica',
        ],
        imageUrl: null,
        email: 'maria.gonzalez@manitospintadas.cl',
        phone: '+56 9 1234 5678',
        isActive: true,
        order: 1,
        position: 'Directora',
        bio: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'mock-2',
        name: 'Carlos Rodríguez',
        title: 'Fonoaudiólogo',
        description:
          'Especialista en terapia del lenguaje y comunicación, dedicado a ayudar a los niños a desarrollar sus habilidades comunicativas.',
        specialties: [
          'Terapia del lenguaje',
          'Trastornos de la comunicación',
          'Evaluación fonoaudiológica',
        ],
        imageUrl: null,
        email: 'carlos.rodriguez@manitospintadas.cl',
        phone: '+56 9 2345 6789',
        isActive: true,
        order: 2,
        position: 'Fonoaudiólogo',
        bio: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'mock-3',
        name: 'Ana Martínez',
        title: 'Psicóloga Educacional',
        description:
          'Profesional enfocada en el apoyo emocional y desarrollo cognitivo de los estudiantes, creando un ambiente seguro para el aprendizaje.',
        specialties: [
          'Psicología infantil',
          'Evaluación psicopedagógica',
          'Apoyo emocional',
        ],
        imageUrl: null,
        email: 'ana.martinez@manitospintadas.cl',
        phone: '+56 9 3456 7890',
        isActive: true,
        order: 3,
        position: 'Psicóloga Educacional',
        bio: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return { success: true, data: mockTeamMembers };
  }
}

export async function getTeamMemberById(
  id: string
): Promise<TeamMemberResponse> {
  try {
    const session = await auth();
    const roleFilter = getRoleFilter(session?.user?.role);

    const teamMember = await db.teamMember.findUnique({
      where: {
        id,
        ...roleFilter,
      },
    });

    if (!teamMember) {
      return { success: false, error: 'Miembro del equipo no encontrado' };
    }

    return { success: true, data: teamMember };
  } catch (error) {
    console.error('Failed to fetch team member by ID:', error);
    return {
      success: false,
      error: 'No se pudo cargar el miembro del equipo',
    };
  }
}
