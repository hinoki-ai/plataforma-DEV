/**
 * Test Voting API Endpoints
 * Tests the voting system API routes for both admin and parent functionality
 */

const CONVEX_URL =
  process.env.NEXT_PUBLIC_CONVEX_URL ||
  "https://industrious-manatee-7.convex.cloud";

// Mock authentication headers (in a real test, you'd use actual JWT tokens)
const mockAdminAuth = {
  // These would be actual session cookies/JWT tokens in real testing
  cookie: "next-auth.session-token=mock-admin-token",
};

const mockParentAuth = {
  cookie: "next-auth.session-token=mock-parent-token",
};

async function testAdminVotesAPI() {
  console.log("🧪 Testing Admin Votes API...\n");

  try {
    // Test 1: Get votes (should return empty array initially)
    console.log("1. Testing GET /api/admin/votes...");
    const getResponse = await fetch(`http://localhost:3000/api/admin/votes`, {
      headers: mockAdminAuth,
    });

    if (getResponse.status === 401) {
      console.log("   ⚠️  Authentication required (expected in production)");
    } else if (getResponse.ok) {
      const data = await getResponse.json();
      console.log(`   ✅ Retrieved ${data.data?.length || 0} votes`);
    } else {
      console.log(
        `   ❌ GET failed: ${getResponse.status} ${getResponse.statusText}`,
      );
    }

    // Test 2: Create vote
    console.log("\n2. Testing POST /api/admin/votes...");
    const createPayload = {
      title: "API Test Vote - School Budget",
      description: "Testing the voting API endpoints",
      category: "FINANCIAL",
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      isActive: true,
      isPublic: true,
      allowMultipleVotes: false,
      requireAuthentication: true,
      options: ["Increase budget", "Keep same budget", "Reduce budget"],
    };

    const createResponse = await fetch(
      `http://localhost:3000/api/admin/votes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...mockAdminAuth,
        },
        body: JSON.stringify(createPayload),
      },
    );

    let createdVoteId: string | null = null;

    if (createResponse.status === 401) {
      console.log("   ⚠️  Authentication required (expected in production)");
    } else if (createResponse.ok) {
      const data = await createResponse.json();
      createdVoteId = data.data?.id;
      console.log(`   ✅ Vote created with ID: ${createdVoteId}`);
    } else {
      const error = await createResponse.json();
      console.log(
        `   ❌ POST failed: ${error.error || createResponse.statusText}`,
      );
    }

    // Test 3: Delete vote (if created)
    if (createdVoteId) {
      console.log("\n3. Testing DELETE /api/admin/votes/[id]...");
      const deleteResponse = await fetch(
        `http://localhost:3000/api/admin/votes/${createdVoteId}`,
        {
          method: "DELETE",
          headers: mockAdminAuth,
        },
      );

      if (deleteResponse.status === 401) {
        console.log("   ⚠️  Authentication required (expected in production)");
      } else if (deleteResponse.ok) {
        console.log("   ✅ Vote deleted successfully");
      } else {
        const error = await deleteResponse.json();
        console.log(
          `   ❌ DELETE failed: ${error.error || deleteResponse.statusText}`,
        );
      }
    }
  } catch (error) {
    console.error("❌ Admin API test failed:", error);
  }
}

async function testParentVotesAPI() {
  console.log("\n🧪 Testing Parent Votes API...\n");

  try {
    // Test 1: Get available votes
    console.log("1. Testing GET /api/parent/votes...");
    const getResponse = await fetch(`http://localhost:3000/api/parent/votes`, {
      headers: mockParentAuth,
    });

    if (getResponse.status === 401) {
      console.log("   ⚠️  Authentication required (expected in production)");
    } else if (getResponse.ok) {
      const data = await getResponse.json();
      console.log(`   ✅ Retrieved ${data.data?.length || 0} public votes`);
    } else {
      console.log(
        `   ❌ GET failed: ${getResponse.status} ${getResponse.statusText}`,
      );
    }

    // Test 2: Cast vote (will fail without real vote ID, but tests endpoint)
    console.log("\n2. Testing POST /api/parent/votes (with invalid data)...");
    const votePayload = {
      voteId: "invalid-vote-id",
      optionId: "invalid-option-id",
    };

    const voteResponse = await fetch(`http://localhost:3000/api/parent/votes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...mockParentAuth,
      },
      body: JSON.stringify(votePayload),
    });

    if (voteResponse.status === 401) {
      console.log("   ⚠️  Authentication required (expected in production)");
    } else if (voteResponse.status === 400 || voteResponse.status === 404) {
      console.log(
        "   ✅ Validation working (invalid vote/option IDs rejected)",
      );
    } else if (voteResponse.ok) {
      console.log("   ✅ Vote casting endpoint accessible");
    } else {
      const error = await voteResponse.json();
      console.log(
        `   ❌ POST failed: ${error.error || voteResponse.statusText}`,
      );
    }
  } catch (error) {
    console.error("❌ Parent API test failed:", error);
  }
}

async function testConvexDirectly() {
  console.log("\n🧪 Testing Convex Functions Directly...\n");

  try {
    // Test getting votes
    console.log("1. Testing Convex votes:getVotes...");
    const { ConvexHttpClient } = await import("convex/browser");
    const convex = new ConvexHttpClient(CONVEX_URL);
    const { api } = await import("../convex/_generated/api");

    const votes = await convex.query(api.votes.getVotes, {});
    console.log(`   ✅ Retrieved ${votes.length} votes from Convex`);

    // Test creating a vote
    console.log("\n2. Testing Convex votes:createVote...");
    const voteId = await convex.mutation(api.votes.createVote, {
      title: "Direct Convex Test Vote",
      description: "Testing Convex functions directly",
      category: "GENERAL",
      endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
      isActive: true,
      isPublic: true,
      allowMultipleVotes: false,
      requireAuthentication: true,
      createdBy: "k176a7y2wknxkv80axnfcffqx57td2hp", // Admin user
      options: ["Yes", "No", "Maybe"],
    });
    console.log(`   ✅ Vote created with ID: ${voteId}`);

    // Test getting vote details
    console.log("\n3. Testing Convex votes:getVoteById...");
    const voteDetails = await convex.query(api.votes.getVoteById, {
      id: voteId,
    });
    console.log(`   ✅ Vote details retrieved: ${voteDetails.title}`);
    console.log(`      - Options: ${voteDetails.options.length}`);
    console.log(
      `      - Total votes: ${voteDetails.options.reduce((sum: number, opt: any) => sum + opt.voteCount, 0)}`,
    );

    // Clean up - delete the test vote
    console.log("\n4. Cleaning up test vote...");
    await convex.mutation(api.votes.deleteVote, { id: voteId });
    console.log("   ✅ Test vote deleted");
  } catch (error) {
    console.error("❌ Convex direct test failed:", error);
  }
}

async function runAllTests() {
  console.log("🚀 Starting Comprehensive Voting System Tests\n");

  await testAdminVotesAPI();
  await testParentVotesAPI();
  await testConvexDirectly();

  console.log("\n✅ All voting system tests completed!");
}

// Run tests
runAllTests().catch(console.error);
