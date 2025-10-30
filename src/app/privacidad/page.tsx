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
                3. Uso de la Información
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Utilizamos tus datos para:
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>Proporcionar y mantener el servicio educativo</li>
                <li>Personalizar la experiencia de usuario</li>
                <li>Garantizar la seguridad y prevenir fraudes</li>
                <li>Cumplir con obligaciones legales y regulatorias</li>
                <li>
                  Mejorar nuestros servicios y desarrollar nuevas
                  funcionalidades
                </li>
                <li>Comunicar información importante sobre el servicio</li>
              </ul>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                4. Almacenamiento y Seguridad
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Tus datos se almacenan en servidores ubicados en Chile con altos
                estándares de seguridad:
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>Cifrado end-to-end para datos sensibles</li>
                <li>Controles de acceso estrictos</li>
                <li>Copias de seguridad automáticas diarias</li>
                <li>Monitoreo continuo de seguridad</li>
                <li>Cumplimiento con estándares ISO 27001 (en proceso)</li>
              </ul>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                5. Compartir Información
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                No vendemos ni alquilamos tus datos personales. Podemos
                compartir información únicamente en estos casos:
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>Con tu consentimiento expreso</li>
                <li>Para cumplir con obligaciones legales</li>
                <li>
                  Con proveedores de servicios que nos ayudan a operar (bajo
                  acuerdos de confidencialidad)
                </li>
                <li>En caso de fusión, adquisición o venta de activos</li>
              </ul>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                6. Derechos de los Usuarios
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Según la Ley 19.628, tienes derecho a:
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>Acceder a tus datos personales</li>
                <li>Rectificar información inexacta o incompleta</li>
                <li>Solicitar la eliminación de tus datos</li>
                <li>Oponerte al tratamiento de tus datos</li>
                <li>Solicitar la portabilidad de tus datos</li>
              </ul>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                7. Cookies y Tecnologías Similares
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos cookies esenciales para el funcionamiento del
                servicio y cookies opcionales para mejorar tu experiencia.
                Puedes gestionar tus preferencias de cookies desde la
                configuración de tu navegador o perfil de usuario.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">8. Retención de Datos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Conservamos tus datos durante el tiempo necesario para
                proporcionar el servicio y cumplir con obligaciones legales. Los
                datos de cuentas inactivas se eliminan automáticamente después
                de 90 días de inactividad, salvo requerimientos legales
                específicos.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">9. Menores de Edad</h2>
              <p className="text-muted-foreground leading-relaxed">
                Protegernos la privacidad de los menores de edad. Los datos de
                estudiantes son tratados únicamente con autorización expresa de
                padres o tutores legales, y solo para fines educativos.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                10. Cambios a esta Política
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos actualizar esta política de privacidad periódicamente.
                Los cambios significativos serán notificados a través del
                sistema y por email. El uso continuado del servicio después de
                los cambios constituye aceptación de la nueva política.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">11. Contacto</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Para ejercer tus derechos o hacer consultas sobre privacidad:
              </p>
              <div className="text-muted-foreground">
                <p>📧 privacidad@plataformaastral.cl</p>
                <p>📞 +56 9 3743 6196 (Loreto Gallegos)</p>
                <p>📞 +56 9 8889 6773 (Agustín Arancibia)</p>
                <p>
                  📍 Avenida Libertad #777, Viña del Mar, Región de Valparaíso
                </p>
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
