'use server';

import { db } from '@/lib/db';
import { revalidatePath, revalidateTag } from 'next/cache';
import { TeamMemberSchema } from '@/lib/validation';

export async function createTeamMember(data: unknown) {
  const validated = TeamMemberSchema.parse(data);

  const teamMember = await db.teamMember.create({
    data: {
      ...validated,
      specialties: JSON.stringify(validated.specialties),
    },
  });

  revalidatePath('/admin/equipo-multidisciplinario');
  revalidatePath('/public/equipo-multidisciplinario');
  revalidateTag('team-members');

  return teamMember;
}

export async function updateTeamMember(id: string, data: unknown) {
  const validated = TeamMemberSchema.parse(data);

  const teamMember = await db.teamMember.update({
    where: { id },
    data: {
      ...validated,
      specialties: JSON.stringify(validated.specialties),
    },
  });

  revalidatePath('/admin/equipo-multidisciplinario');
  revalidatePath('/public/equipo-multidisciplinario');
  revalidateTag('team-members');

  return teamMember;
}

export async function deleteTeamMember(id: string) {
  await db.teamMember.delete({
    where: { id },
  });

  revalidatePath('/admin/equipo-multidisciplinario');
  revalidatePath('/public/equipo-multidisciplinario');
  revalidateTag('team-members');
}

export async function toggleTeamMemberStatus(id: string, isActive: boolean) {
  await db.teamMember.update({
    where: { id },
    data: { isActive },
  });

  revalidatePath('/admin/equipo-multidisciplinario');
  revalidatePath('/public/equipo-multidisciplinario');
  revalidateTag('team-members');
}
