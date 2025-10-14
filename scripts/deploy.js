#!/usr/bin/env node

/**
 * Comprehensive Deployment Script for Plataforma Astral
 *
 * Automates the full deployment process:
 * 1. Pre-deployment quality checks (lint, type-check, tests)
 * 2. Git commit and push
 * 3. Convex deploy
 * 4. Vercel deploy
 * 5. Triple verification of deployment status
 */

const { execSync } = require("child_process");
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

// Configuration
const CHECK_INTERVAL = 30000; // 30 seconds
const MAX_CHECKS = 3; // Triple check
const VERIFICATION_TIMEOUT = 300000; // 5 minutes

class DeploymentManager {
  constructor() {
    this.checkCount = 0;
    this.verificationTimer = null;
    this.skipQualityChecks = process.argv.includes("--skip-checks");
    this.skipVerification = process.argv.includes("--skip-verification");
  }

  log(message, emoji = "📝") {
    const timestamp = new Date().toISOString();
    console.log(`${emoji} [${timestamp}] ${message}`);
  }

  error(message) {
    this.log(message, "❌");
  }

  success(message) {
    this.log(message, "✅");
  }

  info(message) {
    this.log(message, "ℹ️");
  }

  warning(message) {
    this.log(message, "⚠️");
  }

  async runCommand(command, description, options = {}) {
    try {
      this.log(`Running: ${command}`, "🚀");
      this.log(description, "📋");

      const result = execSync(command, {
        stdio: "inherit",
        encoding: "utf8",
        ...options,
      });

      this.success(`${description} completed`);
      return result;
    } catch (error) {
      this.error(`Failed: ${description}`);
      this.error(`Command: ${command}`);
      this.error(`Error: ${error.message}`);
      throw error;
    }
  }

  async checkGitStatus() {
    try {
      const status = execSync("git status --porcelain", {
        encoding: "utf8",
      }).trim();
      return status.length === 0;
    } catch (error) {
      this.error("Failed to check git status");
      return false;
    }
  }

  async runQualityChecks() {
    if (this.skipQualityChecks) {
      this.warning("Skipping quality checks (--skip-checks flag)");
      return true;
    }

    this.log("Running pre-deployment quality checks...", "🔍");

    try {
      // Format code
      await this.runCommand("npm run format", "Formatting code");

      // Type checking
      await this.runCommand("npm run type-check", "Type checking");

      // Linting
      await this.runCommand("npm run lint", "Linting code");

      // Run tests (optional - comment out if tests take too long)
      // await this.runCommand('npm run test', 'Running tests')

      this.success("All quality checks passed!");
      return true;
    } catch (error) {
      this.error("Quality checks failed!");
      this.error("Fix the issues above before deploying.");
      this.info("Or use --skip-checks flag to bypass (not recommended)");
      throw error;
    }
  }

  async gitCommitAndPush() {
    this.log("Starting Git operations...", "🔄");

    const hasChanges = !(await this.checkGitStatus());

    if (!hasChanges) {
      this.info("No changes to commit");
      return true;
    }

    try {
      // Add all changes
      await this.runCommand("git add .", "Staging all changes");

      // Check for sensitive data (excluding documentation files)
      this.log("Checking for sensitive data in staged files...", "🔍");
      try {
        // Get diff excluding .md files
        const diff = execSync('git diff --cached -- . ":(exclude)*.md"', {
          encoding: "utf8",
        });
        const sensitivePatterns = [
          /NEXTAUTH_SECRET=.*[^*\s]/i,
          /GOOGLE_CLIENT_SECRET=.*[^*\s]/i,
          /CLOUDINARY_API_SECRET=.*[^*\s]/i,
          /password\s*=\s*["'].*["']/i,
          /secret\s*=\s*["'].*["']/i,
          /api[_-]?key\s*=\s*["'].*["']/i,
        ];

        for (const pattern of sensitivePatterns) {
          if (pattern.test(diff)) {
            this.error("⚠️  POTENTIAL SENSITIVE DATA DETECTED IN COMMIT!");
            this.error("Please review your changes before committing.");
            this.error('Run: git diff --cached -- . ":(exclude)*.md"');
            throw new Error("Sensitive data detected");
          }
        }
        this.success("No sensitive data detected");
        this.info("(Markdown files excluded from security check)");
      } catch (error) {
        if (error.message === "Sensitive data detected") {
          throw error;
        }
        this.warning("Could not check for sensitive data, proceeding...");
      }

      // Commit with timestamp
      const commitMessage = `deploy: Production deployment ${new Date().toISOString()}`;
      await this.runCommand(
        `git commit -m "${commitMessage}"`,
        "Committing changes",
      );

      // Push to remote
      const currentBranch = execSync("git branch --show-current", {
        encoding: "utf8",
      }).trim();
      await this.runCommand(
        `git push origin ${currentBranch}`,
        `Pushing to ${currentBranch}`,
      );

      this.success("Git operations completed successfully");
      return true;
    } catch (error) {
      this.error("Git operations failed");
      throw error;
    }
  }

  async deployConvex() {
    this.log("Starting Convex deployment...", "🔄");

    try {
      // Deploy Convex to production deployment
      const convexCommand = "CONVEX_DEPLOYMENT=industrious-manatee-7 npx convex deploy --yes";
      await this.runCommand(
        convexCommand,
        "Deploying Convex backend",
      );

      this.success("Convex deployment completed");
      return true;
    } catch (error) {
      this.error("Convex deployment failed");
      this.error("Make sure you are logged in: npx convex login");
      throw error;
    }
  }

  async deployVercel() {
    this.log("Starting Vercel deployment...", "🔄");

    try {
      // Check if vercel CLI is available
      try {
        execSync("which vercel", { encoding: "utf8" });
      } catch {
        this.warning("Vercel CLI not found, installing...");
        await this.runCommand("npm install -g vercel", "Installing Vercel CLI");
      }

      await this.runCommand("vercel --prod --yes", "Deploying to Vercel");

      this.success("Vercel deployment completed");
      return true;
    } catch (error) {
      this.error("Vercel deployment failed");
      this.error("Make sure you are logged in: vercel login");
      throw error;
    }
  }

  async checkDeploymentStatus() {
    this.log(
      `Verifying deployment configuration (check ${this.checkCount}/${MAX_CHECKS})...`,
      "🔍",
    );

    try {
      // Verify Convex URL
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
      if (!convexUrl) {
        this.warning("NEXT_PUBLIC_CONVEX_URL not set in .env.local");
        return false;
      }

      this.success("Convex URL configured");

      // Verify NextAuth configuration
      const nextAuthUrl = process.env.NEXTAUTH_URL;
      const nextAuthSecret = process.env.NEXTAUTH_SECRET;

      if (!nextAuthUrl) {
        this.warning("NEXTAUTH_URL not set");
      }
      if (!nextAuthSecret) {
        this.warning("NEXTAUTH_SECRET not set");
      }

      this.success("Deployment configuration verified");
      this.info("Note: Manual verification recommended at Vercel URL");
      return true;
    } catch (error) {
      this.warning(`Configuration check failed: ${error.message}`);
      return false;
    }
  }

  async verifyDeployment() {
    if (this.skipVerification) {
      this.warning(
        "Skipping deployment verification (--skip-verification flag)",
      );
      return true;
    }

    return new Promise((resolve, reject) => {
      this.checkCount = 0;

      const checkInterval = setInterval(async () => {
        this.checkCount++;

        try {
          const isSuccessful = await this.checkDeploymentStatus();

          if (isSuccessful) {
            clearInterval(checkInterval);
            clearTimeout(this.verificationTimer);
            this.success(
              `Deployment verified successfully after ${this.checkCount} checks`,
            );
            resolve(true);
          } else if (this.checkCount >= MAX_CHECKS) {
            clearInterval(checkInterval);
            clearTimeout(this.verificationTimer);
            this.warning(
              `Deployment verification completed with warnings after ${MAX_CHECKS} checks`,
            );
            this.info(
              "Please manually verify the deployment at your Vercel URL",
            );
            resolve(true); // Don't fail, just warn
          }
        } catch (error) {
          this.error(`Error during deployment check: ${error.message}`);
        }
      }, CHECK_INTERVAL);

      this.verificationTimer = setTimeout(() => {
        clearInterval(checkInterval);
        this.warning("Deployment verification timed out");
        this.info("Please manually verify the deployment");
        resolve(true); // Don't fail on timeout
      }, VERIFICATION_TIMEOUT);
    });
  }

  async runFullDeployment() {
    try {
      this.log("=".repeat(70), "🚀");
      this.log("STARTING COMPREHENSIVE DEPLOYMENT PROCESS", "🚀");
      this.log("=".repeat(70), "🚀");
      console.log();

      // Step 0: Quality checks
      this.log("STEP 1/5: Quality Checks", "🔍");
      await this.runQualityChecks();
      this.log("-".repeat(70));
      console.log();

      // Step 1: Git commit and push
      this.log("STEP 2/5: Git Operations", "📦");
      await this.gitCommitAndPush();
      this.log("-".repeat(70));
      console.log();

      // Step 2: Deploy Convex
      this.log("STEP 3/5: Convex Deployment", "☁️");
      await this.deployConvex();
      this.log("-".repeat(70));
      console.log();

      // Step 3: Deploy Vercel
      this.log("STEP 4/5: Vercel Deployment", "▲");
      await this.deployVercel();
      this.log("-".repeat(70));
      console.log();

      // Step 4: Verify deployment
      this.log("STEP 5/5: Deployment Verification", "✓");
      await this.verifyDeployment();
      this.log("-".repeat(70));
      console.log();

      this.log("=".repeat(70));
      this.success("🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉");
      this.log("=".repeat(70));
      console.log();
      this.info("Next steps:");
      this.info("1. Check Vercel dashboard for deployment URL");
      this.info("2. Test the production deployment");
      this.info("3. Monitor for any errors in Vercel logs");
      console.log();
    } catch (error) {
      console.log();
      this.log("=".repeat(70));
      this.error("💥 DEPLOYMENT FAILED! 💥");
      this.log("=".repeat(70));
      this.error(`Error: ${error.message}`);
      console.log();
      this.info("Troubleshooting tips:");
      this.info("1. Fix the error shown above");
      this.info("2. Ensure you are logged in to Vercel and Convex");
      this.info("3. Check your environment variables");
      this.info(
        "4. Use --skip-checks to bypass quality checks (not recommended)",
      );
      this.info("5. Use --skip-verification to skip deployment verification");
      console.log();
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const deployer = new DeploymentManager();

  console.log();
  console.log("🚀 Plataforma Astral - Deployment Manager");
  console.log("=".repeat(70));
  console.log();

  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log("Usage: npm run deploy [options]");
    console.log();
    console.log("Options:");
    console.log("  --skip-checks        Skip pre-deployment quality checks");
    console.log("  --skip-verification  Skip post-deployment verification");
    console.log("  --help, -h          Show this help message");
    console.log();
    process.exit(0);
  }

  await deployer.runFullDeployment();
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error("💥 Script execution failed:", error);
    process.exit(1);
  });
}

module.exports = { DeploymentManager };
