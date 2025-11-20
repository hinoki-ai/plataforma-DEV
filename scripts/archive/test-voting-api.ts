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
  try {
    // Test 1: Get votes (should return empty array initially)

    const getResponse = await fetch(`http://localhost:3000/api/admin/votes`, {
      headers: mockAdminAuth,
    });

    if (getResponse.status === 401) {
    } else if (getResponse.ok) {
      const data = await getResponse.json();
    } else {
    }

    // Test 2: Create vote

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
    } else if (createResponse.ok) {
      const data = await createResponse.json();
      createdVoteId = data.data?.id;
    } else {
      const error = await createResponse.json();
    }

    // Test 3: Delete vote (if created)
    if (createdVoteId) {
      const deleteResponse = await fetch(
        `http://localhost:3000/api/admin/votes/${createdVoteId}`,
        {
          method: "DELETE",
          headers: mockAdminAuth,
        },
      );

      if (deleteResponse.status === 401) {
      } else if (deleteResponse.ok) {
      } else {
        const error = await deleteResponse.json();
      }
    }
  } catch (error) {}
}

async function testParentVotesAPI() {
  try {
    // Test 1: Get available votes

    const getResponse = await fetch(`http://localhost:3000/api/parent/votes`, {
      headers: mockParentAuth,
    });

    if (getResponse.status === 401) {
    } else if (getResponse.ok) {
      const data = await getResponse.json();
    } else {
    }

    // Test 2: Cast vote (will fail without real vote ID, but tests endpoint)

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
    } else if (voteResponse.status === 400 || voteResponse.status === 404) {
    } else if (voteResponse.ok) {
    } else {
      const error = await voteResponse.json();
    }
  } catch (error) {}
}

async function testConvexDirectly() {
  try {
    // Test getting votes

    const { ConvexHttpClient } = await import("convex/browser");
    const convex = new ConvexHttpClient(CONVEX_URL);
    const { api } = await import("../convex/_generated/api");

    const votes = await convex.query(api.votes.getVotes, {});

    // Test creating a vote

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

    // Test getting vote details

    const voteDetails = await convex.query(api.votes.getVoteById, {
      id: voteId,
    });

    // Clean up - delete the test vote

    await convex.mutation(api.votes.deleteVote, { id: voteId });
  } catch (error) {}
}

async function runAllTests() {
  await testAdminVotesAPI();
  await testParentVotesAPI();
  await testConvexDirectly();
}

// Run tests
runAllTests().catch(console.error);
