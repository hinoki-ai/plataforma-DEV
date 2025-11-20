"use client";

import React from "react";
import { Metadata } from "next";
import Header from "@/components/layout/Header";
import MinEducFooter from "@/components/layout/MinEducFooter";
import CompactFooter from "@/components/layout/CompactFooter";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
// Import translations statically for direct access
import dpaES from "@/locales/es/dpa.json";
import dpaEN from "@/locales/en/dpa.json";

export default function DpaPage() {
  const { language } = useDivineParsing(["dpa"]);
  const dpaTranslations = (language === "es" ? dpaES : dpaEN) as any;

  return (
    <div className="min-h-screen bg-responsive-desktop bg-contacto">
      <Header />
      <main className="container mx-auto px-4 pt-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="backdrop-blur-md bg-white/5 dark:bg-black/20 rounded-2xl border border-white/10 dark:border-white/5 shadow-2xl p-6 mx-auto inline-block">
              <h1 className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 dark:text-white drop-shadow-2xl transition-all duration-700 ease-out">
                {dpaTranslations["hero.title"]}
              </h1>
            </div>
          </div>
          <p className="text-lg text-center text-foreground/90 mb-12">
            {dpaTranslations["hero.last_updated"]}:{" "}
            {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-8 text-foreground">
            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {dpaTranslations["section_1.title"]}
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {dpaTranslations["section_1.data_controller"]}:
                  </h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {dpaTranslations["section_1.controller_content"]}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {dpaTranslations["section_1.data_processor"]}:
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {dpaTranslations["section_1.processor_content"]}
                  </p>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {dpaTranslations["section_2.title"]}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {dpaTranslations["section_2.content"]}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {dpaTranslations["section_3.title"]}
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <div>
                  <strong>{dpaTranslations["section_3.personal_data"]}:</strong>{" "}
                  {dpaTranslations["section_3.personal_data_desc"]}
                </div>
                <div>
                  <strong>{dpaTranslations["section_3.processing"]}:</strong>{" "}
                  {dpaTranslations["section_3.processing_desc"]}
                </div>
                <div>
                  <strong>
                    {dpaTranslations["section_3.sensitive_data"]}:
                  </strong>{" "}
                  {dpaTranslations["section_3.sensitive_data_desc"]}
                </div>
                <div>
                  <strong>
                    {dpaTranslations["section_3.security_measures"]}:
                  </strong>{" "}
                  {dpaTranslations["section_3.security_measures_desc"]}
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {dpaTranslations["section_4.title"]}
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {dpaTranslations["section_4.user_data"]}:
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground leading-relaxed ml-4 space-y-1">
                    {dpaTranslations["section_4.user_data_items"].map(
                      (item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ),
                    )}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {dpaTranslations["section_4.student_data"]}:
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground leading-relaxed ml-4 space-y-1">
                    {dpaTranslations["section_4.student_data_items"].map(
                      (item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ),
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {dpaTranslations["section_5.title"]}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {dpaTranslations["section_5.intro"]}
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                {dpaTranslations["section_5.purposes"].map(
                  (purpose: string, index: number) => (
                    <li key={index}>{purpose}</li>
                  ),
                )}
              </ul>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {dpaTranslations["section_6.title"]}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {dpaTranslations["section_6.intro"]}
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                {dpaTranslations["section_6.obligations"].map(
                  (obligation: string, index: number) => (
                    <li key={index}>{obligation}</li>
                  ),
                )}
              </ul>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {dpaTranslations["section_7.title"]}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {dpaTranslations["section_7.intro"]}
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                {dpaTranslations["section_7.obligations"].map(
                  (obligation: string, index: number) => (
                    <li key={index}>{obligation}</li>
                  ),
                )}
              </ul>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {dpaTranslations["section_8.title"]}
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {dpaTranslations["section_8.technical_title"]}:
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground leading-relaxed ml-4 space-y-1">
                    {dpaTranslations["section_8.technical_measures"].map(
                      (measure: string, index: number) => (
                        <li key={index}>{measure}</li>
                      ),
                    )}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {dpaTranslations["section_8.organizational_title"]}:
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground leading-relaxed ml-4 space-y-1">
                    {dpaTranslations["section_8.organizational_measures"].map(
                      (measure: string, index: number) => (
                        <li key={index}>{measure}</li>
                      ),
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {dpaTranslations["section_9.title"]}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {dpaTranslations["section_9.content"]}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {dpaTranslations["section_10.title"]}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {dpaTranslations["section_10.content"]}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {dpaTranslations["section_11.title"]}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {dpaTranslations["section_11.content"]}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {dpaTranslations["section_12.title"]}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {dpaTranslations["section_12.content"]}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {dpaTranslations["section_13.title"]}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {dpaTranslations["section_13.content"]}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {dpaTranslations["section_14.title"]}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {dpaTranslations["section_14.intro"]}
              </p>
              <div className="text-muted-foreground">
                <p>{dpaTranslations["section_14.contact_email"]}</p>
                <p>{dpaTranslations["section_14.contact_phone"]}</p>
                <p>{dpaTranslations["section_14.contact_address"]}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <MinEducFooter />
      <CompactFooter />
    </div>
  );
}
