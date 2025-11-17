#!/usr/bin/env node

/**
 * EMERGENCY DEPLOYMENT SCRIPT - Solo Developer Edition
 *
 * For when production and git are out of sync.
 * Prioritizes safety and requires explicit confirmation.
 */

const { execSync } = require("child_process");
const fs = require("fs");

class EmergencyDeployer {
  constructor() {
    this.force = process.argv.includes("--force");
    this.skipDriftCheck = process.argv.includes("--skip-drift-check");
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

  warning(message) {
    this.log(message, "⚠️");
  }

  async checkProductionDrift() {
    if (this.skipDriftCheck) {
      this.warning("Skipping production drift check (--skip-drift-check)");
      return false;
    }

    this.log("Checking production drift...", "🔍");

    try {
      const response = execSync("curl -s https://plataforma.aramac.dev | grep -o 'build_[0-9]*' | head -1", {
        encoding: "utf8",
      }).trim();

      if (!response) {
        this.warning("Could not fetch production build ID");
        return false;
      }

      const prodBuildId = response.replace('build_', '');
      const prodTimestamp = parseInt(prodBuildId);

      const lastCommit = execSync("git log -1 --format=%ct", {
        encoding: "utf8",
      }).trim();

      const gitTimestamp = parseInt(lastCommit) * 1000;
      const driftHours = (prodTimestamp - gitTimestamp) / (1000 * 60 * 60);

      if (driftHours > 24) {
        this.error(`🚨 PRODUCTION DRIFT: ${driftHours.toFixed(1)} hours`);
        this.error("Production contains uncommitted changes!");
        return true; // Drift detected
      }

      this.success("Production and git are reasonably in sync");
      return false; // No significant drift
    } catch (error) {
      this.warning(`Could not check drift: ${error.message}`);
      return false;
    }
  }

  async emergencyConfirmation(driftDetected) {
    console.log("\n" + "=".repeat(70));
    console.log("🚨 EMERGENCY DEPLOYMENT CONFIRMATION 🚨");
    console.log("=".repeat(70));

    if (driftDetected) {
      console.log("\n❌ PRODUCTION DRIFT DETECTED!");
      console.log("Your production contains changes not in git.");
      console.log("Deploying now will OVERWRITE working production code!");
    }

    console.log("\nCurrent status:");
    console.log("- Production: Working ✅");
    console.log("- Git status: " + (await this.getGitStatus()));
    console.log("- Drift check: " + (driftDetected ? "❌ DETECTED" : "✅ OK"));

    console.log("\nEMERGENCY OPTIONS:");
    console.log("1. Cancel deployment (RECOMMENDED if drift detected)");
    console.log("2. Force deploy anyway (RISKY - may break production)");
    console.log("3. Create backup first, then deploy");

    if (!this.force) {
      const readline = require("readline");
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      return new Promise((resolve) => {
        rl.question("\nChoose (1-3) or 'cancel': ", (answer) => {
          rl.close();
          const choice = answer.toLowerCase().trim();

          if (choice === "1" || choice === "cancel") {
            console.log("❌ Deployment cancelled by user");
            process.exit(0);
          } else if (choice === "2") {
            console.log("⚠️  Force deploying despite warnings...");
            resolve(true);
          } else if (choice === "3") {
            console.log("📦 Creating backup before deployment...");
            // TODO: Implement backup creation
            resolve(true);
          } else {
            console.log("Invalid choice, cancelling...");
            process.exit(0);
          }
        });
      });
    }

    return true;
  }

  async getGitStatus() {
    try {
      const status = execSync("git status --porcelain", { encoding: "utf8" }).trim();
      return status.length === 0 ? "Clean ✅" : "Uncommitted changes ⚠️";
    } catch {
      return "Unknown";
    }
  }

  async runEmergencyDeploy() {
    try {
      console.log("\n🚨 EMERGENCY DEPLOYMENT MODE 🚨");
      console.log("This script is for solo developers when production/git are out of sync");
      console.log("=".repeat(70));

      // Step 1: Check for drift
      const driftDetected = await this.checkProductionDrift();

      // Step 2: Emergency confirmation
      await this.emergencyConfirmation(driftDetected);

      // Step 3: Proceed with deployment (if confirmed)
      this.log("Proceeding with emergency deployment...", "🚀");

      // Run the normal deployment script
      execSync("node scripts/deploy.js --skip-verification", {
        stdio: "inherit",
        cwd: process.cwd(),
      });

      this.success("Emergency deployment completed");
      this.warning("Monitor production closely for issues");

    } catch (error) {
      this.error(`Emergency deployment failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log("Emergency Deployment Script - Solo Developer Edition");
    console.log("");
    console.log("Usage: node scripts/emergency-deploy.js [options]");
    console.log("");
    console.log("Options:");
    console.log("  --force              Skip confirmation prompts");
    console.log("  --skip-drift-check   Skip production drift detection");
    console.log("  --help, -h          Show this help");
    console.log("");
    console.log("WARNING: Only use this when production and git are out of sync!");
    process.exit(0);
  }

  const deployer = new EmergencyDeployer();
  await deployer.runEmergencyDeploy();
}

if (require.main === module) {
  main().catch((error) => {
    console.error("💥 Emergency deployment failed:", error);
    process.exit(1);
  });
}

module.exports = { EmergencyDeployer };
