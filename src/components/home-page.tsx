// ⚡ Performance: PPR-optimized HomePage with static shell and dynamic components
"use client";

import { Suspense } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DesktopToggle } from "@/components/ui/desktop-toggle";
import Header from "@/components/layout/Header";
import { useDesktopToggle } from "@/lib/hooks/useDesktopToggle";
import { layout, typography } from "@/lib/responsive-utils";
import { useLanguage } from "@/components/language/LanguageContext";

// ⚡ Performance: Dynamic components for PPR streaming
import {
  DynamicPersonalization,
  PersonalizationSkeleton,
} from "@/components/home/DynamicPersonalization";
import MinEducFooter from "@/components/layout/MinEducFooter";

export function HomePage() {
  // Layout and responsive state
  const { isDesktopForced } = useDesktopToggle();
  const { t } = useLanguage();

  // Component mounted successfully

  return (
    <div className="min-h-screen bg-responsive-desktop bg-home-page">
      {/* Mobile portrait video background */}
      <video
        className="mobile-portrait-video"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src="/heromobile.mp4" type="video/mp4" />
      </video>
      <div className="min-h-screen bg-linear-to-b from-black/30 via-black/20 to-black/40">
        <Header />
        <section className={layout.spacing.section(isDesktopForced)}>
          <div className={`${layout.container(isDesktopForced)} text-center`}>
            <h1
              className={`${typography.hero(isDesktopForced)} font-bold text-white mb-6`}
            >
              {t("home.welcome.title", "common")}
            </h1>
            <p
              className={`${typography.body(isDesktopForced)} text-white mb-8 max-w-4xl mx-auto leading-relaxed text-center`}
            >
              {t("home.welcome.description", "common")}
            </p>
          </div>
        </section>

        {/* Mission & Vision with Advanced Animations */}
        <section className="py-4">
          <div className={layout.container(isDesktopForced)}>
            <div
              className={
                isDesktopForced
                  ? "grid grid-cols-2 gap-8"
                  : "grid grid-cols-1 md:grid-cols-2 gap-8"
              }
            >
              <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white">
                    {t("home.mission.title", "common")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    {t("home.mission.description", "common")}
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white">
                    {t("home.vision.title", "common")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    {t("home.vision.description", "common")}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={layout.spacing.section(isDesktopForced)}>
          <div className={layout.container(isDesktopForced)}>
            <div className="text-center mb-12">
              <h2
                className={`${typography.heading(isDesktopForced)} font-bold text-white mb-4`}
              >
                {t("home.features.title", "common")}
              </h2>
              <p
                className={`${typography.body(isDesktopForced)} text-white/90 max-w-2xl mx-auto`}
              >
                {t("home.features.description", "common")}
              </p>
            </div>

            <div
              className={
                isDesktopForced
                  ? "grid grid-cols-3 gap-8 grid-staggered"
                  : "grid grid-cols-1 md:grid-cols-3 gap-8 grid-staggered"
              }
            >
              <Card className="text-center backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
                <CardHeader>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <CardTitle className="text-white">
                    {t("home.excellence.title", "common")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    {t("home.excellence.description", "common")}
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
                <CardHeader>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <CardTitle className="text-white">
                    {t("home.team.title", "common")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    {t("home.team.description", "common")}
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
                <CardHeader>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <CardTitle className="text-white">
                    {t("home.innovation.title", "common")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    {t("home.innovation.description", "common")}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ⚡ Performance: PPR Dynamic Content - streams in after static shell loads */}
        <Suspense fallback={<PersonalizationSkeleton />}>
          <DynamicPersonalization />
        </Suspense>

        <MinEducFooter />

        {/* Desktop Toggle - only shows on mobile */}
        <DesktopToggle />
      </div>
    </div>
  );
}
