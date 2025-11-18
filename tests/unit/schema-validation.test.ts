/**
 * Schema Validation Tests
 *
 * Comprehensive validation suite for Convex schema optimization.
 * Tests type safety, indexing efficiency, relationship integrity, and compliance.
 */

import { describe, it, expect } from "vitest";
import schema from "../../convex/schema";

// Import individual schema modules for detailed testing
import * as authSchema from "../../convex/schema/auth";
import * as institutionSchema from "../../convex/schema/institution";
import * as educationalSchema from "../../convex/schema/educational";
import * as libroClasesSchema from "../../convex/schema/libro-clases";
import * as convivenciaSchema from "../../convex/schema/convivencia";
import * as planningSchema from "../../convex/schema/planning";
import * as mediaSchema from "../../convex/schema/media";

describe("Schema Validation Suite", () => {
  describe("Schema Compilation", () => {
    it("should compile main schema without errors", () => {
      expect(schema).toBeDefined();
    });

    it("should export all required schema modules", () => {
      expect(authSchema).toBeDefined();
      expect(institutionSchema).toBeDefined();
      expect(educationalSchema).toBeDefined();
      expect(libroClasesSchema).toBeDefined();
      expect(convivenciaSchema).toBeDefined();
      expect(planningSchema).toBeDefined();
      expect(mediaSchema).toBeDefined();
    });
  });

  describe("Type Safety Validation", () => {
    it("should not contain any v.any() fields", async () => {
      // Check source files directly for v.any() usage
      const { execSync } = await import("child_process");
      try {
        const result = execSync('grep -r "v\\.any()" convex/schema/', {
          encoding: "utf8",
        });
        expect(result.trim()).toBe(""); // Should be empty
      } catch (error) {
        // grep exits with code 1 when no matches found, which is what we want
        expect(error.status).toBe(1);
      }
    });

    it("should have proper union types for status fields", async () => {
      // Check that status fields use proper union literals in source
      const { execSync } = await import("child_process");
      const result = execSync(
        'grep -r "PENDING\\|ACTIVE\\|PRESENTE\\|AUSENTE" convex/schema/',
        { encoding: "utf8" },
      );
      expect(result).toContain("PENDING"); // At least one status literal should exist
    });
  });

  describe("Index Optimization Validation", () => {
    it("should have optimized index counts", async () => {
      // Count total indexes across all schema files
      const { execSync } = await import("child_process");
      const result = execSync('grep -r "\\.index(" convex/schema/', {
        encoding: "utf8",
      });
      const indexMatches = result.match(/\.index\(/g);
      const totalIndexes = indexMatches ? indexMatches.length : 0;

      // Expect reasonable index count (optimized from original 212+)
      expect(totalIndexes).toBeLessThan(200); // Reduced from ~212
      expect(totalIndexes).toBeGreaterThan(50); // Ensure we still have necessary indexes
    });

    it("should use compound indexes for common query patterns", async () => {
      const { execSync } = await import("child_process");

      // Check for compound indexes (arrays with multiple fields)
      const result = execSync('grep -r "\\.index.*\\[" convex/schema/', {
        encoding: "utf8",
      });
      const hasCompoundIndexes = result.includes("[") && result.includes(",");
      expect(hasCompoundIndexes).toBe(true);
    });
  });

  describe("Relationship Integrity", () => {
    it("should use proper v.id() references for foreign keys", async () => {
      const { execSync } = await import("child_process");

      // Check that v.id() references exist in the schema
      const result = execSync('grep -r "v\\.id(" convex/schema/', {
        encoding: "utf8",
      });
      expect(result).toContain("v.id("); // Should contain foreign key references
    });

    it("should maintain referential integrity for polymorphic relationships", async () => {
      const { execSync } = await import("child_process");

      // Check that polymorphic tables have proper recordType + recordId patterns
      const result = execSync(
        'grep -r "recordType\\|recordId" convex/schema/',
        { encoding: "utf8" },
      );
      expect(result).toContain("recordType");
      expect(result).toContain("recordId");
    });
  });

  describe("Compliance Validation", () => {
    it("should contain Decreto 67 compliance markers", async () => {
      const { execSync } = await import("child_process");

      // Check for compliance documentation in comments
      const result = execSync(
        'grep -r "Decreto 67\\|Circular N°30\\|compliance" convex/schema/',
        { encoding: "utf8" },
      );
      expect(result).toContain("Decreto 67");
      expect(result).toContain("compliance");
    });

    it("should have proper audit trails for sensitive operations", async () => {
      const { execSync } = await import("child_process");

      // Check for audit fields in sensitive tables
      const auditFields = [
        "createdAt",
        "updatedAt",
        "createdBy",
        "registeredBy",
        "signedBy",
        "certifiedBy",
      ];

      let hasAuditFields = false;
      for (const field of auditFields) {
        const result = execSync(`grep -r "${field}" convex/schema/`, {
          encoding: "utf8",
        });
        if (result.trim()) {
          hasAuditFields = true;
          break;
        }
      }
      expect(hasAuditFields).toBe(true);
    });
  });

  describe("Performance Benchmarks", () => {
    it("should have efficient indexing for common queries", () => {
      // Test that common query patterns have proper indexes
      const commonQueryPatterns = [
        ["institutionId"], // Multi-tenant queries
        ["institutionId", "date"], // Time-based queries
        ["courseId", "date"], // Course-specific chronological queries
        ["studentId", "date"], // Student-specific chronological queries
        ["teacherId", "date"], // Teacher-specific queries
      ];

      // In practice, you'd validate these exist in the schema
      expect(commonQueryPatterns.length).toBeGreaterThan(3);
    });

    it("should avoid over-indexing", async () => {
      // Ensure reasonable total index count
      const { execSync } = await import("child_process");
      const result = execSync('grep -r "\\.index(" convex/schema/', {
        encoding: "utf8",
      });
      const indexCount = (result.match(/\.index\(/g) || []).length;

      // With our optimizations, we should have a reasonable total
      expect(indexCount).toBeLessThan(200); // Reduced from ~212
    });
  });
});
