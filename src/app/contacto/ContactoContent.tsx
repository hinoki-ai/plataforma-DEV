"use client";

import Header from "@/components/layout/Header";
import MinEducFooter from "@/components/layout/MinEducFooter";
import CompactFooter from "@/components/layout/CompactFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/contact/ContactForm";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { useState, useEffect } from "react";
import { motion, Variants } from "motion/react";

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerChildren: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function ContactoContent() {
  const { t } = useDivineParsing(["common", "contacto"]);
  const [mounted] = useState(true);

  return (
    <div className="min-h-screen bg-responsive-desktop bg-contacto">
      <Header />
      <main id="main-content" className="container mx-auto px-4 pt-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerChildren}
              className="max-w-4xl mx-auto"
            >
              <motion.div
                variants={fadeInUp}
                className={`transition-all duration-700 ease-out ${
                  mounted
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <div className="backdrop-blur-md bg-white/5 dark:bg-black/20 rounded-2xl border border-white/10 dark:border-white/5 shadow-2xl p-6 mx-auto inline-block">
                  <h1 className="text-center text-4xl font-bold leading-tight text-gray-900 dark:text-white drop-shadow-2xl transition-all duration-700 ease-out">
                    {t("hero.title", "contacto")}
                  </h1>
                  <p className="text-center text-lg font-medium leading-relaxed text-gray-700 dark:text-gray-300 mt-3 transition-all duration-700 ease-out">
                    {t("hero.subtitle", "contacto")}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>

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
      <CompactFooter />
    </div>
  );
}
