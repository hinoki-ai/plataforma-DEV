/**
 * Fix User Passwords Script
 * Updates existing users with correct bcrypt hashes
 * Run with: npx tsx scripts/fix-user-passwords.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

if (!CONVEX_URL) {
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// NOTE: Password hashes have been removed for security reasons
// This script should use environment variables or secure credential management
const CORRECT_HASHES = {
  // Credentials should be loaded from environment variables or secure vault
};

async function fixPasswords() {
  for (const [email, correctHash] of Object.entries(CORRECT_HASHES)) {
    try {
      // Get user by email
      const user = await client.query(api.users.getUserByEmail, { email });

      if (!user) {
        continue;
      }

      // Update password
      await client.mutation(api.users.updateUser, {
        id: user._id,
        password: correctHash,
      });
    } catch (error) {}
  }
}

fixPasswords()
  .then(() => process.exit(0))
  .catch((error) => {
    process.exit(1);
  });
