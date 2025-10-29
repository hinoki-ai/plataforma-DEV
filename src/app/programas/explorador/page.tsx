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
    <div className="min-h-screen bg-responsive-desktop bg-programas">
      <div className="min-h-screen bg-linear-to-b from-black/30 via-black/20 to-black/40 flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-16 flex-1">
          <div className="max-w-6xl mx-auto space-y-12">
            <section className="text-center space-y-6">
              <div className="flex justify-center">
                <Badge className="bg-white/10 text-white backdrop-blur">
                  {t("programas.explorer.title")}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold leading-tight text-gray-900 dark:text-white drop-shadow-2xl md:text-5xl">
                {t("programas.explorer.page_heading")}
              </h1>
              <p className="text-lg md:text-xl text-foreground/90 max-w-3xl mx-auto leading-relaxed">
                {t("programas.explorer.page_subheading")}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-background/70"
                >
                  <Link href="/programas" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    {t("programas.explorer.back")}
                  </Link>
                </Button>
                <Button asChild size="lg">
                  <Link href="/contacto">
                    {t("programas.schedule_meeting")}
                  </Link>
                </Button>
              </div>
            </section>

            <section className="relative">
              <div
                className="absolute inset-0 -z-10 animate-pulse rounded-3xl bg-linear-to-r from-primary/10 via-primary/5 to-transparent"
                aria-hidden="true"
              />
              <Card className="border border-border/60 backdrop-blur-xl bg-card/80 shadow-2xl">
                <CardContent className="p-6 md:p-10">
                  <EducationalSystemExplorer />
                </CardContent>
              </Card>
            </section>

            <section className="relative overflow-hidden rounded-3xl border border-border/60 backdrop-blur-xl bg-card/80 shadow-2xl">
              <div
                className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/10 to-transparent"
                aria-hidden="true"
              />
              <div className="relative p-10 md:p-14 grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1 text-primary font-medium">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    {t("programas.explorer.contact_title")}
                  </div>
                  <p className="text-lg text-foreground/90 leading-relaxed">
                    {t("programas.explorer.contact_subtitle")}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
                  <Button asChild size="lg">
                    <Link href="/contacto">
                      {t("programas.schedule_meeting")}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="bg-background/70"
                  >
                    <Link href="/docs#programas">
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
