import { Metadata } from "next";
import Header from "@/components/layout/Header";
import MinEducFooter from "@/components/layout/MinEducFooter";
import LegalFooter from "@/components/layout/LegalFooter";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Plataforma Astral",
  description: "Términos y condiciones de uso de la Plataforma Astral",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-responsive-desktop bg-contacto">
      <div className="min-h-screen bg-linear-to-b from-black/30 via-black/20 to-black/40">
        <Header />
        <main className="container mx-auto px-4 pt-8 pb-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8 text-foreground">
              Términos y Condiciones
            </h1>
            <p className="text-lg text-center text-foreground/90 mb-12">
              Última actualización: {new Date().toLocaleDateString("es-CL")}
            </p>

            <div className="space-y-8 text-foreground">
              <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-4">
                  1. Aceptación de los Términos
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Al acceder y utilizar la Plataforma Astral, aceptas estar
                  sujeto a estos términos y condiciones de uso. Si no estás de
                  acuerdo con alguna parte de estos términos, no podrás acceder
                  al servicio.
                </p>
              </div>

              <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-4">
                  2. Descripción del Servicio
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Plataforma Astral es una solución SaaS educativa que
                  proporciona herramientas integrales de gestión para
                  instituciones educativas, incluyendo:
                </p>
                <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                  <li>Gestión de usuarios y autenticación</li>
                  <li>Planificación educativa y seguimiento</li>
                  <li>
                    Comunicación entre profesores, padres y administradores
                  </li>
                  <li>Gestión de documentos y recursos educativos</li>
                  <li>Reportes y análisis de rendimiento</li>
                </ul>
              </div>

              <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-4">3. Uso Aceptable</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Te comprometes a utilizar la plataforma únicamente para fines
                  educativos y legales. No está permitido:
                </p>
                <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
                  <li>
                    Utilizar el servicio para actividades ilegales o
                    fraudulentas
                  </li>
                  <li>
                    Compartir credenciales de acceso con terceros no autorizados
                  </li>
                  <li>Intentar acceder a sistemas o datos sin autorización</li>
                  <li>
                    Subir contenido que viole derechos de propiedad intelectual
                  </li>
                  <li>
                    Interferir con el funcionamiento normal de la plataforma
                  </li>
                </ul>
              </div>

              <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-4">
                  4. Propiedad Intelectual
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  La Plataforma Astral y todo su contenido, características y
                  funcionalidad son propiedad de Plataforma Astral y están
                  protegidos por leyes de derechos de autor y propiedad
                  intelectual. Los usuarios mantienen los derechos sobre el
                  contenido que suban, pero otorgan a la plataforma una licencia
                  limitada para procesar y almacenar dicho contenido.
                </p>
              </div>

              <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-4">
                  5. Privacidad y Protección de Datos
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  El tratamiento de datos personales se rige por la Ley 19.628
                  sobre Protección de Datos Personales de Chile y nuestro
                  Acuerdo de Procesamiento de Datos. Nos comprometemos a
                  proteger la privacidad y seguridad de toda la información
                  proporcionada por nuestros usuarios.
                </p>
              </div>

              <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-4">
                  6. Limitación de Responsabilidad
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  La plataforma se proporciona "tal cual" sin garantías de
                  ningún tipo. No nos hacemos responsables por daños indirectos,
                  incidentales o consecuentes que puedan surgir del uso del
                  servicio. Mantenemos niveles de servicio garantizados según el
                  plan contratado.
                </p>
              </div>

              <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-4">
                  7. Modificaciones del Servicio
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Nos reservamos el derecho de modificar, suspender o
                  discontinuar cualquier aspecto del servicio en cualquier
                  momento. Los usuarios serán notificados con anticipación de
                  cambios significativos que puedan afectar su uso del servicio.
                </p>
              </div>

              <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-4">8. Terminación</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Podemos terminar o suspender tu acceso al servicio
                  inmediatamente, sin previo aviso, por cualquier violación de
                  estos términos. Los usuarios pueden cancelar su cuenta en
                  cualquier momento desde la configuración de su perfil.
                </p>
              </div>

              <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-4">9. Ley Aplicable</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Estos términos se rigen por las leyes de la República de
                  Chile. Cualquier disputa será resuelta en los tribunales
                  competentes de Santiago de Chile.
                </p>
              </div>

              <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-4">10. Contacto</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Si tienes preguntas sobre estos términos y condiciones, puedes
                  contactarnos a través de:
                </p>
                <div className="mt-4 text-muted-foreground">
                  <p>📧 contacto@plataformaastral.cl</p>
                  <p>📞 +56 9 3743 6196 (Loreto Gallegos)</p>
                  <p>📞 +56 9 8889 6773 (Agustín Arancibia)</p>
                </div>
              </div>
            </div>
          </div>
        </main>
        <MinEducFooter />
        <LegalFooter />
      </div>
    </div>
  );
}
