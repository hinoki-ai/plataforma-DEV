import { Metadata } from "next";
import Header from "@/components/layout/Header";
import MinEducFooter from "@/components/layout/MinEducFooter";
import LegalFooter from "@/components/layout/LegalFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/contact/ContactForm";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useLanguage } from "@/components/language/LanguageContext";

// Client component to handle translations
function ContactoContent() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-responsive-desktop bg-contacto">
      <div className="min-h-screen bg-linear-to-b from-black/30 via-black/20 to-black/40">
        <Header />
        <main className="container mx-auto px-4 pt-8 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="backdrop-blur-md bg-white/5 dark:bg-black/20 rounded-2xl border border-white/10 dark:border-white/5 shadow-2xl p-6 mx-auto inline-block">
                <h1 className="text-center text-4xl font-bold leading-tight text-gray-900 dark:text-white drop-shadow-2xl transition-all duration-700 ease-out">
                  {t("hero.title", "contacto")}
                </h1>
              </div>
            </div>
            <p className="text-lg text-center text-foreground/90 mb-12">
              {t("hero.subtitle", "contacto")}
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
                          {t("info.section.phone.title", "contacto")}
                        </h4>
                        <div className="space-y-2 ml-6">
                          <div>
                            <p className="font-medium text-foreground">
                              {t("contact.person.loreto.name", "contacto")}
                            </p>
                            <a
                              href="https://wa.me/56937436196"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground font-mono hover:text-green-400 transition-colors"
                            >
                              {t("contact.person.loreto.phone", "contacto")}
                            </a>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {t("contact.person.agustin.name", "contacto")}
                            </p>
                            <a
                              href="https://wa.me/56988896773"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground font-mono hover:text-green-400 transition-colors"
                            >
                              {t("contact.person.agustin.phone", "contacto")}
                            </a>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-lg mb-2 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {t("info.section.email.title", "contacto")}
                        </h4>
                        <div className="ml-6">
                          <a
                            href="mailto:astral@gmail.com"
                            className="text-primary hover:underline"
                          >
                            {t("info.email.address", "contacto")}
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
                          {t("info.section.location.title", "contacto")}
                        </h4>
                        <div className="ml-6">
                          <p className="text-muted-foreground">
                            {t("info.location.address", "contacto")}
                            <br />
                            {t("info.location.street", "contacto")}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-lg mb-3 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {t("info.section.hours.title", "contacto")}
                        </h4>
                        <div className="ml-6">
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>{t("info.hours.monday_friday", "contacto")}</p>
                            <p>{t("info.hours.saturday", "contacto")}</p>
                            <p>{t("info.hours.sunday", "contacto")}</p>
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
                    {t("form.section.title", "contacto")}
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

// Server component for metadata
export async function generateMetadata(): Promise<Metadata> {
  // Since we can't use hooks in server components, we'll use static metadata for now
  // In a real implementation, you might need to use a different approach
  return {
    title: "Contacto | Plataforma Astral",
    description:
      "Ponte en contacto con nosotros. Estamos aquí para ayudarte con tus consultas sobre educación.",
  };
}

export default function ContactoPage() {
  return <ContactoContent />;
}
