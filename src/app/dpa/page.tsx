"use client";

import { Metadata } from "next";
import Header from "@/components/layout/Header";
import MinEducFooter from "@/components/layout/MinEducFooter";
import CompactFooter from "@/components/layout/CompactFooter";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

export default function DpaPage() {
  const { t } = useDivineParsing(["dpa"]);

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
              <h2 className="text-2xl font-bold mb-4">{t("section_2.title", "dpa")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("section_2.content", "dpa")}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">{t("section_3.title", "dpa")}</h2>
              <div className="space-y-3 text-muted-foreground">
                <div>
                  <strong>{t("section_3.personal_data", "dpa")}:</strong> {t("section_3.personal_data_desc", "dpa")}
                </div>
                <div>
                  <strong>{t("section_3.processing", "dpa")}:</strong> {t("section_3.processing_desc", "dpa")}
                </div>
                <div>
                  <strong>{t("section_3.sensitive_data", "dpa")}:</strong> {t("section_3.sensitive_data_desc", "dpa")}
                </div>
                <div>
                  <strong>{t("section_3.security_measures", "dpa")}:</strong> {t("section_3.security_measures_desc", "dpa")}
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
                    {t("section_4.user_data_items", "dpa").map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t("section_4.student_data", "dpa")}:
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground leading-relaxed ml-4 space-y-1">
                    {t("section_4.student_data_items", "dpa").map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                5. Finalidades del Tratamiento
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Los datos se procesan únicamente para:
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>Gestionar el acceso y uso de la plataforma educativa</li>
                <li>Facilitar la comunicación entre comunidad educativa</li>
                <li>Generar reportes académicos y administrativos</li>
                <li>Cumplir con obligaciones legales y regulatorias</li>
                <li>Garantizar la seguridad y integridad del sistema</li>
                <li>Mejorar la calidad de los servicios educativos</li>
              </ul>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                6. Obligaciones del Responsable
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Plataforma Astral se compromete a:
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>
                  Procesar datos únicamente según instrucciones documentadas
                </li>
                <li>
                  Implementar medidas de seguridad técnicas y organizativas
                  apropiadas
                </li>
                <li>Notificar inmediatamente cualquier brecha de seguridad</li>
                <li>
                  Asistir al encargado en la respuesta a solicitudes de derechos
                  ARCO
                </li>
                <li>Eliminar o devolver datos al finalizar el servicio</li>
                <li>Permitir auditorías y revisiones de cumplimiento</li>
              </ul>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                7. Obligaciones del Encargado
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                La institución educativa se compromete a:
              </p>
              <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                <li>
                  Proporcionar instrucciones claras sobre el tratamiento de
                  datos
                </li>
                <li>
                  Obtener consentimientos necesarios antes de transferir datos
                </li>
                <li>
                  Notificar cambios que puedan afectar la seguridad de los datos
                </li>
                <li>Cooperar en la implementación de medidas de seguridad</li>
                <li>Informar sobre requisitos legales aplicables</li>
              </ul>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                8. Medidas de Seguridad
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Medidas Técnicas:
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground leading-relaxed ml-4 space-y-1">
                    <li>Cifrado de datos en tránsito y en reposo</li>
                    <li>Controles de acceso basados en roles</li>
                    <li>Autenticación multifactor</li>
                    <li>Monitoreo continuo de seguridad</li>
                    <li>Copias de seguridad encriptadas</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Medidas Organizativas:
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground leading-relaxed ml-4 space-y-1">
                    <li>Personal capacitado en protección de datos</li>
                    <li>Políticas de seguridad documentadas</li>
                    <li>Evaluaciones de riesgo periódicas</li>
                    <li>Procedimientos de respuesta a incidentes</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                9. Transferencias Internacionales
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Los datos se procesan y almacenan exclusivamente en servidores
                ubicados en Chile. No se realizan transferencias internacionales
                de datos personales sin el consentimiento expreso del titular y
                las garantías adecuadas según la legislación aplicable.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                10. Duración y Terminación
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Este acuerdo tiene vigencia mientras dure la relación
                contractual entre Plataforma Astral y la institución educativa.
                Al finalizar el servicio, los datos serán eliminados o devueltos
                según las instrucciones del encargado, salvo que exista
                obligación legal de retención.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                11. Responsabilidad y Indemnización
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Cada parte será responsable por las infracciones que cometa a
                este acuerdo. En caso de reclamaciones de terceros por
                tratamiento indebido de datos, las partes cooperarán para
                resolver la situación y cubrir los costos asociados según
                corresponda.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                12. Ley Aplicable y Jurisdicción
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Este acuerdo se rige por la legislación chilena, particularmente
                la Ley 19.628 sobre Protección de Datos Personales. Cualquier
                controversia será resuelta en los tribunales competentes de
                Santiago de Chile.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">13. Modificaciones</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cualquier modificación a este acuerdo debe ser realizada por
                escrito y contar con la aprobación de ambas partes. Los cambios
                significativos serán notificados con al menos 30 días de
                anticipación.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                14. Contacto para Protección de Datos
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Para consultas relacionadas con el tratamiento de datos
                personales:
              </p>
              <div className="text-muted-foreground">
                <p>📧 dpo@plataformaastral.cl</p>
                <p>📞 +56 9 3743 6196 (Oficial de Protección de Datos)</p>
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
