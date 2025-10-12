/**
 * Create Admin Account - Loreto
 */

import { ConvexHttpClient } from "convex/browser";
import bcryptjs from "bcryptjs";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

if (!CONVEX_URL) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL is not set");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

const ADMIN_ACCOUNT = {
  email: "loreto@astral.cl",
  password: "Emilia2021-",
  name: "Loreto",
  role: "ADMIN" as const,
};

async function createAdminAccount() {
  console.log("🔍 Checking for admin account...");

  try {
    const existingUser = await client.query(api.users.getUserByEmail, {
      email: ADMIN_ACCOUNT.email,
    });

    if (existingUser) {
      console.log("✅ Admin account already exists:");
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Name: ${existingUser.name}`);
      console.log(`   Role: ${existingUser.role}`);

      const hashedPassword = await bcryptjs.hash(ADMIN_ACCOUNT.password, 10);
      await client.mutation(api.users.updateUser, {
        id: existingUser._id,
        password: hashedPassword,
        role: ADMIN_ACCOUNT.role,
      });

      console.log("🔄 Password and role updated successfully!");
      return;
    }

    console.log("🔨 Creating admin account...");
    const hashedPassword = await bcryptjs.hash(ADMIN_ACCOUNT.password, 10);

    const userId = await client.mutation(api.users.createUser, {
      email: ADMIN_ACCOUNT.email,
      password: hashedPassword,
      name: ADMIN_ACCOUNT.name,
      role: ADMIN_ACCOUNT.role,
    });

    console.log("✅ Admin account created successfully!");
    console.log(`   User ID: ${userId}`);
    console.log(`   Email: ${ADMIN_ACCOUNT.email}`);
    console.log(`   Name: ${ADMIN_ACCOUNT.name}`);
    console.log(`   Role: ${ADMIN_ACCOUNT.role}`);
  } catch (error) {
    console.error("❌ Error creating admin account:", error);
    throw error;
  }
}

createAdminAccount()
  .then(() => {
    console.log("\n✨ Admin account setup complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Setup failed:", error);
    process.exit(1);
  });
