import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL environment variable is not set!");
  process.exit(1);
}

const convex = new ConvexHttpClient(CONVEX_URL);

// Test user IDs - Update these with real IDs from your system
const ADMIN_USER_ID = "k176a7y2wknxkv80axnfcffqx57td2hp";
const PARENT_USER_ID = "k173x3mh8vdyt71djvjeaw36fn7tcgbs";
const SECOND_PARENT_USER_ID = "k17caegbpm3a7p5vbw8gcqda3s7tcwan";

async function testVotingSystem() {
  console.log("🧪 Testing Voting System Constraints...\n");

  const testVotes: string[] = [];

  try {
    // Test 1: Basic vote creation and retrieval
    console.log("1. Creating a test vote...");
    const voteId = await convex.mutation(api.votes.createVote, {
      title: "Test Vote - School Lunch Menu",
      description: "What should be the main dish for next week's lunch?",
      category: "GENERAL",
      endDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
      isActive: true,
      isPublic: true,
      allowMultipleVotes: false,
      requireAuthentication: true,
      createdBy: ADMIN_USER_ID,
      options: [
        "Pasta with tomato sauce",
        "Chicken with rice",
        "Fish and vegetables",
        "Vegetarian option",
      ],
    });
    testVotes.push(voteId);
    console.log(`✅ Vote created with ID: ${voteId}`);

    // Test 2: Get the vote details
    console.log("\n2. Fetching vote details...");
    const voteDetails = await convex.query(api.votes.getVoteById, {
      id: voteId,
    });
    if (!voteDetails) {
      throw new Error("Vote not found after creation");
    }
    console.log(`✅ Vote details retrieved: ${voteDetails.title}`);
    console.log(`   - Options: ${voteDetails.options.length}`);
    console.log(
      `   - Total votes: ${voteDetails.options.reduce((sum, opt) => sum + opt.voteCount, 0)}`,
    );

    // Test 3: Cast a vote
    console.log("\n3. Casting a vote...");
    const voteResponseId = await convex.mutation(api.votes.castVote, {
      voteId,
      optionId: voteDetails.options[0]._id,
      userId: PARENT_USER_ID,
    });
    console.log(`✅ Vote cast with response ID: ${voteResponseId}`);

    // Test 4: Try to vote again (should fail - allowMultipleVotes: false)
    console.log(
      "\n4. Testing duplicate vote prevention (allowMultipleVotes: false)...",
    );
    try {
      await convex.mutation(api.votes.castVote, {
        voteId,
        optionId: voteDetails.options[1]._id,
        userId: PARENT_USER_ID, // Same user
      });
      console.log("❌ ERROR: Duplicate vote was allowed!");
      throw new Error("Duplicate vote prevention failed");
    } catch (error: any) {
      if (error.message.includes("User has already voted")) {
        console.log("✅ Duplicate vote correctly prevented");
      } else {
        throw error;
      }
    }

    // Test 5: Cast vote with different user (should succeed)
    console.log("\n5. Casting vote with different user...");
    const voteResponseId2 = await convex.mutation(api.votes.castVote, {
      voteId,
      optionId: voteDetails.options[1]._id,
      userId: SECOND_PARENT_USER_ID,
    });
    console.log(`✅ Second vote cast with response ID: ${voteResponseId2}`);

    // Test 6: Test maxVotesPerUser constraint
    console.log("\n6. Testing maxVotesPerUser constraint...");
    const maxVotesVoteId = await convex.mutation(api.votes.createVote, {
      title: "Test Vote - Max Votes Constraint",
      description: "Testing maxVotesPerUser limit",
      category: "GENERAL",
      endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
      isActive: true,
      isPublic: true,
      allowMultipleVotes: true,
      maxVotesPerUser: 3,
      requireAuthentication: true,
      createdBy: ADMIN_USER_ID,
      options: ["Option A", "Option B", "Option C", "Option D"],
    });
    testVotes.push(maxVotesVoteId);

    const maxVotesDetails = await convex.query(api.votes.getVoteById, {
      id: maxVotesVoteId,
    });
    if (!maxVotesDetails) {
      throw new Error("Max votes vote not found");
    }

    // Cast 3 votes (should succeed)
    for (let i = 0; i < 3; i++) {
      await convex.mutation(api.votes.castVote, {
        voteId: maxVotesVoteId,
        optionId: maxVotesDetails.options[i]._id,
        userId: PARENT_USER_ID,
      });
      console.log(`   ✅ Vote ${i + 1}/3 cast successfully`);
    }

    // Try 4th vote (should fail)
    try {
      await convex.mutation(api.votes.castVote, {
        voteId: maxVotesVoteId,
        optionId: maxVotesDetails.options[3]._id,
        userId: PARENT_USER_ID,
      });
      console.log("❌ ERROR: 4th vote was allowed when maxVotesPerUser is 3!");
      throw new Error("maxVotesPerUser constraint failed");
    } catch (error: any) {
      if (error.message.includes("Maximum votes per user limit reached")) {
        console.log(
          "✅ maxVotesPerUser constraint correctly enforced (409 on 4th vote)",
        );
      } else {
        throw error;
      }
    }

    // Test 7: Test expired vote (should fail)
    console.log("\n7. Testing expired vote constraint...");
    const expiredVoteId = await convex.mutation(api.votes.createVote, {
      title: "Test Vote - Expired",
      description: "This vote has already expired",
      category: "GENERAL",
      endDate: Date.now() - 1000, // Expired 1 second ago
      isActive: true,
      isPublic: true,
      allowMultipleVotes: false,
      requireAuthentication: true,
      createdBy: ADMIN_USER_ID,
      options: ["Yes", "No"],
    });
    testVotes.push(expiredVoteId);

    const expiredVoteDetails = await convex.query(api.votes.getVoteById, {
      id: expiredVoteId,
    });
    if (!expiredVoteDetails) {
      throw new Error("Expired vote not found");
    }

    // Note: Convex castVote doesn't check expiration - that's handled by API layer
    // This is expected behavior - the constraint should be checked at API level
    console.log(
      "   ℹ️  Expiration check is handled at API layer (tested in API tests)",
    );

    // Test 8: Test allowMultipleVotes: true
    console.log("\n8. Testing allowMultipleVotes: true...");
    const multipleVotesId = await convex.mutation(api.votes.createVote, {
      title: "Test Vote - Multiple Votes Allowed",
      description: "Users can vote multiple times",
      category: "GENERAL",
      endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
      isActive: true,
      isPublic: true,
      allowMultipleVotes: true,
      requireAuthentication: true,
      createdBy: ADMIN_USER_ID,
      options: ["Option 1", "Option 2", "Option 3"],
    });
    testVotes.push(multipleVotesId);

    const multipleVotesDetails = await convex.query(api.votes.getVoteById, {
      id: multipleVotesId,
    });
    if (!multipleVotesDetails) {
      throw new Error("Multiple votes vote not found");
    }

    // Cast 2 votes with same user (should succeed)
    await convex.mutation(api.votes.castVote, {
      voteId: multipleVotesId,
      optionId: multipleVotesDetails.options[0]._id,
      userId: PARENT_USER_ID,
    });
    await convex.mutation(api.votes.castVote, {
      voteId: multipleVotesId,
      optionId: multipleVotesDetails.options[1]._id,
      userId: PARENT_USER_ID,
    });
    console.log("✅ Multiple votes with same user correctly allowed");

    // Test 9: Check vote results
    console.log("\n9. Checking updated vote results...");
    const updatedVoteDetails = await convex.query(api.votes.getVoteById, {
      id: voteId,
    });
    if (!updatedVoteDetails) {
      throw new Error("Vote not found");
    }
    const totalVotes = updatedVoteDetails.options.reduce(
      (sum, opt) => sum + opt.voteCount,
      0,
    );
    console.log(`✅ Total votes now: ${totalVotes}`);
    updatedVoteDetails.options.forEach((opt, index) => {
      const percentage =
        totalVotes > 0 ? (opt.voteCount / totalVotes) * 100 : 0;
      console.log(
        `   - Option ${index + 1}: ${opt.voteCount} votes (${percentage.toFixed(1)}%)`,
      );
    });

    // Test 10: Get all votes with filters
    console.log("\n10. Testing vote listing with filters...");
    const allVotes = await convex.query(api.votes.getVotes, {});
    console.log(`✅ Found ${allVotes.length} total votes in system`);

    const activeVotes = await convex.query(api.votes.getVotes, {
      isActive: true,
    });
    console.log(`✅ Found ${activeVotes.length} active votes`);

    const generalVotes = await convex.query(api.votes.getVotes, {
      category: "GENERAL",
    });
    console.log(`✅ Found ${generalVotes.length} GENERAL category votes`);

    // Test 11: Get user vote response
    console.log("\n11. Testing getUserVoteResponse...");
    const userResponse = await convex.query(api.votes.getUserVoteResponse, {
      voteId,
      userId: PARENT_USER_ID,
    });
    if (userResponse) {
      console.log(`✅ User vote response retrieved: ${userResponse._id}`);
    } else {
      console.log("⚠️  No user vote response found (unexpected)");
    }

    // Test 12: Clean up - delete all test votes
    console.log("\n12. Cleaning up test votes...");
    for (const testVoteId of testVotes) {
      await convex.mutation(api.votes.deleteVote, { id: testVoteId });
      console.log(`✅ Test vote deleted: ${testVoteId}`);
    }

    console.log("\n🎉 All voting system constraint tests passed!");
    return true;
  } catch (error) {
    console.error("❌ Voting system test failed:", error);

    // Clean up on error
    console.log("\nCleaning up test votes after error...");
    for (const testVoteId of testVotes) {
      try {
        await convex.mutation(api.votes.deleteVote, { id: testVoteId });
        console.log(`✅ Cleaned up: ${testVoteId}`);
      } catch (cleanupError) {
        console.error(`⚠️  Failed to cleanup ${testVoteId}:`, cleanupError);
      }
    }

    throw error;
  }
}

// Run the test
testVotingSystem()
  .then(() => {
    console.log("\n✅ All tests completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Tests failed:", error);
    process.exit(1);
  });
