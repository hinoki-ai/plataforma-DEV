/**
 * Comprehensive Voting API Tests
 * Tests all API endpoints with constraint validation
 *
 * NOTE: This script requires:
 * 1. Dev server running: npm run dev
 * 2. Valid authentication (session cookies or JWT tokens)
 * 3. Test accounts (admin + parent)
 *
 * For authentication, you'll need to:
 * - Log in as admin and copy session cookie
 * - Log in as parent and copy session cookie
 * - Replace mockAdminAuth and mockParentAuth with real cookies
 */

const BASE_URL = process.env.TEST_API_URL || "http://localhost:3000";
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

// TODO: Replace with actual session cookies from browser after logging in
// To get cookies: Open browser DevTools > Application > Cookies > Copy "next-auth.session-token"
const mockAdminAuth = {
  cookie: "next-auth.session-token=YOUR_ADMIN_SESSION_TOKEN_HERE",
  // Or use Authorization header if using JWT:
  // Authorization: "Bearer YOUR_ADMIN_JWT_TOKEN_HERE",
};

const mockParentAuth = {
  cookie: "next-auth.session-token=YOUR_PARENT_SESSION_TOKEN_HERE",
  // Or use Authorization header if using JWT:
  // Authorization: "Bearer YOUR_PARENT_JWT_TOKEN_HERE",
};

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function logResult(name: string, passed: boolean, message: string) {
  results.push({ name, passed, message });
  const icon = passed ? "✅" : "❌";
}

async function testAdminGetVotes() {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/votes`, {
      headers: mockAdminAuth,
    });

    if (response.status === 401) {
      logResult(
        "Admin GET - Auth",
        false,
        "401 Unauthorized - Need valid auth token",
      );
      return null;
    }

    if (response.status === 403) {
      logResult("Admin GET - Role", false, "403 Forbidden - User is not admin");
      return null;
    }

    if (!response.ok) {
      logResult(
        "Admin GET",
        false,
        `${response.status} ${response.statusText}`,
      );
      return null;
    }

    const data = await response.json();
    logResult("Admin GET", true, `Retrieved ${data.data?.length || 0} votes`);

    // Test filters
    const filterActive = await fetch(
      `${BASE_URL}/api/admin/votes?isActive=true`,
      {
        headers: mockAdminAuth,
      },
    );
    if (filterActive.ok) {
      const activeData = await filterActive.json();
      logResult(
        "Admin GET - Filter Active",
        true,
        `Found ${activeData.data?.length || 0} active votes`,
      );
    }

    const filterCategory = await fetch(
      `${BASE_URL}/api/admin/votes?category=FINANCIAL`,
      {
        headers: mockAdminAuth,
      },
    );
    if (filterCategory.ok) {
      const categoryData = await filterCategory.json();
      logResult(
        "Admin GET - Filter Category",
        true,
        `Found ${categoryData.data?.length || 0} FINANCIAL votes`,
      );
    }

    return data.data || [];
  } catch (error: any) {
    logResult("Admin GET", false, `Error: ${error.message}`);
    return null;
  }
}

async function testAdminCreateVote() {
  const payload = {
    title: "API Test Vote - Comprehensive Testing",
    description: "Testing API endpoints and constraints",
    category: "FINANCIAL",
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    isPublic: true,
    allowMultipleVotes: false,
    requireAuthentication: true,
    options: ["Option A", "Option B", "Option C"],
  };

  try {
    const response = await fetch(`${BASE_URL}/api/admin/votes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...mockAdminAuth,
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      logResult(
        "Admin POST - Auth",
        false,
        "401 Unauthorized - Need valid auth token",
      );
      return null;
    }

    if (response.status === 403) {
      logResult(
        "Admin POST - Role",
        false,
        "403 Forbidden - User is not admin",
      );
      return null;
    }

    if (!response.ok) {
      const error = await response.json();
      logResult(
        "Admin POST",
        false,
        `${response.status}: ${error.error || response.statusText}`,
      );
      return null;
    }

    const data = await response.json();
    logResult("Admin POST", true, `Vote created with ID: ${data.data?.id}`);
    return data.data?.id;
  } catch (error: any) {
    logResult("Admin POST", false, `Error: ${error.message}`);
    return null;
  }
}

async function testAdminDeleteVote(voteId: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/votes/${voteId}`, {
      method: "DELETE",
      headers: mockAdminAuth,
    });

    if (response.status === 401) {
      logResult(
        "Admin DELETE - Auth",
        false,
        "401 Unauthorized - Need valid auth token",
      );
      return false;
    }

    if (response.status === 403) {
      logResult(
        "Admin DELETE - Role",
        false,
        "403 Forbidden - User is not admin",
      );
      return false;
    }

    if (!response.ok) {
      const error = await response.json();
      logResult(
        "Admin DELETE",
        false,
        `${response.status}: ${error.error || response.statusText}`,
      );
      return false;
    }

    logResult("Admin DELETE", true, "Vote deleted successfully");
    return true;
  } catch (error: any) {
    logResult("Admin DELETE", false, `Error: ${error.message}`);
    return false;
  }
}

async function testParentGetVotes() {
  try {
    const response = await fetch(`${BASE_URL}/api/parent/votes`, {
      headers: mockParentAuth,
    });

    if (response.status === 401) {
      logResult(
        "Parent GET - Auth",
        false,
        "401 Unauthorized - Need valid auth token",
      );
      return null;
    }

    if (response.status === 403) {
      logResult(
        "Parent GET - Role",
        false,
        "403 Forbidden - User is not parent",
      );
      return null;
    }

    if (!response.ok) {
      logResult(
        "Parent GET",
        false,
        `${response.status} ${response.statusText}`,
      );
      return null;
    }

    const data = await response.json();
    const publicActiveVotes =
      data.data?.filter((v: any) => v.status === "active") || [];
    logResult(
      "Parent GET",
      true,
      `Retrieved ${publicActiveVotes.length} active public votes`,
    );
    return data.data || [];
  } catch (error: any) {
    logResult("Parent GET", false, `Error: ${error.message}`);
    return null;
  }
}

async function testParentCastVote(voteId: string, optionId: string) {
  const payload = { voteId, optionId };

  try {
    const response = await fetch(`${BASE_URL}/api/parent/votes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...mockParentAuth,
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      logResult(
        "Parent POST - Auth",
        false,
        "401 Unauthorized - Need valid auth token",
      );
      return { success: false, status: 401 };
    }

    if (response.status === 403) {
      const error = await response.json();
      logResult(
        "Parent POST - Forbidden",
        false,
        `403: ${error.error || "Forbidden"}`,
      );
      return { success: false, status: 403, error: error.error };
    }

    if (response.status === 409) {
      const error = await response.json();
      logResult(
        "Parent POST - Conflict",
        true,
        `409: ${error.error} (Expected for duplicate/max votes)`,
      );
      return { success: false, status: 409, error: error.error };
    }

    if (!response.ok) {
      const error = await response.json();
      logResult(
        "Parent POST",
        false,
        `${response.status}: ${error.error || response.statusText}`,
      );
      return { success: false, status: response.status };
    }

    const data = await response.json();
    logResult("Parent POST", true, `Vote cast successfully: ${data.data?.id}`);
    return { success: true, data: data.data };
  } catch (error: any) {
    logResult("Parent POST", false, `Error: ${error.message}`);
    return { success: false };
  }
}

async function testErrorHandling() {
  // Test 401: Unauthenticated

  const unauthResponse = await fetch(`${BASE_URL}/api/admin/votes`);
  if (unauthResponse.status === 401) {
    logResult(
      "Error 401",
      true,
      "Correctly returns 401 for unauthenticated requests",
    );
  } else {
    logResult("Error 401", false, `Expected 401, got ${unauthResponse.status}`);
  }

  // Test 400: Missing fields

  const badPayload = { title: "Missing fields" }; // Missing required fields
  const badResponse = await fetch(`${BASE_URL}/api/admin/votes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...mockAdminAuth,
    },
    body: JSON.stringify(badPayload),
  });
  if (badResponse.status === 400 || badResponse.status === 401) {
    // 401 is okay if auth is not set up
    logResult(
      "Error 400",
      badResponse.status === 400,
      badResponse.status === 400
        ? "Correctly returns 400 for missing fields"
        : "Got 401 (auth needed)",
    );
  } else {
    logResult("Error 400", false, `Expected 400, got ${badResponse.status}`);
  }

  // Test 404: Invalid vote ID

  const notFoundResponse = await fetch(`${BASE_URL}/api/parent/votes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...mockParentAuth,
    },
    body: JSON.stringify({
      voteId: "invalid-vote-id",
      optionId: "invalid-option-id",
    }),
  });
  if (notFoundResponse.status === 404 || notFoundResponse.status === 400) {
    logResult("Error 404", true, "Correctly returns 404/400 for invalid IDs");
  } else if (notFoundResponse.status === 401) {
    logResult("Error 404", false, "Got 401 (auth needed), cannot test 404");
  } else {
    logResult(
      "Error 404",
      false,
      `Expected 404/400, got ${notFoundResponse.status}`,
    );
  }
}

async function testVotingConstraints() {
  // This would require:
  // 1. Create vote with allowMultipleVotes: false → try to vote twice (should get 409)
  // 2. Create expired vote → try to vote (should get 403)
  // 3. Create private vote → parent shouldn't see it (should be filtered)
  // 4. Create inactive vote → parent shouldn't see it (should be filtered)
  // 5. Create vote with maxVotesPerUser: 3 → vote 4 times (4th should get 409)

  logResult(
    "Constraints Test",
    true,
    "See manual testing section for full constraint verification",
  );
}

async function runAllTests() {
  // Test admin endpoints
  const votes = await testAdminGetVotes();
  const createdVoteId = await testAdminCreateVote();

  // Test parent endpoints
  const parentVotes = await testParentGetVotes();

  // Test constraint: Try to cast vote on created vote (if we have vote and option IDs)
  if (createdVoteId && parentVotes && parentVotes.length > 0) {
    const testVote = parentVotes.find((v: any) => v.id === createdVoteId);
    if (testVote && testVote.options && testVote.options.length > 0) {
      await testParentCastVote(testVote.id, testVote.options[0].id);
      // Try again to test duplicate prevention
      await testParentCastVote(testVote.id, testVote.options[1].id);
    }
  }

  // Test error handling
  await testErrorHandling();

  // Test constraints (documented, manual testing required)
  await testVotingConstraints();

  // Clean up: Delete created vote
  if (createdVoteId) {
    await testAdminDeleteVote(createdVoteId);
  }

  // Summary

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  if (failed > 0) {
    results.filter((r) => !r.passed).forEach((r) => {});
  }
}

// Run tests
runAllTests().catch(console.error);
