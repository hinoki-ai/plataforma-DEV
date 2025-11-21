import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Audit Logging Schema
 *
 * This schema defines the structure for comprehensive audit logging
 * of all user actions and system events in the Plataforma Astral system.
 *
 * Audit logs are used for:
 * - Security monitoring
 * - Compliance reporting
 * - Troubleshooting
 * - User activity analysis
 */

export const auditLogs = defineTable({
  // Timestamp when the action occurred
  timestamp: v.number(),

  // User information
  userId: v.optional(v.id("users")),
  userEmail: v.string(),
  userRole: v.union(
    v.literal("MASTER"),
    v.literal("ADMIN"),
    v.literal("PROFESOR"),
    v.literal("PARENT"),
    v.literal("STUDENT"),
    v.literal("SYSTEM"),
  ),

  // Action details
  action: v.string(), // e.g., "USER_LOGIN", "DATA_ACCESS", "SYSTEM_CONFIG_UPDATE"
  resource: v.string(), // What was accessed/modified
  status: v.union(
    v.literal("success"),
    v.literal("warning"),
    v.literal("error"),
  ),

  // Network and client information
  ipAddress: v.string(),
  userAgent: v.optional(v.string()),

  // Detailed information
  details: v.string(),
  metadata: v.optional(v.any()), // Additional structured data

  // Categorization
  category: v.union(
    v.literal("authentication"),
    v.literal("authorization"),
    v.literal("data_access"),
    v.literal("system_config"),
    v.literal("user_management"),
    v.literal("system_operation"),
    v.literal("security_event"),
  ),

  // Optional institution context
  institutionId: v.optional(v.id("institutions")),

  // Optional session information
  sessionId: v.optional(v.string()),
})
  .index("by_user", ["userId"])
  .index("by_category", ["category"])
  .index("by_timestamp", ["timestamp"])
  .index("by_status", ["status"])
  .index("by_institution", ["institutionId"])
  .index("by_action", ["action"])
  .index("by_user_timestamp", ["userId", "timestamp"])
  .index("by_category_timestamp", ["category", "timestamp"]);

