"use client";

import { Metadata } from "next";
import Header from "@/components/layout/Header";
import MinEducFooter from "@/components/layout/MinEducFooter";
import CompactFooter from "@/components/layout/CompactFooter";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

// Note: Metadata cannot be used in client components, so we'll use a different approach
// The metadata will be handled by the layout or we can create a wrapper component

export default function TerminosPage() {
  const { t } = useDivineParsing(["terminos"]);

  return (
    <div className="min-h-screen bg-responsive-desktop bg-contacto">
      <Header />
      <main className="container mx-auto px-4 pt-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="backdrop-blur-md bg-white/5 dark:bg-black/20 rounded-2xl border border-white/10 dark:border-white/5 shadow-2xl p-6 mx-auto inline-block">
              <h1 className="text-center text-4xl font-bold leading-tight text-gray-900 dark:text-white drop-shadow-2xl transition-all duration-700 ease-out">
                {t("hero.title", "terminos")}
              </h1>
            </div>
          </div>
          <p className="text-lg text-center text-foreground/90 mb-12">
            {t("hero.last_updated", "terminos")}:{" "}
            {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-8 text-foreground">
            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_1.title", "terminos")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("section_1.content", "terminos")}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_2.title", "terminos")}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("section_2.content", "terminos")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                {terminosES["section_2.features"].map(
                  (feature: string, index: number) => (
                    <li key={index}>{feature}</li>
                  ),
                )}
              </ul>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_3.title", "terminos")}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("section_3.content", "terminos")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                {terminosES["section_3.restrictions"].map(
                  (restriction: string, index: number) => (
                    <li key={index}>{restriction}</li>
                  ),
                )}
              </ul>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_4.title", "terminos")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("section_4.content", "terminos")}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_5.title", "terminos")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("section_5.content", "terminos")}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_6.title", "terminos")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("section_6.content", "terminos")}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_7.title", "terminos")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("section_7.content", "terminos")}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_8.title", "terminos")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("section_8.content", "terminos")}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_9.title", "terminos")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("section_9.content", "terminos")}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_10.title", "terminos")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("section_10.content", "terminos")}
              </p>
              <div className="mt-4 text-muted-foreground">
                <p>{t("section_10.contact_email", "terminos")}</p>
                <p>{t("section_10.contact_phone_1", "terminos")}</p>
                <p>{t("section_10.contact_phone_2", "terminos")}</p>
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
