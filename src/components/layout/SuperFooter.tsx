"use client";

import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

export default function HomepageFooter() {
  const { t } = useDivineParsing(["common"]);

  return (
    <footer className="relative bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700/50 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 footer-bg-pattern" />

      <div className="relative max-w-7xl mx-auto px-4 py-16">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {/* Brand & Contact - Compact */}
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-xl mb-2 bg-linear-to-r from-white to-slate-300 bg-clip-text text-transparent">
                {t("home.footer.school.name", "common")}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                {t("home.footer.school.description", "common")}
              </p>
            </div>

            {/* Contact Icons - Clean & Minimal */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center group-hover:bg-slate-700/50 transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm">
                  {t("home.footer.contact.address", "common")}
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center group-hover:bg-slate-700/50 transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <span className="text-sm">
                  {t("home.footer.contact.phone", "common")}
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center group-hover:bg-slate-700/50 transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-sm">
                  {t("home.footer.contact.email", "common")}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links - Clean Layout */}
          <div className="space-y-6">
            <h4 className="text-white font-semibold text-lg">
              {t("home.footer.quick.links", "common")}
            </h4>

            <div className="grid grid-cols-1 gap-3">
              <a
                href="/cpma"
                className="flex items-center gap-3 text-slate-400 hover:text-white transition-all duration-200 group p-2 rounded-lg hover:bg-slate-800/30"
                aria-label={t("home.footer.aria.team", "common")}
              >
                <div className="w-6 h-6 rounded-md bg-linear-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium">
                  {t("home.footer.links.team", "common")}
                </span>
              </a>

              <a
                href="/programas"
                className="flex items-center gap-3 text-slate-400 hover:text-white transition-all duration-200 group p-2 rounded-lg hover:bg-slate-800/30"
                aria-label={t("home.footer.aria.portal", "common")}
              >
                <div className="w-6 h-6 rounded-md bg-linear-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium">
                  {t("home.footer.links.portal", "common")}
                </span>
              </a>

              <a
                href="https://www.mineduc.cl/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-slate-400 hover:text-white transition-all duration-200 group p-2 rounded-lg hover:bg-slate-800/30"
                aria-label={t("home.footer.aria.mineduc", "common")}
              >
                <div className="w-6 h-6 rounded-md bg-linear-to-br from-red-500/20 to-blue-500/20 flex items-center justify-center group-hover:from-red-500/30 group-hover:to-blue-500/30 transition-all">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium">
                  {t("home.footer.links.mineduc", "common")}
                </span>
              </a>
            </div>
          </div>

          {/* Legal & Developer - Streamlined */}
          <div className="space-y-6">
            <h4 className="text-white font-semibold text-lg">
              {t("home.footer.information", "common")}
            </h4>

            <div className="space-y-3">
              <a
                href="/terminos"
                className="block text-slate-400 hover:text-white transition-colors text-sm hover:translate-x-1 transform duration-200"
              >
                Términos y Condiciones
              </a>
              <a
                href="/privacidad"
                className="block text-slate-400 hover:text-white transition-colors text-sm hover:translate-x-1 transform duration-200"
              >
                Política de Privacidad
              </a>
              <a
                href="/acuerdo-proteccion-datos"
                className="block text-slate-400 hover:text-white transition-colors text-sm hover:translate-x-1 transform duration-200"
              >
                DPA
              </a>
              <a
                href="/contacto"
                className="block text-slate-400 hover:text-white transition-colors text-sm hover:translate-x-1 transform duration-200"
              >
                Contacto
              </a>
            </div>

            {/* Developer Credit - Minimal */}
            <div className="pt-6 border-t border-slate-700/50">
              <p className="text-slate-500 text-xs mb-2">
                {t("home.footer.developed.by", "common")}
              </p>
              <a
                href="https://aramac.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E73C48] hover:text-[#d63342] transition-colors font-bold text-sm"
                aria-label={t("home.footer.aria.developer", "common")}
              >
                ΛRΛMΛC
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Clean & Minimal */}
      <div className="relative border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-400 text-sm">
              {t("home.footer.copyright", "common").replace(
                "{year}",
                new Date().getFullYear().toString(),
              )}
            </div>

            {/* Status Badges - Modern Design */}
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-1.5 bg-linear-to-r from-slate-800 to-slate-700 border border-slate-600/50 rounded-full text-xs text-slate-300 font-medium">
                {t("home.footer.rbd", "common")}
              </span>
              <span className="px-4 py-1.5 bg-linear-to-r from-green-900/50 to-green-800/50 border border-green-700/30 rounded-full text-xs text-green-300 font-medium">
                24/7 Support
              </span>
              <span className="px-4 py-1.5 bg-linear-to-r from-blue-900/50 to-blue-800/50 border border-blue-700/30 rounded-full text-xs text-blue-300 font-medium">
                Multi-institucional
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
