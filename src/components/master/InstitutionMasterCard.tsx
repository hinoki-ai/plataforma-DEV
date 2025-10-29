/**
 * 🏛️ Institution Master Control Card
 * Supreme educational institution configuration for master users
 */

"use client";

import React, { useState } from "react";
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
  Crown,
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
      case "COLLEGE":
        return <Building2 className="h-6 w-6" />;
    }
  };

  const handleMasterReconfiguration = async () => {
    setIsConfiguring(true);
    try {
      // Simulate master-level reconfiguration
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("🏛️ MASTER: Configuración educativa actualizada");
    } catch (error) {
      toast.error("Error en configuración master");
    } finally {
      setIsConfiguring(false);
    }
  };

  const masterActions = [
    {
      label: "Configurar Sistema Educativo",
      icon: Settings,
      description: "Control supremo de niveles educativos",
      action: () =>
        toast.info("🏛️ MASTER: Accediendo a configuración educativa"),
      color:
        "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700",
    },
    {
      label: "Migrar Estructura Educativa",
      icon: Database,
      description: "Migración masiva de datos educativos",
      action: () => toast.info("🏛️ MASTER: Iniciendo migración educativa"),
      color:
        "bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700",
    },
    {
      label: "Gestión Universal Usuarios",
      icon: Users,
      description: "Control total de todos los niveles educativos",
      action: () => toast.info("🏛️ MASTER: Accediendo a gestión universal"),
      color:
        "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700",
    },
    {
      label: "Analytics Institucional",
      icon: BarChart3,
      description: "Métricas avanzadas del sistema educativo",
      action: () => toast.info("🏛️ MASTER: Cargando analytics educativos"),
      color:
        "bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700",
    },
  ];

  return (
    <Card className="border-2 border-gold-300 dark:border-gold-700 bg-linear-to-br from-gold-50 via-white to-blue-50 dark:from-gold-950/20 dark:via-card dark:to-blue-950/20">
      <CardHeader className="border-b border-gold-200 dark:border-gold-700">
        <CardTitle className="flex items-center gap-3 text-gold-800 dark:text-gold-200">
          🏛️ MASTER - Configuración Educativa Suprema
        </CardTitle>
        <CardDescription>
          Control absoluto del sistema educativo institucional
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Current Institution Status */}
          <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
            <div className="flex items-center gap-3">
              {getInstitutionIcon(currentType)}
              <AlertDescription>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <strong>Institución Actual:</strong>{" "}
                    {currentInfo.chileanName}
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {currentInfo.levels.length} niveles educativos • ISCED{" "}
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
              Niveles Educativos Disponibles
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
                        {info.levels.length} niveles
                      </div>
                      {isActive && (
                        <Badge className="mt-1" variant="secondary">
                          Activo
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
              <Crown className="h-5 w-5 mr-2" />
              {isConfiguring
                ? "Reconfigurando Sistema..."
                : "🏛️ MASTER RECONFIGURACIÓN EDUCATIVA"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
