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

const baseUrl = process.argv[2] || 'https://plataforma.aramac.dev';

console.log('🔐 Testing Authentication Endpoints');
console.log('=====================================');
console.log(`Base URL: ${baseUrl}\n`);

async function testEndpoint(path, method = 'GET', body = null) {
  const url = `${baseUrl}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
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
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    const status = response.ok ? '✅' : '❌';
    console.log(`${status} ${method} ${path}`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Duration: ${duration}ms`);
    
    if (!response.ok) {
      console.log(`   Error: ${JSON.stringify(data).substring(0, 200)}`);
    }
    console.log('');

    return { ok: response.ok, status: response.status, data, duration };
  } catch (error) {
    console.log(`❌ ${method} ${path}`);
    console.log(`   Error: ${error.message}`);
    console.log('');
    return { ok: false, error: error.message };
  }
}

async function runTests() {
  const results = {
    passed: 0,
    failed: 0,
    total: 0,
  };

  console.log('Testing NextAuth.js Endpoints:\n');

  // Test 1: CSRF Token endpoint
  const csrf = await testEndpoint('/api/auth/csrf', 'GET');
  results.total++;
  if (csrf.ok) results.passed++;
  else results.failed++;

  // Test 2: Session endpoint (should return 200 even without session)
  const session = await testEndpoint('/api/auth/session', 'GET');
  results.total++;
  if (session.ok) results.passed++;
  else results.failed++;

  // Test 3: Providers endpoint
  const providers = await testEndpoint('/api/auth/providers', 'GET');
  results.total++;
  if (providers.ok) results.passed++;
  else results.failed++;

  // Test 4: Signin page (should redirect or return HTML)
  const signin = await testEndpoint('/api/auth/signin', 'GET');
  results.total++;
  // 200 or 307 redirect is OK
  if (signin.status === 200 || signin.status === 307) {
    results.passed++;
    console.log('Note: Signin endpoint redirected (this is normal)');
  } else {
    results.failed++;
  }

  console.log('\n=====================================');
  console.log('Test Results:');
  console.log(`  ✅ Passed: ${results.passed}/${results.total}`);
  console.log(`  ❌ Failed: ${results.failed}/${results.total}`);
  console.log('=====================================\n');

  if (results.failed === 0) {
    console.log('✅ All auth endpoints are accessible and responding correctly!');
    console.log('   If you\'re still experiencing auth issues, the problem is likely:');
    console.log('   1. Client-side configuration (check SessionProvider baseUrl)');
    console.log('   2. Environment variables (check NEXTAUTH_URL, NEXTAUTH_SECRET)');
    console.log('   3. Browser caching (clear cache and hard refresh)');
    console.log('   4. CORS/CSP blocking (check browser console for errors)');
  } else {
    console.log('⚠️  Some endpoints failed. This indicates a server configuration issue.');
    console.log('   Check:');
    console.log('   1. Server is running and accessible');
    console.log('   2. NEXTAUTH_URL environment variable is set correctly');
    console.log('   3. NEXTAUTH_SECRET environment variable is set');
    console.log('   4. No firewall or network blocking the requests');
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
