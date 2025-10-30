"use client";

import { Metadata } from "next";
import Header from "@/components/layout/Header";
import MinEducFooter from "@/components/layout/MinEducFooter";
import CompactFooter from "@/components/layout/CompactFooter";
import dpaTranslationsES from "@/locales/es/dpa.json";
import dpaTranslationsEN from "@/locales/en/dpa.json";

export default function DpaPage() {
  // Get current language from localStorage or default to Spanish
  const currentLanguage = typeof window !== "undefined"
    ? (localStorage.getItem("aramac-language-preference") as "es" | "en") || "es"
    : "es";

  const dpaTranslations = currentLanguage === "en" ? dpaTranslationsEN : dpaTranslationsES;

  return (
    <div className="min-h-screen bg-responsive-desktop bg-contacto">
      <Header />
      <main className="container mx-auto px-4 pt-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-foreground">
            {t("hero.title", "dpa")}
          </h1>
          <p className="text-lg text-center text-foreground/90 mb-12">
            {t("hero.last_updated", "dpa")}: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-8 text-foreground">
            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_1.title", "dpa")}
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t("section_1.data_controller", "dpa")}:
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Plataforma Astral SpA
                    <br />
                    Avenida Libertad #777, Viña del Mar
                    <br />
                    Región de Valparaíso, Chile
                    <br />
                    astral@gmail.com
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Encargado del Tratamiento:
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Las instituciones educativas que utilizan nuestros servicios
                    y sus representantes legales autorizados.
                  </p>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_2.title", "dpa")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("section_2.content", "dpa")}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_3.title", "dpa")}
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <div>
                  <strong>{t("section_3.personal_data", "dpa")}:</strong>{" "}
                  {t("section_3.personal_data_desc", "dpa")}
                </div>
                <div>
                  <strong>{t("section_3.processing", "dpa")}:</strong>{" "}
                  {t("section_3.processing_desc", "dpa")}
                </div>
                <div>
                  <strong>{t("section_3.sensitive_data", "dpa")}:</strong>{" "}
                  {t("section_3.sensitive_data_desc", "dpa")}
                </div>
                <div>
                  <strong>{t("section_3.security_measures", "dpa")}:</strong>{" "}
                  {t("section_3.security_measures_desc", "dpa")}
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_4.title", "dpa")}
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t("section_4.user_data", "dpa")}:
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground leading-relaxed ml-4 space-y-1">
                    <li>{t("section_4.user_data_item_1", "dpa")}</li>
                    <li>{t("section_4.user_data_item_2", "dpa")}</li>
                    <li>{t("section_4.user_data_item_3", "dpa")}</li>
                    <li>{t("section_4.user_data_item_4", "dpa")}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t("section_4.student_data", "dpa")}:
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground leading-relaxed ml-4 space-y-1">
                    <li>{t("section_4.student_data_item_1", "dpa")}</li>
                    <li>{t("section_4.student_data_item_2", "dpa")}</li>
                    <li>{t("section_4.student_data_item_3", "dpa")}</li>
                    <li>{t("section_4.student_data_item_4", "dpa")}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_5.title", "dpa")}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("section_5.intro", "dpa")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>{t("section_5.purpose_1", "dpa")}</li>
                <li>{t("section_5.purpose_2", "dpa")}</li>
                <li>{t("section_5.purpose_3", "dpa")}</li>
                <li>{t("section_5.purpose_4", "dpa")}</li>
                <li>{t("section_5.purpose_5", "dpa")}</li>
                <li>{t("section_5.purpose_6", "dpa")}</li>
              </ul>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_6.title", "dpa")}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("section_6.intro", "dpa")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>{t("section_6.obligation_1", "dpa")}</li>
                <li>{t("section_6.obligation_2", "dpa")}</li>
                <li>{t("section_6.obligation_3", "dpa")}</li>
                <li>{t("section_6.obligation_4", "dpa")}</li>
                <li>{t("section_6.obligation_5", "dpa")}</li>
                <li>{t("section_6.obligation_6", "dpa")}</li>
              </ul>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_7.title", "dpa")}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("section_7.intro", "dpa")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>{t("section_7.obligation_1", "dpa")}</li>
                <li>{t("section_7.obligation_2", "dpa")}</li>
                <li>{t("section_7.obligation_3", "dpa")}</li>
                <li>{t("section_7.obligation_4", "dpa")}</li>
                <li>{t("section_7.obligation_5", "dpa")}</li>
              </ul>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_8.title", "dpa")}
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t("section_8.technical_title", "dpa")}:
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground leading-relaxed ml-4 space-y-1">
                    {[1, 2, 3, 4, 5].map((num: number) => (
                      <li key={num}>
                        {
                          dpaTranslations[
                            `section_8.technical_measure_${num}` as keyof typeof dpaTranslations
                          ]
                        }
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t("section_8.organizational_title", "dpa")}:
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground leading-relaxed ml-4 space-y-1">
                    {[1, 2, 3, 4].map((num: number) => (
                      <li key={num}>
                        {
                          dpaTranslations[
                            `section_8.organizational_measure_${num}` as keyof typeof dpaTranslations
                          ]
                        }
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_9.title", "dpa")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("section_9.content", "dpa")}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_10.title", "dpa")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("section_10.content", "dpa")}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_11.title", "dpa")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("section_11.content", "dpa")}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_12.title", "dpa")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("section_12.content", "dpa")}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_13.title", "dpa")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("section_13.content", "dpa")}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_14.title", "dpa")}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("section_14.intro", "dpa")}
              </p>
              <div className="text-muted-foreground">
                <p>{t("section_14.contact_email", "dpa")}</p>
                <p>{t("section_14.contact_phone", "dpa")}</p>
                <p>{t("section_14.contact_address", "dpa")}</p>
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
