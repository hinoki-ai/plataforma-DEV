import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

const JWT_SECRET = process.env.NEXTAUTH_SECRET;

export async function generateMagicLink(
  userId: string,
  email: string
): Promise<string> {
  if (!JWT_SECRET) {
    throw new Error('NEXTAUTH_SECRET is required for magic links');
  }

  const token = jwt.sign(
    { userId, email },
    JWT_SECRET,
    { noTimestamp: true } // Permanent token
  );

  return `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/magic-login/${token}`;
}

export async function createTeacherWithMagicLink(
  email: string,
  name: string,
  role: UserRole = UserRole.PROFESOR
) {
  // Generate random password (won't be used)
  const randomPassword = Math.random().toString(36).substring(2, 15);

  // Create user
  const user = await db.user.create({
    data: {
      email,
      name,
      role,
      password: randomPassword, // Won't be used
    },
  });

  // Generate magic link
  const magicLink = await generateMagicLink(user.id, user.email);

  return {
    user,
    magicLink,
    rawLink: magicLink, // For copy-paste
  };
}

export async function getMagicLink(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });

  if (!user) throw new Error('User not found');

  return generateMagicLink(user.id, user.email);
}
