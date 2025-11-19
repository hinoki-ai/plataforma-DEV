/**
 * Team Member Queries - Convex Implementation
 */

import { getAuthenticatedConvexClient } from "@/lib/convex-server";
import { api } from "../../../convex/_generated/api";
import type { TeamMember } from "@/lib/prisma-compat-types";

/**
 * Adapter to convert Convex team member data to TeamMember interface
 */
function adaptTeamMember(convexMember: Record<string, unknown>): TeamMember {
  return {
    id: convexMember._id as string,
    name: convexMember.name as string,
    title: convexMember.title as string,
    description: convexMember.description as string,
    specialties: convexMember.specialties as string[],
    imageUrl: convexMember.imageUrl as string | undefined,
    order: convexMember.order as number,
    isActive: convexMember.isActive as boolean,
    createdAt: new Date(convexMember.createdAt as number),
    updatedAt: new Date(convexMember.updatedAt as number),
  };
}

export async function getTeamMembers(isActive?: boolean) {
  try {
    const client = await getAuthenticatedConvexClient();
    const members = await client.query(api.teamMembers.getTeamMembers, {
      isActive,
    });
    const adaptedMembers = members.map(adaptTeamMember);
    return { success: true, data: adaptedMembers };
  } catch (error) {
    console.error("Failed to fetch team members:", error);
    return {
      success: false,
      error: "No se pudieron cargar los miembros del equipo",
      data: [],
    };
  }
}

export async function getTeamMemberById(id: string) {
  try {
    const client = await getAuthenticatedConvexClient();
    const member = await client.query(api.teamMembers.getTeamMemberById, {
      id: id as never,
    });

    if (!member) {
      return { success: false, error: "Miembro no encontrado" };
    }

    const adaptedMember = adaptTeamMember(member);
    return { success: true, data: adaptedMember };
  } catch (error) {
    console.error("Failed to fetch team member:", error);
    return { success: false, error: "No se pudo cargar el miembro" };
  }
}

export async function getActiveTeamMembers() {
  return getTeamMembers(true);
}
