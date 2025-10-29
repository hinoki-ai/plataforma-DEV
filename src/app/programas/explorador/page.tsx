"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import MinEducFooter from "@/components/layout/MinEducFooter";
import LegalFooter from "@/components/layout/LegalFooter";
import { useLanguage } from "@/components/language/LanguageContext";
import { EducationalSystemExplorer } from "@/components/programs/EducationalSystemExplorer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function ProgramasExplorerPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-linear-to-tr from-indigo-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-linear-to-r from-emerald-400/10 to-teal-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative min-h-screen flex flex-col">
        <Header />

        <main className="container mx-auto px-4 py-8 md:py-16 flex-1">
          <div className="max-w-7xl mx-auto space-y-16">
            {/* Hero Section */}
            <section className="text-center space-y-8 relative">
              <div className="absolute inset-0 bg-linear-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5 rounded-3xl blur-3xl -z-10"></div>

              <div className="inline-flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
                <Sparkles className="h-4 w-4" />
                {t("programas.explorer.title")}
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-linear-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent leading-tight">
                  {t("programas.explorer.page_heading")}
                </h1>
                <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed font-light">
                  {t("programas.explorer.page_subheading")}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 group"
                >
                  <Link href="/programas" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
                    {t("programas.explorer.back")}
                  </Link>
                </Button>
              </div>
            </section>

            {/* Explorer Section */}
            <section className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/5 to-indigo-500/10 rounded-3xl blur-2xl -z-10"></div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-white/50 to-transparent dark:from-slate-700/50 pointer-events-none"></div>

                <div className="relative p-8 md:p-12">
                  <EducationalSystemExplorer />
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-2xl">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

              <div className="relative p-12 md:p-16 grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full font-medium">
                    <Sparkles className="h-5 w-5" />
                    {t("programas.explorer.contact_title")}
                  </div>
                  <p className="text-xl md:text-2xl leading-relaxed opacity-90">
                    {t("programas.explorer.contact_subtitle")}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-end">
                  <Button
                    asChild
                    size="lg"
                    variant="secondary"
                    className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Link href="/contacto" className="flex items-center gap-2">
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
        <LegalFooter />
      </div>
    </div>
  );
}
