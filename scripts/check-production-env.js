#!/usr/bin/env node

/**
 * Production Environment Check Script
 *
 * Checks if production environment variables are correctly configured
 * and provides instructions for fixing issues.
 */

const https = require("https");

console.log("🔍 Checking production environment configuration...\n");

// Expected production values
const EXPECTED_CONVEX_URL = "https://industrious-manatee-7.convex.cloud";
const PRODUCTION_DOMAIN = "https://plataforma.aramac.dev";

console.log("📋 Expected Configuration:");
console.log(`   Convex URL: ${EXPECTED_CONVEX_URL}`);
console.log(`   Domain: ${PRODUCTION_DOMAIN}`);
console.log();

// Test Convex endpoint
function testConvexEndpoint(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: "HEAD" }, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on("error", () => resolve(false));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function runChecks() {
  console.log("🧪 Testing endpoints...\n");

  // Test if Convex endpoint is accessible
  const convexReachable = await testConvexEndpoint(EXPECTED_CONVEX_URL);
  if (convexReachable) {
    console.log("✅ Convex production endpoint is accessible");
  } else {
    console.log("❌ Convex production endpoint is not accessible");
  }

  console.log();
  console.log("🔧 Vercel Environment Variables to Check/Set:");
  console.log();
  console.log("Required Variables:");
  console.log(`   NEXT_PUBLIC_CONVEX_URL = ${EXPECTED_CONVEX_URL}`);
  console.log("   NEXTAUTH_SECRET = [32+ character secure random string]");
  console.log(`   NEXTAUTH_URL = ${PRODUCTION_DOMAIN}`);
  console.log("   CLERK_SECRET_KEY = [your Clerk secret key]");
  console.log("   CLERK_WEBHOOK_SECRET = [your Clerk webhook secret]");
  console.log(
    "   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = [your Clerk publishable key]",
  );
  console.log();
  console.log("Optional Variables:");
  console.log("   CLOUDINARY_CLOUD_NAME = [your Cloudinary cloud name]");
  console.log("   CLOUDINARY_API_KEY = [your Cloudinary API key]");
  console.log("   CLOUDINARY_API_SECRET = [your Cloudinary API secret]");
  console.log();
  console.log("📖 How to fix:");
  console.log();
  console.log(
    "1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables",
  );
  console.log(
    "2. Ensure NEXT_PUBLIC_CONVEX_URL is set to:",
    EXPECTED_CONVEX_URL,
  );
  console.log("3. Redeploy the application after updating variables");
  console.log("4. Check the deployment logs for any remaining errors");
  console.log();
  console.log(
    "💡 Note: Environment variable changes require a new deployment to take effect.",
  );
}

runChecks().catch(console.error);
