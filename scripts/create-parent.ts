#!/usr/bin/env tsx
/**
 * Parent User Creation Script
 * Creates a parent test user for development/testing
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/crypto';

const prisma = new PrismaClient();

async function createParentUser() {
  const showCredentials = process.argv.includes('--show-creds') || process.env.DEBUG === 'true';

  try {
    // Parent user credentials
    const parentEmail = 'parent@manitospintadas.cl';
    const parentPassword = 'parent123';
    const parentName = 'María López - Apoderada';

    // Hash password securely
    const hashedPassword = await hashPassword(parentPassword);

    // Create parent user
    const parent = await prisma.user.upsert({
      where: { email: parentEmail },
      update: {
        password: hashedPassword,
        isActive: true,
        name: parentName,
        role: 'PARENT',
        parentRole: 'apoderado',
        status: 'ACTIVE',
        isOAuthUser: false,
        provider: 'credentials',
      },
      create: {
        email: parentEmail,
        name: parentName,
        password: hashedPassword,
        role: 'PARENT',
        parentRole: 'apoderado',
        status: 'ACTIVE',
        isActive: true,
        isOAuthUser: false,
        provider: 'credentials',
      },
    });

    console.log(`✅ Parent user ${parent.email} ${parent.createdAt === parent.updatedAt ? 'created' : 'updated'}`);

    if (showCredentials) {
      console.log(`📧 Email: ${parentEmail}`);
      console.log(`🔑 Password: ${parentPassword}`);
      console.log(`👤 Name: ${parentName}`);
      console.log(`🔒 Password is securely hashed in database`);
    }

    return parent;
  } catch (error) {
    console.error('❌ Failed to create parent user:', error);

    // Provide helpful debugging information
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.error(
          '🔍 Database connection refused. Check DATABASE_URL environment variable.'
        );
      } else if (error.message.includes('schema')) {
        console.error(
          '🔍 Database schema issue. Run: npm run db:generate && npm run db:push'
        );
      }
    }

    throw error;
  }
}

createParentUser()
  .catch(error => {
    console.error('Fatal error during parent creation:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
