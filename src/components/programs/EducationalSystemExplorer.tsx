/**
 * 🎓 Educational System Explorer Component
 * Interactive explorer for the comprehensive educational system functionality
 */

"use client";

import React, { useState } from "react";
import { useLanguage } from "@/components/language/LanguageContext";
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
  Globe,
  Target,
  Users,
  BarChart3,
} from "lucide-react";
import {
  EducationalInstitutionType,
  INSTITUTION_TYPE_INFO,
  getGradesForInstitutionType,
  getSubjectsForInstitutionType,
  shouldShowFeature,
} from "@/lib/educational-system";
import { LevelSpecificDashboard } from "@/components/dashboard/LevelSpecificDashboard";
import { EducationalLevelAwareNavigation } from "@/components/layout/EducationalLevelAwareNavigation";

export function EducationalSystemExplorer() {
  const { t } = useLanguage();
  const [selectedType, setSelectedType] =
    useState<EducationalInstitutionType>("PRESCHOOL");
  const [activeView, setActiveView] = useState<
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
      case "UNIVERSITY":
        return <Building2 className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>

        <Card className="bg-transparent border-0 text-white shadow-none">
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-2xl md:text-3xl font-bold">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Globe className="h-7 w-7" />
              </div>
              🎓 {t("programas.explorer.title")}
            </CardTitle>
            <CardDescription className="text-blue-100 text-lg leading-relaxed mt-2">
              {t("educational_system.description")}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Institution Type Selector */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
            {t("programas.explorer.select_institution_type")}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            {t("programas.explorer.explore_adaptation")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(INSTITUTION_TYPE_INFO).map(([type, info]) => {
            const typedType = type as EducationalInstitutionType;
            const isSelected = selectedType === typedType;

            return (
              <div
                key={type}
                className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  isSelected ? "scale-105" : ""
                }`}
                onClick={() => setSelectedType(typedType)}
              >
                <div className={`absolute inset-0 rounded-2xl blur-xl transition-all duration-300 ${
                  isSelected
                    ? "bg-gradient-to-r from-blue-500/50 to-purple-500/50"
                    : "bg-gradient-to-r from-slate-200/20 to-slate-300/20 group-hover:from-blue-400/30 group-hover:to-purple-400/30"
                }`}></div>

                <Card className={`relative border-0 shadow-xl transition-all duration-300 overflow-hidden ${
                  isSelected
                    ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-blue-500/25"
                    : "bg-white dark:bg-slate-800 hover:shadow-2xl hover:shadow-blue-500/10"
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <CardContent className="p-6 text-center space-y-4 relative z-10">
                    <div className={`inline-flex p-4 rounded-2xl transition-all duration-300 ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-600 dark:text-blue-400 group-hover:scale-110"
                    }`}>
                      <span className="text-3xl">{info.icon}</span>
                    </div>

                    <div className="space-y-2">
                      <h3 className={`font-bold text-lg transition-colors duration-300 ${
                        isSelected ? "text-white" : "text-slate-800 dark:text-white"
                      }`}>
                        {info.chileanName}
                      </h3>
                      <Badge variant={isSelected ? "secondary" : "outline"} className={`transition-all duration-300 ${
                        isSelected
                          ? "bg-white/20 text-white border-white/30"
                          : "group-hover:bg-blue-50 group-hover:border-blue-200"
                      }`}>
                        {info.levels.length} {t("programas.explorer.levels_text")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Selection Info */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
        <div className="absolute inset-0 bg-black/10"></div>

        <Alert className="border-0 bg-transparent text-white shadow-none">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Target className="h-5 w-5" />
            </div>
            <AlertDescription className="text-white/90 leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-white">Institución:</span>{" "}
                  <span className="text-white/90">{INSTITUTION_TYPE_INFO[selectedType].chileanName}</span>
                </div>
                <div>
                  <span className="font-semibold text-white">Descripción:</span>{" "}
                  <span className="text-white/90">{INSTITUTION_TYPE_INFO[selectedType].description}</span>
                </div>
                <div>
                  <span className="font-semibold text-white">Niveles:</span>{" "}
                  <span className="text-white/90">{INSTITUTION_TYPE_INFO[selectedType].levels.length}</span>
                </div>
                <div>
                  <span className="font-semibold text-white">Asignaturas:</span>{" "}
                  <span className="text-white/90">{getSubjectsForInstitutionType(selectedType).length}</span>
                </div>
              </div>
            </AlertDescription>
          </div>
        </Alert>
      </div>

      {/* Explorer Tabs */}
      <Tabs
        value={activeView}
        onValueChange={(value) => setActiveView(value as any)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl shadow-inner">
          <TabsTrigger
            value="overview"
            className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-lg transition-all duration-300 font-medium"
          >
            {t("programas.explorer.overview")}
          </TabsTrigger>
          <TabsTrigger
            value="navigation"
            className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-lg transition-all duration-300 font-medium"
          >
            {t("programas.explorer.navigation")}
          </TabsTrigger>
          <TabsTrigger
            value="dashboard"
            className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-lg transition-all duration-300 font-medium"
          >
            {t("programas.explorer.dashboard")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Educational Levels */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-blue-600 rounded-xl text-white">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  {t("educational_system.educational_levels")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {INSTITUTION_TYPE_INFO[selectedType].levels.map((level, index) => (
                    <div
                      key={level.id}
                      className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-white">
                              {level.chileanName}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {level.ages} • ISCED {level.isced}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/50 dark:border-blue-700 dark:text-blue-300">
                          {level.grades?.length || 0} grados
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subjects and Features */}
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border-emerald-200 dark:border-emerald-800 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-emerald-600 rounded-xl text-white">
                    <Users className="h-5 w-5" />
                  </div>
                  Características del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-800 dark:text-white">
                      Asignaturas
                    </h4>
                    <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/50 dark:border-emerald-700 dark:text-emerald-300">
                      {getSubjectsForInstitutionType(selectedType).length} total
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getSubjectsForInstitutionType(selectedType)
                      .slice(0, 8)
                      .map((subject, index) => (
                        <Badge
                          key={subject}
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 hover:bg-emerald-200 transition-colors duration-200"
                        >
                          {subject}
                        </Badge>
                      ))}
                    {getSubjectsForInstitutionType(selectedType).length > 8 && (
                      <Badge variant="outline" className="border-emerald-300 text-emerald-600 dark:border-emerald-600 dark:text-emerald-400">
                        +{getSubjectsForInstitutionType(selectedType).length - 8} más
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold mb-3 text-slate-800 dark:text-white">
                    {t("programas.explorer.enabled_features")}
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
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
                          className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
                            enabled
                              ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
                              : "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full flex-shrink-0 ${
                              enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                            }`}
                          />
                          <span className={`text-sm capitalize ${
                            enabled
                              ? "text-emerald-800 dark:text-emerald-200 font-medium"
                              : "text-slate-600 dark:text-slate-400"
                          }`}>
                            {feature.split("_").join(" ")}
                          </span>
                          {enabled && (
                            <Badge variant="outline" className="ml-auto bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-600 text-xs">
                              Activo
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="navigation" className="space-y-8 mt-8">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-purple-200 dark:border-purple-800 shadow-xl">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-purple-600 rounded-xl text-white">
                  <Globe className="h-5 w-5" />
                </div>
                {t("programas.explorer.adapted_navigation")}
              </CardTitle>
              <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
                La navegación se adapta automáticamente según el tipo de institución
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <EducationalLevelAwareNavigation
                  currentType={selectedType}
                  userRole="ADMIN"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-8 mt-8">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-600 rounded-xl text-white">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  Dashboard Interactivo
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Vista previa del panel de control adaptado para {INSTITUTION_TYPE_INFO[selectedType].chileanName.toLowerCase()}
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
              <LevelSpecificDashboard currentType={selectedType} userRole="ADMIN" />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Implementation Status */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>

        <Card className="bg-transparent border-0 text-white shadow-none">
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Info className="h-6 w-6" />
              </div>
              Estado de Implementación
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Sistema Educativo",
                  status: "Completado",
                  color: "bg-green-400",
                  icon: "🎓",
                },
                {
                  label: "Niveles ISCED",
                  status: "Completado",
                  color: "bg-green-400",
                  icon: "📚",
                },
                {
                  label: "Base de Datos",
                  status: "Completado",
                  color: "bg-green-400",
                  icon: "💾",
                },
                {
                  label: "Interface Admin",
                  status: "Completado",
                  color: "bg-green-400",
                  icon: "🖥️",
                },
                {
                  label: "Navegación Adaptiva",
                  status: "Completado",
                  color: "bg-green-400",
                  icon: "🧭",
                },
                {
                  label: "Dashboard Específico",
                  status: "Completado",
                  color: "bg-green-400",
                  icon: "📊",
                },
                {
                  label: "APIs y Hooks",
                  status: "Completado",
                  color: "bg-green-400",
                  icon: "⚙️",
                },
                {
                  label: "Migración BD",
                  status: "Listo",
                  color: "bg-blue-400",
                  icon: "🚀",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{item.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-white group-hover:scale-105 transition-transform duration-200">
                        {item.label}
                      </div>
                      <div className="text-sm text-green-100">{item.status}</div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${item.color} flex-shrink-0`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🎉</div>
                <div className="flex-1">
                  <h4 className="font-bold text-xl text-white mb-2">
                    Sistema Completado
                  </h4>
                  <p className="text-green-100 leading-relaxed">
                    El sistema educativo comprensivo está listo para usar. Soporta desde Educación
                    Parvularia hasta Educación Superior con estándares chilenos e
                    internacionales ISCED.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
