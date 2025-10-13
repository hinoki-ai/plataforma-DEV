/**
 * Check user credentials in Convex database
 */
import { ConvexHttpClient } from "convex/browser";
import bcryptjs from "bcryptjs";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL not found in environment");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function checkUser() {
  const email = "agustin@astral.cl";
  const passwordToTest = "59163476a";

  console.log(`\n🔍 Checking user: ${email}\n`);

  try {
    // @ts-ignore
    const user = await client.query("users:getUserByEmail", { email });

    if (!user) {
      console.log("❌ User not found in database");
      console.log("\n💡 Possible solutions:");
      console.log("   1. Check if email is correct (case-sensitive)");
      console.log("   2. Create the user via Convex dashboard");
      console.log("   3. Run seed script to create initial users");
      return;
    }

    console.log("✅ User found!");
    console.log(`   Name: ${user.name || "N/A"}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   Has Password: ${user.password ? "Yes" : "No"}`);

    if (!user.isActive) {
      console.log("\n❌ User account is INACTIVE");
      return;
    }

    if (!user.password) {
      console.log("\n❌ User has no password set (might be OAuth only)");
      return;
    }

    // Test password
    const isValid = await bcryptjs.compare(passwordToTest, user.password);

    console.log(`\n🔐 Password Test:`);
    console.log(`   Testing password: "${passwordToTest}"`);
    console.log(`   Match: ${isValid ? "✅ YES" : "❌ NO"}`);

    if (!isValid) {
      console.log("\n❌ Password does not match!");
      console.log("\n💡 Possible solutions:");
      console.log("   1. Verify the correct password");
      console.log("   2. Reset password via Convex dashboard");
      console.log("   3. Create new password hash with: npx tsx scripts/hash-password.ts");
    } else {
      console.log("\n✅ Password is correct! Login should work.");
      console.log("\n🔍 If login still fails, check:");
      console.log("   1. Browser console for errors");
      console.log("   2. Network tab for API responses");
      console.log("   3. NextAuth configuration in src/lib/auth.ts");
    }
  } catch (error: any) {
    console.error("❌ Error checking user:", error.message);
  }
}

checkUser();
