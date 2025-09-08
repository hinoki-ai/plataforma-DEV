// Direct test of master authentication using server action
const { authenticateUser } = require('./src/lib/auth-prisma.ts');

// Test the master credentials directly
async function testMasterCredentials() {
  console.log('🧪 Testing Master Credentials...');

  try {
    // Test master credentials
    const masterResult = await authenticateUser('master@manitospintadas.cl', 'master123');
    console.log('🔐 Master auth result:', masterResult);

    if (masterResult && masterResult.role === 'MASTER') {
      console.log('✅ MASTER CREDENTIALS WORKING!');
      console.log('   Email: master@manitospintadas.cl');
      console.log('   Password: master123');
      console.log('   Role:', masterResult.role);
      console.log('   Name:', masterResult.name);
      return true;
    } else {
      console.log('❌ Master credentials failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing master credentials:', error);
    return false;
  }
}

testMasterCredentials();