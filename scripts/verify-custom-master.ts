#!/usr/bin/env tsx
/**
 * Verify Custom Master User Script
 * Verifies that the custom master user exists and has correct credentials
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyCustomMasterUser() {
  console.log('🔍 Verifying custom master user...');

  try {
    const masterUser = await prisma.user.findUnique({
      where: { email: 'agustinaramac@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        password: true, // We'll just check if it exists
      },
    });

    if (!masterUser) {
      console.log('❌ Custom master user not found!');
      return false;
    }

    console.log('✅ Custom master user found:');
    console.log(`📧 Email: ${masterUser.email}`);
    console.log(`👤 Name: ${masterUser.name}`);
    console.log(`🔰 Role: ${masterUser.role}`);
    console.log(`✅ Active: ${masterUser.isActive}`);
    console.log(`🔒 Has Password: ${!!masterUser.password}`);

    if (masterUser.role !== 'MASTER') {
      console.log('❌ ERROR: User role is not MASTER!');
      return false;
    }

    if (!masterUser.isActive) {
      console.log('❌ ERROR: Master user is not active!');
      return false;
    }

    if (!masterUser.password) {
      console.log('❌ ERROR: Master user has no password!');
      return false;
    }

    console.log('🎉 Custom master user is properly configured!');
    console.log('💡 Login credentials: agustinaramac@gmail.com / madmin123');

    return true;
  } catch (error) {
    console.error('❌ Error verifying custom master user:', error);
    return false;
  }
}

verifyCustomMasterUser()
  .catch(error => {
    console.error('Fatal error during custom master user verification:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });