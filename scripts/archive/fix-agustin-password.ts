#!/usr/bin/env tsx
/**
 * Fix Agustin's Password
 * Reset password for agustin@astral.cl to 59163476a
 */

import { ConvexHttpClient } from "convex/browser";
import bcryptjs from "bcryptjs";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

if (!CONVEX_URL) {
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

const CREDENTIALS = {
  email: "agustin@astral.cl",
  password: "59163476a",
};

async function fixPassword() {
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

fixPassword()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });
