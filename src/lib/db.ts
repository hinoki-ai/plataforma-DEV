import { PrismaClient } from '@prisma/client';

// Production-safe singleton pattern for all environments
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

// Create single client instance with optimized production configuration
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Configure connection pooling properly
    ...(process.env.NODE_ENV === 'production' && {
      // Production optimizations
      errorFormat: 'minimal',
      // Let Prisma handle connection pooling - don't override
    }),
  });

  // Add query performance monitoring using Prisma Client Extension
  const extendedClient = client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const before = Date.now();
          const result = await query(args);
          const after = Date.now();

          // Log slow queries in development
          if (process.env.NODE_ENV === 'development' && after - before > 1000) {
            console.log(`🐌 Slow Query (${after - before}ms):`, {
              model,
              operation,
            });
          }

          return result;
        },
      },
    },
  });

  return extendedClient;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Only store globally in development to prevent memory leaks
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown on process exit (server-side only)
if (typeof window === 'undefined' && typeof process !== 'undefined' && typeof process.on === 'function') {
  const gracefulShutdown = async () => {
    console.log('🔄 Graceful Prisma shutdown...');
    try {
      await prisma.$disconnect();
      console.log('✅ Prisma disconnected successfully');
    } catch (error) {
      console.error('❌ Error during Prisma shutdown:', error);
    }
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
  process.on('beforeExit', gracefulShutdown);
}

// Health check helper
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Consistent exports for all import patterns
export const db = prisma;
export default prisma;