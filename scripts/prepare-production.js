#!/usr/bin/env node

/**
 * Production preparation script
 * Validates PostgreSQL configuration for production builds
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing for production deployment...');

// Check if we're in production environment
const isProduction =
  process.env.NODE_ENV === 'production' || process.env.VERCEL;

if (isProduction) {
  console.log('🐘 Validating PostgreSQL configuration for production...');

  const currentSchema = path.join(__dirname, '../prisma/schema.prisma');

  if (fs.existsSync(currentSchema)) {
    const schemaContent = fs.readFileSync(currentSchema, 'utf8');

    if (schemaContent.includes('provider = "postgresql"')) {
      console.log('✅ PostgreSQL provider confirmed in schema');
    } else {
      console.error('❌ Schema must use PostgreSQL provider for production!');
      process.exit(1);
    }

    if (
      process.env.DATABASE_URL &&
      process.env.DATABASE_URL.startsWith('postgresql://')
    ) {
      console.log('✅ PostgreSQL DATABASE_URL validated');
    } else {
      console.error('❌ DATABASE_URL must be a PostgreSQL connection string!');
      console.log(
        '📝 Expected format: postgresql://username:password@host:port/database'
      );
      process.exit(1);
    }

    console.log('✅ PostgreSQL configuration validated');
  } else {
    console.error('❌ Prisma schema not found!');
    process.exit(1);
  }
} else {
  console.log('🔧 Development mode: PostgreSQL ready for local development');
}

console.log('✅ Production preparation complete');
