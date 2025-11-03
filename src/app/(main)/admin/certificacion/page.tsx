"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageTransition } from "@/components/ui/page-transition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminCertificationDashboard } from "@/components/digital-signatures/AdminCertificationDashboard";
import { SignatureAuditTrail } from "@/components/digital-signatures/SignatureAuditTrail";
import { PeriodLockingControls } from "@/components/digital-signatures/PeriodLockingControls";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, Lock, History } from "lucide-react";

export default function CertificacionPage() {
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState("certification");

  // Get current user
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    userId ? { clerkId: userId } : "skip",
  );

  return (
    <PageTransition skeletonType="page" duration={700}>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                Certificación Digital - Circular N°30
                <Badge className="bg-primary/10 text-primary">
                  <Shield className="w-3 h-3" />
                  ADMIN
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Gestión completa de firmas digitales, certificación y bloqueo de
                períodos
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {currentUser && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                value="certification"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Certificación
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Historial
              </TabsTrigger>
              <TabsTrigger value="locking" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Bloqueos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="certification" className="space-y-6">
              <AdminCertificationDashboard userId={currentUser._id} />
            </TabsContent>

            <TabsContent value="audit" className="space-y-6">
              <SignatureAuditTrail />
            </TabsContent>

            <TabsContent value="locking" className="space-y-6">
              <PeriodLockingControls userId={currentUser._id} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageTransition>
  );
}
