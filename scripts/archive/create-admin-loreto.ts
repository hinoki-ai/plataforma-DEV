/**
 * Create Admin Account - Loreto
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { hashUserPassword, logUserCreation } from "../src/lib/user-creation";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

if (!CONVEX_URL) {
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

const ADMIN_ACCOUNT = {
  email: "loreto@astral.cl",
  password: process.env.ADMIN_PASSWORD || "",
  name: "Loreto",
  role: "ADMIN" as const,
};

if (!ADMIN_ACCOUNT.password) {
  process.exit(1);
}

async function createAdminAccount() {
  try {
    const existingUser = await client.query(api.users.getUserByEmail, {
      email: ADMIN_ACCOUNT.email,
    });

    if (existingUser) {
      const hashedPassword = await bcryptjs.hash(ADMIN_ACCOUNT.password, 10);
      await client.mutation(api.users.updateUser, {
        id: existingUser._id,
        password: hashedPassword,
        role: ADMIN_ACCOUNT.role,
      });

      return;
    }

    const hashedPassword = await hashUserPassword(ADMIN_ACCOUNT.password);

    const userId = await client.mutation(api.users.createUser, {
      email: ADMIN_ACCOUNT.email,
      password: hashedPassword,
      name: ADMIN_ACCOUNT.name,
      role: ADMIN_ACCOUNT.role,
    });

    // Log successful creation
    logUserCreation(
      "createAdminLoretoScript",
      {
        email: ADMIN_ACCOUNT.email,
        role: ADMIN_ACCOUNT.role,
        name: ADMIN_ACCOUNT.name,
      },
      "system",
      true,
    );
  } catch (error) {
    throw error;
  }
}

createAdminAccount()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });
