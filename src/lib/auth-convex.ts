/**
 * Convex Authentication Utilities
 * Replaces auth-prisma.ts with Convex-based authentication
 */

import bcryptjs from 'bcryptjs';
import { getConvexClient } from './convex';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

export type UserRole = 'MASTER' | 'ADMIN' | 'PROFESOR' | 'PARENT' | 'PUBLIC';

export interface User {
  _id: Id<"users">;
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  image: string | null;
  password?: string;
  isActive: boolean;
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<User | null> {
  try {
    const client = getConvexClient();
    
    // Get user by email
    const user = await client.query(api.users.getUserByEmail, { email });

    if (!user || !user.password) {
      return null;
    }

    // Verify password
    const isValidPassword = await bcryptjs.compare(password, user.password);
    
    if (!isValidPassword || !user.isActive) {
      return null;
    }

    // Return user without password
    return {
      _id: user._id,
      id: user._id,
      email: user.email,
      name: user.name ?? null,
      role: user.role,
      image: user.image ?? null,
      isActive: user.isActive,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const client = getConvexClient();
    const user = await client.query(api.users.getUserByEmail, { email });

    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      id: user._id,
      email: user.email,
      name: user.name ?? null,
      role: user.role,
      image: user.image ?? null,
      isActive: user.isActive,
    };
  } catch (error) {
    console.error('Find user error:', error);
    return null;
  }
}

/**
 * Find user by ID
 */
export async function findUserById(id: string | Id<"users">): Promise<User | null> {
  try {
    const client = getConvexClient();
    const user = await client.query(api.users.getUserById, { userId: id as Id<"users"> });

    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      id: user._id,
      email: user.email,
      name: user.name ?? null,
      role: user.role,
      image: user.image ?? null,
      isActive: user.isActive,
    };
  } catch (error) {
    console.error('Find user by ID error:', error);
    return null;
  }
}

/**
 * Create a new user
 */
export async function createUser(data: {
  email: string;
  password?: string;
  name?: string;
  role: UserRole;
  image?: string;
  phone?: string;
  provider?: string;
  isOAuthUser?: boolean;
}): Promise<User> {
  const client = getConvexClient();

  // Hash password if provided
  const hashedPassword = data.password
    ? await bcryptjs.hash(data.password, 10)
    : undefined;

  const userId = await client.mutation(api.users.createUser, {
    email: data.email,
    password: hashedPassword,
    name: data.name,
    role: data.role,
    image: data.image,
    phone: data.phone,
    provider: data.provider,
    isOAuthUser: data.isOAuthUser ?? false,
  });

  const user = await client.query(api.users.getUserById, { id: userId });

  if (!user) {
    throw new Error('Failed to create user');
  }

  return {
    _id: user._id,
    id: user._id,
    email: user.email,
    name: user.name ?? null,
    role: user.role,
    image: user.image ?? null,
    isActive: user.isActive,
  };
}
