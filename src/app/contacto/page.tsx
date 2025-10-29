import { Metadata } from "next";
import Header from "@/components/layout/Header";
import MinEducFooter from "@/components/layout/MinEducFooter";
import LegalFooter from "@/components/layout/LegalFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/contact/ContactForm";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contacto | Plataforma Astral",
  description:
    "Ponte en contacto con nosotros. Estamos aquí para ayudarte con tus consultas sobre educación.",
};

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-responsive-desktop bg-contacto">
      <div className="min-h-screen bg-linear-to-b from-black/30 via-black/20 to-black/40">
        <Header />
        <main className="container mx-auto px-4 pt-8 pb-16">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8 text-foreground">
              Contacto
            </h1>
            <p className="text-lg text-center text-foreground/90 mb-12">
              Estamos aquí para ayudarte. No dudes en ponerte en contacto con
              nosotros.
            </p>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Contact Information */}
              <div className="space-y-8">
                <Card className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl shadow-2xl">
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-bold text-foreground text-lg mb-3 flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Teléfonos de Contacto
                        </h4>
                        <div className="space-y-2 ml-6">
                          <div>
                            <p className="font-medium text-foreground">
                              Loreto Gallegos Estay
                            </p>
                            <a
                              href="https://wa.me/56937436196"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground font-mono hover:text-green-400 transition-colors"
                            >
                              +569 3743 6196
                            </a>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              Agustin Arancibia Mac-Guire
                            </p>
                            <a
                              href="https://wa.me/56988896773"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground font-mono hover:text-green-400 transition-colors"
                            >
                              +569 8889 6773
                            </a>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-lg mb-2 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Correo Electrónico
                        </h4>
                        <div className="ml-6">
                          <a
                            href="mailto:contacto@plataformaastral.cl"
                            className="text-primary hover:underline"
                          >
                            contacto@plataformaastral.cl
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl shadow-2xl">
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-bold text-foreground text-lg mb-3 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Ubicación
                        </h4>
                        <div className="ml-6">
                          <p className="text-muted-foreground">
                            Región de Valparaíso, Viña Del Mar
                            <br />
                            Avenida Libertad #777
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-lg mb-3 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Horarios
                        </h4>
                        <div className="ml-6">
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Lunes a Viernes: 8:00 - 18:00</p>
                            <p>Sábado: 9:00 - 13:00</p>
                            <p>Domingo: Cerrado</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Form */}
              <Card className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg font-bold">
                    Envíanos un mensaje
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ContactForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <MinEducFooter />
        <LegalFooter />
      </div>
    </div>
  );
}
