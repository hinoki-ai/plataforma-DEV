/**
 * 🎓 Educational System Demo Component
 * Demonstrates the comprehensive educational system functionality
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  School,
  GraduationCap,
  BookOpen,
  Building2,
  Info,
  ChevronRight,
  Globe,
  Target,
  Users,
} from "lucide-react";
import {
  EducationalInstitutionType,
  INSTITUTION_TYPE_INFO,
  EDUCATIONAL_LEVELS,
  getGradesForInstitutionType,
  getSubjectsForInstitutionType,
  shouldShowFeature,
} from "@/lib/educational-system";
import { LevelSpecificDashboard } from "@/components/dashboard/LevelSpecificDashboard";
import { EducationalLevelAwareNavigation } from "@/components/layout/EducationalLevelAwareNavigation";

export function EducationalSystemDemo() {
  const [selectedType, setSelectedType] =
    useState<EducationalInstitutionType>("PRESCHOOL");
  const [activeDemo, setActiveDemo] = useState<
    "overview" | "navigation" | "dashboard"
  >("overview");

  const getInstitutionIcon = (type: EducationalInstitutionType) => {
    switch (type) {
      case "PRESCHOOL":
        return <School className="h-5 w-5" />;
      case "BASIC_SCHOOL":
        return <BookOpen className="h-5 w-5" />;
      case "HIGH_SCHOOL":
        return <GraduationCap className="h-5 w-5" />;
      case "COLLEGE":
        return <Building2 className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-linear-to-r from-blue-600 to-indigo-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <Globe className="h-6 w-6" />
            🎓 Sistema Educativo Comprensivo
          </CardTitle>
          <CardDescription className="text-blue-100">
            Sistema adaptable desde Educación Parvularia hasta Educación
            Superior
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Institution Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Tipo de Institución</CardTitle>
          <CardDescription>
            Explora cómo el sistema se adapta a diferentes niveles educativos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(INSTITUTION_TYPE_INFO).map(([type, info]) => {
              const typedType = type as EducationalInstitutionType;
              const isSelected = selectedType === typedType;

              return (
                <Button
                  key={type}
                  variant={isSelected ? "default" : "outline"}
                  className={`h-auto p-4 flex-col gap-2 ${isSelected ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                  onClick={() => setSelectedType(typedType)}
                >
                  <div className="text-2xl">{info.icon}</div>
                  <div className="text-sm font-medium">{info.chileanName}</div>
                  <Badge variant="secondary" className="text-xs">
                    {info.levels.length} niveles
                  </Badge>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Selection Info */}
      <Alert>
        <Target className="h-4 w-4" />
        <AlertDescription>
          <strong>Institución seleccionada:</strong>{" "}
          {INSTITUTION_TYPE_INFO[selectedType].chileanName} •
          <strong> Descripción:</strong>{" "}
          {INSTITUTION_TYPE_INFO[selectedType].description} •
          <strong> Niveles:</strong>{" "}
          {INSTITUTION_TYPE_INFO[selectedType].levels.length} •
          <strong> Asignaturas:</strong>{" "}
          {getSubjectsForInstitutionType(selectedType).length}
        </AlertDescription>
      </Alert>

      {/* Demo Tabs */}
      <Tabs
        value={activeDemo}
        onValueChange={(value) => setActiveDemo(value as any)}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visión General</TabsTrigger>
          <TabsTrigger value="navigation">Navegación</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Educational Levels */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Niveles Educativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {INSTITUTION_TYPE_INFO[selectedType].levels.map((level) => (
                    <div
                      key={level.id}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div>
                        <div className="font-medium text-sm">
                          {level.chileanName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {level.ages} • ISCED {level.isced}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {level.grades?.length || 0} grados
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subjects and Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Características del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">
                    Asignaturas (
                    {getSubjectsForInstitutionType(selectedType).length})
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {getSubjectsForInstitutionType(selectedType)
                      .slice(0, 6)
                      .map((subject) => (
                        <Badge
                          key={subject}
                          variant="secondary"
                          className="text-xs"
                        >
                          {subject}
                        </Badge>
                      ))}
                    {getSubjectsForInstitutionType(selectedType).length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +
                        {getSubjectsForInstitutionType(selectedType).length - 6}{" "}
                        más
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Funciones Habilitadas</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      "parent_meetings",
                      "academic_planning",
                      "grading_system",
                      "daycare_features",
                      "university_features",
                      "research_projects",
                    ].map((feature) => {
                      const enabled = shouldShowFeature(feature, selectedType);
                      return (
                        <div
                          key={feature}
                          className={`flex items-center gap-1 ${enabled ? "text-green-600" : "text-gray-400"}`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${enabled ? "bg-green-500" : "bg-gray-300"}`}
                          />
                          {feature.replace("_", " ")}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="navigation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Navegación Adaptada</CardTitle>
              <CardDescription>
                La navegación se adapta automáticamente según el tipo de
                institución
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-sm">
                <EducationalLevelAwareNavigation
                  currentType={selectedType}
                  userRole="ADMIN"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <LevelSpecificDashboard currentType={selectedType} userRole="ADMIN" />
        </TabsContent>
      </Tabs>

      {/* Implementation Status */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Info className="h-5 w-5" />
            Estado de Implementación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Sistema Educativo",
                status: "Completado",
                color: "bg-green-500",
              },
              {
                label: "Niveles ISCED",
                status: "Completado",
                color: "bg-green-500",
              },
              {
                label: "Base de Datos",
                status: "Completado",
                color: "bg-green-500",
              },
              {
                label: "Interface Admin",
                status: "Completado",
                color: "bg-green-500",
              },
              {
                label: "Navegación Adaptiva",
                status: "Completado",
                color: "bg-green-500",
              },
              {
                label: "Dashboard Específico",
                status: "Completado",
                color: "bg-green-500",
              },
              {
                label: "APIs y Hooks",
                status: "Completado",
                color: "bg-green-500",
              },
              { label: "Migración BD", status: "Listo", color: "bg-blue-500" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-white rounded border"
              >
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <div className="text-sm">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-600">{item.status}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <div className="text-sm text-blue-800">
              <strong>🎉 Sistema Completado:</strong> El sistema educativo
              comprensivo está listo para usar. Soporta desde Educación
              Parvularia hasta Educación Superior con estándares chilenos e
              internacionales ISCED.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
