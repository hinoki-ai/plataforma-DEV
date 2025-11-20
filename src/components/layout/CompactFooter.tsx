"use client";

import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

export default function CompactFooter() {
  const { t } = useDivineParsing(["common"]);

  return (
    <div className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="text-gray-300 text-sm">
            © {new Date().getFullYear()} Plataforma Astral. Todos los derechos
            reservados.
          </div>
          <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-gray-400">
            <a
              href="/terminos"
              className="hover:text-primary transition-colors underline"
            >
              Términos y Condiciones
            </a>
            <a
              href="/privacidad"
              className="hover:text-primary transition-colors underline"
            >
              Política de Privacidad
            </a>
            <a
              href="/acuerdo-proteccion-datos"
              className="hover:text-primary transition-colors underline"
            >
              Acuerdo de Procesamiento de Datos (DPA)
            </a>
            <a
              href="/contacto"
              className="hover:text-primary transition-colors underline"
            >
              Contacto
            </a>
          </div>
          <a
            href="https://aramac.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#E73C48] hover:text-[#d63342] transition-colors font-bold text-sm mr-2"
            aria-label={t("home.footer.aria.developer", "common")}
          >
            ΛRΛMΛC
          </a>
        </div>
      </div>
    </div>
  );
}
