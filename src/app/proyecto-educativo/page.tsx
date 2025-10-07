// ⚡ Performance: PPR-optimized proyecto educativo page
"use client";

import { Suspense, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileIcons } from "@/components/icons/hero-icons";
import Header from "@/components/layout/Header";
import { FixedBackgroundLayout } from "@/components/layout/FixedBackgroundLayout";
import { useDesktopToggle } from "@/lib/hooks/useDesktopToggle";
import { layout, typography } from "@/lib/responsive-utils";
import { useDivineParsing } from "@/components/language/useDivineLanguage";

type VideoCapsule = {
  id: string;
  title: string;
  url: string;
  description?: string;
  isActive: boolean;
};

// ⚡ Performance: Dynamic components for PPR
import {
  DynamicVideoSection,
  VideoSectionSkeleton,
} from "@/components/proyecto-educativo/DynamicVideoSection";

export default function ProyectoEducativoPage() {
  // Layout and responsive state
  const { isDesktopForced } = useDesktopToggle();
  const { t } = useDivineParsing(["common"]);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Video capsule state
  const [videoCapsule, setVideoCapsule] = useState<VideoCapsule>({
    id: "default-capsule",
    title: "",
    url: "",
    description: "",
    isActive: false,
  });

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCapsule, setEditingCapsule] =
    useState<VideoCapsule>(videoCapsule);
  const [isSaving, setIsSaving] = useState(false);

  const loadVideoCapsule = async () => {
    try {
      const response = await fetch("/api/proyecto-educativo/video-capsule");
      if (response.ok) {
        const data = await response.json();
        if (data.videoCapsule) {
          setVideoCapsule(data.videoCapsule);
        }
      }
    } catch (error) {
      console.error("Error loading video capsule:", error);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadVideoCapsule();

    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleEdit = () => {
    setEditingCapsule(videoCapsule);
    setEditModalOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/proyecto-educativo/video-capsule", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingCapsule),
      });

      if (response.ok) {
        const data = await response.json();
        setVideoCapsule(data.videoCapsule);
        setEditModalOpen(false);
      }
    } catch (error) {
      console.error("Error saving video capsule:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(t("proyecto_educativo.delete_confirmation", "common"))) {
      try {
        const response = await fetch("/api/proyecto-educativo/video-capsule", {
          method: "DELETE",
        });

        if (response.ok) {
          setVideoCapsule({
            id: "default-capsule",
            title: t(
              "proyecto_educativo.video_capsule_default_title",
              "common",
            ),
            url: "",
            description: t(
              "proyecto_educativo.video_capsule_default_description",
              "common",
            ),
            isActive: false,
          });
        }
      } catch (error) {
        console.error("Error deleting video capsule:", error);
      }
    }
  };

  const getVideoEmbedUrl = (url: string) => {
    if (!url) return null;

    // YouTube
    if (url.includes("youtube.com/watch") || url.includes("youtu.be/")) {
      const videoId = url.includes("youtube.com/watch")
        ? url.split("v=")[1]?.split("&")[0]
        : url.split("youtu.be/")[1]?.split("?")[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    // Vimeo
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("/")[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }

    return null;
  };

  const embedUrl = getVideoEmbedUrl(videoCapsule.url);

  return (
    <FixedBackgroundLayout
      backgroundImage="/bg6.jpg"
      overlayType="gradient"
      responsivePositioning="default"
      pageTransitionProps={{
        skeletonType: "proyecto-educativo",
        duration: 700,
        enableProgressiveAnimation: true,
      }}
    >
      <Header />
      {/* Hero Section with Enhanced Background */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          {/* Removed problematic overlays that cause blur line effect */}
        </div>

        {/* Content Container */}
        <div className="relative z-10 px-4 py-12 sm:px-6 sm:py-16 lg:py-24">
          <div className={`${layout.container(isDesktopForced)} text-center`}>
            <div className="max-w-4xl mx-auto">
              {/* Animated Title */}
              <h1
                className={`${typography.heading(isDesktopForced)} font-bold text-white mb-6 sm:text-5xl lg:text-7xl drop-shadow-2xl transition-all duration-700 ease-out ${
                  mounted
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <span className="inline-block animate-fade-in-up bg-gradient-to-r from-pink-200 to-purple-200 bg-clip-text text-transparent">
                  {t("proyecto_educativo.title", "common")}
                </span>
              </h1>

              {/* Animated Subtitle */}
              <p
                className={`${typography.body(isDesktopForced)} text-white/90 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400 transition-all duration-700 ease-out delay-200 ${
                  mounted
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                {t("proyecto_educativo.description", "common")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div
        id="main-content"
        className={`${layout.container(isDesktopForced)} ${layout.spacing.section(isDesktopForced)} backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl mx-4 my-8 transition-all duration-700 ease-out delay-300 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="prose prose-gray dark:prose-invert max-w-none">
          {/* ⚡ Performance: PPR Dynamic Video Section - streams in after static content */}
          <Suspense fallback={<VideoSectionSkeleton />}>
            <DynamicVideoSection />
          </Suspense>

          {/* Main PDF Presentation Section - Enhanced */}
          <section className="py-4 sm:py-6 lg:py-8">
            <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="bg-gradient-to-r from-white/5 to-white/10 p-6">
                <CardHeader className="flex flex-row items-center gap-4 p-0">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <FileIcons.Document className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-white">
                      {t("proyecto_educativo.regulation_title", "common")}
                    </CardTitle>
                    <p className="text-sm text-gray-300 mt-1">
                      {t("proyecto_educativo.regulation_subtitle", "common")}
                    </p>
                  </div>
                </CardHeader>
              </div>

              <CardContent className="pt-6">
                <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-8 rounded-xl border border-primary/20 relative overflow-hidden">
                  {/* Background pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16" />
                  <div className="relative z-10">
                    <h3 className="text-lg font-semibold mb-3 text-white">
                      {t("proyecto_educativo.document_content_title", "common")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-gray-300">
                          {t("proyecto_educativo.document_item_1", "common")}
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-gray-300">
                          {t("proyecto_educativo.document_item_2", "common")}
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-gray-300">
                          {t("proyecto_educativo.document_item_3", "common")}
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-gray-300">
                          {t("proyecto_educativo.document_item_4", "common")}
                        </p>
                      </div>
                    </div>

                    <a
                      href="/uploads/reglamento-1.pdf"
                      download
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground rounded-full font-medium hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <FileIcons.Attachment className="w-5 h-5 mr-2" />
                      {t("proyecto_educativo.download_pdf", "common")}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Philosophical Foundation - Enhanced */}
          <section className="py-4 sm:py-6 lg:py-8">
            <Card className="border-primary/40 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
              <CardHeader className="border-b border-primary/10">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  {t("proyecto_educativo.philosophy_title", "common")}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("proyecto_educativo.philosophy_subtitle", "common")}
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-primary/5 to-purple-500/5 p-6 rounded-xl">
                    <p className="text-lg leading-relaxed text-foreground">
                      {t("proyecto_educativo.philosophy_description", "common")}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: t(
                          "proyecto_educativo.respect_development",
                          "common",
                        ),
                        description: t(
                          "proyecto_educativo.respect_development_desc",
                          "common",
                        ),
                        icon: "⏰",
                      },
                      {
                        title: t(
                          "proyecto_educativo.enhance_capabilities",
                          "common",
                        ),
                        description: t(
                          "proyecto_educativo.enhance_capabilities_desc",
                          "common",
                        ),
                        icon: "✨",
                      },
                      {
                        title: t(
                          "proyecto_educativo.integral_development",
                          "common",
                        ),
                        description: t(
                          "proyecto_educativo.integral_development_desc",
                          "common",
                        ),
                        icon: "🌱",
                      },
                      {
                        title: t(
                          "proyecto_educativo.collaborative_work",
                          "common",
                        ),
                        description: t(
                          "proyecto_educativo.collaborative_work_desc",
                          "common",
                        ),
                        icon: "🤝",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="bg-white/50 dark:bg-card/50 p-4 rounded-xl border border-primary/10 hover:border-primary/30 transition-all duration-300"
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{item.icon}</div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-1">
                              {item.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Educational Objectives - Enhanced */}
          <section className="py-4 sm:py-6 lg:py-8">
            <Card className="border-primary/40 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
              <CardHeader className="border-b border-primary/10">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  {t("proyecto_educativo.objectives_title", "common")}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("proyecto_educativo.objectives_subtitle", "common")}
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {" "}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-xl">
                      <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        🎯
                      </div>
                      <h3 className="font-semibold text-lg text-white">
                        {t("proyecto_educativo.general_objectives", "common")}
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {[
                        t("proyecto_educativo.objective_1", "common"),
                        t("proyecto_educativo.objective_2", "common"),
                        t("proyecto_educativo.objective_3", "common"),
                        t("proyecto_educativo.objective_4", "common"),
                        t("proyecto_educativo.objective_5", "common"),
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-white/10 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-all"
                        >
                          <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-medium text-white">
                              {index + 1}
                            </span>
                          </div>
                          <p className="text-sm text-white">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-xl">
                      <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        📝
                      </div>
                      <h3 className="font-semibold text-lg text-white">
                        {t("proyecto_educativo.specific_objectives", "common")}
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {[
                        t("proyecto_educativo.specific_objective_1", "common"),
                        t("proyecto_educativo.specific_objective_2", "common"),
                        t("proyecto_educativo.specific_objective_3", "common"),
                        t("proyecto_educativo.specific_objective_4", "common"),
                        t("proyecto_educativo.specific_objective_5", "common"),
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-white/10 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-all"
                        >
                          <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-medium text-white">
                              {index + 1}
                            </span>
                          </div>
                          <p className="text-sm text-white">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Methodological Approach */}
          <section className="py-2">
            <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  {t("proyecto_educativo.methodology_title", "common")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-white">
                      {t("proyecto_educativo.early_stimulation", "common")}
                    </h4>
                    <p className="text-sm text-gray-300">
                      {t("proyecto_educativo.early_stimulation_desc", "common")}
                    </p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-white">
                      {t("proyecto_educativo.individual_attention", "common")}
                    </h4>
                    <p className="text-sm text-gray-300">
                      {t(
                        "proyecto_educativo.individual_attention_desc",
                        "common",
                      )}
                    </p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-white">
                      {t("proyecto_educativo.continuous_evaluation", "common")}
                    </h4>
                    <p className="text-sm text-gray-300">
                      {t(
                        "proyecto_educativo.continuous_evaluation_desc",
                        "common",
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Team - Enhanced */}
          <section className="py-4 sm:py-6 lg:py-8">
            <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="border-b border-gray-700/50">
                <CardTitle className="text-2xl font-bold text-white">
                  {t("proyecto_educativo.multidisciplinary_team", "common")}
                </CardTitle>
                <p className="text-sm text-gray-300 mt-2">
                  {t("proyecto_educativo.team_subtitle", "common")}
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      title: t("proyecto_educativo.team_parvularia", "common"),
                      subtitle: t(
                        "proyecto_educativo.team_parvularia_subtitle",
                        "common",
                      ),
                      icon: "👩‍🏫",
                      description: t(
                        "proyecto_educativo.team_parvularia_desc",
                        "common",
                      ),
                    },
                    {
                      title: t("proyecto_educativo.team_therapist", "common"),
                      subtitle: t(
                        "proyecto_educativo.team_therapist_subtitle",
                        "common",
                      ),
                      icon: "🗣️",
                      description: t(
                        "proyecto_educativo.team_therapist_desc",
                        "common",
                      ),
                    },
                    {
                      title: t(
                        "proyecto_educativo.team_psychologist",
                        "common",
                      ),
                      subtitle: t(
                        "proyecto_educativo.team_psychologist_subtitle",
                        "common",
                      ),
                      icon: "🧠",
                      description: t(
                        "proyecto_educativo.team_psychologist_desc",
                        "common",
                      ),
                    },
                    {
                      title: t(
                        "proyecto_educativo.team_occupational",
                        "common",
                      ),
                      subtitle: t(
                        "proyecto_educativo.team_occupational_subtitle",
                        "common",
                      ),
                      icon: "🤲",
                      description: t(
                        "proyecto_educativo.team_occupational_desc",
                        "common",
                      ),
                    },
                  ].map((member, index) => (
                    <div
                      key={index}
                      className="bg-white/10 p-6 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-2xl">
                          {member.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">
                            {member.title}
                          </h4>
                          <p className="text-sm text-gray-300">
                            {member.subtitle}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-300 leading-relaxed">
                        {member.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-xl">
                  <p className="text-center text-sm text-gray-300">
                    <strong className="text-white">
                      {t(
                        "proyecto_educativo.collaborative_work_note",
                        "common",
                      )}
                    </strong>{" "}
                    {t("proyecto_educativo.team_meetings", "common")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("proyecto_educativo.edit_video_capsule", "common")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium">
                {t("proyecto_educativo.title_label", "common")}
              </label>
              <Input
                value={editingCapsule.title}
                onChange={(e) =>
                  setEditingCapsule({
                    ...editingCapsule,
                    title: e.target.value,
                  })
                }
                className="col-span-3"
                placeholder={t("forms.title_video.placeholder", "common")}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium">
                {t("proyecto_educativo.video_url_label", "common")}
              </label>
              <Input
                value={editingCapsule.url}
                onChange={(e) =>
                  setEditingCapsule({ ...editingCapsule, url: e.target.value })
                }
                className="col-span-3"
                placeholder={t("forms.video_url.placeholder", "common")}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium">
                {t("proyecto_educativo.description_label", "common")}
              </label>
              <Input
                value={editingCapsule.description || ""}
                onChange={(e) =>
                  setEditingCapsule({
                    ...editingCapsule,
                    description: e.target.value,
                  })
                }
                className="col-span-3"
                placeholder={t("forms.description.placeholder", "common")}
              />
            </div>
            <div className="flex items-center gap-4">
              <label htmlFor="active-checkbox" className="text-sm font-medium">
                {t("proyecto_educativo.active_label", "common")}
              </label>
              <input
                id="active-checkbox"
                type="checkbox"
                checked={editingCapsule.isActive}
                onChange={(e) =>
                  setEditingCapsule({
                    ...editingCapsule,
                    isActive: e.target.checked,
                  })
                }
                className="rounded border-gray-300"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                {t("common.cancel", "common")}
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving
                  ? t("proyecto_educativo.saving", "common")
                  : t("proyecto_educativo.save_changes", "common")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </FixedBackgroundLayout>
  );
}
