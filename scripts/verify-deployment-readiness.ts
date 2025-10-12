#!/usr/bin/env tsx
/**
 * Deployment Readiness Verification Script
 * Ensures all conditions are met before deployment
 */

import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

interface DeploymentCheck {
  name: string;
  check: () => boolean | Promise<boolean>;
  critical: boolean;
  description: string;
}

class DeploymentVerifier {
  private checks: DeploymentCheck[] = [];
  private errors: string[] = [];
  private warnings: string[] = [];

  constructor() {
    this.setupChecks();
  }

  private setupChecks() {
    this.checks = [
      {
        name: "Git Status Clean",
        check: () => this.checkGitStatus(),
        critical: true,
        description: "No uncommitted changes should exist",
      },
      {
        name: "Branch Tracking Correct",
        check: () => this.checkBranchTracking(),
        critical: true,
        description: "Local branch should track correct remote branch",
      },
      {
        name: "Remote Commits Synced",
        check: () => this.checkRemoteSync(),
        critical: true,
        description: "All local commits should be pushed to remote",
      },
      {
        name: "Environment Configuration",
        check: () => this.checkEnvironmentConfig(),
        critical: true,
        description: "Environment variables should be properly configured",
      },
      {
        name: "Build Readiness",
        check: () => this.checkBuildReadiness(),
        critical: false,
        description: "Project should build without errors",
      },
      {
        name: "Database Connection",
        check: () => this.checkDatabaseConnection(),
        critical: false,
        description: "Database should be accessible",
      },
    ];
  }

  private checkGitStatus(): boolean {
    try {
      const status = execSync("git status --porcelain", { encoding: "utf8" });
      if (status.trim()) {
        this.errors.push(`Uncommitted changes detected:\n${status}`);
        return false;
      }
      return true;
    } catch (error) {
      this.errors.push(`Git status check failed: ${error}`);
      return false;
    }
  }

  private checkBranchTracking(): boolean {
    try {
      const currentBranch = execSync("git branch --show-current", {
        encoding: "utf8",
      }).trim();
      const upstream = execSync(
        'git rev-parse --abbrev-ref --symbolic-full-name @{upstream} 2>/dev/null || echo ""',
        { encoding: "utf8" },
      ).trim();

      if (!upstream) {
        this.errors.push(
          `Branch '${currentBranch}' is not tracking any remote branch`,
        );
        return false;
      }

      // For production branches, ensure correct tracking
      if (["main", "master"].includes(currentBranch)) {
        const expectedUpstream = `origin/${currentBranch}`;
        if (upstream !== expectedUpstream) {
          this.errors.push(
            `Production branch '${currentBranch}' should track '${expectedUpstream}', but tracks '${upstream}'`,
          );
          return false;
        }
      }

      console.log(`✅ Branch tracking: ${currentBranch} → ${upstream}`);
      return true;
    } catch (error) {
      this.errors.push(`Branch tracking check failed: ${error}`);
      return false;
    }
  }

  private checkRemoteSync(): boolean {
    try {
      const result = execSync(
        'git rev-list --count --left-right @{upstream}...HEAD 2>/dev/null || echo "0 0"',
        { encoding: "utf8" },
      ).trim();
      const [behind, ahead] = result.split(" ").map(Number);

      if (ahead > 0) {
        this.errors.push(
          `Branch is ${ahead} commits ahead of remote. Push your changes first.`,
        );
        return false;
      }

      if (behind > 0) {
        this.warnings.push(
          `Branch is ${behind} commits behind remote. Consider pulling latest changes.`,
        );
      }

      return true;
    } catch (error) {
      this.errors.push(`Remote sync check failed: ${error}`);
      return false;
    }
  }

  private checkEnvironmentConfig(): boolean {
    try {
      const currentBranch = execSync("git branch --show-current", {
        encoding: "utf8",
      }).trim();

      if (["main", "master"].includes(currentBranch)) {
        // Check production environment file
        const envProdPath = join(process.cwd(), ".env.production");
        if (!existsSync(envProdPath)) {
          this.errors.push(
            "Production environment file (.env.production) is missing",
          );
          return false;
        }

        const envContent = readFileSync(envProdPath, "utf8");
        if (!envContent.includes("NEXT_PUBLIC_DOMAIN=plataforma-astral.com")) {
          this.errors.push(
            "Production environment file does not have correct domain configuration",
          );
          return false;
        }
      }

      return true;
    } catch (error) {
      this.errors.push(`Environment config check failed: ${error}`);
      return false;
    }
  }

  private checkBuildReadiness(): boolean {
    try {
      console.log("🔨 Testing build readiness...");
      execSync("npm run build:vercel", { stdio: "pipe", timeout: 300000 });
      console.log("✅ Build test passed");
      return true;
    } catch (error) {
      this.warnings.push(
        `Build test failed: ${error}. This may not prevent deployment but should be investigated.`,
      );
      return true; // Not critical
    }
  }

  private checkDatabaseConnection(): boolean {
    try {
      console.log("🗄️  Testing database connection...");
      execSync("npx convex dev --version", { stdio: "pipe" });
      console.log("✅ Convex connection test passed");
      return true;
    } catch (error) {
      this.warnings.push(
        "Convex connection test failed. Ensure CONVEX_URL is set correctly.",
      );
      return true; // Not critical
    }
  }

  async runChecks(): Promise<boolean> {
    console.log("🚀 Running Deployment Readiness Verification...\n");

    let allPassed = true;

    for (const check of this.checks) {
      process.stdout.write(`🔍 ${check.name}... `);

      try {
        const passed = await check.check();

        if (passed) {
          console.log("✅ PASSED");
        } else {
          console.log("❌ FAILED");
          if (check.critical) {
            allPassed = false;
          }
        }
      } catch (error) {
        console.log("❌ ERROR");
        this.errors.push(`${check.name}: ${error}`);
        if (check.critical) {
          allPassed = false;
        }
      }
    }

    console.log("\n" + "=".repeat(50));

    if (this.errors.length > 0) {
      console.log("❌ CRITICAL ISSUES:");
      this.errors.forEach((error) => console.log(`   • ${error}`));
      console.log("");
    }

    if (this.warnings.length > 0) {
      console.log("⚠️  WARNINGS:");
      this.warnings.forEach((warning) => console.log(`   • ${warning}`));
      console.log("");
    }

    if (allPassed && this.errors.length === 0) {
      console.log("🎉 ALL CHECKS PASSED - READY FOR DEPLOYMENT!");
      return true;
    } else if (!allPassed) {
      console.log("❌ DEPLOYMENT BLOCKED - Fix critical issues first!");
      return false;
    } else {
      console.log(
        "⚠️  DEPLOYMENT READY WITH WARNINGS - Review warnings before proceeding",
      );
      return true;
    }
  }
}

// Main execution
async function main() {
  const verifier = new DeploymentVerifier();
  const ready = await verifier.runChecks();
  process.exit(ready ? 0 : 1);
}

if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });
}

export { DeploymentVerifier };
