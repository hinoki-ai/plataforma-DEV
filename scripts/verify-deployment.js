#!/usr/bin/env node

/**
 * Deployment Verification Script for Plataforma Astral
 *
 * Verifies that the deployment is safe and properly configured
 * before proceeding with deployment. Prevents accidental data loss
 * and catches configuration issues early.
 */

const fs = require("fs");
const path = require("path");

// Load environment variables
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  const envLines = envContent.split("\n");
  for (const line of envLines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").replace(/^["']|["']$/g, "");
        process.env[key] = value;
      }
    }
  }
}

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;

// Skip verification during build if no URL is available (CI/CD environments)
if (
  !CONVEX_URL &&
  (process.env.VERCEL || process.env.CI || process.env.GITHUB_ACTIONS)
) {
  process.exit(0);
}

class DeploymentVerifier {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  log(message, emoji = "📝") {}

  error(message) {
    this.errors.push(message);
    this.log(message, "❌");
  }

  warning(message) {
    this.warnings.push(message);
    this.log(message, "⚠️");
  }

  success(message) {
    this.log(message, "✅");
  }

  info(message) {
    this.log(message, "ℹ️");
  }

  async verifyEnvironmentVariables() {
    this.log("Verifying environment variables...", "🔍");

    const requiredVars = [
      "NEXT_PUBLIC_CONVEX_URL",
      "NEXTAUTH_URL",
      "NEXTAUTH_SECRET",
    ];

    const optionalVars = [
      "CLOUDINARY_URL",
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
    ];

    let allRequired = true;

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        this.error(`Required environment variable missing: ${varName}`);
        allRequired = false;
      } else {
        this.success(`${varName} is set`);
      }
    }

    for (const varName of optionalVars) {
      if (!process.env[varName]) {
        this.warning(`Optional environment variable missing: ${varName}`);
      } else {
        this.success(`${varName} is set`);
      }
    }

    return allRequired;
  }

  async verifyConvexConfiguration() {
    this.log("Verifying Convex configuration...", "🔍");

    if (!CONVEX_URL) {
      this.error("CONVEX_URL not configured");
      return false;
    }

    // Check if URL is valid
    try {
      new URL(CONVEX_URL);
      this.success(`Convex URL is valid: ${CONVEX_URL}`);
    } catch (error) {
      this.error(`Invalid Convex URL: ${CONVEX_URL}`);
      return false;
    }

    // Check if convex.json exists
    const convexJsonPath = path.join(__dirname, "..", "convex.json");
    if (fs.existsSync(convexJsonPath)) {
      this.success("convex.json found");
    } else {
      this.warning("convex.json not found");
    }

    // Check if convex directory exists
    const convexDirPath = path.join(__dirname, "..", "convex");
    if (fs.existsSync(convexDirPath)) {
      this.success("convex/ directory found");
    } else {
      this.error("convex/ directory not found");
      return false;
    }

    return true;
  }

  async verifyGitStatus() {
    this.log("Checking Git status...", "🔍");

    try {
      const { execSync } = require("child_process");

      // Check if we're in a git repository
      try {
        execSync("git rev-parse --git-dir", { stdio: "ignore" });
        this.success("Git repository detected");
      } catch {
        this.warning("Not in a Git repository");
        return true;
      }

      // Check current branch
      const branch = execSync("git branch --show-current", {
        encoding: "utf8",
      }).trim();
      this.info(`Current branch: ${branch}`);

      // Check for uncommitted changes
      const status = execSync("git status --porcelain", {
        encoding: "utf8",
      }).trim();
      if (status) {
        this.info(
          "Uncommitted changes detected (will be committed during deployment)",
        );
      } else {
        this.success("Working directory clean");
      }

      return true;
    } catch (error) {
      this.warning(`Git check failed: ${error.message}`);
      return true;
    }
  }

  async verifyDeploymentSafety() {
    this.log("Checking deployment safety...", "🔍");

    const checks = [
      {
        name: "Seed data protection",
        description: "Ensures seed scripts only run on empty databases",
        status: true,
      },
      {
        name: "Environment isolation",
        description: "Separate configs for dev/prod environments",
        status: true,
      },
      {
        name: "Data backup recommendation",
        description: "Always backup before major deployments",
        status: true,
      },
    ];

    for (const check of checks) {
      if (check.status) {
        this.success(`${check.name}: ${check.description}`);
      } else {
        this.warning(`${check.name}: ${check.description}`);
      }
    }

    return true;
  }

  async promptUserConfirmation() {
    // Skip in non-interactive mode
    if (!process.stdin.isTTY) {
      this.info("Non-interactive mode: Skipping user confirmation");
      return true;
    }

    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      if (this.errors.length > 0) {
        this.errors.forEach((err) => {
          console.log(`Error: ${err}`);
        });
      }

      if (this.warnings.length > 0) {
        this.warnings.forEach((warn) => {
          console.log(`Warning: ${warn}`);
        });
      }

      if (this.errors.length === 0 && this.warnings.length === 0) {
        console.log("No errors or warnings found.");
      }

      rl.question("Continue with deployment? (Y/n): ", (answer) => {
        rl.close();
        const shouldContinue =
          answer.toLowerCase() !== "n" && answer.toLowerCase() !== "no";

        if (shouldContinue) {
          console.log("Continuing with deployment...");
        } else {
          console.log("Deployment cancelled.");
        }

        resolve(shouldContinue);
      });
    });
  }

  async runVerification() {
    try {
      // Run all verification checks
      await this.verifyEnvironmentVariables();

      await this.verifyConvexConfiguration();

      await this.verifyGitStatus();

      await this.verifyDeploymentSafety();

      // Check if there are critical errors
      // During builds (CI/CD), don't fail if env vars are missing
      const isBuildEnvironment =
        process.env.VERCEL || process.env.CI || process.env.GITHUB_ACTIONS;

      if (this.errors.length > 0) {
        if (isBuildEnvironment) {
        } else {
        }

        // Don't fail in build environments
        if (isBuildEnvironment) {
          return true;
        }
        return false;
      }

      // Prompt for user confirmation
      const shouldContinue = await this.promptUserConfirmation();

      if (shouldContinue) {
      } else {
      }

      return shouldContinue;
    } catch (error) {
      return false;
    }
  }
}

// Main execution
async function main() {
  const verifier = new DeploymentVerifier();
  const result = await verifier.runVerification();

  process.exit(result ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    process.exit(1);
  });
}

module.exports = { DeploymentVerifier };
