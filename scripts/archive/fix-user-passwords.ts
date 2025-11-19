/**
 * Fix User Passwords Script
 * Updates existing users with correct bcrypt hashes
 * Run with: npx tsx scripts/fix-user-passwords.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

if (!CONVEX_URL) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL not found in environment");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Correct bcrypt hashes for test passwords
const CORRECT_HASHES = {
  "master@plataforma-astral.com":
    "$2b$10$.CMNqsxLIY3X9LAunrPvaOG1GIGmvwNi70Ksth1hHOlMrqQyp9UOy", // master123
  "admin@plataforma-astral.com":
    "$2b$10$07JuDiQUuQj9AQYD7k7KSeNbPVSx0n6cA8N17biZ95Qroq3owdtRm", // admin123
  "profesor@plataforma-astral.com":
    "$2b$10$cd7.dEqS/9KNbYaG7DSgmeKUXOBvKN4qNzNXHK1TGdYaRf26xqtAu", // profesor123
  "parent@plataforma-astral.com":
    "$2b$10$F1C0aQWCrE59er8wB0p94OThHCBMPrpxRA3esWSW0UuPS/Aa0FLZS", // parent123
};

async function fixPasswords() {
  console.log("🔧 Fixing user passwords...\n");

  for (const [email, correctHash] of Object.entries(CORRECT_HASHES)) {
    try {
      // Get user by email
      const user = await client.query(api.users.getUserByEmail, { email });

      if (!user) {
        console.log(`⚠️  User not found: ${email}`);
        continue;
      }

      // Update password
      await client.mutation(api.users.updateUser, {
        id: user._id,
        password: correctHash,
      });

      console.log(`✅ Updated password for: ${email}`);
    } catch (error) {
      console.error(`❌ Error updating ${email}:`, error);
    }
  }

  console.log("\n✨ Password fix complete!");
  console.log("\nTest credentials:");
  console.log("- master@plataforma-astral.com / master123");
  console.log("- admin@plataforma-astral.com / admin123");
  console.log("- profesor@plataforma-astral.com / profesor123");
  console.log("- parent@plataforma-astral.com / parent123");
}

fixPasswords()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
