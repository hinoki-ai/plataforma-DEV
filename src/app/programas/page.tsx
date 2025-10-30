"use client";

import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { useLanguage } from "@/components/language/LanguageContext";
import MinEducFooter from "@/components/layout/MinEducFooter";
import CompactFooter from "@/components/layout/CompactFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart3,
  Calendar,
  Compass,
  FileText,
  GraduationCap,
  Handshake,
  Layers,
  Lightbulb,
  MessageSquare,
  Rocket,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  INSTITUTION_TYPE_INFO,
  getGradesForInstitutionType,
  getSubjectsForInstitutionType,
  type EducationalInstitutionType,
} from "@/lib/educational-system";

// Note: Metadata removed because this is now a client component for i18n support
// If metadata is needed, consider using a layout or moving to a server component with different i18n approach

const heroHighlights = [
  {
    icon: ShieldCheck,
    titleKey: "programas.hardcoded.hero_highlights.governance.title",
    descriptionKey:
      "programas.hardcoded.hero_highlights.governance.description",
  },
  {
    icon: Calendar,
    titleKey: "programas.hardcoded.hero_highlights.calendar.title",
    descriptionKey: "programas.hardcoded.hero_highlights.calendar.description",
  },
  {
    icon: Layers,
    titleKey: "programas.hardcoded.hero_highlights.coverage.title",
    descriptionKey: "programas.hardcoded.hero_highlights.coverage.description",
  },
];

const institutionProgramDetails: Record<
  EducationalInstitutionType,
  {
    icon: LucideIcon;
    taglineKey: string;
    modulesKey: string;
  }
> = {
  PRESCHOOL: {
    icon: Sparkles,
    taglineKey: "programas.hardcoded.institution_programs.preschool.tagline",
    modulesKey: "programas.hardcoded.institution_programs.preschool.modules",
  },
  BASIC_SCHOOL: {
    icon: Lightbulb,
    taglineKey: "programas.hardcoded.institution_programs.basic_school.tagline",
    modulesKey: "programas.hardcoded.institution_programs.basic_school.modules",
  },
  HIGH_SCHOOL: {
    icon: Layers,
    taglineKey: "programas.hardcoded.institution_programs.high_school.tagline",
    modulesKey: "programas.hardcoded.institution_programs.high_school.modules",
  },
  TECHNICAL_INSTITUTE: {
    icon: Wrench,
    taglineKey:
      "programas.hardcoded.institution_programs.technical_institute.tagline",
    modulesKey:
      "programas.hardcoded.institution_programs.technical_institute.modules",
  },
  TECHNICAL_CENTER: {
    icon: Settings,
    taglineKey:
      "programas.hardcoded.institution_programs.technical_center.tagline",
    modulesKey:
      "programas.hardcoded.institution_programs.technical_center.modules",
  },
  UNIVERSITY: {
    icon: GraduationCap,
    taglineKey: "programas.hardcoded.institution_programs.university.tagline",
    modulesKey: "programas.hardcoded.institution_programs.university.modules",
  },
};

const institutionPrograms = (
  Object.entries(INSTITUTION_TYPE_INFO) as Array<
    [
      EducationalInstitutionType,
      (typeof INSTITUTION_TYPE_INFO)[EducationalInstitutionType],
    ]
  >
).map(([type, info]) => {
  const details = institutionProgramDetails[type];
  const grades = getGradesForInstitutionType(type);
  const subjects = getSubjectsForInstitutionType(type).slice(0, 4);
  const levelRange = info.levels.length
    ? info.levels.length > 1
      ? `${info.levels[0].chileanName} → ${info.levels[info.levels.length - 1].chileanName}`
      : info.levels[0].chileanName
    : info.chileanName;

  return {
    type,
    title: info.chileanName,
    description: info.description,
    icon: details.icon,
    taglineKey: details.taglineKey,
    modulesKey: details.modulesKey,
    subjects,
    levelRange,
    grades,
  };
});

const roleDashboards = [
  {
    id: "admin",
    icon: ShieldCheck,
    titleKey: "programas.hardcoded.role_dashboards.admin.title",
    descriptionKey: "programas.hardcoded.role_dashboards.admin.description",
    modulesKey: "programas.hardcoded.role_dashboards.admin.modules",
  },
  {
    id: "profesor",
    icon: Lightbulb,
    titleKey: "programas.hardcoded.role_dashboards.profesor.title",
    descriptionKey: "programas.hardcoded.role_dashboards.profesor.description",
    modulesKey: "programas.hardcoded.role_dashboards.profesor.modules",
  },
  {
    id: "parent",
    icon: Handshake,
    titleKey: "programas.hardcoded.role_dashboards.parent.title",
    descriptionKey: "programas.hardcoded.role_dashboards.parent.description",
    modulesKey: "programas.hardcoded.role_dashboards.parent.modules",
  },
];

const platformModules = [
  {
    icon: Calendar,
    titleKey: "programas.hardcoded.platform_modules.calendar.title",
    descriptionKey: "programas.hardcoded.platform_modules.calendar.description",
    href: "/admin/calendario-escolar",
  },
  {
    icon: FileText,
    titleKey: "programas.hardcoded.platform_modules.planning.title",
    descriptionKey: "programas.hardcoded.platform_modules.planning.description",
    href: "/profesor/planificaciones",
  },
  {
    icon: BarChart3,
    titleKey: "programas.hardcoded.platform_modules.pme.title",
    descriptionKey: "programas.hardcoded.platform_modules.pme.description",
    href: "/admin/pme",
  },
  {
    icon: MessageSquare,
    titleKey: "programas.hardcoded.platform_modules.meetings.title",
    descriptionKey: "programas.hardcoded.platform_modules.meetings.description",
    href: "/admin/reuniones",
  },
  {
    icon: ShieldCheck,
    titleKey: "programas.hardcoded.platform_modules.documents.title",
    descriptionKey:
      "programas.hardcoded.platform_modules.documents.description",
    href: "/admin/documentos",
  },
  {
    icon: Users,
    titleKey: "programas.hardcoded.platform_modules.voting.title",
    descriptionKey: "programas.hardcoded.platform_modules.voting.description",
    href: "/admin/votaciones",
  },
];

const implementationPhases = [
  {
    icon: Compass,
    titleKey: "programas.hardcoded.implementation_phases.diagnosis.title",
    durationKey: "programas.hardcoded.implementation_phases.diagnosis.duration",
    descriptionKey:
      "programas.hardcoded.implementation_phases.diagnosis.description",
    focusKey: "programas.hardcoded.implementation_phases.diagnosis.focus",
  },
  {
    icon: Layers,
    titleKey: "programas.hardcoded.implementation_phases.data_load.title",
    durationKey: "programas.hardcoded.implementation_phases.data_load.duration",
    descriptionKey:
      "programas.hardcoded.implementation_phases.data_load.description",
    focusKey: "programas.hardcoded.implementation_phases.data_load.focus",
  },
  {
    icon: Rocket,
    titleKey: "programas.hardcoded.implementation_phases.deployment.title",
    durationKey:
      "programas.hardcoded.implementation_phases.deployment.duration",
    descriptionKey:
      "programas.hardcoded.implementation_phases.deployment.description",
    focusKey: "programas.hardcoded.implementation_phases.deployment.focus",
  },
  {
    icon: BarChart3,
    titleKey: "programas.hardcoded.implementation_phases.monitoring.title",
    durationKey:
      "programas.hardcoded.implementation_phases.monitoring.duration",
    descriptionKey:
      "programas.hardcoded.implementation_phases.monitoring.description",
    focusKey: "programas.hardcoded.implementation_phases.monitoring.focus",
  },
];

const supportHighlights = [
  {
    titleKey: "programas.hardcoded.support.dedicated_team.title",
    descriptionKey: "programas.hardcoded.support.dedicated_team.description",
    bulletsKey: "programas.hardcoded.support.dedicated_team.bullets",
  },
  {
    titleKey: "programas.hardcoded.support.operational.title",
    descriptionKey: "programas.hardcoded.support.operational.description",
    bulletsKey: "programas.hardcoded.support.operational.bullets",
  },
  {
    titleKey: "programas.hardcoded.support.community.title",
    descriptionKey: "programas.hardcoded.support.community.description",
    bulletsKey: "programas.hardcoded.support.community.bullets",
  },
];

const impactHighlightsKey = "programas.hardcoded.impact_highlights";

// Helper function to safely get translation arrays
const getTranslationArray = (t: any, key: string): string[] => {
  try {
    const result = t(key);
    if (Array.isArray(result)) {
      return result;
    }
    // Fallback: try to access the translation directly from the hardcoded section
    // This handles the case where the translation system doesn't work during SSG
    const keys = key.split(".");
    let value: any = t("programas.hardcoded");
    for (const k of keys.slice(2)) {
      // Skip 'programas.hardcoded'
      value = value?.[k];
    }
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

export default function ProgramasPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-responsive-desktop bg-programas flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-16 flex-1">
        <div className="max-w-6xl mx-auto space-y-16">
          <section className="text-center space-y-6">
            <div className="space-y-4">
              <div className="backdrop-blur-md bg-white/5 dark:bg-black/20 rounded-2xl border border-white/10 dark:border-white/5 shadow-2xl p-6 mx-auto inline-block">
                <h1 className="text-center text-4xl font-bold leading-tight text-gray-900 dark:text-white drop-shadow-2xl transition-all duration-700 ease-out md:text-5xl">
                  {t("programas.hero.title")}
                </h1>
              </div>
              <p className="text-lg md:text-xl text-foreground/90 max-w-3xl mx-auto leading-relaxed">
                {t("programas.hero.description")}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link href="/contacto">
                  {t("programas.request_presentation")}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                <Link href="/programas/explorador">
                  {t("programas.explorer.cta")}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-background/70"
              >
                <Link href="/docs">{t("programas.view_specs")}</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 pt-6">
              {heroHighlights.map(
                ({ icon: Icon, titleKey, descriptionKey }) => (
                  <div
                    key={titleKey}
                    className="backdrop-blur-xl bg-card/80 border border-border/60 rounded-2xl shadow-2xl p-5 flex flex-col items-center text-center"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary mb-3">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      {t(titleKey)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t(descriptionKey)}
                    </p>
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-semibold text-foreground">
                {t("programas.institution_programs.title")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("programas.institution_programs.subtitle")}
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {institutionPrograms.map(
                ({
                  type,
                  icon: Icon,
                  title,
                  taglineKey,
                  description,
                  modulesKey,
                  subjects,
                  levelRange,
                  grades,
                }) => (
                  <Card
                    key={type}
                    className="relative backdrop-blur-xl bg-card/80 border border-border/60 rounded-2xl shadow-2xl flex flex-col"
                  >
                    <CardHeader className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                          <Icon className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-foreground">
                            {title}
                          </CardTitle>
                          <p className="text-xs uppercase tracking-wide text-primary">
                            {levelRange}
                          </p>
                        </div>
                      </div>
                      <CardDescription className="text-base text-muted-foreground">
                        {t(taglineKey)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge
                          variant="secondary"
                          className="bg-white/5 border border-white/10"
                        >
                          {description}
                        </Badge>
                        {grades.length > 0 && (
                          <Badge
                            variant="outline"
                            className="bg-white/5 border border-white/10"
                          >
                            {grades.slice(0, 3).join(" • ")}
                            {grades.length > 3 ? "…" : ""}
                          </Badge>
                        )}
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {getTranslationArray(t, modulesKey).map(
                          (item: string) => (
                            <li key={item} className="flex gap-2 text-left">
                              <span
                                className="mt-1 h-2 w-2 rounded-full bg-primary"
                                aria-hidden="true"
                              />
                              <span>{item}</span>
                            </li>
                          ),
                        )}
                      </ul>
                      {subjects.length > 0 && (
                        <div className="pt-2 border-t border-border/40">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                            {t(
                              "programas.institution_programs.curricular_focus",
                            )}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {subjects.map((subject) => (
                              <span
                                key={subject}
                                className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs text-foreground border border-white/10"
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
          </section>

          <section className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-semibold text-foreground">
                {t("programas.role_dashboards.title")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("programas.role_dashboards.subtitle")}
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {roleDashboards.map(
                ({ id, icon: Icon, titleKey, descriptionKey, modulesKey }) => (
                  <Card
                    key={id}
                    className="backdrop-blur-xl bg-card/80 border border-border/60 rounded-2xl shadow-2xl h-full flex flex-col"
                  >
                    <CardHeader className="space-y-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <CardTitle className="text-xl text-foreground">
                        {t(titleKey)}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {t(descriptionKey)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 flex-1">
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {getTranslationArray(t, modulesKey).map(
                          (item: string) => (
                            <li key={item} className="flex gap-2">
                              <span
                                className="mt-1 h-2 w-2 rounded-full bg-primary"
                                aria-hidden="true"
                              />
                              <span>{item}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
          </section>

          <section className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-semibold text-foreground">
                {t("programas.platform_modules.title")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("programas.platform_modules.subtitle")}
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {platformModules.map(
                ({ icon: Icon, titleKey, descriptionKey, href }) => (
                  <Card
                    key={titleKey}
                    className="backdrop-blur-xl bg-card/80 border border-border/60 rounded-2xl shadow-2xl h-full"
                  >
                    <CardHeader>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary mb-3">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <CardTitle className="text-lg text-foreground">
                        {t(titleKey)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="text-sm text-muted-foreground">
                        {t(descriptionKey)}
                      </CardDescription>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={href}>
                          {t("programas.platform_modules.see_in_action")}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
          </section>

          <section className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-semibold text-foreground">
                {t("programas.implementation_phases.title")}
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                {t("programas.implementation_phases.subtitle")}
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2">
              {implementationPhases.map(
                (
                  {
                    icon: Icon,
                    titleKey,
                    durationKey,
                    descriptionKey,
                    focusKey,
                  },
                  index,
                ) => (
                  <Card
                    key={titleKey}
                    className="backdrop-blur-xl bg-card/80 border border-border/60 rounded-2xl shadow-2xl h-full"
                  >
                    <CardHeader className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-lg text-foreground">
                            {t(titleKey)}
                          </CardTitle>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {t(durationKey)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t(descriptionKey)}
                      </p>
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {t(focusKey)}
                      </div>
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
          </section>

          <section className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-semibold text-foreground">
                {t("programas.support.title")}
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                {t("programas.support.subtitle")}
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {supportHighlights.map(
                ({ titleKey, descriptionKey, bulletsKey }) => (
                  <Card
                    key={titleKey}
                    className="backdrop-blur-xl bg-card/80 border border-border/60 rounded-2xl shadow-2xl h-full"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg text-foreground">
                        {t(titleKey)}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {t(descriptionKey)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                      {getTranslationArray(t, bulletsKey).map(
                        (item: string) => (
                          <div key={item} className="flex gap-2">
                            <span
                              className="mt-1 h-2 w-2 rounded-full bg-primary"
                              aria-hidden="true"
                            />
                            <span>{item}</span>
                          </div>
                        ),
                      )}
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
          </section>

          <section className="relative overflow-hidden rounded-3xl border border-border/60 backdrop-blur-xl bg-card/80 shadow-2xl">
            <div
              className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/5 to-transparent"
              aria-hidden="true"
            />
            <div className="relative grid gap-8 lg:grid-cols-[1.2fr,1fr] p-10 md:p-14">
              <div className="space-y-6">
                <Badge className="bg-primary text-primary-foreground uppercase tracking-wide">
                  {t("programas.impact.badge")}
                </Badge>
                <h2 className="text-3xl font-semibold text-foreground">
                  {t("programas.impact.title")}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {t("programas.impact.description")}
                </p>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {getTranslationArray(t, impactHighlightsKey).map(
                    (item: string) => (
                      <li key={item} className="flex gap-2">
                        <span
                          className="mt-1 h-2 w-2 rounded-full bg-primary"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {platformModules.slice(0, 4).map(({ titleKey }) => (
                  <div
                    key={titleKey}
                    className="rounded-2xl border border-white/20 bg-white/10 p-5 text-sm text-foreground font-medium"
                  >
                    {t(titleKey)}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="text-center space-y-6">
            <h2 className="text-3xl font-semibold text-foreground">
              {t("programas.cta.title")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("programas.cta.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link href="/contacto">{t("programas.schedule_meeting")}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/docs#programas">
                  {t("programas.cta.download_specs")}
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </main>
      <MinEducFooter />
      <CompactFooter />
    </div>
  );
}
