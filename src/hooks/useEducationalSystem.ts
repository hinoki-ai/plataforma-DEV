/**
 * 🎓 Educational System Hook
 * React hook for managing educational institution configuration
 */

import { useState, useEffect } from "react";
import {
  EducationalInstitutionType,
  INSTITUTION_TYPE_INFO,
} from "@/lib/educational-system";
import { toast } from "sonner";
import { useLanguage } from "@/components/language/LanguageContext";

interface EducationalSystemState {
  currentType: EducationalInstitutionType;
  isLoading: boolean;
  error: string | null;
  settings: any;
}

export function useEducationalSystem() {
  const { t } = useLanguage();
  const [state, setState] = useState<EducationalSystemState>({
    currentType: "PRESCHOOL",
    isLoading: true,
    error: null,
    settings: null,
  });

  // Load current configuration
  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch("/api/educational-system");
      const data = await response.json();

      if (data.success) {
        setState({
          currentType: data.institutionType,
          settings: data.settings,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(data.error || t("educational_system.config_failed"));
      }
    } catch (error) {
      console.error("Error loading educational configuration:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : t("educational_system.config_failed"),
      }));

      // Use default fallback
      setState((prev) => ({
        ...prev,
        currentType: "PRESCHOOL",
        isLoading: false,
      }));
    }
  };

  const updateInstitutionType = async (newType: EducationalInstitutionType) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch("/api/educational-system", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ institutionType: newType }),
      });

      const data = await response.json();

      if (data.success) {
        setState((prev) => ({
          ...prev,
          currentType: newType,
          isLoading: false,
        }));

        toast.success(data.message);

        // Reload page to update all components
        window.location.reload();

        return { success: true };
      } else {
        throw new Error(data.error || t("educational_system.config_error"));
      }
    } catch (error) {
      console.error("Error updating institution type:", error);
      const errorMessage =
        error instanceof Error ? error.message : t("educational_system.config_error");
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error(t("educational_system.config_error"));
      return { success: false, error: errorMessage };
    }
  };

  const getCurrentInfo = () => {
    return INSTITUTION_TYPE_INFO[state.currentType];
  };

  const isFeatureEnabled = (feature: string): boolean => {
    // Feature matrix - could be moved to settings
    const featureMatrix: Record<string, string[]> = {
      parent_meetings: ["PRESCHOOL", "BASIC_SCHOOL", "HIGH_SCHOOL"],
      academic_planning: ["BASIC_SCHOOL", "HIGH_SCHOOL", "TECHNICAL_INSTITUTE", "TECHNICAL_CENTER", "UNIVERSITY"],
      grading_system: ["BASIC_SCHOOL", "HIGH_SCHOOL", "TECHNICAL_INSTITUTE", "TECHNICAL_CENTER", "UNIVERSITY"],
      daycare_features: ["PRESCHOOL"],
      university_features: ["UNIVERSITY"],
      technical_training: ["HIGH_SCHOOL", "TECHNICAL_INSTITUTE", "TECHNICAL_CENTER", "UNIVERSITY"],
      thesis_management: ["TECHNICAL_INSTITUTE", "TECHNICAL_CENTER", "UNIVERSITY"],
      play_based_learning: ["PRESCHOOL"],
      career_guidance: ["HIGH_SCHOOL", "TECHNICAL_INSTITUTE", "TECHNICAL_CENTER", "UNIVERSITY"],
      research_projects: ["TECHNICAL_INSTITUTE", "TECHNICAL_CENTER", "UNIVERSITY"],
      laboratory_access: ["HIGH_SCHOOL", "TECHNICAL_INSTITUTE", "TECHNICAL_CENTER", "UNIVERSITY"],
      certification_programs: ["TECHNICAL_INSTITUTE", "TECHNICAL_CENTER"],
      postgraduate_programs: ["UNIVERSITY"],
      technical_specialization: ["TECHNICAL_INSTITUTE", "TECHNICAL_CENTER"],
    };

    return featureMatrix[feature]?.includes(state.currentType) ?? true;
  };

  return {
    ...state,
    updateInstitutionType,
    loadConfiguration,
    getCurrentInfo,
    isFeatureEnabled,

    // Helper functions
    getLevels: () => getCurrentInfo().levels,
    getDescription: () => getCurrentInfo().description,
    getIcon: () => getCurrentInfo().icon,
    getColor: () => getCurrentInfo().color,
  };
}
