"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useResponsiveMode } from "@/lib/hooks/useDesktopToggle";
import { typography, layout } from "@/lib/responsive-utils";
import { motion, AnimatePresence, Variants } from "motion/react";
import Header from "@/components/layout/Header";
import MinEducFooter from "@/components/layout/MinEducFooter";
import LegalFooter from "@/components/layout/LegalFooter";

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
import {
  SignupStylePanel,
  SignupStyleCard,
  SignupStyleGrid,
  SignupStyleSection,
} from "@/components/layout/SignupStylePanel";

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
  // Early Childhood Education
  rosa_martinez: "👶",
  juan_perez: "👨‍👶",
  maria_gonzalez: "👩‍👧",
  carlos_rodriguez: "👨‍👦",

  // Preschool Education
  ana_silva: "👩‍👧‍👦",
  pedro_morales: "👨‍👧",
  isabel_fernandez: "👩‍👦",
  roberto_jimenez: "👨‍👧‍👦",

  // Primary Education
  carmen_vega: "👩‍👧‍👧",
  miguel_torres: "👨‍👦‍👦",
  patricia_lopez: "👩‍👧‍👦",
  francisco_herrera: "👨‍👧",
  sofia_mendoza: "👩‍👦",
  diego_castro: "👨‍👧‍👦",

  // Secondary Education
  valentina_ruiz: "👩‍👧‍👧",
  andres_moreno: "👨‍👦‍👦",
  daniela_paredes: "👩‍👧‍👦",
  luis_sanchez: "👨‍🎓",
  catalina_lopez: "👩‍💼",
  fernando_garcia: "👨‍🎓",

  // Higher Education
  gabriela_rojas: "👩‍🔧",
  ricardo_morales: "👨‍🏫",
  antonia_vega: "👩‍🎓",
  pablo_castillo: "👨‍🔬",
  elena_martinez: "👩‍🏭",
  carolina_silva: "👩‍💻",
};

export default function CPAPage() {
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
      title: t("cpa.feature_community", "common"),
      description: t("cpa.feature_community_desc", "common"),
      color: "text-blue-600",
    },
    {
      icon: Shield,
      title: t("cpa.feature_transparency", "common"),
      description: t("cpa.feature_transparency_desc", "common"),
      color: "text-green-600",
    },
    {
      icon: BookOpen,
      title: t("cpa.feature_resources", "common"),
      description: t("cpa.feature_resources_desc", "common"),
      color: "text-purple-600",
    },
    {
      icon: Handshake,
      title: t("cpa.feature_support", "common"),
      description: t("cpa.feature_support_desc", "common"),
      color: "text-pink-600",
    },
    {
      icon: Calendar,
      title: t("cpa.feature_participation", "common"),
      description: t("cpa.feature_participation_desc", "common"),
      color: "text-orange-600",
    },
    {
      icon: Award,
      title: t("cpa.feature_recognition", "common"),
      description: t("cpa.feature_recognition_desc", "common"),
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
      // Early Childhood Education (ISCED 0)
      "rosa_martinez", // Sala Cuna Menor
      "juan_perez", // Sala Cuna Mayor
      "maria_gonzalez", // Nivel Medio Menor
      "carlos_rodriguez", // Nivel Medio Mayor
      "ana_silva", // NT1 Pre-Kinder
      "pedro_morales", // NT2 Kinder
      "isabel_fernandez", // NT1 Pre-Kinder
      "roberto_jimenez", // NT2 Kinder

      // Primary Education (ISCED 1)
      "carmen_vega", // 1° Básico
      "miguel_torres", // 2° Básico
      "patricia_lopez", // 3° Básico
      "francisco_herrera", // 4° Básico
      "sofia_mendoza", // 5° Básico
      "diego_castro", // 6° Básico

      // Secondary Education (ISCED 2-3)
      "valentina_ruiz", // 7° Básico
      "andres_moreno", // 8° Básico
      "daniela_paredes", // 1° Medio
      "luis_sanchez", // 2° Medio HC
      "catalina_lopez", // 3° Medio TP
      "fernando_garcia", // 4° Medio HC

      // Higher Education (ISCED 4-8)
      "gabriela_rojas", // Técnico Superior
      "ricardo_morales", // Licenciatura
      "antonia_vega", // Magíster
      "pablo_castillo", // Doctorado
      "elena_martinez", // Centro de Formación Técnica
      "carolina_silva", // Instituto Profesional
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
    <div className="min-h-screen bg-responsive-desktop bg-cpa">
      <div className="min-h-screen bg-linear-to-b from-black/30 via-black/20 to-black/40">
        <Header />
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="relative z-10 px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
            <div className={`${layout.container(isDesktopForced)} text-center`}>
              <motion.div
                initial="initial"
                animate="animate"
                variants={staggerChildren}
                className="max-w-4xl mx-auto"
              >
                <motion.div
                  variants={fadeInUp}
                  className={`mb-6 transition-all duration-700 ease-out ${
                    mounted
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  <div className="backdrop-blur-md bg-white/5 dark:bg-black/20 rounded-2xl border border-white/10 dark:border-white/5 shadow-2xl p-6 mx-auto inline-block">
                    <h1
                      className={`${typography.heading(isDesktopForced)} font-bold leading-tight text-gray-900 dark:text-white drop-shadow-2xl text-center transition-all duration-700 ease-out`}
                    >
                      {t("cpa.title", "common")}
                    </h1>
                  </div>
                </motion.div>

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
                        {/* Testimonial indicator dots */}
                        <div className="flex justify-center gap-2 mb-4">
                          {Array.from(
                            { length: Math.ceil(getTestimonials().length / 3) },
                            (_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                  Math.floor(currentTestimonialIndex / 3) === i
                                    ? "bg-primary scale-125 shadow-sm"
                                    : "bg-primary/30 hover:bg-primary/50"
                                }`}
                              />
                            ),
                          )}
                        </div>
                        <AnimatePresence mode="wait">
                          <div className="flex flex-col gap-4 h-full justify-between">
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
                                  <div className="group w-full">
                                    <SignupStyleCard className="w-full h-full backdrop-blur-md bg-white/5 dark:bg-black/20 border-white/10 dark:border-white/5 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] cursor-pointer">
                                      {/* Header with avatar and name/role */}
                                      <div className="flex items-start gap-4 mb-4">
                                        <div className="relative">
                                          <div className="w-12 h-12 bg-linear-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center border border-primary/20 shadow-lg">
                                            <span className="text-2xl">
                                              {testimonial.avatar}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-bold text-foreground text-lg leading-tight truncate">
                                            {testimonial.name}
                                          </h4>
                                          <p className="text-sm text-muted-foreground/80 font-medium">
                                            {testimonial.role}
                                          </p>
                                          {/* Star rating */}
                                          <div className="flex items-center gap-1 mt-1">
                                            {[...Array(5)].map((_, i) => (
                                              <svg
                                                key={i}
                                                className="w-4 h-4 text-yellow-400 fill-current"
                                                viewBox="0 0 20 20"
                                              >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                              </svg>
                                            ))}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Content */}
                                      <p className="text-foreground/90 leading-relaxed text-base pl-2 border-l-2 border-primary/20 group-hover:border-primary/40 transition-colors duration-300">
                                        {testimonial.content}
                                      </p>
                                    </SignupStyleCard>
                                  </div>
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
            <SignupStyleSection
              title={t("cpa.subtitle", "common")}
              subtitle={t("cpa.description", "common")}
            >
              <SignupStyleGrid columns={3} gap="md">
                {features.map((feature, index) => (
                  <motion.div key={index} variants={fadeInUp}>
                    <SignupStyleCard
                      variant="feature"
                      className="h-full backdrop-blur-md bg-white/5 dark:bg-black/20 border-white/10 dark:border-white/5"
                    >
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div
                          className={`p-3 bg-white/5 dark:bg-black/10 rounded-xl ${feature.color} shadow-lg`}
                        >
                          <feature.icon className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-bold text-foreground text-lg leading-tight">
                            {feature.title}
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </SignupStyleCard>
                  </motion.div>
                ))}
              </SignupStyleGrid>
            </SignupStyleSection>
          </div>
        </section>

        {/* Educational Project Content */}
        <section className={`${layout.spacing.section(isDesktopForced)}`}>
          <div className={`${layout.container(isDesktopForced)} space-y-8`}>
            {/* Video Section */}
            <Suspense fallback={<VideoSectionSkeleton />}>
              <DynamicVideoSection />
            </Suspense>

            {/* Main PDF Presentation Section */}
            <SignupStylePanel
              title={t("proyecto_educativo.regulation_title", "common")}
              subtitle={t("proyecto_educativo.regulation_subtitle", "common")}
              icon={<FileIcons.Document className="w-8 h-8 text-foreground" />}
              variant="info"
            >
              <div className="bg-black/5 dark:bg-black/10 p-6 rounded-xl border border-white/10 dark:border-white/5 relative overflow-hidden backdrop-blur-sm">
                {/* Background pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16" />
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold mb-3 text-foreground">
                    {t("proyecto_educativo.document_content_title", "common")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        {t("proyecto_educativo.document_item_1", "common")}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-white dark:bg-foreground rounded-full mt-2 shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        {t("proyecto_educativo.document_item_2", "common")}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-white dark:bg-foreground rounded-full mt-2 shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        {t("proyecto_educativo.document_item_3", "common")}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-white dark:bg-foreground rounded-full mt-2 shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        {t("proyecto_educativo.document_item_4", "common")}
                      </p>
                    </div>
                  </div>

                  <a
                    href="/uploads/reglamento-1.pdf"
                    download
                    className="inline-flex items-center px-6 py-3 bg-linear-to-r from-primary to-purple-600 text-primary-foreground rounded-full font-medium hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300 shadow-lg"
                  >
                    <FileIcons.Attachment className="w-5 h-5 mr-2" />
                    {t("proyecto_educativo.download_pdf", "common")}
                  </a>
                </div>
              </div>
            </SignupStylePanel>

            {/* Propuesta Técnica Panel */}
            <SignupStylePanel
              title="Propuesta Técnica"
              subtitle="Documento técnico detallado con información actualizada y mejorada para una entrega perfecta"
              icon={<FileIcons.Document className="w-8 h-8 text-foreground" />}
              variant="info"
            >
              <div className="bg-black/5 dark:bg-black/10 p-6 rounded-xl border border-white/10 dark:border-white/5 relative overflow-hidden backdrop-blur-sm">
                {/* Background pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-16 translate-x-16" />
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold mb-3 text-foreground">
                    Documento Técnico Completo
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        Especificaciones técnicas actualizadas
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        Metodología de implementación
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        Requisitos y dependencias
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        Plan de entrega optimizado
                      </p>
                    </div>
                  </div>

                  <a
                    href="/uploads/propuesta_tecnica-1.pdf"
                    download
                    className="inline-flex items-center px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-primary-foreground rounded-full font-medium hover:from-blue-600/90 hover:to-purple-600/90 transition-all duration-300 shadow-lg"
                  >
                    <FileIcons.Attachment className="w-5 h-5 mr-2" />
                    Descargar Propuesta Técnica
                  </a>
                </div>
              </div>
            </SignupStylePanel>

            {/* Philosophical Foundation */}
            <SignupStyleSection
              title={t("proyecto_educativo.philosophy_title", "common")}
              subtitle={t("proyecto_educativo.philosophy_subtitle", "common")}
            >
              <SignupStylePanel variant="info">
                <div className="space-y-6">
                  <div className="bg-black/5 dark:bg-black/10 p-6 rounded-xl border border-white/5 dark:border-white/5 backdrop-blur-sm">
                    <p className="text-lg leading-relaxed text-foreground">
                      {t("proyecto_educativo.philosophy_description", "common")}
                    </p>
                  </div>

                  <SignupStyleGrid columns={2} gap="md">
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
                      <SignupStyleCard
                        key={index}
                        variant="info"
                        className="h-full"
                      >
                        <div className="flex flex-col items-center text-center space-y-4">
                          <div className="p-3 bg-white/10 rounded-xl shadow-lg">
                            <div className="text-3xl">{item.icon}</div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-bold text-foreground text-lg leading-tight">
                              {item.title}
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </SignupStyleCard>
                    ))}
                  </SignupStyleGrid>
                </div>
              </SignupStylePanel>
            </SignupStyleSection>

            {/* Educational Objectives */}
            <SignupStyleSection
              title={t("proyecto_educativo.objectives_title", "common")}
              subtitle={t("proyecto_educativo.objectives_subtitle", "common")}
            >
              <SignupStyleGrid columns={2} gap="md">
                <SignupStylePanel variant="action">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-linear-to-r from-white/5 to-white/10 rounded-xl">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                        🎯
                      </div>
                      <h3 className="font-semibold text-lg text-foreground">
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
                        <SignupStyleCard
                          key={index}
                          variant="info"
                          className="p-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-xs font-medium text-foreground">
                                {index + 1}
                              </span>
                            </div>
                            <p className="text-sm text-foreground">{item}</p>
                          </div>
                        </SignupStyleCard>
                      ))}
                    </div>
                  </div>
                </SignupStylePanel>

                <SignupStylePanel variant="action">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-linear-to-r from-white/5 to-white/10 rounded-xl">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                        📝
                      </div>
                      <h3 className="font-semibold text-lg text-foreground">
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
                        <SignupStyleCard
                          key={index}
                          variant="info"
                          className="p-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-xs font-medium text-foreground">
                                {index + 1}
                              </span>
                            </div>
                            <p className="text-sm text-foreground">{item}</p>
                          </div>
                        </SignupStyleCard>
                      ))}
                    </div>
                  </div>
                </SignupStylePanel>
              </SignupStyleGrid>
            </SignupStyleSection>

            {/* Methodological Approach */}
            <SignupStyleSection
              title={t("proyecto_educativo.methodology_title", "common")}
            >
              <SignupStyleGrid columns={3} gap="md">
                <SignupStyleCard variant="info" className="h-full">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-white/10 rounded-xl shadow-lg">
                      <div className="text-3xl">🌱</div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-foreground text-lg leading-tight">
                        {t("proyecto_educativo.early_stimulation", "common")}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t(
                          "proyecto_educativo.early_stimulation_desc",
                          "common",
                        )}
                      </p>
                    </div>
                  </div>
                </SignupStyleCard>

                <SignupStyleCard variant="info" className="h-full">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-white/10 rounded-xl shadow-lg">
                      <div className="text-3xl">👤</div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-foreground text-lg leading-tight">
                        {t("proyecto_educativo.individual_attention", "common")}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t(
                          "proyecto_educativo.individual_attention_desc",
                          "common",
                        )}
                      </p>
                    </div>
                  </div>
                </SignupStyleCard>

                <SignupStyleCard variant="info" className="h-full">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-white/10 rounded-xl shadow-lg">
                      <div className="text-3xl">📊</div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-foreground text-lg leading-tight">
                        {t(
                          "proyecto_educativo.continuous_evaluation",
                          "common",
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t(
                          "proyecto_educativo.continuous_evaluation_desc",
                          "common",
                        )}
                      </p>
                    </div>
                  </div>
                </SignupStyleCard>
              </SignupStyleGrid>
            </SignupStyleSection>

            {/* Team */}
            <SignupStyleSection
              title={t("proyecto_educativo.multidisciplinary_team", "common")}
              subtitle={t("proyecto_educativo.team_subtitle", "common")}
            >
              <SignupStyleGrid columns={2} gap="md">
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
                    title: t("proyecto_educativo.team_psychologist", "common"),
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
                    title: t("proyecto_educativo.team_occupational", "common"),
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
                  <SignupStyleCard
                    key={index}
                    variant="info"
                    className="h-full"
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-3 bg-white/10 rounded-xl shadow-lg">
                        <div className="text-3xl">{member.icon}</div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-foreground text-lg leading-tight">
                          {member.title}
                        </h4>
                        <p className="text-sm text-muted-foreground font-medium">
                          {member.subtitle}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {member.description}
                        </p>
                      </div>
                    </div>
                  </SignupStyleCard>
                ))}
              </SignupStyleGrid>

              <SignupStyleCard variant="info" className="mt-6">
                <p className="text-center text-sm text-muted-foreground">
                  <strong className="text-foreground">
                    {t("proyecto_educativo.collaborative_work_note", "common")}
                  </strong>{" "}
                  {t("proyecto_educativo.team_meetings", "common")}
                </p>
              </SignupStyleCard>
            </SignupStyleSection>
          </div>
        </section>

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
          className={`bg-card/90 backdrop-blur-sm text-foreground py-12 transition-all duration-700 ease-out delay-1000 ${
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
                <h3 className="text-xl font-bold mb-4 text-foreground">
                  {t("centro_consejo.footer.title", "common")}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t("centro_consejo.footer.description", "common")}
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p>📍 Anibal Pinto Nº 160, Los Sauces, Chile</p>
                  <p>📞 (45) 278 3486</p>
                  <p>✉️ centrodepadres@plataforma-astral.com</p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4 text-foreground">
                  {t("centro_consejo.footer.quick_access", "common")}
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/login"
                      className="text-muted-foreground hover:text-foreground transition duration-200 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background rounded"
                      aria-label="Acceder a la plataforma"
                    >
                      Acceder a la Plataforma
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/"
                      className="text-muted-foreground hover:text-foreground transition duration-200 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background rounded"
                      aria-label="Volver al inicio"
                    >
                      Volver al Inicio
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4 text-foreground">
                  {t("centro_consejo.footer.schedule_title", "common")}
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>{t("centro_consejo.footer.meetings", "common")}</li>
                  <li>{t("centro_consejo.footer.time", "common")}</li>
                  <li>{t("centro_consejo.footer.location", "common")}</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-border mt-8 pt-8 text-center">
              <p className="text-muted-foreground pb-3">
                {t("centro_consejo.footer.school_info", "common")}
              </p>
              <p className="text-muted-foreground pb-3">
                {t("centro_consejo.footer.copyright", "common").replace(
                  "{year}",
                  new Date().getFullYear().toString(),
                )}
              </p>
              <p className="text-muted-foreground">
                {t("centro_consejo.footer.part_of", "common")}{" "}
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition duration-200 underline focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background rounded"
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
        <MinEducFooter />
        <LegalFooter />
      </div>
    </div>
  );
}
