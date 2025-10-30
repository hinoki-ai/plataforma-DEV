/**
 * 🎓 Educational Institution Type Selector
 * Admin interface for selecting and configuring educational institution type
 */

"use client";

import React, { useState, useEffect } from "react";
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
  Settings,
  Save,
  School,
  GraduationCap,
  BookOpen,
  Building2,
  Info,
  Check,
  AlertTriangle,
} from "lucide-react";
import {
  EducationalInstitutionType,
  INSTITUTION_TYPE_INFO,
  EDUCATIONAL_LEVELS,
  getGradesForInstitutionType,
  getSubjectsForInstitutionType,
} from "@/lib/educational-system";
import { toast } from "sonner";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

interface EducationalInstitutionSelectorProps {
  currentType?: EducationalInstitutionType;
  onTypeChange?: (type: EducationalInstitutionType) => void;
}

export function EducationalInstitutionSelector({
  currentType,
  onTypeChange,
}: EducationalInstitutionSelectorProps) {
  const { t } = useDivineParsing(["common"]);
  const [selectedType, setSelectedType] =
    useState<EducationalInstitutionType | null>(currentType || null);
  const [isConfiguring, setIsConfiguring] = useState(false);

  const handleTypeSelect = (type: EducationalInstitutionType) => {
    setSelectedType(type);
  };

  const handleSaveConfiguration = async () => {
    if (!selectedType) {
      toast.error(t("educational_system.select_institution"));
      return;
    }

    setIsConfiguring(true);

    try {
      // Make actual API call to save configuration
      const response = await fetch("/api/educational-system", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          institutionType: selectedType,
        }),
      });

      // Check if response is ok
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(t("educational_system.permission_denied"));
        } else if (response.status === 403) {
          throw new Error(t("educational_system.access_denied"));
        } else if (response.status >= 500) {
          throw new Error(t("educational_system.server_error"));
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      }

      const result = await response.json();

      if (result.success) {
        onTypeChange?.(selectedType);
        toast.success(`✅ ${result.message}`);
        // Reload the page to reflect the new configuration
        setTimeout(() => {
          window.location.reload();
        }, 1500); // Give user time to see the success message
      } else {
        throw new Error(
          result.error || "Error desconocido al guardar la configuración",
        );
      }
    } catch (error) {
      console.error("Error saving configuration:", error);

      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        toast.error(t("educational_system.connection_error"));
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t("educational_system.unknown_error"));
      }
    } finally {
      setIsConfiguring(false);
    }
  };

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

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            {t("educational_system.title")}
          </CardTitle>
          <CardDescription>
            {t("educational_system.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {Object.entries(INSTITUTION_TYPE_INFO).map(([type, info]) => {
              const typedType = type as EducationalInstitutionType;
              const isSelected = selectedType === typedType;
              const isCurrent = currentType === typedType;

              return (
                <Card
                  key={type}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isSelected
                      ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/20 ring-2 ring-blue-200 dark:ring-blue-800"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                  }`}
                  onClick={() => handleTypeSelect(typedType)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getInstitutionIcon(typedType)}
                        <div>
                          <CardTitle className="text-lg">
                            {info.icon} {info.chileanName}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {info.name}
                          </CardDescription>
                        </div>
                      </div>
                      {isCurrent && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          {t("educational_system.current_type")}
                        </Badge>
                      )}
                      {isSelected && !isCurrent && (
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          {t("educational_system.select_type")}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {info.description}
                    </p>
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <strong>
                          {t("educational_system.levels_included")}:
                        </strong>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {info.levels.slice(0, 3).map((level) => (
                          <Badge
                            key={level.id}
                            variant="outline"
                            className="text-xs"
                          >
                            {level.chileanName}
                          </Badge>
                        ))}
                        {info.levels.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{info.levels.length - 3}{" "}
                            {t("educational_system.more_levels")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedType && (
            <div className="mt-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>
                      <strong>
                        {t("educational_system.selected_config")}:
                      </strong>{" "}
                      {INSTITUTION_TYPE_INFO[selectedType].chileanName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("educational_system.config_description")}{" "}
                      {INSTITUTION_TYPE_INFO[selectedType].levels.length}{" "}
                      {t("educational_system.educational_levels").toLowerCase()}{" "}
                      {t("common.and")}{" "}
                      {getSubjectsForInstitutionType(selectedType).length}{" "}
                      {t("educational_system.subject_areas").toLowerCase()}{" "}
                      {t("educational_system.specific").toLowerCase()}.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleSaveConfiguration}
              disabled={
                !selectedType || isConfiguring || selectedType === currentType
              }
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isConfiguring
                ? t("educational_system.configuring")
                : t("educational_system.apply_config")}
            </Button>

            {selectedType && selectedType !== currentType && (
              <Alert className="flex-1 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  {t("educational_system.changes_warning")}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information */}
      {selectedType && (
        <Card>
          <CardHeader>
            <CardTitle>
              {t("educational_system.config_details")}:{" "}
              {INSTITUTION_TYPE_INFO[selectedType].chileanName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">
                  {t("educational_system.educational_levels")}
                </h4>
                <div className="space-y-2">
                  {INSTITUTION_TYPE_INFO[selectedType].levels.map((level) => (
                    <div
                      key={level.id}
                      className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded"
                    >
                      <div>
                        <div className="font-medium text-sm">
                          {level.chileanName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {level.ages} • ISCED {level.isced}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">
                  {t("educational_system.subject_areas")}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {getSubjectsForInstitutionType(selectedType).map(
                    (subject) => (
                      <Badge
                        key={subject}
                        variant="secondary"
                        className="text-xs"
                      >
                        {subject}
                      </Badge>
                    ),
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
