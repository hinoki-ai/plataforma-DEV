"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { PageTransition } from "@/components/ui/page-transition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminCertificationDashboard } from "@/components/digital-signatures/AdminCertificationDashboard";
import { SignatureAuditTrail } from "@/components/digital-signatures/SignatureAuditTrail";
import { PeriodLockingControls } from "@/components/digital-signatures/PeriodLockingControls";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, Lock, History } from "lucide-react";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

export default function CertificacionPage() {
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState("certification");
  const { t } = useDivineParsing(["admin"]);

  // Get current user
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    userId ? { clerkId: userId } : "skip",
  );

  return (
    <PageTransition skeletonType="page" duration={700}>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Tabs */}
        {currentUser && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                value="certification"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                {t("admin.certificacion.tab.certification", "admin")}
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                {t("admin.certificacion.tab.audit", "admin")}
              </TabsTrigger>
              <TabsTrigger value="locking" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {t("admin.certificacion.tab.locking", "admin")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="certification" className="space-y-6">
              <AdminCertificationDashboard
                userId={currentUser._id as Id<"users">}
              />
            </TabsContent>

            <TabsContent value="audit" className="space-y-6">
              <SignatureAuditTrail />
            </TabsContent>

            <TabsContent value="locking" className="space-y-6">
              <PeriodLockingControls userId={currentUser._id as Id<"users">} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageTransition>
  );
}
