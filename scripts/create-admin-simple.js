#!/usr/bin/env node

/**
 * DEPRECATED: Simple script to create admin user using native PostgreSQL client
 * This script uses CommonJS and contains hardcoded passwords
 * Use the modern TypeScript version instead: scripts/create-admin.ts
 *
 * Bypasses Prisma to avoid prepared statement issues
 */

const { Client } = require('pg');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: '.env.production' });

async function createAdminUser() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // For production Supabase
    },
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();

    console.log('🔐 Hashing passwords...');
    const andreinaPassword = await bcrypt.hash('lilo1308', 12);
    const backupPassword = await bcrypt.hash('admin123', 12);

    console.log('👤 Creating Andreina as primary admin...');

    // Create or update Andreina's user
    const andreinaQuery = `
      INSERT INTO users (id, name, email, password, role, "isActive", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        "isActive" = EXCLUDED."isActive",
        "updatedAt" = NOW()
      RETURNING id, name, email, role;
    `;

    const andreinaResult = await client.query(andreinaQuery, [
      'Andreina Giovanna Salazar Nuñez',
      'inacorgan@gmail.com',
      andreinaPassword,
      'ADMIN',
      true
    ]);

    console.log('✅ Andreina created/updated:', andreinaResult.rows[0]);

    console.log('👤 Creating backup admin...');

    // Create or update backup admin
    const backupQuery = `
      INSERT INTO users (id, name, email, password, role, "isActive", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        "isActive" = EXCLUDED."isActive",
        "updatedAt" = NOW()
      RETURNING id, name, email, role;
    `;

    const backupResult = await client.query(backupQuery, [
      'Administrador Backup',
      'admin@manitospintadas.cl',
      backupPassword,
      'ADMIN',
      true
    ]);

    console.log('✅ Backup admin created/updated:', backupResult.rows[0]);

    console.log('\n🎉 Production admin users created successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log('   Primary Admin (Andreina): inacorgan@gmail.com / lilo1308');
    console.log('   Backup Admin: admin@manitospintadas.cl / admin123');

    // Verify users
    const verifyQuery = 'SELECT name, email, role, "isActive" FROM users WHERE email IN ($1, $2)';
    const verifyResult = await client.query(verifyQuery, ['inacorgan@gmail.com', 'admin@manitospintadas.cl']);

    console.log('\n📊 Current Admin Users:');
    verifyResult.rows.forEach(user => {
      console.log(`   👤 ${user.name} (${user.email}) - ${user.role} - Active: ${user.isActive}`);
    });

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createAdminUser();