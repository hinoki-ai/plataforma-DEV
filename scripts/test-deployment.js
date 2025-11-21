#!/usr/bin/env node

/**
 * 🚀 DEPLOYMENT TESTING SUITE - PLATAFORMA ASTRAL
 *
 * Automated deployment verification following the 9-phase testing protocol
 * Run this after every deployment to ensure system integrity
 *
 * Usage:
 *   npm run test:deployment
 *   node scripts/test-deployment.js --url=https://plataforma.aramac.dev
 *   node scripts/test-deployment.js --quick  # Skip slow tests
 */

const https = require("https");
const http = require("http");

class DeploymentTester {
  constructor(options = {}) {
    this.baseUrl = options.url || "https://plataforma.aramac.dev";
    this.quick = options.quick || false;
    this.verbose = options.verbose || false;
    this.timeout = 30000; // 30 seconds
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: [],
    };
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const colors = {
      success: "\x1b[32m",
      error: "\x1b[31m",
      warning: "\x1b[33m",
      info: "\x1b[36m",
      reset: "\x1b[0m",
    };

    if (this.verbose || type !== "info") {
      console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
    }
  }

  async makeRequest(endpoint, options = {}) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${endpoint}`;
      const protocol = url.startsWith("https") ? https : http;

      const req = protocol.request(
        url,
        {
          method: options.method || "GET",
          headers: {
            "User-Agent": "Deployment-Test-Suite/1.0",
            Accept: "application/json",
            ...options.headers,
          },
          timeout: this.timeout,
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              const jsonData = data ? JSON.parse(data) : {};
              resolve({
                status: res.statusCode,
                headers: res.headers,
                data: jsonData,
                responseTime: Date.now() - req.startTime,
              });
            } catch (e) {
              resolve({
                status: res.statusCode,
                headers: res.headers,
                data: data,
                responseTime: Date.now() - req.startTime,
              });
            }
          });
        },
      );

      req.startTime = Date.now();
      req.on("timeout", () => {
        req.destroy();
        reject(new Error(`Request timeout: ${endpoint}`));
      });

      req.on("error", reject);
      req.end();
    });
  }

  async runTest(name, testFn) {
    try {
      this.log(`Running: ${name}`, "info");
      const result = await testFn();
      this.results.passed++;
      this.results.tests.push({ name, status: "PASSED", result });
      this.log(`✅ PASSED: ${name}`, "success");
      return result;
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: "FAILED", error: error.message });
      this.log(`❌ FAILED: ${name} - ${error.message}`, "error");
      throw error;
    }
  }

  async runWarningTest(name, testFn) {
    try {
      this.log(`Checking: ${name}`, "info");
      const result = await testFn();
      this.log(`✅ OK: ${name}`, "success");
      return result;
    } catch (error) {
      this.results.warnings++;
      this.results.tests.push({
        name,
        status: "WARNING",
        error: error.message,
      });
      this.log(`⚠️  WARNING: ${name} - ${error.message}`, "warning");
      return null;
    }
  }

  // PHASE 3: POST-DEPLOYMENT VERIFICATION
  async testHealthEndpoint() {
    await this.runTest("Health Endpoint Check", async () => {
      const response = await this.makeRequest("/api/health");
      if (response.status !== 200) {
        throw new Error(`Health endpoint returned ${response.status}`);
      }
      if (!response.data.status || response.data.status !== "healthy") {
        throw new Error('Health status is not "healthy"');
      }
      if (response.data.database !== "connected") {
        throw new Error("Database connection failed");
      }
      if (response.data.backend !== "convex") {
        throw new Error("Backend connection failed");
      }
      return response.data;
    });
  }

  async testHomePage() {
    await this.runTest("Homepage Accessibility", async () => {
      const response = await this.makeRequest("/");
      if (response.status !== 200) {
        throw new Error(`Homepage returned ${response.status}`);
      }
      if (!response.data.includes("<html")) {
        throw new Error("Homepage does not contain HTML");
      }
      if (response.responseTime > 5000) {
        throw new Error(
          `Homepage load time too slow: ${response.responseTime}ms`,
        );
      }
      return { status: response.status, loadTime: response.responseTime };
    });
  }

  async testApiEndpoints() {
    const endpoints = [
      "/api/auth/session",
      "/api/institutions",
      "/api/school-info",
    ];

    for (const endpoint of endpoints) {
      await this.runWarningTest(`API Endpoint: ${endpoint}`, async () => {
        const response = await this.makeRequest(endpoint);
        if (response.status >= 400) {
          throw new Error(`Endpoint returned ${response.status}`);
        }
        if (response.responseTime > 2000) {
          throw new Error(`Slow response: ${response.responseTime}ms`);
        }
        return response.status;
      });
    }
  }

  async testStaticAssets() {
    const assets = ["/favicon.ico", "/manifest.json"];

    for (const asset of assets) {
      await this.runWarningTest(`Static Asset: ${asset}`, async () => {
        const response = await this.makeRequest(asset);
        if (response.status !== 200) {
          throw new Error(`Asset returned ${response.status}`);
        }
        return response.status;
      });
    }
  }

  // PHASE 4: SYSTEM TESTING
  async testAuthenticationFlow() {
    await this.runWarningTest("Authentication Redirect", async () => {
      const response = await this.makeRequest("/login");
      if (response.status !== 200) {
        throw new Error(`Login page returned ${response.status}`);
      }
      return response.status;
    });
  }

  async testDatabaseConnection() {
    await this.runTest("Database Connectivity", async () => {
      // Test through health endpoint which verifies DB connection
      const health = await this.makeRequest("/api/health");
      if (health.data.database !== "connected") {
        throw new Error("Database not connected");
      }
      return health.data.database;
    });
  }

  async testSecurityHeaders() {
    await this.runWarningTest("Security Headers", async () => {
      const response = await this.makeRequest("/");
      const headers = response.headers;

      const requiredHeaders = [
        "x-frame-options",
        "x-content-type-options",
        "referrer-policy",
      ];

      const missing = requiredHeaders.filter((h) => !headers[h]);
      if (missing.length > 0) {
        throw new Error(`Missing security headers: ${missing.join(", ")}`);
      }
      return "Security headers present";
    });
  }

  // PHASE 6: MONITORING & ANALYTICS
  async testPerformanceMetrics() {
    await this.runWarningTest("Performance Metrics", async () => {
      const start = Date.now();
      const response = await this.makeRequest("/api/health");
      const loadTime = response.responseTime;

      if (loadTime > 1000) {
        throw new Error(`Slow API response: ${loadTime}ms`);
      }
      return { loadTime: `${loadTime}ms` };
    });
  }

  async runAllTests() {
    console.log("🚀 Starting Deployment Testing Suite");
    console.log("=".repeat(50));
    console.log(`Target URL: ${this.baseUrl}`);
    console.log(`Mode: ${this.quick ? "Quick" : "Full"} Test Suite`);
    console.log("=".repeat(50));

    const startTime = Date.now();

    try {
      // PHASE 3: Post-deployment verification
      console.log("\n📋 PHASE 3: POST-DEPLOYMENT VERIFICATION");
      await this.testHealthEndpoint();
      await this.testHomePage();

      if (!this.quick) {
        await this.testApiEndpoints();
        await this.testStaticAssets();
      }

      // PHASE 4: System testing
      console.log("\n🔍 PHASE 4: COMPREHENSIVE SYSTEM TESTING");
      await this.testDatabaseConnection();

      if (!this.quick) {
        await this.testAuthenticationFlow();
        await this.testSecurityHeaders();
        await this.testPerformanceMetrics();
      }

      // PHASE 6: Monitoring
      console.log("\n📊 PHASE 6: MONITORING & ANALYTICS");
      await this.runWarningTest("Overall System Health", async () => {
        const health = await this.makeRequest("/api/health");
        const uptime = health.data.timestamp
          ? new Date(health.data.timestamp)
          : new Date();
        const age = Date.now() - uptime.getTime();

        if (age > 300000) {
          // 5 minutes
          throw new Error(
            `System may be stale (${Math.round(age / 1000)}s old)`,
          );
        }
        return `System healthy (${Math.round(age / 1000)}s ago)`;
      });
    } catch (error) {
      this.log(`Critical test failure: ${error.message}`, "error");
    }

    const duration = Date.now() - startTime;

    // Print results
    console.log("\n" + "=".repeat(50));
    console.log("📊 TEST RESULTS SUMMARY");
    console.log("=".repeat(50));
    console.log(`✅ PASSED: ${this.results.passed}`);
    console.log(`❌ FAILED: ${this.results.failed}`);
    console.log(`⚠️  WARNINGS: ${this.results.warnings}`);
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(
      `📈 Success Rate: ${Math.round((this.results.passed / (this.results.passed + this.results.failed)) * 100)}%`,
    );

    if (this.results.failed > 0) {
      console.log("\n❌ FAILED TESTS:");
      this.results.tests
        .filter((t) => t.status === "FAILED")
        .forEach((test) => {
          console.log(`   - ${test.name}: ${test.error}`);
        });
    }

    if (this.results.warnings > 0) {
      console.log("\n⚠️  WARNINGS:");
      this.results.tests
        .filter((t) => t.status === "WARNING")
        .forEach((test) => {
          console.log(`   - ${test.name}: ${test.error}`);
        });
    }

    // Exit codes for CI/CD
    if (this.results.failed > 0) {
      console.log("\n💥 DEPLOYMENT VERIFICATION: FAILED");
      process.exit(1);
    } else if (this.results.warnings > 0) {
      console.log("\n⚠️  DEPLOYMENT VERIFICATION: PASSED WITH WARNINGS");
      process.exit(0);
    } else {
      console.log("\n🎉 DEPLOYMENT VERIFICATION: ALL TESTS PASSED");
      process.exit(0);
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  args.forEach((arg) => {
    if (arg.startsWith("--url=")) {
      options.url = arg.split("=")[1];
    } else if (arg === "--quick") {
      options.quick = true;
    } else if (arg === "--verbose") {
      options.verbose = true;
    }
  });

  const tester = new DeploymentTester(options);
  tester.runAllTests().catch((error) => {
    console.error("💥 Test suite failed:", error);
    process.exit(1);
  });
}

module.exports = DeploymentTester;

