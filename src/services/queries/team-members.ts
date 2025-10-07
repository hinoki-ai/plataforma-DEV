/**
 * Team Member Queries - Convex Implementation
 */

import { getConvexClient } from '@/lib/convex';
import { api } from '../../../convex/_generated/api';
import type { TeamMember } from '@/lib/prisma-compat-types';

/**
 * Adapter to convert Convex team member data to TeamMember interface
 */
function adaptTeamMember(convexMember: any): TeamMember {
  return {
    id: convexMember._id,
    name: convexMember.name,
    title: convexMember.title,
    description: convexMember.description,
    specialties: convexMember.specialties,
    imageUrl: convexMember.imageUrl,
    order: convexMember.order,
    isActive: convexMember.isActive,
    createdAt: new Date(convexMember.createdAt),
    updatedAt: new Date(convexMember.updatedAt),
  };
}

export async function getTeamMembers(isActive?: boolean) {
  try {
    const client = getConvexClient();
    const members = await client.query(api.teamMembers.getTeamMembers, { isActive });
    const adaptedMembers = members.map(adaptTeamMember);
    return { success: true, data: adaptedMembers };
  } catch (error) {
    console.error('Failed to fetch team members:', error);
    return { success: false, error: 'No se pudieron cargar los miembros del equipo', data: [] };
  }
}

export async function getTeamMemberById(id: string) {
  try {
    const client = getConvexClient();
    const member = await client.query(api.teamMembers.getTeamMemberById, { id: id as any });

    if (!member) {
      return { success: false, error: 'Miembro no encontrado' };
    }

    const adaptedMember = adaptTeamMember(member);
    return { success: true, data: adaptedMember };
  } catch (error) {
    console.error('Failed to fetch team member:', error);
    return { success: false, error: 'No se pudo cargar el miembro' };
  }
}

export async function getActiveTeamMembers() {
  return getTeamMembers(true);
}
