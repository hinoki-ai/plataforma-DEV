const { execSync } = require('child_process');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

console.log('DATABASE_URL available:', !!process.env.DATABASE_URL);

async function deployMigrations() {
  let prisma = null;

  try {
    console.log('Resetting database connection...');
    prisma = new PrismaClient();
    await prisma.$disconnect();

    console.log('Deploying database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('Migrations deployed successfully!');
  } catch (error) {
    console.error('Failed to deploy migrations:', error);
    process.exit(1);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

deployMigrations();