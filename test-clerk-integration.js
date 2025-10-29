import {
  createClerkUser,
  getClerkUsers,
  getClerkUserById,
} from "./src/services/actions/clerk-users.js";

async function testClerkIntegration() {
  console.log("🧪 Testing Clerk User Management Integration");

  try {
    // Test getting all users
    console.log("\n1. Getting all users...");
    const users = await getClerkUsers();
    console.log(`✅ Found ${users.length} users`);

    // Test creating a user (commented out to avoid creating test users)
    /*
    console.log('\n2. Creating test user...');
    const testUser = await createClerkUser({
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPass123!',
      role: 'PROFESOR',
      isActive: true,
    });
    console.log(`✅ Created user: ${testUser.id} - ${testUser.email}`);

    // Test getting user by ID
    console.log('\n3. Getting user by ID...');
    const retrievedUser = await getClerkUserById(testUser.id);
    console.log(`✅ Retrieved user: ${retrievedUser?.email}`);
    */

    console.log("\n🎉 Clerk integration test completed successfully!");
    console.log(
      "Note: User creation test is commented out to avoid creating test users.",
    );
  } catch (error) {
    console.error("❌ Clerk integration test failed:", error.message);
    process.exit(1);
  }
}

// Only run if this script is called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testClerkIntegration();
}

export { testClerkIntegration };
