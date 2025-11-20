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
