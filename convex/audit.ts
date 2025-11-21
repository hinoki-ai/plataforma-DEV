import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

/**
 * Audit Logging Functions
 *
 * These functions provide comprehensive audit logging capabilities
 * for the Plataforma Astral system.
 */

/**
 * Log an audit event
 *
 * This mutation records audit events for security, compliance, and monitoring purposes.
 */
export const logAuditEvent = mutation({
  args: {
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
    action: v.string(),
    resource: v.string(),
    status: v.union(
      v.literal("success"),
      v.literal("warning"),
      v.literal("error"),
    ),
    ipAddress: v.string(),
    userAgent: v.optional(v.string()),
    details: v.string(),
    metadata: v.optional(v.any()),
    category: v.union(
      v.literal("authentication"),
      v.literal("authorization"),
      v.literal("data_access"),
      v.literal("system_config"),
      v.literal("user_management"),
      v.literal("system_operation"),
      v.literal("security_event"),
    ),
    institutionId: v.optional(v.id("institutions")),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();

    // Create the audit log entry
    const auditLogId = await ctx.db.insert("auditLogs", {
      timestamp,
      userId: args.userId,
      userEmail: args.userEmail,
      userRole: args.userRole,
      action: args.action,
      resource: args.resource,
      status: args.status,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      details: args.details,
      metadata: args.metadata,
      category: args.category,
      institutionId: args.institutionId,
      sessionId: args.sessionId,
    });

    // Log to console for immediate visibility during development
    console.log(
      `[AUDIT] ${args.category}:${args.action} - ${args.userEmail} (${args.status}) - ${args.details}`,
    );

    return auditLogId;
  },
});

/**
 * Get audit logs with filtering and pagination
 */
export const getAuditLogs = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    userId: v.optional(v.id("users")),
    category: v.optional(
      v.union(
        v.literal("authentication"),
        v.literal("authorization"),
        v.literal("data_access"),
        v.literal("system_config"),
        v.literal("user_management"),
        v.literal("system_operation"),
        v.literal("security_event"),
      ),
    ),
    status: v.optional(
      v.union(v.literal("success"), v.literal("warning"), v.literal("error")),
    ),
    action: v.optional(v.string()),
    institutionId: v.optional(v.id("institutions")),
    startDate: v.optional(v.number()), // Unix timestamp
    endDate: v.optional(v.number()), // Unix timestamp
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const offset = args.offset || 0;

    // Get all audit logs (simplified version for now)
    const allLogs = await ctx.db.query("auditLogs").collect();

    // Apply filters in memory (for now - can be optimized later with proper indexes)
    let filteredLogs = allLogs;

    if (args.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === args.userId);
    }
    if (args.category) {
      filteredLogs = filteredLogs.filter(log => log.category === args.category);
    }
    if (args.status) {
      filteredLogs = filteredLogs.filter(log => log.status === args.status);
    }
    if (args.action) {
      filteredLogs = filteredLogs.filter(log => log.action === args.action);
    }
    if (args.institutionId) {
      filteredLogs = filteredLogs.filter(log => log.institutionId === args.institutionId);
    }
    if (args.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= args.startDate!);
    }
    if (args.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= args.endDate!);
    }

    // Search term filtering
    if (args.searchTerm) {
      const searchTerm = args.searchTerm.toLowerCase();
      filteredLogs = filteredLogs.filter(log =>
        log.userEmail.toLowerCase().includes(searchTerm) ||
        log.action.toLowerCase().includes(searchTerm) ||
        log.details.toLowerCase().includes(searchTerm) ||
        log.resource.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by timestamp descending
    filteredLogs.sort((a, b) => b.timestamp - a.timestamp);

    // Apply pagination
    const startIndex = offset;
    const endIndex = startIndex + limit;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
    const hasMore = endIndex < filteredLogs.length;

    return {
      logs: paginatedLogs,
      hasMore,
      totalCount: filteredLogs.length,
    };
  },
});

/**
 * Get audit log statistics
 */
export const getAuditStats = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    institutionId: v.optional(v.id("institutions")),
  },
  handler: async (ctx, args) => {
    const filters: any = {};
    if (args.institutionId) filters.institutionId = args.institutionId;

    // Get all logs matching filters
    let query = ctx.db.query("auditLogs");
    if (args.institutionId)
      query = query.filter((q) =>
        q.eq(q.field("institutionId"), args.institutionId),
      );

    // Date range filtering
    if (args.startDate)
      query = query.filter((q) => q.gte(q.field("timestamp"), args.startDate));
    if (args.endDate)
      query = query.filter((q) => q.lte(q.field("timestamp"), args.endDate));

    const allLogs = await query.collect();

    // Calculate statistics
    const totalLogs = allLogs.length;
    const todayLogs = allLogs.filter((log) => {
      const logDate = new Date(log.timestamp);
      const today = new Date();
      return logDate.toDateString() === today.toDateString();
    }).length;

    const errorLogs = allLogs.filter((log) => log.status === "error").length;
    const successLogs = allLogs.filter(
      (log) => log.status === "success",
    ).length;
    const warningLogs = allLogs.filter(
      (log) => log.status === "warning",
    ).length;

    const uniqueUsers = new Set(allLogs.map((log) => log.userEmail)).size;

    // Category breakdown
    const categoryStats = allLogs.reduce(
      (acc, log) => {
        acc[log.category] = (acc[log.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Status breakdown
    const statusStats = {
      success: successLogs,
      warning: warningLogs,
      error: errorLogs,
    };

    return {
      totalLogs,
      todayLogs,
      errorLogs,
      successLogs,
      warningLogs,
      uniqueUsers,
      categoryStats,
      statusStats,
    };
  },
});

/**
 * Get audit log by ID
 */
export const getAuditLog = query({
  args: {
    id: v.id("auditLogs"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Utility function to log authentication events
 */
export const logAuthenticationEvent = mutation({
  args: {
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
    action: v.union(
      v.literal("USER_LOGIN"),
      v.literal("USER_LOGOUT"),
      v.literal("PASSWORD_CHANGE"),
      v.literal("LOGIN_FAILED"),
      v.literal("SESSION_EXPIRED"),
    ),
    status: v.union(
      v.literal("success"),
      v.literal("warning"),
      v.literal("error"),
    ),
    ipAddress: v.string(),
    userAgent: v.optional(v.string()),
    details: v.string(),
    institutionId: v.optional(v.id("institutions")),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditLogs", {
      timestamp: Date.now(),
      userId: args.userId,
      userEmail: args.userEmail,
      userRole: args.userRole,
      action: args.action,
      resource: "authentication",
      status: args.status,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      details: args.details,
      category: "authentication",
      institutionId: args.institutionId,
      sessionId: args.sessionId,
    });
  },
});

/**
 * Utility function to log data access events
 */
export const logDataAccessEvent = mutation({
  args: {
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
    resource: v.string(),
    action: v.union(
      v.literal("DATA_ACCESS"),
      v.literal("DATA_MODIFY"),
      v.literal("DATA_DELETE"),
      v.literal("DATA_EXPORT"),
    ),
    status: v.union(
      v.literal("success"),
      v.literal("warning"),
      v.literal("error"),
    ),
    ipAddress: v.string(),
    userAgent: v.optional(v.string()),
    details: v.string(),
    institutionId: v.optional(v.id("institutions")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditLogs", {
      timestamp: Date.now(),
      userId: args.userId,
      userEmail: args.userEmail,
      userRole: args.userRole,
      action: args.action,
      resource: args.resource,
      status: args.status,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      details: args.details,
      category: "data_access",
      institutionId: args.institutionId,
    });
  },
});

/**
 * Populate sample audit logs for testing (development only)
 */
export const populateSampleAuditLogs = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if we already have logs to avoid duplicates
    const existingLogs = await ctx.db.query("auditLogs").collect();
    if (existingLogs.length > 0) {
      console.log("Sample audit logs already exist, skipping population");
      return { message: "Sample logs already exist" };
    }

    const sampleLogs = [
      {
        userEmail: "admin@school.com",
        userRole: "ADMIN" as const,
        action: "USER_LOGIN",
        resource: "authentication",
        status: "success" as const,
        ipAddress: "192.168.1.100",
        userAgent: "Chrome/120.0",
        details: "Successful login from admin panel",
        category: "authentication" as const,
      },
      {
        userEmail: "profesor@school.com",
        userRole: "PROFESOR" as const,
        action: "DATA_ACCESS",
        resource: "student_records",
        status: "success" as const,
        ipAddress: "192.168.1.105",
        userAgent: "Firefox/119.0",
        details: "Accessed student grades for Mathematics 3A",
        category: "data_access" as const,
      },
      {
        userEmail: "master@system.com",
        userRole: "MASTER" as const,
        action: "SYSTEM_CONFIG_UPDATE",
        resource: "database_settings",
        status: "success" as const,
        ipAddress: "10.0.0.1",
        userAgent: "System/1.0",
        details: "Updated database connection pool size to 25",
        category: "system_config" as const,
      },
      {
        userEmail: "parent@school.com",
        userRole: "PARENT" as const,
        action: "UNAUTHORIZED_ACCESS_ATTEMPT",
        resource: "admin_panel",
        status: "error" as const,
        ipAddress: "192.168.1.110",
        userAgent: "Safari/17.0",
        details: "Attempted access to admin panel without proper permissions",
        category: "authorization" as const,
      },
      {
        userEmail: "system@internal",
        userRole: "SYSTEM" as const,
        action: "USER_ROLE_UPDATE",
        resource: "user_management",
        status: "success" as const,
        ipAddress: "127.0.0.1",
        userAgent: "System/1.0",
        details:
          "Updated role for user estudiante@school.com from STUDENT to GRADUATE",
        category: "user_management" as const,
      },
    ];

    // Insert sample logs with timestamps spread over the last few hours
    const now = Date.now();
    const logIds = [];

    for (let i = 0; i < sampleLogs.length; i++) {
      const log = sampleLogs[i];
      const timestamp = now - i * 15 * 60 * 1000; // Spread logs 15 minutes apart

      const logId = await ctx.db.insert("auditLogs", {
        timestamp,
        userEmail: log.userEmail,
        userRole: log.userRole,
        action: log.action,
        resource: log.resource,
        status: log.status,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        details: log.details,
        category: log.category,
      });

      logIds.push(logId);
    }

    console.log(`Populated ${logIds.length} sample audit logs`);
    return { message: `Created ${logIds.length} sample audit logs`, logIds };
  },
});
