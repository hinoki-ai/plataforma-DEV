#!/usr/bin/env node
/**
 * Test Auth Endpoints
 *
 * This script tests the authentication endpoints to verify they're accessible
 * and responding correctly. Run this to diagnose auth issues.
 *
 * Usage:
 *   node scripts/test-auth-endpoints.js [URL]
 *
 * Example:
 *   node scripts/test-auth-endpoints.js https://plataforma.aramac.dev
 *   node scripts/test-auth-endpoints.js http://localhost:3000
 */

const baseUrl = process.argv[2] || "https://plataforma.aramac.dev";

async function testEndpoint(path, method = "GET", body = null) {
  const url = `${baseUrl}${path}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const startTime = Date.now();
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    const status = response.ok ? "✅" : "❌";

    if (!response.ok) {
    }

    return { ok: response.ok, status: response.status, data, duration };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

async function runTests() {
  const results = {
    passed: 0,
    failed: 0,
    total: 0,
  };

  // Test 1: CSRF Token endpoint
  const csrf = await testEndpoint("/api/auth/csrf", "GET");
  results.total++;
  if (csrf.ok) results.passed++;
  else results.failed++;

  // Test 2: Session endpoint (should return 200 even without session)
  const session = await testEndpoint("/api/auth/session", "GET");
  results.total++;
  if (session.ok) results.passed++;
  else results.failed++;

  // Test 3: Providers endpoint
  const providers = await testEndpoint("/api/auth/providers", "GET");
  results.total++;
  if (providers.ok) results.passed++;
  else results.failed++;

  // Test 4: Signin page (should redirect or return HTML)
  const signin = await testEndpoint("/api/auth/signin", "GET");
  results.total++;
  // 200 or 307 redirect is OK
  if (signin.status === 200 || signin.status === 307) {
    results.passed++;
  } else {
    results.failed++;
  }

  if (results.failed === 0) {
  } else {
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

runTests().catch((error) => {
  process.exit(1);
});
