"use client";

import { useLanguage } from "@/components/language/LanguageContext";

export default function CompactFooter() {
  const { t } = useLanguage();

  return (
    <div className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-300 text-sm">
            © {new Date().getFullYear()} Plataforma Astral. Todos los derechos
            reservados.
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-400">
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
              href="/dpa"
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
        </div>
      </div>
    </div>
  );
}
