"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import MinEducFooter from "@/components/layout/MinEducFooter";
import CompactFooter from "@/components/layout/CompactFooter";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { EducationalSystemExplorer } from "@/components/programs/EducationalSystemExplorer";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function ProgramasExplorerPage() {
  const { t } = useDivineParsing(["common", "programas"]);

  return (
    <div className="min-h-screen bg-responsive-desktop bg-programas flex flex-col">
      <div className="relative flex flex-1 flex-col">
        {/* Animated ambient elements - responsive sizing */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-linear-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-linear-to-tr from-indigo-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-linear-to-r from-emerald-400/10 to-teal-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative flex flex-1 flex-col">
          <Header />

          <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-8 sm:pb-12 md:pb-16 flex-1">
            <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 lg:space-y-16">
              {/* Hero Section */}
              <section className="text-center space-y-4 sm:space-y-6">
                <div className="max-w-4xl mx-auto px-4">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-gray-900 dark:text-white drop-shadow-2xl">
                    {t("programas.explorer.page_heading")}
                  </h1>
                  <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-200 max-w-3xl mx-auto leading-relaxed">
                    {t("programas.explorer.page_subheading")}
                  </p>
                </div>
              </section>

              {/* Explorer Section */}
              <section className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-blue-500/15 via-purple-500/10 to-indigo-500/15 rounded-3xl blur-2xl -z-10"></div>

                <div className="relative backdrop-blur-2xl bg-white/80 dark:bg-slate-900/70 rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-br from-white/40 via-transparent to-transparent dark:from-slate-700/40 pointer-events-none"></div>
                  <div className="relative p-8 md:p-12">
                    <EducationalSystemExplorer />
                  </div>
                </div>
              </section>

              {/* CTA Section */}
              <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-2xl border border-white/20 dark:border-white/10">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute -top-10 -right-10 sm:-top-20 sm:-right-20 w-20 h-20 sm:w-40 sm:h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 sm:-bottom-20 sm:-left-20 w-20 h-20 sm:w-40 sm:h-40 bg-white/10 rounded-full blur-2xl"></div>

                <div className="relative p-6 sm:p-8 md:p-12 lg:p-16 grid gap-6 sm:gap-8 lg:grid-cols-[1.2fr,0.8fr]">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="inline-flex items-center gap-2 sm:gap-3 bg-white/20 backdrop-blur-sm px-4 py-2 sm:px-6 sm:py-3 rounded-full font-medium text-sm sm:text-base">
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                      {t("programas.explorer.contact_title")}
                    </div>
                    <p className="text-lg sm:text-xl md:text-2xl leading-relaxed opacity-90">
                      {t("programas.explorer.contact_subtitle")}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:items-center lg:justify-end">
                    <Button
                      asChild
                      size="lg"
                      variant="secondary"
                      className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Link
                        href="/contacto"
                        className="flex items-center gap-2"
                      >
                        <Sparkles className="h-4 w-4" />
                        {t("programas.schedule_meeting")}
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:shadow-lg transition-all duration-300"
                    >
                      <Link
                        href="/docs#programas"
                        className="flex items-center gap-2"
                      >
                        {t("programas.view_specs")}
                      </Link>
                    </Button>
                  </div>
                </div>
              </section>
            </div>
          </main>

          <MinEducFooter />
          <CompactFooter />
        </div>
      </div>
    </div>
  );
}
