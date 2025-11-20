"use client";

import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedErrorBoundary } from "@/components/ui/advanced-error-boundary";
import { MasterPageTemplate } from "@/components/master/MasterPageTemplate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Lock, Eye, CheckCircle } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";

// Force dynamic rendering for Vercel compatibility
export const dynamic = "force-dynamic";

const securityCenterFallback = (
  <div className="space-y-8">
    <Card className="animate-pulse border-blue-200 dark:border-blue-800">
      <div className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-32 w-full rounded" />
      </div>
    </Card>
  </div>
);

function SecurityCenterContent() {
  const { stats, loading } = useDashboardData();

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-blue-200 dark:border-blue-800">
            <div className="p-6">
              <Skeleton className="h-8 w-8 mb-4" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Security Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-200 dark:border-green-800">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {stats.security?.securityScore || "N/A"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Security Score
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-red-200 dark:border-red-800">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold">
                  {stats.security?.activeThreats || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Threats
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">
                  {stats.security?.blockedAttempts?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Blocked Attempts
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-muted-foreground">Monitoring</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Security Status */}
      <Card className="border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-6">Security Status</h3>
          <div className="space-y-4">
            <div
              className={`flex items-start gap-4 p-4 rounded-lg ${
                stats.security?.activeThreats &&
                stats.security.activeThreats > 0
                  ? "bg-red-50 dark:bg-red-950/20"
                  : "bg-green-50 dark:bg-green-950/20"
              }`}
            >
              {stats.security?.activeThreats &&
              stats.security.activeThreats > 0 ? (
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {stats.security?.activeThreats &&
                    stats.security.activeThreats > 0
                      ? "Active Threats Detected"
                      : "System Secure"}
                  </span>
                  <Badge
                    variant={
                      stats.security?.activeThreats &&
                      stats.security.activeThreats > 0
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {stats.security?.activeThreats &&
                    stats.security.activeThreats > 0
                      ? "High"
                      : "Good"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {stats.security?.activeThreats &&
                  stats.security.activeThreats > 0
                    ? `${stats.security.activeThreats} active security threats detected`
                    : "No active security threats detected"}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Last scan:{" "}
                  {stats.security?.lastSecurityScan
                    ? new Date(stats.security.lastSecurityScan).toLocaleString()
                    : "Never"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Security Score</span>
                  <Badge variant="secondary">
                    {stats.security?.securityScore || "N/A"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Current security assessment score
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Updated continuously
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <Lock className="h-5 w-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Access Control</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {stats.security?.blockedAttempts || 0} blocked access attempts
                  in the last 24 hours
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Real-time protection active
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Security Actions */}
      <Card className="border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-6">Security Actions</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="h-auto p-4 justify-start">
              <Shield className="h-4 w-4 mr-3" />
              Run Security Scan
            </Button>
            <Button variant="outline" className="h-auto p-4 justify-start">
              <Lock className="h-4 w-4 mr-3" />
              View Firewall Rules
            </Button>
            <Button variant="outline" className="h-auto p-4 justify-start">
              <Eye className="h-4 w-4 mr-3" />
              Access Logs
            </Button>
            <Button variant="outline" className="h-auto p-4 justify-start">
              <AlertTriangle className="h-4 w-4 mr-3" />
              Threat Intelligence
            </Button>
            <Button variant="outline" className="h-auto p-4 justify-start">
              <CheckCircle className="h-4 w-4 mr-3" />
              Compliance Report
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}

export default function SecurityCenterPage() {
  return (
    <MasterPageTemplate
      title=""
      subtitle=""
      context="SECURITY_CENTER"
      errorContext="SecurityCenterPage"
      fallbackContent={securityCenterFallback}
    >
      <SecurityCenterContent />
    </MasterPageTemplate>
  );
}
