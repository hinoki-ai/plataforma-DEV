/**
 * Reset user password in Convex database
 */
import { ConvexHttpClient } from "convex/browser";
import bcryptjs from "bcryptjs";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL not found in environment");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function resetPassword() {
  const email = "agustin@astral.cl";
  const newPassword = "59163476a";

  console.log(`\n🔄 Resetting password for: ${email}\n`);

  try {
    // Get user
    const user = await client.query(api.users.getUserByEmail, { email });

    if (!user) {
      console.log("❌ User not found in database");
      return;
    }

    console.log("✅ User found!");
    console.log(`   Name: ${user.name || "N/A"}`);
    console.log(`   Role: ${user.role}`);

    // Hash the new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    console.log(`\n🔐 New password hash generated`);
    console.log(`   Password: ${newPassword}`);
    console.log(`   Hash: ${hashedPassword.substring(0, 30)}...`);

    // Update user password
    await client.mutation(api.users.updateUser, {
      id: user._id,
      password: hashedPassword,
    });

    console.log(`\n✅ Password updated successfully!`);
    console.log(`\n🎉 You can now log in with:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}`);
    
    // Verify the password works
    const isValid = await bcryptjs.compare(newPassword, hashedPassword);
    console.log(`\n🔍 Verification: ${isValid ? "✅ Password hash is valid" : "❌ Something went wrong"}`);

  } catch (error: any) {
    console.error("❌ Error resetting password:", error.message);
    console.error("\nFull error:", error);
  }
}

resetPassword();
