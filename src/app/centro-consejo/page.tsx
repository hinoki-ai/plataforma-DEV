"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useResponsiveMode } from "@/lib/hooks/useDesktopToggle";
import { typography, layout } from "@/lib/responsive-utils";
import { motion, AnimatePresence, Variants } from "motion/react";
import Header from "@/components/layout/Header";

import {
  Users,
  Shield,
  Sparkles,
  ArrowRight,
  Calendar,
  MessageCircle,
  Award,
  BookOpen,
  UsersRound,
  Handshake,
  Phone,
  Mail,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UnifiedSignupForm } from "@/components/UnifiedSignupForm";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { FileIcons } from "@/components/icons/hero-icons";

// Dynamic components for educational project content
import {
  DynamicVideoSection,
  VideoSectionSkeleton,
} from "@/components/proyecto-educativo/DynamicVideoSection";

type VideoCapsule = {
  id: string;
  title: string;
  url: string;
  description?: string;
  isActive: boolean;
};

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerChildren: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Testimonial avatars mapping
const testimonialAvatars = {
  maria_gonzalez: "👩‍👧",
  carlos_rodriguez: "👨‍👦",
  ana_silva: "👩‍👧‍👦",
  pedro_morales: "👨‍👧",
  isabel_fernandez: "👩‍👦",
  roberto_jimenez: "👨‍👧‍👦",
  carmen_vega: "👩‍👧‍👧",
  miguel_torres: "👨‍👦‍👦",
  patricia_lopez: "👩‍👧‍👦",
  francisco_herrera: "👨‍👧",
  sofia_mendoza: "👩‍👦",
  diego_castro: "👨‍👧‍👦",
  valentina_ruiz: "👩‍👧‍👧",
  andres_moreno: "👨‍👦‍👦",
  daniela_paredes: "👩‍👧‍👦",
};

export default function CentroConsejoPage() {
  const { t } = useDivineParsing(["common"]);
  const { isDesktopForced } = useResponsiveMode();
  const [mounted, setMounted] = useState(false);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  // Video capsule state for educational project content
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

  const features = [
    {
      icon: UsersRound,
      title: t("centro_consejo.feature_community", "common"),
      description: t("centro_consejo.feature_community_desc", "common"),
      color: "text-blue-600",
    },
    {
      icon: Shield,
      title: t("centro_consejo.feature_transparency", "common"),
      description: t("centro_consejo.feature_transparency_desc", "common"),
      color: "text-green-600",
    },
    {
      icon: BookOpen,
      title: t("centro_consejo.feature_resources", "common"),
      description: t("centro_consejo.feature_resources_desc", "common"),
      color: "text-purple-600",
    },
    {
      icon: Handshake,
      title: t("centro_consejo.feature_support", "common"),
      description: t("centro_consejo.feature_support_desc", "common"),
      color: "text-pink-600",
    },
    {
      icon: Calendar,
      title: t("centro_consejo.feature_participation", "common"),
      description: t("centro_consejo.feature_participation_desc", "common"),
      color: "text-orange-600",
    },
    {
      icon: Award,
      title: t("centro_consejo.feature_recognition", "common"),
      description: t("centro_consejo.feature_recognition_desc", "common"),
      color: "text-indigo-600",
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-rotate testimonials every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prev) => {
        const nextIndex = prev + 3;
        const testimonials = getTestimonials();
        return nextIndex >= testimonials.length ? 0 : nextIndex;
      });
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  // Load video capsule for educational project content
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
    loadVideoCapsule();
  }, []);

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

  // Get testimonials from translations
  const getTestimonials = () => {
    const testimonialKeys = [
      "maria_gonzalez",
      "carlos_rodriguez",
      "ana_silva",
      "pedro_morales",
      "isabel_fernandez",
      "roberto_jimenez",
      "carmen_vega",
      "miguel_torres",
      "patricia_lopez",
      "francisco_herrera",
      "sofia_mendoza",
      "diego_castro",
      "valentina_ruiz",
      "andres_moreno",
      "daniela_paredes",
    ];

    const testimonials = testimonialKeys.map((key) => {
      const name = t(`centro_consejo.testimonials.${key}.name`, "common");
      const role = t(`centro_consejo.testimonials.${key}.role`, "common");
      const content = t(`centro_consejo.testimonials.${key}.content`, "common");

      return {
        id: key,
        name,
        role,
        content,
        avatar:
          testimonialAvatars[key as keyof typeof testimonialAvatars] || "👤",
      };
    });

    return testimonials;
  };

  // Get current 3 testimonials to display
  const getCurrentTestimonials = () => {
    const testimonials = getTestimonials();
    const indices = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentTestimonialIndex + i) % testimonials.length;
      indices.push(index);
    }
    return indices.map((index) => testimonials[index]);
  };

  return (
    <div
      className="min-h-screen bg-responsive-desktop"
      style={{ "--bg-image": "url(/bg3.jpg)" } as React.CSSProperties}
    >
      <div className="min-h-screen bg-gradient-to-b from-black/30 via-black/20 to-black/40">
        <Header />
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="relative z-10 px-4 py-12 sm:px-6 sm:py-16 lg:py-24">
            <div className={`${layout.container(isDesktopForced)} text-center`}>
              <motion.div
                initial="initial"
                animate="animate"
                variants={staggerChildren}
                className="max-w-4xl mx-auto"
              >
                <motion.h1
                  variants={fadeInUp}
                  className={`${typography.heading(isDesktopForced)} font-bold text-white mb-6 transition-all duration-700 ease-out ${
                    mounted
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  {t("centro_consejo.title", "common")}
                </motion.h1>

                {/* Signup Form Section */}
                <motion.div
                  variants={fadeInUp}
                  className={`mt-8 transition-all duration-700 ease-out delay-400 ${
                    mounted
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  <div
                    className={`grid ${isDesktopForced ? "grid-cols-3" : "grid-cols-1 lg:grid-cols-3"} gap-6 items-stretch`}
                  >
                    {/* Unified Signup Form - Left Column (2/3 width) */}
                    <div
                      className={`${isDesktopForced ? "col-span-2" : "col-span-1 lg:col-span-2"} flex`}
                    >
                      <UnifiedSignupForm />
                    </div>

                    {/* Testimonials - Right Column (1/3 width) */}
                    <div
                      className={`${isDesktopForced ? "col-span-1" : "col-span-1 lg:col-span-1"}`}
                    >
                      {/* Testimonials container matching form height */}
                      <div className="relative h-full flex flex-col">
                        <AnimatePresence mode="wait">
                          <div className="flex flex-col gap-3 h-full justify-between">
                            {getCurrentTestimonials().map(
                              (testimonial, index) => (
                                <motion.div
                                  key={`${testimonial.id}-${currentTestimonialIndex}-${index}`}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                  transition={{
                                    duration: 0.6,
                                    ease: "easeInOut",
                                    delay: index * 0.1,
                                  }}
                                  className="flex-1 flex"
                                >
                                  <Card className="bg-gray-900/80 backdrop-blur-xl shadow-2xl border border-gray-700/50 hover:bg-gray-800/80 transition-all duration-300 w-full flex flex-col">
                                    <CardContent className="pt-5 pb-5 px-6 flex-1 flex flex-col justify-center">
                                      <div className="flex items-center gap-3 mb-4">
                                        <div className="text-3xl">
                                          {testimonial.avatar}
                                        </div>
                                        <div className="flex-1">
                                          <h4 className="font-semibold text-white text-lg leading-tight">
                                            {testimonial.name}
                                          </h4>
                                          <p className="text-base text-white/70">
                                            {testimonial.role}
                                          </p>
                                        </div>
                                      </div>
                                      <p className="text-white/90 leading-relaxed text-lg line-clamp-4">
                                        &ldquo;{testimonial.content}&rdquo;
                                      </p>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              ),
                            )}
                          </div>
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          className={`${layout.spacing.section(isDesktopForced)} transition-all duration-700 ease-out delay-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className={`${layout.container(isDesktopForced)}`}>
            <div className="text-center mb-12">
              <h2
                className={`${typography.heading(isDesktopForced)} font-bold text-white mb-4`}
              >
                {t("centro_consejo.subtitle", "common")}
              </h2>
              <p
                className={`${typography.body(isDesktopForced)} text-white/80 max-w-2xl mx-auto`}
              >
                {t("centro_consejo.description", "common")}
              </p>
            </div>

            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerChildren}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {features.map((feature, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="backdrop-blur-xl bg-white/10 border-white/20 hover:bg-white/15 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 bg-white/20 rounded-lg ${feature.color}`}
                        >
                          <feature.icon className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-white">
                          {feature.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-white/80">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Educational Project Content */}
        <div
          className={`${layout.container(isDesktopForced)} ${layout.spacing.section(isDesktopForced)}`}
        >
          {/* Video Section */}
          <Suspense fallback={<VideoSectionSkeleton />}>
            <DynamicVideoSection />
          </Suspense>

          {/* Main PDF Presentation Section */}
          <section className="py-4 sm:py-6 lg:py-8">
            <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden">
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
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground rounded-full font-medium hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300 shadow-lg"
                    >
                      <FileIcons.Attachment className="w-5 h-5 mr-2" />
                      {t("proyecto_educativo.download_pdf", "common")}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Philosophical Foundation */}
          <section className="py-4 sm:py-6 lg:py-8">
            <Card className="border-primary/40 shadow-xl transition-all duration-300 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
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

          {/* Educational Objectives */}
          <section className="py-4 sm:py-6 lg:py-8">
            <Card className="border-primary/40 shadow-xl transition-all duration-300 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
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
            <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl transition-all duration-300">
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

          {/* Team */}
          <section className="py-4 sm:py-6 lg:py-8">
            <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl transition-all duration-300">
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
                      className="bg-white/10 p-6 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300"
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

        {/* Edit Modal for Video Capsule */}
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
                    setEditingCapsule({
                      ...editingCapsule,
                      url: e.target.value,
                    })
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
                <label
                  htmlFor="active-checkbox"
                  className="text-sm font-medium"
                >
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
                <Button
                  variant="outline"
                  onClick={() => setEditModalOpen(false)}
                >
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

        {/* Footer with proper contrast and accessibility */}
        <footer
          className={`bg-gray-900/95 backdrop-blur-sm text-white py-12 transition-all duration-700 ease-out delay-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          role="contentinfo"
          aria-label={t("centro_consejo.footer.contact_info_aria", "common")}
        >
          <div className={layout.container(isDesktopForced)}>
            <div
              className={
                isDesktopForced
                  ? "grid grid-cols-3 gap-8"
                  : "grid grid-cols-1 md:grid-cols-3 gap-8"
              }
            >
              <div>
                <h3 className="text-xl font-bold mb-4 text-white">
                  {t("centro_consejo.footer.title", "common")}
                </h3>
                <p className="text-gray-300 mb-4">
                  {t("centro_consejo.footer.description", "common")}
                </p>
                <div className="space-y-2 text-gray-300">
                  <p>📍 Anibal Pinto Nº 160, Los Sauces, Chile</p>
                  <p>📞 (45) 278 3486</p>
                  <p>✉️ centrodepadres@plataforma-astral.com</p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4 text-white">
                  {t("centro_consejo.footer.quick_access", "common")}
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/centro-consejo/dashboard"
                      className="text-gray-300 hover:text-white transition duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                      aria-label={t(
                        "centro_consejo.footer.dashboard_aria",
                        "common",
                      )}
                    >
                      {t("centro_consejo.footer.dashboard_link", "common")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/centro-consejo/profile"
                      className="text-gray-300 hover:text-white transition duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                      aria-label={t(
                        "centro_consejo.footer.profile_aria",
                        "common",
                      )}
                    >
                      {t("centro_consejo.footer.profile_link", "common")}
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4 text-white">
                  {t("centro_consejo.footer.schedule_title", "common")}
                </h4>
                <ul className="space-y-2 text-gray-300">
                  <li>{t("centro_consejo.footer.meetings", "common")}</li>
                  <li>{t("centro_consejo.footer.time", "common")}</li>
                  <li>{t("centro_consejo.footer.location", "common")}</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-700 mt-8 pt-8 text-center">
              <p className="text-gray-300 pb-3">
                {t("centro_consejo.footer.school_info", "common")}
              </p>
              <p className="text-gray-300 pb-3">
                {t("centro_consejo.footer.copyright", "common").replace(
                  "{year}",
                  new Date().getFullYear().toString(),
                )}
              </p>
              <p className="text-gray-300">
                {t("centro_consejo.footer.part_of", "common")}{" "}
                <Link
                  href="/"
                  className="text-gray-300 hover:text-white transition duration-200 underline focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                  aria-label={t(
                    "centro_consejo.footer.home_link_aria",
                    "common",
                  )}
                >
                  Plataforma Institucional Astral
                </Link>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
