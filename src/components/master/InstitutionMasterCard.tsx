/**
 * 🏛️ INSTITUTION MASTER CONTROL CARD - ENGLISH ONLY
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

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  School,
  GraduationCap,
  BookOpen,
  Building2,
  Settings,
  Database,
  Users,
  BarChart3,
  Shield,
} from "lucide-react";
import {
  EducationalInstitutionType,
  INSTITUTION_TYPE_INFO,
  EDUCATIONAL_LEVELS,
} from "@/lib/educational-system";
import { toast } from "sonner";

interface InstitutionMasterCardProps {
  currentType?: EducationalInstitutionType;
}

export function InstitutionMasterCard({
  currentType = "PRESCHOOL",
}: InstitutionMasterCardProps) {
  const router = useRouter();
  const [isConfiguring, setIsConfiguring] = useState(false);
  const currentInfo = INSTITUTION_TYPE_INFO[currentType];

  const getInstitutionIcon = (type: EducationalInstitutionType) => {
    switch (type) {
      case "PRESCHOOL":
        return <School className="h-6 w-6" />;
      case "BASIC_SCHOOL":
        return <BookOpen className="h-6 w-6" />;
      case "HIGH_SCHOOL":
        return <GraduationCap className="h-6 w-6" />;
      case "UNIVERSITY":
        return <Building2 className="h-6 w-6" />;
    }
  };

  const handleMasterReconfiguration = async () => {
    setIsConfiguring(true);
    try {
      // Simulate master-level reconfiguration
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("Configuration updated successfully");
    } catch (error) {
      toast.error("Configuration update failed");
    } finally {
      setIsConfiguring(false);
    }
  };

  const masterActions = [
    {
      label: "Provision New Institution",
      icon: Building2,
      description: "Create and link a complete tenant",
      action: () => router.push("/master/institution-creation"),
      color:
        "bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700",
    },
    {
      label: "Configure Educational System",
      icon: Settings,
      description: "Supreme control of educational levels",
      action: () => toast.info("Accessing system configuration"),
      color:
        "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700",
    },
    {
      label: "Migrate Educational Structure",
      icon: Database,
      description: "Mass migration of educational data",
      action: () => toast.info("🏛️ MASTER: Starting educational migration"),
      color:
        "bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700",
    },
    {
      label: "Institution Management",
      icon: Building2,
      description: "Manage tenants and their users",
      action: () => router.push("/master/institutions"),
      color:
        "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700",
    },
    {
      label: "Institutional Analytics",
      icon: BarChart3,
      description: "Advanced metrics of the educational system",
      action: () => toast.info("🏛️ MASTER: Loading educational analytics"),
      color:
        "bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700",
    },
  ];

  return (
    <Card className="border-2 border-gold-300 dark:border-gold-700 bg-linear-to-br from-gold-50 via-white to-blue-50 dark:from-gold-950/20 dark:via-card dark:to-blue-950/20">
      <CardContent className="pt-0 pb-4">
        <div className="space-y-1">
          {/* Current Institution Status */}
          <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
            <div className="flex items-center gap-3">
              {getInstitutionIcon(currentType)}
              <AlertDescription>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <strong>Current Institution:</strong> {currentInfo.name}
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {currentInfo.levels.length} educational levels • ISCED{" "}
                      {Math.min(...currentInfo.levels.map((l) => l.isced))}-
                      {Math.max(...currentInfo.levels.map((l) => l.isced))}
                    </div>
                  </div>
                  <Badge className={currentInfo.color} variant="secondary">
                    {currentInfo.icon} {currentInfo.name}
                  </Badge>
                </div>
              </AlertDescription>
            </div>
          </Alert>

          {/* Master Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {masterActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className={`h-auto p-4 text-left justify-start ${action.color} text-white border-0 hover:shadow-md transition-all`}
                onClick={action.action}
              >
                <div className="flex items-center gap-3">
                  <action.icon className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{action.label}</div>
                    <div className="text-xs opacity-90 text-white dark:text-gray-100">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {/* Educational Levels Overview */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="font-medium mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Shield className="h-4 w-4" />
              Available Educational Levels
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {Object.entries(INSTITUTION_TYPE_INFO).map(([type, info]) => {
                const typedType = type as EducationalInstitutionType;
                const isActive = typedType === currentType;
                return (
                  <Card
                    key={type}
                    className={`p-3 ${isActive ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/20" : "border-gray-200 dark:border-gray-700"}`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{info.icon}</div>
                      <div className="text-sm font-medium">{info.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {info.levels.length} levels
                      </div>
                      {isActive && (
                        <Badge className="mt-1" variant="secondary">
                          Active
                        </Badge>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Master Reconfiguration */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <Button
              onClick={handleMasterReconfiguration}
              disabled={isConfiguring}
              className="w-full bg-linear-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 dark:from-gold-600 dark:to-gold-700 dark:hover:from-gold-700 dark:hover:to-gold-800 text-white"
              size="lg"
            >
              <Shield className="h-5 w-5 mr-2" />
              {isConfiguring
                ? "Reconfiguring System..."
                : "🏛️ MASTER EDUCATIONAL RECONFIGURATION"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
