import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dbLogger } from "@/lib/logger";

interface ErrorReport {
  errorId: string;
  message: string;
  stack?: string;
  componentStack?: string;
  context?: string;
  timestamp: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  userRole?: string;
  sessionId?: string;
}

// In-memory error storage (in production, use a database)
const errorReports = new Map<string, ErrorReport>();
const MAX_ERROR_REPORTS = 1000;

// Advanced error analysis
function analyzeError(error: ErrorReport) {
  const analysis = {
    severity: "low" as "low" | "medium" | "high" | "critical",
    category: "unknown" as string,
    frequency: 1,
    similarErrors: [] as string[],
    recommendations: [] as string[],
  };

  // Analyze severity based on error patterns
  if (error.message.includes("chunk") || error.message.includes("network")) {
    analysis.severity = "high";
    analysis.category = "network";
    analysis.recommendations.push("Check network connectivity");
    analysis.recommendations.push("Verify CDN configuration");
  } else if (
    error.message.includes("auth") ||
    error.message.includes("unauthorized")
  ) {
    analysis.severity = "medium";
    analysis.category = "authentication";
    analysis.recommendations.push("Verify authentication flow");
    analysis.recommendations.push("Check token expiration");
  } else if (
    error.message.includes("database") ||
    error.message.includes("prisma")
  ) {
    analysis.severity = "high";
    analysis.category = "database";
    analysis.recommendations.push("Check database connectivity");
    analysis.recommendations.push("Verify database schema");
  } else if (error.stack?.includes("React") || error.componentStack) {
    analysis.severity = "medium";
    analysis.category = "react";
    analysis.recommendations.push("Check component lifecycle");
    analysis.recommendations.push("Verify prop types");
  }

  // Check for similar errors
  const similarErrors = Array.from(errorReports.values())
    .filter(
      (e) =>
        e.message === error.message ||
        (e.stack &&
          error.stack &&
          e.stack.includes(error.stack.substring(0, 100))),
    )
    .map((e) => e.errorId);

  analysis.similarErrors = similarErrors;
  analysis.frequency = similarErrors.length + 1;

  // Upgrade severity if error is frequent
  if (analysis.frequency > 5) {
    analysis.severity = "high";
  } else if (analysis.frequency > 10) {
    analysis.severity = "critical";
  }

  return analysis;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ErrorReport;

    // Validate required fields
    if (!body.errorId || !body.message || !body.timestamp) {
      return NextResponse.json(
        { error: "Missing required fields: errorId, message, timestamp" },
        { status: 400 },
      );
    }

    // Get authenticated user info if available
    let userInfo = {};
    try {
      const session = await auth();
      if (session?.user) {
        userInfo = {
          userId: session.user.id,
          userRole: session.user.role,
          sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        };
      }
    } catch (authError) {
      // Authentication is optional for error reporting
      console.warn("Could not get auth info for error report:", authError);
    }

    // Enhanced error report
    const enhancedReport: ErrorReport = {
      ...body,
      ...userInfo,
      timestamp: new Date().toISOString(), // Use server timestamp
      userAgent: request.headers.get("user-agent") || undefined,
      url: request.headers.get("referer") || body.url,
    };

    // Analyze the error
    const analysis = analyzeError(enhancedReport);

    // Store the error report
    if (errorReports.size >= MAX_ERROR_REPORTS) {
      // Remove oldest entry
      const oldestKey = errorReports.keys().next().value;
      if (oldestKey) {
        errorReports.delete(oldestKey);
      }
    }

    errorReports.set(body.errorId, enhancedReport);

    // Log the error with analysis
    const logData = {
      errorId: body.errorId,
      severity: analysis.severity,
      category: analysis.category,
      frequency: analysis.frequency,
      message: body.message,
      context: body.context,
      stack: body.stack?.substring(0, 500), // Truncate stack for logging
      timestamp: body.timestamp,
      userId: "userId" in userInfo ? userInfo.userId : undefined,
      userRole: "userRole" in userInfo ? userInfo.userRole : undefined,
      recommendations: analysis.recommendations,
    };

    dbLogger.error("Client Error Report", new Error(body.message), logData);

    // Log critical errors to console for immediate attention
    if (analysis.severity === "critical") {
      console.error("🚨 CRITICAL ERROR REPORTED:", logData);
    } else if (analysis.severity === "high") {
      console.warn("⚠️ HIGH PRIORITY ERROR:", logData);
    }

    // Prepare response
    const response = {
      success: true,
      errorId: body.errorId,
      severity: analysis.severity,
      category: analysis.category,
      frequency: analysis.frequency,
      recommendations: analysis.recommendations,
      stored: true,
      timestamp: enhancedReport.timestamp,
    };

    // Return appropriate status based on severity
    const statusCode =
      analysis.severity === "critical"
        ? 500
        : analysis.severity === "high"
          ? 400
          : 200;

    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    console.error("Error processing error report:", error);

    // Log the error processing failure
    dbLogger.error("Error Report Processing Failed", error, {
      context: "ErrorReportingAPI",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: "Failed to process error report",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

// GET endpoint to retrieve error reports (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
    const offset = parseInt(searchParams.get("offset") || "0");
    const severity = searchParams.get("severity");
    const category = searchParams.get("category");

    // Filter error reports
    let filteredReports = Array.from(errorReports.values());

    if (severity) {
      filteredReports = filteredReports.filter((report) => {
        const analysis = analyzeError(report);
        return analysis.severity === severity;
      });
    }

    if (category) {
      filteredReports = filteredReports.filter((report) => {
        const analysis = analyzeError(report);
        return analysis.category === category;
      });
    }

    // Sort by timestamp (newest first)
    filteredReports.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    // Paginate
    const paginatedReports = filteredReports.slice(offset, offset + limit);

    // Add analysis to each report
    const reportsWithAnalysis = paginatedReports.map((report) => ({
      ...report,
      analysis: analyzeError(report),
    }));

    const response = {
      reports: reportsWithAnalysis,
      total: filteredReports.length,
      limit,
      offset,
      hasMore: offset + limit < filteredReports.length,
      summary: {
        total: errorReports.size,
        bySeverity: {
          critical: Array.from(errorReports.values()).filter(
            (r) => analyzeError(r).severity === "critical",
          ).length,
          high: Array.from(errorReports.values()).filter(
            (r) => analyzeError(r).severity === "high",
          ).length,
          medium: Array.from(errorReports.values()).filter(
            (r) => analyzeError(r).severity === "medium",
          ).length,
          low: Array.from(errorReports.values()).filter(
            (r) => analyzeError(r).severity === "low",
          ).length,
        },
        byCategory: {} as Record<string, number>,
      },
    };

    // Calculate category summary
    Array.from(errorReports.values()).forEach((report) => {
      const category = analyzeError(report).category;
      response.summary.byCategory[category] =
        (response.summary.byCategory[category] || 0) + 1;
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error retrieving error reports:", error);
    return NextResponse.json(
      { error: "Failed to retrieve error reports" },
      { status: 500 },
    );
  }
}
