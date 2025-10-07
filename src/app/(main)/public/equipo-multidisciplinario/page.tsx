"use client";

import {
  TeamMemberList,
  type TeamMember,
} from "@/components/team/TeamMemberCard";
import { FixedBackgroundLayout } from "@/components/layout/FixedBackgroundLayout";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { useEffect, useState } from "react";

function EquipoMultidisciplinarioContent({
  members,
}: {
  members: TeamMember[];
}) {
  const { t } = useDivineParsing(["common"]);

  return (
    <>
      {/* Hero Section with Background Image */}
      <div className="relative overflow-hidden">
        <div className="relative z-10 px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-6 sm:text-5xl lg:text-6xl">
              {t("team.title", "common")}
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              {t("team.description", "common")}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8 py-8">
          <div className="px-4 sm:px-0">
            <TeamMemberList
              members={members}
              variant="public"
              gridColumns={3}
              showContact={false}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default function EquipoMultidisciplinarioPage() {
  const { t } = useDivineParsing(["common"]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const response = await fetch("/api/team-members");
        if (!response.ok) {
          throw new Error("Failed to fetch team members");
        }
        const result = await response.json();
        setMembers(result.data);
      } catch (err) {
        console.error("Error loading team members:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">{t("common.loading", "common")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {t("team.error_loading", "common")}
          </h1>
        </div>
      </div>
    );
  }

  return (
    <FixedBackgroundLayout
      backgroundImage="/bg1.jpg"
      overlayType="gradient"
      responsivePositioning="default"
      pageTransitionProps={{
        skeletonType: "equipo-multidisciplinario",
        duration: 700,
        enableProgressiveAnimation: true,
      }}
    >
      <EquipoMultidisciplinarioContent members={members} />
    </FixedBackgroundLayout>
  );
}
