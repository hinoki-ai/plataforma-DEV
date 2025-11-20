/**
 * USER MANAGEMENT PAGE - ENGLISH ONLY
 *
 * CRITICAL RULE: This component MUST remain English-only and hardcoded.
 * No translations, i18n hooks, or internationalization allowed.
 *
 * This is a strict requirement that cannot be broken for:
 * - Master dashboard consistency
 * - Technical admin interface standards
 * - Performance optimization
 * - Avoiding translation overhead for system administrators
 *
 * If you need to add text, hardcode it in English only.
 * DO NOT add useDivineParsing, useLanguage, or any translation hooks.
 */

"use client";

import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedErrorBoundary } from "@/components/ui/advanced-error-boundary";
import { MasterPageTemplate } from "@/components/master/MasterPageTemplate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX, Shield, GraduationCap } from "lucide-react";

// Force dynamic rendering for Vercel compatibility
export const dynamic = "force-dynamic";

const userManagementFallback = (
  <div className="space-y-8">
    <Card className="animate-pulse border-blue-200 dark:border-blue-800">
      <div className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-32 w-full rounded" />
      </div>
    </Card>
  </div>
);

export default function UserManagementPage() {
  return (
    <MasterPageTemplate
      context="USER_MANAGEMENT"
      errorContext="UserManagementPage"
      fallbackContent={userManagementFallback}
    >
      {/* User Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200 dark:border-blue-800">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">1,247</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-green-200 dark:border-green-800">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">1,189</div>
                <div className="text-sm text-muted-foreground">
                  Active Users
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-red-200 dark:border-red-800">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <UserX className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold">58</div>
                <div className="text-sm text-muted-foreground">
                  Inactive Users
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">
                  Master Users
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Role Distribution */}
      <Card className="border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-6">Role Distribution</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Master</span>
              </div>
              <Badge variant="secondary">12 users</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Administrator</span>
              </div>
              <Badge variant="secondary">45 users</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-green-600" />
                <span className="font-medium">Teacher</span>
              </div>
              <Badge variant="secondary">234 users</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Parent</span>
              </div>
              <Badge variant="secondary">956 users</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-6">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="h-auto p-4 justify-start">
              <Users className="h-4 w-4 mr-3" />
              View All Users
            </Button>
            <Button variant="outline" className="h-auto p-4 justify-start">
              <Shield className="h-4 w-4 mr-3" />
              Manage Roles
            </Button>
            <Button variant="outline" className="h-auto p-4 justify-start">
              <UserCheck className="h-4 w-4 mr-3" />
              Bulk Operations
            </Button>
            <Button variant="outline" className="h-auto p-4 justify-start">
              <Shield className="h-4 w-4 mr-3" />
              Role Permissions
            </Button>
            <Button variant="outline" className="h-auto p-4 justify-start">
              <UserX className="h-4 w-4 mr-3" />
              Deactivated Users
            </Button>
          </div>
        </div>
      </Card>
    </MasterPageTemplate>
  );
}
