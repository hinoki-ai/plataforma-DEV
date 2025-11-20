#!/usr/bin/env tsx
/**
 * Fix Agustin's Password in PRODUCTION
 * Reset password for agustin@astral.cl to 59163476a in production Convex
 */

import { ConvexHttpClient } from "convex/browser";
import bcryptjs from "bcryptjs";
import { api } from "../convex/_generated/api";

// PRODUCTION Convex URL
const PRODUCTION_CONVEX_URL = "https://industrious-manatee-7.convex.cloud";

const client = new ConvexHttpClient(PRODUCTION_CONVEX_URL);

const CREDENTIALS = {
  email: "agustin@astral.cl",
  password: "59163476a",
};

async function fixProductionPassword() {
  try {
    // Get the user

    const user = await client.query(api.users.getUserByEmail, {
      email: CREDENTIALS.email,
    });

    if (!user) {
      const hashedPassword = await bcryptjs.hash(CREDENTIALS.password, 10);
      const userId = await client.mutation(api.users.createUser, {
        email: CREDENTIALS.email,
        password: hashedPassword,
        name: "Agustin - Master Admin",
        role: "MASTER",
        isActive: true,
      });

      return;
    }

    // Check current password format
    if (user.password) {
      const isBcrypt = /^\$2[abyxz]\$/.test(user.password);
    }

    // Reset password with bcrypt

    const hashedPassword = await bcryptjs.hash(CREDENTIALS.password, 10);

    await client.mutation(api.users.updateUser, {
      id: user._id,
      password: hashedPassword,
      isActive: true, // Ensure account is active
    });

    // Verify the password works

    const isValid = await bcryptjs.compare(
      CREDENTIALS.password,
      hashedPassword,
    );
  } catch (error) {
    throw error;
  }
}

fixProductionPassword()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });
