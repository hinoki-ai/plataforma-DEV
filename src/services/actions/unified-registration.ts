/**
 * Unified Registration Actions - Convex Implementation
 */

import { getConvexClient } from '@/lib/convex';
import { api } from '../../../convex/_generated/api';
import bcryptjs from 'bcryptjs';

export async function registerParent(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}) {
  try {
    const client = getConvexClient();
    
    // Hash password
    const hashedPassword = await bcryptjs.hash(data.password, 10);

    const userId = await client.mutation(api.users.createUser, {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      phone: data.phone,
      role: 'PARENT',
      isOAuthUser: false,
    });

    return { success: true, data: { id: userId } };
  } catch (error: any) {
    console.error('Failed to register parent:', error);
    
    if (error.message?.includes('already exists')) {
      return { success: false, error: 'El correo electrónico ya está registrado' };
    }
    
    return { success: false, error: 'No se pudo completar el registro' };
  }
}
