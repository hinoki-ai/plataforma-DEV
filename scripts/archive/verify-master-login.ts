/**
 * Verify Master Account Login
 * Tests that the master account credentials are valid
 */

import bcryptjs from "bcryptjs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

if (!CONVEX_URL) {
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

const MASTER_CREDENTIALS = {
  email: "agustin@astral.cl",
  password: process.env.MASTER_PASSWORD || "",
};

if (!MASTER_CREDENTIALS.password) {
  process.exit(1);
}

async function verifyLogin() {
  try {
    // Get user by email
    const user = await client.query(api.users.getUserByEmail, {
      email: MASTER_CREDENTIALS.email,
    });

    if (!user) {
      return false;
    }

    // Verify password
    if (!user.password) {
      return false;
    }

    const isValidPassword = await bcryptjs.compare(
      MASTER_CREDENTIALS.password,
      user.password,
    );

    if (!isValidPassword) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

verifyLogin()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch(() => {
    process.exit(1);
  });
