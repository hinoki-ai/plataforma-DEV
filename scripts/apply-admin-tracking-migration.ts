#!/usr/bin/env tsx
/**
 * Apply Admin Tracking Migration
 * Adds the createdByAdmin field to track admin hierarchy
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient({
  log: ['error'],
});

async function applyMigration() {
  console.log('🔧 Applying admin tracking migration...');

  try {
    // Read the migration SQL file
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const migrationPath = join(__dirname, 'add-admin-tracking-migration.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration SQL loaded');

    // Execute the migration
    await prisma.$executeRawUnsafe(migrationSQL);

    console.log('✅ Migration applied successfully!');
    console.log('🔍 New features:');
    console.log('  - Admin creation limits (1 secondary admin per main admin)');
    console.log('  - Business model messaging for additional admin slots');
    console.log('  - Admin hierarchy tracking');

  } catch (error) {
    console.error('❌ Migration failed:', error);

    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Column might already exist, checking...');
        // Check if the column exists
        const result = await prisma.$queryRaw`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = 'users'
          AND column_name = 'created_by_admin'
        `;

        if (Array.isArray(result) && result.length > 0) {
          console.log('✅ Column already exists, migration complete');
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
  }
}

applyMigration()
  .catch(error => {
    console.error('Fatal error during migration:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });