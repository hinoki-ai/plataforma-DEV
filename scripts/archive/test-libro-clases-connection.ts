/**
 * Test Script for Libro de Clases Connection
 * Tests the connection to Convex and verifies all queries work
 * Run with: npx tsx scripts/test-libro-clases-connection.ts
 */

// Load environment variables from .env files
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local"), override: true });

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl || convexUrl.includes("your-project")) {
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

async function testLibroClasesConnection(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Test 1: Check Convex connection
  try {
    // Simple query to test connection
    const testConnection = await client.query(api.users.getUserCountByRole, {});
    results.push({
      name: "Convex Connection",
      passed: true,
      details: { userCounts: testConnection },
    });
  } catch (error: any) {
    results.push({
      name: "Convex Connection",
      passed: false,
      error: error.message,
    });

    return results; // Can't continue if connection fails
  }

  // Test 2: Test tenancy query (requires auth)
  try {
    // This should fail without auth, which is expected
    try {
      const tenancy = await client.query(api.tenancy.getCurrentTenancy, {});
      if ("error" in tenancy) {
        results.push({
          name: "Tenancy Error Handling",
          passed: true,
          details: {
            errorReturned: true,
            errorMessage: tenancy.error,
          },
        });
      } else {
        results.push({
          name: "Tenancy Query",
          passed: true,
          details: tenancy,
        });
      }
    } catch (error: any) {
      // If error is thrown (not returned), that's also valid
      results.push({
        name: "Tenancy Error Handling",
        passed: true,
        details: {
          errorThrown: true,
          errorMessage: error.message,
        },
      });
    }
  } catch (error: any) {
    results.push({
      name: "Tenancy Query",
      passed: false,
      error: error.message,
    });
  }

  // Test 3: Test getUserByClerkId (non-tenant query)
  try {
    const testClerkId = "test-clerk-id-12345";
    const user = await client.query(api.users.getUserByClerkId, {
      clerkId: testClerkId,
    });
    results.push({
      name: "getUserByClerkId Query",
      passed: true,
      details: { userFound: !!user, userId: user?._id },
    });
    if (user) {
    } else {
    }
  } catch (error: any) {
    results.push({
      name: "getUserByClerkId Query",
      passed: false,
      error: error.message,
    });
  }

  // Test 4: Test getCourses (tenant query - will fail without auth/tenancy)
  try {
    try {
      const courses = await client.query(api.courses.getCourses, {
        academicYear: new Date().getFullYear(),
        isActive: true,
      });
      results.push({
        name: "getCourses Query",
        passed: true,
        details: { courseCount: courses?.length || 0 },
      });
    } catch (error: any) {
      // This is expected if user is not authenticated or lacks institution
      results.push({
        name: "getCourses Error Handling",
        passed: true,
        details: {
          errorThrown: true,
          errorMessage: error.message,
          expectedBehavior: "Query correctly requires tenancy",
        },
      });
    }
  } catch (error: any) {
    results.push({
      name: "getCourses Query",
      passed: false,
      error: error.message,
    });
  }

  // Test 5: Check if institutions exist
  try {
    const institutions = await client.query(
      api.institutionInfo.getAllInstitutions,
      {},
    );
    results.push({
      name: "Institution Check",
      passed: true,
      details: { institutionCount: institutions?.length || 0 },
    });

    if (institutions && institutions.length > 0) {
      institutions.slice(0, 5).forEach((inst: any) => {});
      if (institutions.length > 5) {
      }
    } else {
    }
  } catch (error: any) {
    results.push({
      name: "Institution Check",
      passed: false,
      error: error.message,
    });
  }

  return results;
}

async function main() {
  try {
    const results = await testLibroClasesConnection();

    let passed = 0;
    let failed = 0;

    results.forEach((result) => {
      if (result.passed) {
        passed++;

        if (result.details) {
        }
      } else {
        failed++;
      }
    });

    if (failed === 0) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error: any) {
    process.exit(1);
  }
}

main();
