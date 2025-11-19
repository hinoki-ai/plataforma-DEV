"use server";

/**
 * Team Member Actions (Mutations) - Convex Implementation
 */

import { getAuthenticatedConvexClient } from "@/lib/convex-server";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export async function createTeamMember(data: {
  name: string;
  title: string;
  description: string;
  specialties: string[];
  imageUrl?: string;
  order?: number;
}) {
  try {
    const client = await getAuthenticatedConvexClient();

    const memberId = await client.mutation(
      api.teamMembers.createTeamMember,
      data,
    );

    return { success: true, data: { id: memberId } };
  } catch (error) {
    console.error("Failed to create team member:", error);
    return { success: false, error: "No se pudo crear el miembro del equipo" };
  }
}

export async function updateTeamMember(
  id: string,
  data: {
    name?: string;
    title?: string;
    description?: string;
    specialties?: string[];
    imageUrl?: string;
    order?: number;
    isActive?: boolean;
  },
) {
  try {
    const client = await getAuthenticatedConvexClient();

    await client.mutation(api.teamMembers.updateTeamMember, {
      id: id as Id<"teamMembers">,
      ...data,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update team member:", error);
    return {
      success: false,
      error: "No se pudo actualizar el miembro del equipo",
    };
  }
}

export async function deleteTeamMember(id: string) {
  try {
    const client = await getAuthenticatedConvexClient();
    await client.mutation(api.teamMembers.deleteTeamMember, {
      id: id as Id<"teamMembers">,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to delete team member:", error);
    return {
      success: false,
      error: "No se pudo eliminar el miembro del equipo",
    };
  }
}

export async function toggleTeamMemberStatus(id: string, isActive: boolean) {
  try {
    const client = await getAuthenticatedConvexClient();
    await client.mutation(api.teamMembers.toggleTeamMemberStatus, {
      id: id as Id<"teamMembers">,
      isActive,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle team member status:", error);
    return {
      success: false,
      error: "No se pudo cambiar el estado del miembro del equipo",
    };
  }
}
