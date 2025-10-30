"use client";

import { Metadata } from "next";
import Header from "@/components/layout/Header";
import MinEducFooter from "@/components/layout/MinEducFooter";
import CompactFooter from "@/components/layout/CompactFooter";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

export default function PrivacidadPage() {
  const { t } = useDivineParsing(["privacidad"]);
  return (
    <div className="min-h-screen bg-responsive-desktop bg-contacto">
      <Header />
      <main className="container mx-auto px-4 pt-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="backdrop-blur-md bg-white/5 dark:bg-black/20 rounded-2xl border border-white/10 dark:border-white/5 shadow-2xl p-6 mx-auto inline-block">
              <h1 className="text-center text-4xl font-bold leading-tight text-gray-900 dark:text-white drop-shadow-2xl transition-all duration-700 ease-out">
                {t("title", "privacidad")}
              </h1>
            </div>
          </div>
          <p className="text-lg text-center text-foreground/90 mb-12">
            {t("last_updated", "privacidad")}:{" "}
            {new Date().toLocaleDateString("es-CL")}
          </p>

          <div className="space-y-8 text-foreground">
            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_1.title", "privacidad")}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("section_1.content_1", "privacidad")}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t("section_1.content_2", "privacidad")}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_2.title", "privacidad")}
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t("section_2.direct_info_title", "privacidad")}
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground leading-relaxed ml-4 space-y-1">
                    <li>{t("section_2.direct_info_1", "privacidad")}</li>
                    <li>{t("section_2.direct_info_2", "privacidad")}</li>
                    <li>{t("section_2.direct_info_3", "privacidad")}</li>
                    <li>{t("section_2.direct_info_4", "privacidad")}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t("section_2.technical_info_title", "privacidad")}
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground leading-relaxed ml-4 space-y-1">
                    <li>{t("section_2.technical_info_1", "privacidad")}</li>
                    <li>{t("section_2.technical_info_2", "privacidad")}</li>
                    <li>{t("section_2.technical_info_3", "privacidad")}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_3.title", "privacidad")}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("section_3.content_1", "privacidad")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>{t("section_3.content_2", "privacidad")}</li>
                <li>{t("section_3.content_3", "privacidad")}</li>
                <li>{t("section_3.content_4", "privacidad")}</li>
                <li>{t("section_3.content_5", "privacidad")}</li>
                <li>{t("section_3.content_6", "privacidad")}</li>
                <li>{t("section_3.content_7", "privacidad")}</li>
              </ul>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_5.title", "privacidad")}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("section_5.content_1", "privacidad")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>{t("section_5.content_2", "privacidad")}</li>
                <li>{t("section_5.content_3", "privacidad")}</li>
                <li>{t("section_5.content_4", "privacidad")}</li>
                <li>{t("section_5.content_5", "privacidad")}</li>
                <li>{t("section_5.content_6", "privacidad")}</li>
              </ul>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_4.title", "privacidad")}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("section_4.content_1", "privacidad")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>{t("section_4.content_2", "privacidad")}</li>
                <li>{t("section_4.content_3", "privacidad")}</li>
                <li>{t("section_4.content_4", "privacidad")}</li>
                <li>{t("section_4.content_5", "privacidad")}</li>
              </ul>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_6.title", "privacidad")}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("section_6.content", "privacidad")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>{t("section_6.right_1", "privacidad")}</li>
                <li>{t("section_6.right_2", "privacidad")}</li>
                <li>{t("section_6.right_3", "privacidad")}</li>
                <li>{t("section_6.right_4", "privacidad")}</li>
                <li>{t("section_6.right_5", "privacidad")}</li>
              </ul>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_7.title", "privacidad")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("section_7.content", "privacidad")}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_8.title", "privacidad")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("section_8.content", "privacidad")}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_9.title", "privacidad")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("section_9.content", "privacidad")}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_10.title", "privacidad")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("section_10.content", "privacidad")}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("section_11.title", "privacidad")}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("section_11.content", "privacidad")}
              </p>
              <div className="text-muted-foreground">
                <p>📧 {t("contact.email", "privacidad")}</p>
                <p>📞 {t("contact.phone_1", "privacidad")}</p>
                <p>📞 {t("contact.phone_2", "privacidad")}</p>
                <p>📍 {t("contact.address", "privacidad")}</p>
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
