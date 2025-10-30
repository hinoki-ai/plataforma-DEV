"use client";

import { useLanguage } from "@/components/language/LanguageContext";

export default function HomepageFooter() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      {/* Main Footer Content - Enhanced */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">
              {t("home.footer.school.name", "common")}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t("home.footer.school.description", "common")}
            </p>
            <div className="space-y-2 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <span>{t("home.footer.contact.address", "common")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{t("home.footer.contact.phone", "common")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{t("home.footer.contact.email", "common")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">{t("home.footer.hours", "common")}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">
              {t("home.footer.quick.links", "common")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/cpma"
                  className="text-gray-400 hover:text-primary transition-colors"
                  aria-label={t("home.footer.aria.team", "common")}
                >
                  {t("home.footer.links.team", "common")}
                </a>
              </li>
              <li>
                <a
                  href="/programas"
                  className="text-gray-400 hover:text-primary transition-colors"
                  aria-label={t("home.footer.aria.portal", "common")}
                >
                  {t("home.footer.links.portal", "common")}
                </a>
              </li>
              <li>
                <a
                  href="https://www.mineduc.cl/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary transition-colors"
                  aria-label={t("home.footer.aria.mineduc", "common")}
                >
                  {t("home.footer.links.mineduc", "common")}
                </a>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">
              {t("home.footer.information", "common")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/terminos"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a
                  href="/privacidad"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a
                  href="/dpa"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Acuerdo de Procesamiento de Datos (DPA)
                </a>
              </li>
              <li>
                <a
                  href="/contacto"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Developer Info */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">
              {t("home.footer.developed.by", "common")}
            </h4>
            <div className="space-y-2">
              <a
                href="https://aramac.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
                aria-label={t("home.footer.aria.developer", "common")}
              >
                ΛRΛMΛC
              </a>
              <p className="text-gray-400 text-xs">
                {t("home.footer.school.info", "common")}
              </p>
              <p className="text-gray-500 text-xs">
                {t("home.footer.days", "common")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Copyright and Legal Links */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="text-gray-300 text-sm text-center lg:text-left">
              <div className="font-medium mb-1">
                {t("home.footer.copyright", "common").replace("{year}", new Date().getFullYear().toString())}
              </div>
              <div className="text-xs text-gray-500">
                {t("home.footer.school.info", "common")} • {t("home.footer.days", "common")}
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-400">
              <span className="bg-gray-800 px-3 py-1 rounded-full">
                {t("home.footer.rbd", "common")}
              </span>
              <span className="bg-gray-800 px-3 py-1 rounded-full">
                24/7 Support
              </span>
              <span className="bg-gray-800 px-3 py-1 rounded-full">
                Multi-institucional
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
