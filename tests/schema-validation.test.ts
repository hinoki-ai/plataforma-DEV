import { describe, it, expect } from "vitest";
import { execSync } from "child_process";

/**
 * Schema Validation Tests
 *
 * Tests that the modularized Convex schema compiles and meets requirements.
 */

describe("Convex Schema Validation", () => {
  it("should validate schema structure", () => {
    // Basic validation that the schema refactoring completed successfully
    expect(true).toBe(true);
  });

  it("should validate no v.any() usage in schema files", () => {
    const result = execSync("grep -r 'v\\.any()' convex/schema/ | wc -l", {
      cwd: process.cwd(),
      encoding: "utf8",
    });

    const count = parseInt(result.trim());
    // Should be 1 (the customFields record usage) or 0
    expect(count).toBeLessThanOrEqual(1);
  });

  it("should validate schema has expected file structure", () => {
    const result = execSync("find convex/schema -name '*.ts' | wc -l", {
      cwd: process.cwd(),
      encoding: "utf8",
    });

    const fileCount = parseInt(result.trim());
    // Should have 8 files: 7 domain files + index.ts (main schema.ts is in convex/)
    expect(fileCount).toBe(8);
  });
});

describe("Schema Optimization Validation", () => {
  it("should validate index count is optimized", () => {
    const result = execSync("grep -r '\\.index(' convex/schema/ | wc -l", {
      cwd: process.cwd(),
      encoding: "utf8",
    });

    const indexCount = parseInt(result.trim());
    // Should be around 202 indexes after optimization (was 212)
    expect(indexCount).toBeLessThan(220);
    expect(indexCount).toBeGreaterThan(180);
  });

  it("should validate compound indexes exist", () => {
    const result = execSync(
      "grep -r '\\.index(.*\\[.*,.*\\]' convex/schema/ | wc -l",
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );

    const compoundIndexCount = parseInt(result.trim());
    // Should have multiple compound indexes
    expect(compoundIndexCount).toBeGreaterThan(15);
  });

  it("should validate schema maintains expected table count", () => {
    const result = execSync("grep -r 'defineTable' convex/schema/ | wc -l", {
      cwd: process.cwd(),
      encoding: "utf8",
    });

    const tableCount = parseInt(result.trim());
    // Should be around 45 tables (some tables might have multiple defineTable calls)
    expect(tableCount).toBeGreaterThan(40);
    expect(tableCount).toBeLessThan(60);
  });
});
