#!/usr/bin/env node
/**
 * Verify Master User with Clerk API
 * Uses Clerk backend SDK to verify the master user exists and has correct role
 */

import { createClerkClient } from "@clerk/backend";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

const MASTER_EMAIL = process.env.E2E_MASTER_EMAIL || "agustinaramac@gmail.com";

async function verifyMasterUser() {
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║         CLERK MASTER USER VERIFICATION                   ║");
  console.log(
    "╚═══════════════════════════════════════════════════════════╝\n",
  );

  const clerkSecret = process.env.CLERK_SECRET_KEY;

  if (!clerkSecret) {
    console.log("❌ CLERK_SECRET_KEY not found in environment");
    console.log("   Please set CLERK_SECRET_KEY in .env.local");
    process.exit(1);
  }

  try {
    const clerkClient = createClerkClient({ secretKey: clerkSecret });

    console.log(`🔍 Looking for master user: ${MASTER_EMAIL}\n`);

    // Search for user by email
    const usersResponse = await clerkClient.users.getUserList({
      emailAddress: [MASTER_EMAIL],
      limit: 10,
    });

    if (usersResponse.data.length === 0) {
      console.log(`❌ Master user not found: ${MASTER_EMAIL}`);
      console.log("\n💡 To create the master user:");
      console.log("   1. Go to https://dashboard.clerk.com");
      console.log("   2. Navigate to Users section");
      console.log("   3. Create user with email:", MASTER_EMAIL);
      console.log('   4. Set public metadata: { "role": "MASTER" }');
      process.exit(1);
    }

    const masterUser = usersResponse.data[0];
    const email = masterUser.emailAddresses.find(
      (e) => e.id === masterUser.primaryEmailAddressId,
    )?.emailAddress;
    const role = masterUser.publicMetadata?.role;
    const firstName = masterUser.firstName;
    const lastName = masterUser.lastName;
    const fullName = [firstName, lastName].filter(Boolean).join(" ");

    console.log("✅ Master user found!");
    console.log(`   User ID: ${masterUser.id}`);
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${fullName || "Not set"}`);
    console.log(`   Role: ${role || "Not set"}`);

    if (role !== "MASTER") {
      console.log(
        `\n⚠️  Warning: User role is "${role}" but should be "MASTER"`,
      );
      console.log(
        "   Update public metadata in Clerk dashboard to set role to MASTER",
      );
    } else {
      console.log("\n✅ Master user verified successfully!");
      console.log(`   Ready for e2e testing as: ${fullName || email}`);
    }

    return {
      id: masterUser.id,
      email,
      name: fullName,
      role,
      verified: role === "MASTER",
    };
  } catch (error) {
    console.error("\n❌ Error verifying master user:", error.message);
    if (error.status === 401) {
      console.error("   Invalid CLERK_SECRET_KEY");
    }
    process.exit(1);
  }
}

verifyMasterUser();
