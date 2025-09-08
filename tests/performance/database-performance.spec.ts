/**
 * Database Performance Testing Suite
 * Tests database operations under various load conditions
 */

import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

interface QueryPerformanceResult {
  query: string;
  executionTime: number;
  recordsAffected: number;
  success: boolean;
  error?: string;
}

test.describe('Database Performance Tests', () => {
  async function measureQueryPerformance<T>(
    queryName: string,
    queryFunction: () => Promise<T>
  ): Promise<QueryPerformanceResult> {
    const startTime = Date.now();

    try {
      const result = await queryFunction();
      const endTime = Date.now();

      return {
        query: queryName,
        executionTime: endTime - startTime,
        recordsAffected: Array.isArray(result) ? result.length : 1,
        success: true,
      };
    } catch (error) {
      const endTime = Date.now();

      return {
        query: queryName,
        executionTime: endTime - startTime,
        recordsAffected: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async function createBulkTestData(recordCount: number) {
    // Create test users
    const users = Array.from({ length: Math.min(recordCount, 100) }, () => ({
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: faker.helpers.arrayElement(['ADMIN', 'PROFESOR']),
      hashedPassword: faker.string.alphanumeric(60),
    }));

    await prisma.user.createMany({
      data: users,
      skipDuplicates: true,
    });

    const createdUsers = await prisma.user.findMany({
      take: Math.min(recordCount, 100),
      orderBy: { createdAt: 'desc' },
    });

    // Create planning documents
    const planningDocs = Array.from({ length: recordCount }, () => ({
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraphs(3),
      subject: faker.helpers.arrayElement([
        'Mathematics',
        'Science',
        'Language',
        'History',
      ]),
      grade: faker.helpers.arrayElement([
        '1st',
        '2nd',
        '3rd',
        '4th',
        '5th',
        '6th',
      ]),
      duration: faker.number.int({ min: 30, max: 120 }),
      objectives: faker.lorem.paragraphs(2),
      content: faker.lorem.paragraphs(5),
      methodology: faker.lorem.paragraph(),
      resources: faker.lorem.words(10),
      evaluation: faker.lorem.paragraph(),
      authorId: faker.helpers.arrayElement(createdUsers).id,
    }));

    await prisma.planningDocument.createMany({
      data: planningDocs,
    });

    // Create meetings
    const meetings = Array.from(
      { length: Math.floor(recordCount / 2) },
      () => ({
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        scheduledAt: faker.date.future(),
        duration: faker.number.int({ min: 15, max: 60 }),
        meetingType: faker.helpers.arrayElement([
          'PARENT_TEACHER',
          'TEAM',
          'PLANNING',
        ]),
        status: faker.helpers.arrayElement([
          'SCHEDULED',
          'COMPLETED',
          'CANCELLED',
        ]),
        teacherId: faker.helpers.arrayElement(
          createdUsers.filter(u => u.role === 'PROFESOR')
        ).id,
      })
    );

    await prisma.meeting.createMany({
      data: meetings,
      skipDuplicates: true,
    });

    return {
      usersCreated: createdUsers.length,
      planningDocsCreated: recordCount,
      meetingsCreated: meetings.length,
    };
  }

  test.beforeAll(async () => {
    // Clean up any existing test data
    await prisma.meeting.deleteMany({
      where: {
        title: { contains: 'faker' },
      },
    });
    await prisma.planningDocument.deleteMany({
      where: {
        title: { contains: 'faker' },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: { contains: 'test' },
      },
    });
  });

  test.afterAll(async () => {
    // Clean up test data
    await prisma.meeting.deleteMany({
      where: {
        title: { contains: 'faker' },
      },
    });
    await prisma.planningDocument.deleteMany({
      where: {
        title: { contains: 'faker' },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: { contains: 'test' },
      },
    });

    await prisma.$disconnect();
  });

  test('Basic CRUD operations performance', async () => {
    const results: QueryPerformanceResult[] = [];

    // CREATE operation
    const createResult = await measureQueryPerformance('Create User', () =>
      prisma.user.create({
        data: {
          email: `perf-test-${Date.now()}@test.com`,
          name: 'Performance Test User',
          role: 'PROFESOR',
          hashedPassword: 'test-hash',
        },
      })
    );
    results.push(createResult);

    const userId = await prisma.user.findFirst({
      where: {
        email: createResult.query.includes('Create')
          ? `perf-test-${Date.now()}@test.com`
          : undefined,
      },
      select: { id: true },
    });

    // READ operation
    const readResult = await measureQueryPerformance('Read User', () =>
      prisma.user.findUnique({
        where: { id: userId?.id },
        include: {
          planningDocuments: true,
          assignedMeetings: true,
        },
      })
    );
    results.push(readResult);

    // UPDATE operation
    const updateResult = await measureQueryPerformance('Update User', () =>
      prisma.user.update({
        where: { id: userId?.id },
        data: { name: 'Updated Performance Test User' },
      })
    );
    results.push(updateResult);

    // DELETE operation
    const deleteResult = await measureQueryPerformance('Delete User', () =>
      prisma.user.delete({
        where: { id: userId?.id },
      })
    );
    results.push(deleteResult);

    console.log('CRUD Performance Results:', results);

    // Performance assertions
    results.forEach(result => {
      expect(result.success).toBe(true);
      expect(result.executionTime).toBeLessThan(1000); // 1 second max
    });

    // Specific operation expectations
    const createTime =
      results.find(r => r.query === 'Create User')?.executionTime || 0;
    const readTime =
      results.find(r => r.query === 'Read User')?.executionTime || 0;
    const updateTime =
      results.find(r => r.query === 'Update User')?.executionTime || 0;
    const deleteTime =
      results.find(r => r.query === 'Delete User')?.executionTime || 0;

    expect(createTime).toBeLessThan(500); // 500ms for create
    expect(readTime).toBeLessThan(300); // 300ms for read
    expect(updateTime).toBeLessThan(500); // 500ms for update
    expect(deleteTime).toBeLessThan(300); // 300ms for delete
  });

  test('Large dataset query performance', async () => {
    // Create test dataset
    const testData = await createBulkTestData(1000);
    console.log('Created test dataset:', testData);

    const results: QueryPerformanceResult[] = [];

    // Test pagination performance
    const paginationResult = await measureQueryPerformance(
      'Paginated Query (1000 records)',
      () =>
        prisma.planningDocument.findMany({
          take: 20,
          skip: 0,
          include: {
            author: true,
          },
          orderBy: { createdAt: 'desc' },
        })
    );
    results.push(paginationResult);

    // Test search performance
    const searchResult = await measureQueryPerformance('Search Query', () =>
      prisma.planningDocument.findMany({
        where: {
          OR: [
            { title: { contains: 'test' } },
            { subject: { contains: 'Math' } },
            { description: { contains: 'learning' } },
          ],
        },
        include: { author: true },
      })
    );
    results.push(searchResult);

    // Test aggregation performance
    const aggregationResult = await measureQueryPerformance(
      'Aggregation Query',
      () =>
        prisma.planningDocument.groupBy({
          by: ['subject'],
          _count: {
            id: true,
          },
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        })
    );
    results.push(aggregationResult);

    // Test complex join performance
    const joinResult = await measureQueryPerformance('Complex Join Query', () =>
      prisma.user.findMany({
        where: {
          role: 'PROFESOR',
        },
        include: {
          planningDocuments: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
          assignedMeetings: {
            where: {
              status: 'SCHEDULED',
            },
          },
        },
      })
    );
    results.push(joinResult);

    console.log('Large Dataset Query Performance:', results);

    // Performance assertions
    results.forEach(result => {
      expect(result.success).toBe(true);
      expect(result.executionTime).toBeLessThan(5000); // 5 seconds max for complex queries
    });

    // Specific performance expectations
    expect(paginationResult.executionTime).toBeLessThan(1000); // Pagination should be fast
    expect(searchResult.executionTime).toBeLessThan(2000); // Search should be reasonable
    expect(aggregationResult.executionTime).toBeLessThan(1500); // Aggregation should be optimized
  });

  test('Concurrent database operations', async () => {
    const concurrentOperations = 20;
    const operationPromises: Promise<QueryPerformanceResult>[] = [];

    // Create concurrent read operations
    for (let i = 0; i < concurrentOperations; i++) {
      const promise = measureQueryPerformance(`Concurrent Read ${i + 1}`, () =>
        prisma.planningDocument.findMany({
          take: 10,
          include: { author: true },
        })
      );
      operationPromises.push(promise);
    }

    // Create concurrent write operations
    for (let i = 0; i < Math.floor(concurrentOperations / 2); i++) {
      const promise = measureQueryPerformance(`Concurrent Write ${i + 1}`, () =>
        prisma.planningDocument.create({
          data: {
            title: `Concurrent Test ${i + 1}`,
            description: 'Concurrent operation test',
            subject: 'Test Subject',
            grade: '1st',
            duration: 60,
            objectives: 'Test objectives',
            content: 'Test content',
            methodology: 'Test methodology',
            resources: 'Test resources',
            evaluation: 'Test evaluation',
            authorId: 1, // Assume user ID 1 exists
          },
        })
      );
      operationPromises.push(promise);
    }

    const results = await Promise.all(operationPromises);

    console.log('Concurrent Operations Performance:', {
      totalOperations: results.length,
      averageExecutionTime:
        results.reduce((sum, r) => sum + r.executionTime, 0) / results.length,
      maxExecutionTime: Math.max(...results.map(r => r.executionTime)),
      successRate:
        (results.filter(r => r.success).length / results.length) * 100,
    });

    // All operations should succeed
    expect(results.every(r => r.success)).toBe(true);

    // Average response time should be reasonable under concurrent load
    const averageTime =
      results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
    expect(averageTime).toBeLessThan(2000); // 2 seconds average

    // No single operation should take too long
    const maxTime = Math.max(...results.map(r => r.executionTime));
    expect(maxTime).toBeLessThan(5000); // 5 seconds max
  });

  test('Database connection pool performance', async () => {
    const connectionTests: Promise<QueryPerformanceResult>[] = [];

    // Test multiple rapid connections
    for (let i = 0; i < 50; i++) {
      const promise = measureQueryPerformance(
        `Connection Test ${i + 1}`,
        async () => {
          const result = await prisma.user.count();
          return result;
        }
      );
      connectionTests.push(promise);
    }

    const results = await Promise.all(connectionTests);

    console.log('Connection Pool Performance:', {
      totalConnections: results.length,
      averageTime:
        results.reduce((sum, r) => sum + r.executionTime, 0) / results.length,
      maxTime: Math.max(...results.map(r => r.executionTime)),
      successRate:
        (results.filter(r => r.success).length / results.length) * 100,
      failures: results.filter(r => !r.success).map(r => r.error),
    });

    // All connections should succeed
    expect(results.every(r => r.success)).toBe(true);

    // Connection pool should handle rapid connections efficiently
    const averageTime =
      results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
    expect(averageTime).toBeLessThan(500); // 500ms average for simple queries
  });

  test('Memory usage during large operations', async () => {
    const initialMemory = process.memoryUsage();

    // Perform memory-intensive operation
    const largeResult = await measureQueryPerformance(
      'Large Query Result',
      () =>
        prisma.planningDocument.findMany({
          include: {
            author: true,
          },
          take: 1000, // Large result set
        })
    );

    const peakMemory = process.memoryUsage();

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const finalMemory = process.memoryUsage();

    console.log('Memory Usage Analysis:', {
      initial: {
        heapUsed: `${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(initialMemory.heapTotal / 1024 / 1024).toFixed(2)}MB`,
      },
      peak: {
        heapUsed: `${(peakMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(peakMemory.heapTotal / 1024 / 1024).toFixed(2)}MB`,
      },
      final: {
        heapUsed: `${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(finalMemory.heapTotal / 1024 / 1024).toFixed(2)}MB`,
      },
      queryTime: largeResult.executionTime,
      recordsReturned: largeResult.recordsAffected,
    });

    // Memory usage should be reasonable
    expect(peakMemory.heapUsed).toBeLessThan(200 * 1024 * 1024); // 200MB max

    // Query should complete successfully
    expect(largeResult.success).toBe(true);
    expect(largeResult.executionTime).toBeLessThan(10000); // 10 seconds max
  });

  test('Database transaction performance', async () => {
    const transactionResults: QueryPerformanceResult[] = [];

    // Test simple transaction
    const simpleTransaction = await measureQueryPerformance(
      'Simple Transaction',
      () =>
        prisma.$transaction(async tx => {
          const user = await tx.user.create({
            data: {
              email: `tx-test-${Date.now()}@test.com`,
              name: 'Transaction Test User',
              role: 'PROFESOR',
              hashedPassword: 'test-hash',
            },
          });

          await tx.planningDocument.create({
            data: {
              title: 'Transaction Test Document',
              description: 'Test document for transaction',
              subject: 'Test',
              grade: '1st',
              duration: 60,
              objectives: 'Test objectives',
              content: 'Test content',
              methodology: 'Test methodology',
              resources: 'Test resources',
              evaluation: 'Test evaluation',
              authorId: user.id,
            },
          });

          return user;
        })
    );
    transactionResults.push(simpleTransaction);

    // Test complex transaction with multiple operations
    const complexTransaction = await measureQueryPerformance(
      'Complex Transaction',
      () =>
        prisma.$transaction(async tx => {
          // Create multiple related records
          const user = await tx.user.create({
            data: {
              email: `complex-tx-${Date.now()}@test.com`,
              name: 'Complex Transaction User',
              role: 'PROFESOR',
              hashedPassword: 'test-hash',
            },
          });

          const docs = await Promise.all([
            tx.planningDocument.create({
              data: {
                title: 'Complex TX Doc 1',
                description: 'First document',
                subject: 'Math',
                grade: '1st',
                duration: 60,
                objectives: 'Objectives 1',
                content: 'Content 1',
                methodology: 'Method 1',
                resources: 'Resources 1',
                evaluation: 'Evaluation 1',
                authorId: user.id,
              },
            }),
            tx.planningDocument.create({
              data: {
                title: 'Complex TX Doc 2',
                description: 'Second document',
                subject: 'Science',
                grade: '2nd',
                duration: 45,
                objectives: 'Objectives 2',
                content: 'Content 2',
                methodology: 'Method 2',
                resources: 'Resources 2',
                evaluation: 'Evaluation 2',
                authorId: user.id,
              },
            }),
          ]);

          return { user, docs };
        })
    );
    transactionResults.push(complexTransaction);

    console.log('Transaction Performance:', transactionResults);

    // All transactions should succeed
    transactionResults.forEach(result => {
      expect(result.success).toBe(true);
      expect(result.executionTime).toBeLessThan(3000); // 3 seconds max for transactions
    });

    // Simple transactions should be faster than complex ones
    expect(simpleTransaction.executionTime).toBeLessThan(
      complexTransaction.executionTime
    );
  });
});
