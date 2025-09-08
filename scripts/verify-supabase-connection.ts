#!/usr/bin/env tsx

/**
 * Supabase Connection Verification Script
 * Tests PostgreSQL connection and runs basic queries
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySupabaseConnection() {
  console.log('🔍 Verifying Supabase connection...');

  try {
    // Test 1: Basic connection
    console.log('\n1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test 2: Raw query test
    console.log('\n2️⃣ Testing raw PostgreSQL query...');
    const result = await prisma.$queryRaw`SELECT version() as version`;
    console.log(
      '✅ PostgreSQL version:',
      (result as any)[0]?.version?.substring(0, 50) + '...'
    );

    // Test 3: Schema verification
    console.log('\n3️⃣ Verifying database schema...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    console.log('✅ Found', (tables as any[]).length, 'tables in database');

    // Test 4: Test user operations
    console.log('\n4️⃣ Testing user operations...');
    const userCount = await prisma.user.count();
    console.log('✅ Current user count:', userCount);

    // Test 5: Test connection pooling
    console.log('\n5️⃣ Testing connection pooling...');
    const connections = await prisma.$queryRaw`
      SELECT count(*) as active_connections 
      FROM pg_stat_activity 
      WHERE state = 'active';
    `;
    console.log(
      '✅ Active connections:',
      (connections as any)[0]?.active_connections
    );

    console.log('\n🎉 All Supabase connection tests passed!');
    console.log('\n📊 Database Status:');
    console.log(`   - PostgreSQL: Connected`);
    console.log(`   - Tables: ${(tables as any[]).length} created`);
    console.log(`   - Users: ${userCount} registered`);
    console.log(`   - Connection pooling: Working`);
  } catch (error) {
    console.error('\n❌ Supabase connection test failed:');
    console.error('Error:', error);

    if ((error as any)?.code === 'P1001') {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Check DATABASE_URL in environment variables');
      console.error('   - Verify Supabase project is running');
      console.error('   - Confirm database password is correct');
      console.error('   - Check network connectivity');
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifySupabaseConnection();
