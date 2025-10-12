#!/usr/bin/env tsx
/**
 * Environment Validation Script
 * Validates all required environment variables for deployment
 * Catches credential issues before they cause deployment failures
 */

// Load environment variables from .env file
import { config } from "dotenv";
import { resolve } from "path";

// Load base .env, then overlay with .env.local if present (keeps per-dev overrides minimal)
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local"), override: true });

interface EnvValidation {
  name: string;
  required: boolean;
  type?: "url" | "secret" | "email" | "string" | "number";
  minLength?: number;
  description: string;
  pattern?: string; // Added for regex validation
}

const ENV_REQUIREMENTS: EnvValidation[] = [

  // Authentication Configuration
  {
    name: "NEXTAUTH_URL",
    required: true,
    type: "url",
    description: "Application URL for NextAuth callbacks",
  },
  {
    name: "NEXTAUTH_SECRET",
    required: true,
    type: "secret",
    minLength: 32,
    description: "Secret key for NextAuth session encryption",
  },

  // Default Credentials (for test users)
  {
    name: "DEFAULT_ADMIN_EMAIL",
    required: false,
    type: "email",
    description: "Default admin email for test user creation",
  },
  {
    name: "DEFAULT_ADMIN_PASSWORD",
    required: false,
    type: "string",
    minLength: 6,
    description: "Default admin password for test user creation",
  },
  {
    name: "DEFAULT_TEACHER_EMAIL",
    required: false,
    type: "email",
    description: "Default teacher email for test user creation",
  },
  {
    name: "DEFAULT_TEACHER_PASSWORD",
    required: false,
    type: "string",
    minLength: 6,
    description: "Default teacher password for test user creation",
  },

  // Optional OAuth Configuration
  {
    name: "GOOGLE_CLIENT_ID",
    required: false,
    type: "string",
    description: "Google OAuth client ID (optional)",
  },
  {
    name: "GOOGLE_CLIENT_SECRET",
    required: false,
    type: "string",
    description: "Google OAuth client secret (optional)",
  },
  {
    name: "FACEBOOK_CLIENT_ID",
    required: false,
    type: "string",
    description: "Facebook OAuth client ID (optional)",
  },
  {
    name: "FACEBOOK_CLIENT_SECRET",
    required: false,
    type: "string",
    description: "Facebook OAuth client secret (optional)",
  },

  // Application Configuration
  {
    name: "NODE_ENV",
    required: false,
    type: "string",
    description: "Node environment (development/production)",
  },
];

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  environment: string;
}

function validateEnvironmentVariable(env: EnvValidation): {
  valid: boolean;
  error?: string;
  warning?: string;
} {
  const value = process.env[env.name];

  if (!value && env.required) {
    return { valid: false, error: `${env.name} is required` };
  }

  if (!value && !env.required) {
    return { valid: true, warning: `${env.name} is not set (optional)` };
  }


  if (env.pattern && !new RegExp(env.pattern).test(value!)) {
    return { valid: false, error: `${env.name} format is invalid` };
  }

  return { valid: true };
}


function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required environment variables
  for (const env of ENV_REQUIREMENTS) {
    const result = validateEnvironmentVariable(env);
    if (!result.valid && result.error) {
      errors.push(result.error);
    }
    if (result.warning) {
      warnings.push(result.warning);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    environment: process.env.NODE_ENV || "development",
  };
}

async function main() {
  console.log("🚀 Plataforma Astral - Environment Validation");
  console.log("================================================");

  const result = validateEnvironment();

  // Display warnings
  if (result.warnings.length > 0) {
    console.log("\n⚠️  WARNINGS:");
    result.warnings.forEach((warning) => console.log(`   ${warning}`));
  }

  // Display errors
  if (result.errors.length > 0) {
    console.log("\n❌ VALIDATION ERRORS:");
    result.errors.forEach((error) => console.log(`   ${error}`));
    console.log("\n📋 Quick Fix Guide:");
    console.log(
      "   1. Check your .env file exists and has all required variables",
    );
    console.log("   2. For production: Update NEXTAUTH_URL to your domain");
    console.log("   3. Set NEXT_PUBLIC_CONVEX_URL to your Convex project URL");
    console.log("   4. Generate secure NEXTAUTH_SECRET (32+ characters)");
    console.log("\n💡 Example production .env:");
    console.log('   NEXT_PUBLIC_CONVEX_URL="https://your-project.convex.cloud"');
    console.log('   NEXTAUTH_URL="https://your-domain.vercel.app"');
    console.log('   NEXTAUTH_SECRET="your-super-secure-key-here"');

    process.exit(1);
  }

  // Success message
  console.log("\n✅ Environment validation passed!");
  console.log(`📊 Summary: ${result.environment} environment`);
  console.log("🎯 Ready for deployment!");

  return result;
}

// Execute if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error during environment validation:", error);
    process.exit(1);
  });
}

export default validateEnvironment;
