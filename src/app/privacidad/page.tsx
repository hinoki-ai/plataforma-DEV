"use client";

import { Metadata } from "next";
import Header from "@/components/layout/Header";
import MinEducFooter from "@/components/layout/MinEducFooter";
import CompactFooter from "@/components/layout/CompactFooter";
import { useLanguage } from "@/components/language/LanguageContext";

export default function PrivacidadPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-responsive-desktop bg-contacto">
      <Header />
      <main className="container mx-auto px-4 pt-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="backdrop-blur-md bg-white/5 dark:bg-black/20 rounded-2xl border border-white/10 dark:border-white/5 shadow-2xl p-6 mx-auto inline-block">
              <h1 className="text-center text-4xl font-bold leading-tight text-gray-900 dark:text-white drop-shadow-2xl transition-all duration-700 ease-out">
                {t("privacidad.title")}
              </h1>
            </div>
          </div>
          <p className="text-lg text-center text-foreground/90 mb-12">
            {t("privacidad.last_updated")}:{" "}
            {new Date().toLocaleDateString("es-CL")}
          </p>

          <div className="space-y-8 text-foreground">
            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("privacidad.section_1.title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("privacidad.section_1.content_1")}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t("privacidad.section_1.content_2")}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("privacidad.section_2.title")}
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t("privacidad.section_2.direct_info_title")}
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground leading-relaxed ml-4 space-y-1">
                    <li>{t("privacidad.section_2.direct_info_1")}</li>
                    <li>{t("privacidad.section_2.direct_info_2")}</li>
                    <li>{t("privacidad.section_2.direct_info_3")}</li>
                    <li>{t("privacidad.section_2.direct_info_4")}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t("privacidad.section_2.technical_info_title")}
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground leading-relaxed ml-4 space-y-1">
                    <li>{t("privacidad.section_2.technical_info_1")}</li>
                    <li>{t("privacidad.section_2.technical_info_2")}</li>
                    <li>{t("privacidad.section_2.technical_info_3")}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("privacidad.section_3.title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("privacidad.section_3.content_1")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>{t("privacidad.section_3.content_2")}</li>
                <li>{t("privacidad.section_3.content_3")}</li>
                <li>{t("privacidad.section_3.content_4")}</li>
                <li>{t("privacidad.section_3.content_5")}</li>
                <li>{t("privacidad.section_3.content_6")}</li>
                <li>{t("privacidad.section_3.content_7")}</li>
              </ul>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("privacidad.section_5.title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("privacidad.section_5.content_1")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>{t("privacidad.section_5.content_2")}</li>
                <li>{t("privacidad.section_5.content_3")}</li>
                <li>{t("privacidad.section_5.content_4")}</li>
                <li>{t("privacidad.section_5.content_5")}</li>
                <li>{t("privacidad.section_5.content_6")}</li>
              </ul>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("privacidad.section_4.title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("privacidad.section_4.content_1")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>{t("privacidad.section_4.content_2")}</li>
                <li>{t("privacidad.section_4.content_3")}</li>
                <li>{t("privacidad.section_4.content_4")}</li>
                <li>{t("privacidad.section_4.content_5")}</li>
              </ul>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("privacidad.section_6.title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("privacidad.section_6.content")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>{t("privacidad.section_6.right_1")}</li>
                <li>{t("privacidad.section_6.right_2")}</li>
                <li>{t("privacidad.section_6.right_3")}</li>
                <li>{t("privacidad.section_6.right_4")}</li>
                <li>{t("privacidad.section_6.right_5")}</li>
              </ul>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("privacidad.section_7.title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("privacidad.section_7.content")}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">{t("privacidad.section_8.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("privacidad.section_8.content")}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">{t("privacidad.section_9.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("privacidad.section_9.content")}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t("privacidad.section_10.title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("privacidad.section_10.content")}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">{t("privacidad.section_11.title")}</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("privacidad.section_11.content")}
              </p>
              <div className="text-muted-foreground">
                <p>📧 {t("privacidad.contact.email")}</p>
                <p>📞 {t("privacidad.contact.phone_1")}</p>
                <p>📞 {t("privacidad.contact.phone_2")}</p>
                <p>📍 {t("privacidad.contact.address")}</p>
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
