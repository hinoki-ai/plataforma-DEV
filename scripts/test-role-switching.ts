#!/usr/bin/env tsx
/**
 * Test script for role switching functionality
 * Tests the API endpoints and role switching logic
 */

import { Logger } from "../src/lib/logger";

const logger = Logger.getInstance("RoleSwitchTest");

interface TestResult {
  test: string;
  success: boolean;
  error?: string;
  data?: any;
}

async function testRoleSwitchAPI() {
  const results: TestResult[] = [];

  console.log("🧪 Testing Role Switching Functionality\n");

  // Test 1: API health check
  try {
    console.log("1️⃣ Testing API health...");
    const response = await fetch("http://localhost:3000/api/role-switch", {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      results.push({
        test: "API Health Check",
        success: true,
        data: data,
      });
      console.log("✅ API is healthy");
    } else {
      results.push({
        test: "API Health Check",
        success: false,
        error: `HTTP ${response.status}`,
      });
      console.log("❌ API health check failed");
    }
  } catch (error) {
    results.push({
      test: "API Health Check",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    console.log("❌ API health check failed:", error);
  }

  // Test 2: Test invalid role switch (should fail)
  try {
    console.log("\n2️⃣ Testing invalid role switch...");
    const response = await fetch("http://localhost:3000/api/role-switch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        targetRole: "INVALID_ROLE",
      }),
    });

    const data = await response.json();

    if (response.status === 400 && data.error.includes("Invalid target role")) {
      results.push({
        test: "Invalid Role Validation",
        success: true,
        data: data,
      });
      console.log("✅ Invalid role validation working");
    } else {
      results.push({
        test: "Invalid Role Validation",
        success: false,
        error: "Expected validation error",
        data: data,
      });
      console.log("❌ Invalid role validation failed");
    }
  } catch (error) {
    results.push({
      test: "Invalid Role Validation",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    console.log("❌ Invalid role validation test failed:", error);
  }

  // Test 3: Test unauthorized access (should fail)
  try {
    console.log("\n3️⃣ Testing unauthorized access...");
    const response = await fetch("http://localhost:3000/api/role-switch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        targetRole: "ADMIN",
      }),
    });

    if (response.status === 403) {
      results.push({
        test: "Unauthorized Access Prevention",
        success: true,
      });
      console.log("✅ Unauthorized access properly blocked");
    } else {
      results.push({
        test: "Unauthorized Access Prevention",
        success: false,
        error: "Expected 403 Forbidden",
      });
      console.log("❌ Unauthorized access test failed");
    }
  } catch (error) {
    results.push({
      test: "Unauthorized Access Prevention",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    console.log("❌ Unauthorized access test failed:", error);
  }

  // Summary
  console.log("\n📊 Test Results Summary:");
  console.log("=".repeat(50));

  const passed = results.filter((r) => r.success).length;
  const total = results.length;

  results.forEach((result) => {
    const icon = result.success ? "✅" : "❌";
    console.log(`${icon} ${result.test}`);
    if (!result.success && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log("🎉 All role switching tests passed!");
    console.log("\n💡 Next steps:");
    console.log(
      "1. Login as MASTER user (agustinaramac@gmail.com / madmin123)",
    );
    console.log("2. Test role switching in the UI");
    console.log("3. Verify navigation changes based on role");
    console.log("4. Test permissions are properly enforced");
  } else {
    console.log("⚠️ Some tests failed. Check the errors above.");
  }

  return results;
}

// Run tests
testRoleSwitchAPI().catch((error) => {
  console.error("❌ Test execution failed:", error);
  process.exit(1);
});
