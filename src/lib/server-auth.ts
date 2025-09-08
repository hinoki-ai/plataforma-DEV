import { auth } from '@/lib/auth';
import {
  hasPermission,
  Permissions,
  ExtendedUserRole,
  isStandardUserRole,
} from '@/lib/authorization';
import { redirect } from 'next/navigation';

export async function getServerSession() {
  const session = await auth();
  return session;
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  return session;
}

export async function requirePermission(
  permission: Parameters<typeof hasPermission>[1]
) {
  const session = await requireAuth();

  if (
    !isStandardUserRole(session.user.role) ||
    !hasPermission(session.user.role, permission)
  ) {
    redirect('/unauthorized');
  }

  return session;
}

export async function hasServerPermission(
  permission: Parameters<typeof hasPermission>[1]
) {
  const session = await getServerSession();
  if (!session?.user) return false;
  return hasPermission(session.user.role, permission);
}

export async function getUserRole(): Promise<ExtendedUserRole | null> {
  const session = await getServerSession();
  return session?.user?.role || null;
}

export async function isAdmin() {
  const role = await getUserRole();
  return role === 'ADMIN';
}

export async function isProfesor() {
  const role = await getUserRole();
  return role === 'PROFESOR';
}

export async function isParent() {
  const role = await getUserRole();
  return role === 'PARENT';
}
