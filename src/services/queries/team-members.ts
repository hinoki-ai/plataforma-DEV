/**
 * Team Member Queries - Convex Implementation
 */

import { getConvexClient } from '@/lib/convex';
import { api } from '../../../convex/_generated/api';

export async function getTeamMembers(isActive?: boolean) {
  try {
    const client = getConvexClient();
    const members = await client.query(api.teamMembers.getTeamMembers, { isActive });
    return { success: true, data: members };
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

    return { success: true, data: member };
  } catch (error) {
    console.error('Failed to fetch team member:', error);
    return { success: false, error: 'No se pudo cargar el miembro' };
  }
}

export async function getActiveTeamMembers() {
  return getTeamMembers(true);
}
