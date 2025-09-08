// Simple test script to verify authentication
const { authenticateUser } = require('./src/lib/auth-prisma');

async function testAuth() {
  console.log('🧪 Testing Authentication...');

  // Test emergency bypass credentials
  const masterResult = await authenticateUser('master@manitospintadas.cl', 'master123');
  console.log('Master login:', masterResult ? '✅ SUCCESS' : '❌ FAILED');

  const adminResult = await authenticateUser('admin@manitospintadas.cl', 'admin123');
  console.log('Admin login:', adminResult ? '✅ SUCCESS' : '❌ FAILED');

  // Test invalid credentials
  const invalidResult = await authenticateUser('invalid@test.com', 'wrongpass');
  console.log('Invalid login:', invalidResult ? '❌ UNEXPECTED SUCCESS' : '✅ CORRECTLY FAILED');
}

testAuth().catch(console.error);