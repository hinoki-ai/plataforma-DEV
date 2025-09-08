const { execSync } = require('child_process');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

console.log('DATABASE_URL available:', !!process.env.DATABASE_URL);

async function resetDatabase() {
  let prisma = null;

  try {
    console.log('Resetting database connection...');
    prisma = new PrismaClient();

    // Force disconnect to clear prepared statements
    await prisma.$disconnect();

    // Wait a bit for cleanup
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Pushing database schema...');
    execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
    console.log('Database schema pushed successfully!');

  } catch (error) {
    console.error('Failed to reset database:', error);
    process.exit(1);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

resetDatabase();