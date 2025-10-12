#!/usr/bin/env tsx
/**
 * Branch Tracking Fixer
 * Automatically ensures all branches are properly tracking their remote counterparts
 */

import { execSync } from "child_process";

interface BranchInfo {
  name: string;
  remote: string;
  isTracking: boolean;
  upstream?: string;
}

class BranchTracker {
  private branches: BranchInfo[] = [];

  constructor() {
    this.loadBranches();
  }

  private loadBranches() {
    try {
      // Get all local branches
      const localBranches = execSync('git branch --format="%(refname:short)"', {
        encoding: "utf8",
      })
        .trim()
        .split("\n")
        .filter((branch) => branch && !branch.startsWith("remotes/"));

      // Get remote branches
      const remoteBranches = execSync(
        'git branch -r --format="%(refname:short)"',
        { encoding: "utf8" },
      )
        .trim()
        .split("\n")
        .filter((branch) => branch)
        .map((branch) => branch.replace("origin/", ""));

      // Check tracking for each local branch
      for (const branch of localBranches) {
        const upstream = this.getUpstream(branch);
        const isTracking = !!upstream;

        this.branches.push({
          name: branch,
          remote: "origin",
          isTracking,
          upstream,
        });
      }

      console.log(`📋 Found ${this.branches.length} local branches`);
    } catch (error) {
      console.error("❌ Failed to load branches:", error);
      process.exit(1);
    }
  }

  private getUpstream(branch: string): string | undefined {
    try {
      const upstream = execSync(
        `git rev-parse --abbrev-ref --symbolic-full-name "${branch}@{upstream}" 2>/dev/null || echo ""`,
        { encoding: "utf8" },
      ).trim();
      return upstream || undefined;
    } catch {
      return undefined;
    }
  }

  private getExpectedUpstream(branch: string): string {
    // Production branches should track themselves
    if (["main", "master"].includes(branch)) {
      return `origin/${branch}`;
    }

    // Development branches
    if (
      branch.startsWith("dev") ||
      branch.startsWith("feature") ||
      branch.startsWith("bugfix")
    ) {
      return "origin/dev";
    }

    // Default to same name on origin
    return `origin/${branch}`;
  }

  private setUpstreamTracking(branch: string, upstream: string): boolean {
    try {
      execSync(`git branch --set-upstream-to="${upstream}" "${branch}"`, {
        stdio: "pipe",
      });
      console.log(`✅ Set ${branch} → ${upstream}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to set upstream for ${branch}:`, error);
      return false;
    }
  }

  private checkRemoteBranchExists(remoteBranch: string): boolean {
    try {
      execSync(
        `git ls-remote --heads origin "${remoteBranch.replace("origin/", "")}"`,
        { stdio: "pipe" },
      );
      return true;
    } catch {
      return false;
    }
  }

  public analyzeTracking(): {
    correct: BranchInfo[];
    incorrect: BranchInfo[];
    missing: BranchInfo[];
  } {
    const correct: BranchInfo[] = [];
    const incorrect: BranchInfo[] = [];
    const missing: BranchInfo[] = [];

    for (const branch of this.branches) {
      const expectedUpstream = this.getExpectedUpstream(branch.name);

      if (!branch.isTracking) {
        // No tracking set up
        if (this.checkRemoteBranchExists(expectedUpstream)) {
          incorrect.push(branch);
        } else {
          missing.push(branch);
        }
      } else if (branch.upstream !== expectedUpstream) {
        // Wrong upstream
        incorrect.push(branch);
      } else {
        // Correct tracking
        correct.push(branch);
      }
    }

    return { correct, incorrect, missing };
  }

  public fixTracking(): boolean {
    const { correct, incorrect, missing } = this.analyzeTracking();

    console.log("\n🔧 BRANCH TRACKING ANALYSIS");
    console.log("=".repeat(50));

    console.log(`✅ Correctly tracking: ${correct.length} branches`);
    correct.forEach((branch) => {
      console.log(`   ${branch.name} → ${branch.upstream}`);
    });

    if (missing.length > 0) {
      console.log(`\n⚠️  Missing remote branches: ${missing.length} branches`);
      missing.forEach((branch) => {
        const expected = this.getExpectedUpstream(branch.name);
        console.log(`   ${branch.name} (expected: ${expected})`);
      });
    }

    if (incorrect.length > 0) {
      console.log(
        `\n🔧 Fixing incorrect tracking: ${incorrect.length} branches`,
      );
      let fixed = 0;

      for (const branch of incorrect) {
        const expectedUpstream = this.getExpectedUpstream(branch.name);

        if (this.checkRemoteBranchExists(expectedUpstream)) {
          if (this.setUpstreamTracking(branch.name, expectedUpstream)) {
            fixed++;
          }
        } else {
          console.log(
            `   ⚠️  Remote branch ${expectedUpstream} doesn't exist for ${branch.name}`,
          );
        }
      }

      console.log(`✅ Fixed ${fixed} branches`);
      return fixed === incorrect.length;
    }

    console.log("\n🎉 All branches are correctly tracked!");
    return true;
  }

  public showStatus(): void {
    const { correct, incorrect, missing } = this.analyzeTracking();

    console.log("\n📊 BRANCH TRACKING STATUS");
    console.log("=".repeat(50));

    if (correct.length > 0) {
      console.log("✅ CORRECTLY TRACKING:");
      correct.forEach((branch) => {
        console.log(`   ${branch.name} → ${branch.upstream}`);
      });
    }

    if (incorrect.length > 0) {
      console.log("\n❌ INCORRECT TRACKING:");
      incorrect.forEach((branch) => {
        const expected = this.getExpectedUpstream(branch.name);
        console.log(
          `   ${branch.name} → ${branch.upstream || "none"} (expected: ${expected})`,
        );
      });
    }

    if (missing.length > 0) {
      console.log("\n⚠️  MISSING REMOTE BRANCHES:");
      missing.forEach((branch) => {
        const expected = this.getExpectedUpstream(branch.name);
        console.log(`   ${branch.name} (expected: ${expected})`);
      });
    }

    const totalIssues = incorrect.length + missing.length;
    if (totalIssues > 0) {
      console.log(
        `\n🔧 Run 'npm run git:fix-tracking' to fix ${totalIssues} issues`,
      );
    }
  }
}

// Main execution
async function main() {
  const action = process.argv[2] || "status";

  const tracker = new BranchTracker();

  switch (action) {
    case "fix":
      const success = tracker.fixTracking();
      process.exit(success ? 0 : 1);
      break;

    case "status":
    default:
      tracker.showStatus();
      break;
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Branch tracking check failed:", error);
    process.exit(1);
  });
}

export { BranchTracker };
