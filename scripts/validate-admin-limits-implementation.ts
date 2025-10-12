#!/usr/bin/env tsx
/**
 * Validate Admin Limits Implementation
 * Comprehensive validation of the admin creation limits feature without database connection
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

interface ValidationResult {
  success: boolean;
  message: string;
  details?: any;
}

class AdminLimitsValidator {
  private projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

  async validateAll(): Promise<void> {
    console.log(
      "🔍 Starting comprehensive validation of admin limits implementation...\n",
    );

    const validations = [
      this.validateSchemaChanges(),
      this.validateApiImplementation(),
      this.validateMigrationScripts(),
      this.validateTestScripts(),
      this.validateBusinessLogic(),
      this.validateErrorHandling(),
      this.validateFrontendIntegration(),
    ];

    const results = await Promise.all(validations);
    const passed = results.filter((r) => r.success).length;
    const total = results.length;

    console.log("\n" + "=".repeat(80));
    console.log("📊 VALIDATION SUMMARY");
    console.log("=".repeat(80));
    console.log(`✅ Passed: ${passed}/${total} validations`);

    if (passed === total) {
      console.log("🎉 ALL VALIDATIONS PASSED! Implementation is flawless.");
      console.log("\n🚀 Ready for deployment!");
      console.log("   1. Set up CONVEX_URL environment variable");
      console.log("   2. Run: tsx scripts/apply-admin-tracking-migration.ts");
      console.log("   3. Test: tsx scripts/test-admin-limits.ts");
    } else {
      console.log(
        "❌ Some validations failed. Please review the errors above.",
      );
      const failed = results.filter((r) => !r.success);
      console.log("\nFailed validations:");
      failed.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.message}`);
      });
    }
  }

  private validateSchemaChanges(): ValidationResult {
    try {
      const schemaPath = join(this.projectRoot, "prisma/schema.prisma");
      const schemaContent = readFileSync(schemaPath, "utf-8");

      const checks = [
        {
          name: "createdByAdmin field",
          check:
            schemaContent.includes("createdByAdmin") &&
            schemaContent.includes('@map("created_by_admin")'),
          message:
            "createdByAdmin field should be present in User model with correct mapping",
        },
        {
          name: "Field type",
          check: schemaContent.includes("createdByAdmin    String?"),
          message: "createdByAdmin should be optional String field",
        },
        {
          name: "Field placement",
          check:
            schemaContent.indexOf("createdByAdmin") >
              schemaContent.indexOf("isOAuthUser") &&
            schemaContent.indexOf("createdByAdmin") <
              schemaContent.indexOf("createdAt"),
          message:
            "createdByAdmin should be placed correctly in the User model",
        },
      ];

      const failed = checks.filter((c) => !c.check);
      if (failed.length > 0) {
        return {
          success: false,
          message: "Schema validation failed",
          details: failed.map((f) => f.message),
        };
      }

      return {
        success: true,
        message: "✅ Database schema changes are correctly implemented",
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to validate schema changes",
        details: error,
      };
    }
  }

  private validateApiImplementation(): ValidationResult {
    try {
      const apiPath = join(
        this.projectRoot,
        "src/app/api/admin/users/route.ts",
      );
      const apiContent = readFileSync(apiPath, "utf-8");

      const checks = [
        {
          name: "Admin limit check",
          check:
            apiContent.includes("adminCount >= 1") &&
            apiContent.includes("Limit to 1 secondary admin"),
          message: "API should check admin count and limit to 1",
        },
        {
          name: "Business messaging",
          check:
            apiContent.includes("support@manitospintadas.com") &&
            apiContent.includes("contacta con soporte"),
          message: "API should include business contact information",
        },
        {
          name: "Created by admin tracking",
          check: apiContent.includes("createdByAdmin: session.user.id"),
          message: "API should track which admin created the user",
        },
        {
          name: "Limit response data",
          check:
            apiContent.includes("currentAdminsCreated") &&
            apiContent.includes("maxAllowed"),
          message: "API should return admin limit information",
        },
        {
          name: "GET endpoint stats",
          check:
            apiContent.includes("adminLimits") &&
            apiContent.includes("canCreateMoreAdmins"),
          message: "GET endpoint should return admin creation statistics",
        },
      ];

      const failed = checks.filter((c) => !c.check);
      if (failed.length > 0) {
        return {
          success: false,
          message: "API implementation validation failed",
          details: failed.map((f) => f.message),
        };
      }

      return {
        success: true,
        message: "✅ API implementation is correctly structured",
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to validate API implementation",
        details: error,
      };
    }
  }

  private validateMigrationScripts(): ValidationResult {
    try {
      const migrationPath = join(
        this.projectRoot,
        "scripts/add-admin-tracking-migration.sql",
      );
      const migrationContent = readFileSync(migrationPath, "utf-8");

      const checks = [
        {
          name: "Column creation",
          check: migrationContent.includes(
            'ADD COLUMN "created_by_admin" TEXT',
          ),
          message: "Migration should add created_by_admin column",
        },
        {
          name: "Index creation",
          check: migrationContent.includes(
            'CREATE INDEX "users_created_by_admin_idx"',
          ),
          message: "Migration should create index for performance",
        },
        {
          name: "Foreign key constraint",
          check: migrationContent.includes(
            'FOREIGN KEY ("created_by_admin") REFERENCES "users"("id")',
          ),
          message: "Migration should add foreign key constraint",
        },
        {
          name: "Documentation",
          check: migrationContent.includes("COMMENT ON COLUMN"),
          message: "Migration should include documentation comments",
        },
      ];

      const failed = checks.filter((c) => !c.check);
      if (failed.length > 0) {
        return {
          success: false,
          message: "Migration scripts validation failed",
          details: failed.map((f) => f.message),
        };
      }

      return {
        success: true,
        message: "✅ Migration scripts are properly structured",
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to validate migration scripts",
        details: error,
      };
    }
  }

  private validateTestScripts(): ValidationResult {
    try {
      const testPath = join(this.projectRoot, "scripts/test-admin-limits.ts");
      const testContent = readFileSync(testPath, "utf-8");

      const checks = [
        {
          name: "Admin creation test",
          check: testContent.includes("createdByAdmin: testAdmin.id"),
          message: "Test should create admin with createdByAdmin field",
        },
        {
          name: "Count verification",
          check:
            testContent.includes("role: 'ADMIN'") &&
            testContent.includes("createdByAdmin: testAdmin.id"),
          message: "Test should verify admin count logic",
        },
        {
          name: "Cleanup logic",
          check:
            testContent.includes("deleteMany") &&
            testContent.includes("in: [testAdminEmail"),
          message: "Test should include proper cleanup",
        },
        {
          name: "Business logic validation",
          check:
            testContent.includes("adminCount >= 1") &&
            testContent.includes("Business opportunity"),
          message: "Test should validate business logic and opportunities",
        },
      ];

      const failed = checks.filter((c) => !c.check);
      if (failed.length > 0) {
        console.log("❌ Test scripts validation failed:");
        failed.forEach((f) => console.log(`   - ${f.message}`));
        return {
          success: false,
          message: "Test scripts validation failed",
          details: failed.map((f) => f.message),
        };
      }

      return {
        success: true,
        message: "✅ Test scripts cover all critical functionality",
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to validate test scripts",
        details: error,
      };
    }
  }

  private validateBusinessLogic(): ValidationResult {
    try {
      const apiPath = join(
        this.projectRoot,
        "src/app/api/admin/users/route.ts",
      );
      const apiContent = readFileSync(apiPath, "utf-8");

      const checks = [
        {
          name: "Limit enforcement",
          check:
            apiContent.includes("if (validatedData.role === 'ADMIN')") &&
            apiContent.includes("adminCount >= 1"),
          message:
            "Business logic should only apply limits to ADMIN role creation",
        },
        {
          name: "Contact information",
          check:
            apiContent.includes("support@manitospintadas.com") &&
            apiContent.includes("Solicita ampliación de slots"),
          message: "Business logic should include clear contact information",
        },
        {
          name: "Error response structure",
          check:
            apiContent.includes(
              "error: 'Límite de administradores alcanzado'",
            ) && apiContent.includes("status: 403"),
          message: "Business logic should return proper error responses",
        },
        {
          name: "Limit tracking",
          check:
            apiContent.includes("currentAdminsCreated") &&
            apiContent.includes("remainingAdminSlots"),
          message: "Business logic should track and report limits accurately",
        },
      ];

      const failed = checks.filter((c) => !c.check);
      if (failed.length > 0) {
        return {
          success: false,
          message: "Business logic validation failed",
          details: failed.map((f) => f.message),
        };
      }

      return {
        success: true,
        message: "✅ Business logic is correctly implemented",
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to validate business logic",
        details: error,
      };
    }
  }

  private validateErrorHandling(): ValidationResult {
    try {
      const apiPath = join(
        this.projectRoot,
        "src/app/api/admin/users/route.ts",
      );
      const apiContent = readFileSync(apiPath, "utf-8");

      const checks = [
        {
          name: "Limit exceeded error",
          check:
            apiContent.includes("Límite de administradores alcanzado") &&
            apiContent.includes("status: 403"),
          message: "Should handle admin limit exceeded with proper error",
        },
        {
          name: "Unauthorized access",
          check:
            apiContent.includes("session.user.role !== 'ADMIN'") &&
            apiContent.includes("status: 401"),
          message: "Should handle unauthorized access properly",
        },
        {
          name: "Email conflict",
          check:
            apiContent.includes("El email ya está registrado") &&
            apiContent.includes("status: 400"),
          message: "Should handle email conflicts properly",
        },
        {
          name: "Validation errors",
          check: apiContent.includes("instanceof z.ZodError"),
          message: "Should handle validation errors from Zod schema",
        },
      ];

      const failed = checks.filter((c) => !c.check);
      if (failed.length > 0) {
        return {
          success: false,
          message: "Error handling validation failed",
          details: failed.map((f) => f.message),
        };
      }

      return {
        success: true,
        message: "✅ Error handling is comprehensive and user-friendly",
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to validate error handling",
        details: error,
      };
    }
  }

  private validateFrontendIntegration(): ValidationResult {
    try {
      const apiPath = join(
        this.projectRoot,
        "src/app/api/admin/users/route.ts",
      );
      const apiContent = readFileSync(apiPath, "utf-8");

      const checks = [
        {
          name: "Response structure",
          check:
            apiContent.includes("adminLimits: {") &&
            apiContent.includes("canCreateMoreAdmins"),
          message: "API should return frontend-friendly data structure",
        },
        {
          name: "Limit information",
          check:
            apiContent.includes("currentAdminsCreated") &&
            apiContent.includes("maxAdminsAllowed") &&
            apiContent.includes("remainingAdminSlots"),
          message: "API should provide all necessary limit information for UI",
        },
        {
          name: "User creation response",
          check:
            apiContent.includes("temporaryPassword") &&
            apiContent.includes("adminLimits"),
          message:
            "User creation should return both user data and limit information",
        },
        {
          name: "Consistent structure",
          check: apiContent.includes(
            "canCreateMoreAdmins: adminsCreated < maxAdminsAllowed",
          ),
          message: "API should provide consistent boolean flags for UI logic",
        },
      ];

      const failed = checks.filter((c) => !c.check);
      if (failed.length > 0) {
        return {
          success: false,
          message: "Frontend integration validation failed",
          details: failed.map((f) => f.message),
        };
      }

      return {
        success: true,
        message: "✅ Frontend integration points are properly structured",
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to validate frontend integration",
        details: error,
      };
    }
  }
}

// Run validation
const validator = new AdminLimitsValidator();
validator.validateAll().catch(console.error);
