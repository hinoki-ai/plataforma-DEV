'use client';

import { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdvancedErrorBoundary } from '@/components/ui/advanced-error-boundary';
import { dbLogger } from '@/lib/logger';
import { MasterPageTemplate } from '@/components/master/MasterPageTemplate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Lock, Eye, CheckCircle, XCircle } from 'lucide-react';

// Force dynamic rendering for Vercel compatibility
export const dynamic = 'force-dynamic';

const securityCenterFallback = (
  <div className="space-y-8">
    <Card className="animate-pulse border-red-200 dark:border-red-800">
      <div className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-32 w-full rounded" />
      </div>
    </Card>
  </div>
);

export default function SecurityCenterPage() {
  return (
    <MasterPageTemplate
      title="🛡️ Security Center"
      subtitle="Monitor security events, manage threats, and ensure system integrity"
      context="SECURITY_CENTER"
      errorContext="SecurityCenterPage"
      fallbackContent={securityCenterFallback}
    >
      {/* Security Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-200 dark:border-green-800">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">98.5%</div>
                <div className="text-sm text-muted-foreground">Security Score</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-red-200 dark:border-red-800">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">Active Threats</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">1,247</div>
                <div className="text-sm text-muted-foreground">Blocked Attempts</div>
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

      {/* Recent Security Events */}
      <Card className="border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-6">Recent Security Events</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Failed Login Attempt</span>
                  <Badge variant="destructive">High</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Multiple failed login attempts from IP 192.168.1.100
                </p>
                <p className="text-xs text-muted-foreground mt-2">2 minutes ago</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Suspicious Activity</span>
                  <Badge variant="secondary">Medium</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Unusual data access pattern detected
                </p>
                <p className="text-xs text-muted-foreground mt-2">15 minutes ago</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Security Update</span>
                  <Badge variant="secondary">Info</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Automatic security patch applied successfully
                </p>
                <p className="text-xs text-muted-foreground mt-2">1 hour ago</p>
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
    </MasterPageTemplate>
  );
}