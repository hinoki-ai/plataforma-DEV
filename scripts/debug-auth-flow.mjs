#!/usr/bin/env node
/**
 * Authentication Flow Debugger
 * Tests the complete authentication flow and identifies issues
 */

import { execSync } from "child_process";

console.log("╔═══════════════════════════════════════════════════════════╗");
console.log("║         AUTHENTICATION FLOW DEBUG TOOL                    ║");
console.log("╚═══════════════════════════════════════════════════════════╝\n");

async function testAuthFlow() {
  try {
    console.log("✅ Step 1: Convex Connection Test\n");

    // Test Convex connection
    try {
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
      console.log(`   Convex URL: ${convexUrl || "❌ NOT SET"}`);

      if (convexUrl) {
        const result = execSync("npx convex run users:getUserCountByRole", {
          encoding: "utf-8",
        });
        const counts = JSON.parse(result);
        console.log(`   ✅ Convex Connected!`);
        console.log(`   User Counts:`, counts);
      }
    } catch (error) {
      console.log(`   ❌ Convex connection failed:`, error.message);
    }

    console.log("\n🔍 Step 2: Testing User Authentication\n");

    const TEST_USERS = [
      "master@plataforma-astral.com",
      "admin@plataforma-astral.com",
      "profesor@plataforma-astral.com",
      "parent@plataforma-astral.com",
    ];

    for (const email of TEST_USERS) {
      console.log(`   Testing: ${email}`);

      try {
        const result = execSync(
          `npx convex run users:getUsers '{"role": "${email.includes("master") ? "MASTER" : email.includes("admin") ? "ADMIN" : email.includes("profesor") ? "PROFESOR" : "PARENT"}"}'`,
          { encoding: "utf-8" },
        );
        const users = JSON.parse(result);
        const user = users.find((u) => u.email === email);

        if (user) {
          console.log(`   ✓ User found`);
          console.log(`     - Role: ${user.role}`);
          console.log(`     - Active: ${user.isActive}`);
          console.log(`     - Has Password: ${!!user.password}`);
        } else {
          console.log(`   ❌ User not found\n`);
        }
      } catch (error) {
        console.log(`   ❌ Error querying user:`, error.message);
      }

      console.log("");
    }

    console.log("📊 Step 3: Environment Configuration Check\n");

    const checks = [
      {
        name: "NEXT_PUBLIC_CONVEX_URL",
        value: process.env.NEXT_PUBLIC_CONVEX_URL,
        required: true,
      },
      {
        name: "NEXTAUTH_SECRET",
        value: process.env.NEXTAUTH_SECRET ? "✓ Set" : undefined,
        required: true,
      },
      {
        name: "NEXTAUTH_URL",
        value: process.env.NEXTAUTH_URL,
        required: true,
      },
      {
        name: "NODE_ENV",
        value: process.env.NODE_ENV || "development",
        required: false,
      },
    ];

    for (const check of checks) {
      const status = check.value
        ? "✅"
        : check.required
          ? "❌ MISSING!"
          : "⚠️  Optional";
      console.log(`   ${status} ${check.name}: ${check.value || "Not set"}`);
    }

    console.log("\n🔐 Step 4: Authentication Flow Summary\n");
    console.log("   Expected Flow:");
    console.log("   1. User visits /login");
    console.log("   2. User enters credentials");
    console.log("   3. Form submits to authenticate() server action");
    console.log(
      "   4. authenticateUser() validates credentials (Convex query)",
    );
    console.log("   5. signIn() is called (creates session)");
    console.log("   6. NextAuth throws NEXT_REDIRECT to /auth-success");
    console.log(
      "   7. /auth-success checks session and redirects to role dashboard",
    );
    console.log("   8. Middleware validates session and allows access\n");

    console.log("   Common Issues:");
    console.log("   ❌ NEXT_REDIRECT not re-thrown → User stays on /login");
    console.log(
      "   ❌ Session cookie not set → Middleware redirects to /login",
    );
    console.log(
      "   ❌ JWT callback fails → Token not populated → Session fails",
    );
    console.log(
      "   ❌ Role missing in token → Middleware can't determine access\n",
    );

    console.log("📝 Step 5: Recommendations\n");
    console.log("   1. Check browser DevTools → Application → Cookies");
    console.log(
      "      Look for: next-auth.session-token (dev) or __Secure-next-auth.session-token (prod)",
    );
    console.log("   2. Check browser Console for auth debug logs");
    console.log("   3. Check server terminal for [AUTH-SUCCESS] logs");
    console.log(
      "   4. If stuck at /login, session cookie is likely not being set\n",
    );

    console.log("✅ Diagnostic Complete!\n");
  } catch (error) {
    console.error("\n❌ Error during diagnostic:", error.message);
  }
}

testAuthFlow();
