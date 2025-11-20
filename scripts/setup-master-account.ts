/**
 * Setup Master Admin Account
 * Ensures the master admin account exists with correct credentials
 */

import { ConvexHttpClient } from "convex/browser";
import bcryptjs from "bcryptjs";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

if (!CONVEX_URL) {
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

const MASTER_ACCOUNT = {
  email: "agustin@astral.cl",
  password: process.env.MASTER_PASSWORD || "",
  name: "Agustin - Master Admin",
  role: "MASTER" as const,
};

if (!MASTER_ACCOUNT.password) {
  process.exit(1);
}

async function setupMasterAccount() {
  try {
    // Check if user exists
    const existingUser = await client.query(api.users.getUserByEmail, {
      email: MASTER_ACCOUNT.email,
    });

    if (existingUser) {
      // Update password if needed
      const hashedPassword = await bcryptjs.hash(MASTER_ACCOUNT.password, 10);
      await client.mutation(api.users.updateUser, {
        id: existingUser._id,
        password: hashedPassword,
        role: MASTER_ACCOUNT.role,
        isActive: true,
      });

      return;
    }

    // Create new master account

    const hashedPassword = await bcryptjs.hash(MASTER_ACCOUNT.password, 10);

    const userId = await client.mutation(api.users.createUser, {
      email: MASTER_ACCOUNT.email,
      password: hashedPassword,
      name: MASTER_ACCOUNT.name,
      role: MASTER_ACCOUNT.role,
    });
  } catch (error) {
    throw error;
  }
}

setupMasterAccount()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });
