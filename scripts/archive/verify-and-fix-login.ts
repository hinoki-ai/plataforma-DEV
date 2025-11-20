#!/usr/bin/env tsx
/**
 * Verify and Fix Login Script
 * Checks if agustin@astral.cl can log in and fixes password if needed
 */

import { ConvexHttpClient } from "convex/browser";
import bcryptjs from "bcryptjs";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

if (!CONVEX_URL) {
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

const TEST_CREDENTIALS = {
  email: "agustin@astral.cl",
  password: "master123",
};

async function verifyAndFixLogin() {
  try {
    // 1. Get the user from database

    const user = await client.query(api.users.getUserByEmail, {
      email: TEST_CREDENTIALS.email,
    });

    if (!user) {
      const hashedPassword = await bcryptjs.hash(TEST_CREDENTIALS.password, 10);
      await client.mutation(api.users.createUser, {
        email: TEST_CREDENTIALS.email,
        password: hashedPassword,
        name: "Agustin - Master Admin",
        role: "MASTER",
      });

      return;
    }

    // 2. Test password verification

    if (!user.password) {
      const hashedPassword = await bcryptjs.hash(TEST_CREDENTIALS.password, 10);
      await client.mutation(api.users.updateUser, {
        id: user._id,
        password: hashedPassword,
      });

      return;
    }

    // Check if password is bcrypt format
    const isBcryptHash = /^\$2[abyxz]\$/.test(user.password);

    // Try to verify with bcryptjs
    try {
      const isValid = await bcryptjs.compare(
        TEST_CREDENTIALS.password,
        user.password,
      );

      if (isValid) {
        return;
      } else {
        const hashedPassword = await bcryptjs.hash(
          TEST_CREDENTIALS.password,
          10,
        );
        await client.mutation(api.users.updateUser, {
          id: user._id,
          password: hashedPassword,
        });
      }
    } catch (error) {
      const hashedPassword = await bcryptjs.hash(TEST_CREDENTIALS.password, 10);
      await client.mutation(api.users.updateUser, {
        id: user._id,
        password: hashedPassword,
      });
    }
  } catch (error) {
    throw error;
  }
}

verifyAndFixLogin()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });
