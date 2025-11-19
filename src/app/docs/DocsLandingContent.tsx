"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import MinEducFooter from "@/components/layout/MinEducFooter";
import CompactFooter from "@/components/layout/CompactFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDivineParsing } from "@/components/language/useDivineLanguage";

interface DocsLandingContentProps {
  htmlContent: string;
}

export function DocsLandingContent({ htmlContent }: DocsLandingContentProps) {
  const { t } = useDivineParsing(["common"]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 bg-docs flex flex-col">
      <Header />
      <main className="container mx-auto px-4 pt-8 pb-12 flex-1">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Hero Section with Enhanced Visual Appeal */}
          <div className="text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-3xl -z-10"></div>
            <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-2xl p-8 mx-auto inline-block transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📚</span>
                </div>
              </div>
              <h1 className="text-center text-4xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                {t("docs.title", "common")}
              </h1>
              <p className="text-center text-lg md:text-xl font-medium leading-relaxed text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                {t("docs.subtitle", "common")}
              </p>
              <div className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-500 dark:text-slate-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>
                  {t("docs.content.last_updated", "common")}: October 13, 2025
                </span>
              </div>
            </div>
          </div>

          {/* Main Content Card with Enhanced Design */}
          <div className="grid gap-8 md:grid-cols-3">
            {/* Quick Actions Sidebar */}
            <div className="md:col-span-1">
              <Card className="backdrop-blur-xl bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/30 rounded-2xl shadow-xl sticky top-8">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <span className="text-2xl">🚀</span>
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link
                    href="/"
                    className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all duration-200 group"
                  >
                    <span className="text-blue-600 dark:text-blue-400">←</span>
                    <span className="font-medium text-blue-700 dark:text-blue-300 group-hover:translate-x-1 transition-transform">
                      {t("docs.back_home", "common")}
                    </span>
                  </Link>
                  <Link
                    href="#quick-start"
                    className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition-all duration-200 group"
                  >
                    <span className="text-green-600 dark:text-green-400">
                      ⚡
                    </span>
                    <span className="font-medium text-green-700 dark:text-green-300 group-hover:translate-x-1 transition-transform">
                      Quick Start
                    </span>
                  </Link>
                  <Link
                    href="#tech-stack"
                    className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all duration-200 group"
                  >
                    <span className="text-purple-600 dark:text-purple-400">
                      🔧
                    </span>
                    <span className="font-medium text-purple-700 dark:text-purple-300 group-hover:translate-x-1 transition-transform">
                      Tech Stack
                    </span>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2">
              <Card className="backdrop-blur-xl bg-white/90 dark:bg-slate-800/90 border border-white/30 dark:border-slate-700/50 rounded-2xl shadow-2xl">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <span className="text-3xl">📖</span>
                    {t("docs.index.title", "common")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div
                    className="prose prose-slate dark:prose-invert max-w-none text-base leading-relaxed prose-headings:text-slate-800 dark:prose-headings:text-slate-200 prose-headings:font-semibold prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Enhanced Footer Section */}
          <div className="backdrop-blur-xl bg-gradient-to-r from-slate-50/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-700/90 border border-white/30 dark:border-slate-600/30 rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">📂</span>
                </div>
                <div className="text-sm">
                  <p className="text-slate-600 dark:text-slate-300 font-medium">
                    {t("docs.github.message", "common")}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    <span className="font-mono bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-xs">
                      docs
                    </span>
                    {t("docs.github.repository", "common")}
                  </p>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-300 dark:bg-slate-600 hidden sm:block"></div>
              <a
                href="https://github.com/hinoki-ai/plataforma-DEV/tree/main/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span>🔗</span>
                {t("docs.github.link", "common")}
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </main>
      <MinEducFooter />
      <CompactFooter />
    </div>
  );
}

export default DocsLandingContent;
