/**
 * 🏛️ Institution Configuration Card
 * Master admin card for educational institution settings
 */

"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  School,
  GraduationCap,
  BookOpen,
  Building2,
  ChevronRight,
  Cog,
} from "lucide-react";
import {
  EducationalInstitutionType,
  INSTITUTION_TYPE_INFO,
} from "@/lib/educational-system";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

interface InstitutionConfigCardProps {
  currentType: EducationalInstitutionType;
  onConfigureClick: () => void;
}

export function InstitutionConfigCard({
  currentType,
  onConfigureClick,
}: InstitutionConfigCardProps) {
  const { t } = useDivineParsing(["common"]);
  const currentInfo = INSTITUTION_TYPE_INFO[currentType];

  const getInstitutionIcon = (type: EducationalInstitutionType) => {
    switch (type) {
      case "PRESCHOOL":
        return <School className="h-8 w-8" />;
      case "BASIC_SCHOOL":
        return <BookOpen className="h-8 w-8" />;
      case "HIGH_SCHOOL":
        return <GraduationCap className="h-8 w-8" />;
      case "UNIVERSITY":
        return <Building2 className="h-8 w-8" />;
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500 dark:border-l-blue-400 bg-linear-to-r from-blue-50/50 to-white dark:from-blue-950/20 dark:to-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              {getInstitutionIcon(currentType)}
            </div>
            <div>
              <CardTitle className="text-xl">
                {currentInfo.icon} {currentInfo.chileanName}
              </CardTitle>
              <CardDescription className="text-base">
                {t("educational_system.current_config")}
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={onConfigureClick}
            className="gap-2"
            variant="outline"
          >
            <Cog className="h-4 w-4" />
            {t("educational_system.configure")}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t("educational_system.institution_type")}
            </h4>
            <Badge className={currentInfo.color} variant="secondary">
              {currentInfo.name}
            </Badge>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {currentInfo.description}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t("educational_system.levels_available")}
            </h4>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {currentInfo.levels.length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("educational_system.levels_configured")}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t("educational_system.age_range")}
            </h4>
            <div className="text-sm text-gray-900 dark:text-gray-100">
              {currentInfo.levels[0]?.ages} -{" "}
              {currentInfo.levels[currentInfo.levels.length - 1]?.ages}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("educational_system.complete_coverage")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
