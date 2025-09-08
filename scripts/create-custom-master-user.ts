#!/usr/bin/env tsx
/**
 * Create Custom Master User Script
 * Creates a master user with the specified credentials
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/crypto';

const prisma = new PrismaClient();

async function createCustomMasterUser() {
  console.log('🔑 Creating custom master user...');

  try {
    const masterEmail = 'agustinaramac@gmail.com';
    const masterPassword = 'madmin123';
    const masterName = 'Agustin Arancibia Mac-Guire - Master Deity';

    // Hash the password
    const masterPasswordHash = await hashPassword(masterPassword);

    // Create/update master user
    const master = await prisma.user.upsert({
      where: { email: masterEmail },
      update: {
        password: masterPasswordHash,
        isActive: true,
        name: masterName,
        role: 'MASTER',
      },
      create: {
        email: masterEmail,
        name: masterName,
        password: masterPasswordHash,
        role: 'MASTER',
        isActive: true,
      },
    });

    console.log('✅ Custom master user created/updated:');
    console.log(`📧 Email: ${masterEmail}`);
    console.log(`👤 Name: ${masterName}`);
    console.log(`🔰 Role: ${master.role}`);
    console.log(`✅ Active: ${master.isActive}`);
    console.log(`🔒 Password: ${masterPassword}`);
    console.log('🔒 Password is securely hashed in database');

    return master;
  } catch (error) {
    console.error('❌ Failed to create custom master user:', error);
    throw error;
  }
}

createCustomMasterUser()
  .catch(error => {
    console.error('Fatal error during custom master user creation:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });