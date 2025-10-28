import { Metadata } from "next";
import Header from "@/components/layout/Header";
import MinEducFooter from "@/components/layout/MinEducFooter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contacto | Plataforma Astral",
  description:
    "Ponte en contacto con nosotros. Estamos aquí para ayudarte con tus consultas sobre educación.",
};

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-responsive-desktop bg-contacto">
      <div className="min-h-screen bg-gradient-to-b from-black/30 via-black/20 to-black/40">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8 text-white">
              Contacto
            </h1>
            <p className="text-lg text-center text-white/90 mb-12">
              Estamos aquí para ayudarte. No dudes en ponerte en contacto con
              nosotros.
            </p>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Contact Information */}
              <div className="space-y-8">
                <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <MapPin className="h-5 w-5" />
                      Ubicación
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-gray-300">
                      Región de Valparaíso, Viña Del Mar
                      <br />
                      Avenida Libertad #777
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Phone className="h-5 w-5" />
                      Teléfonos de Contacto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="font-medium text-white">
                          Loreto Gallegos Estay
                        </p>
                        <p className="text-gray-300 font-mono">
                          +569 3743 6196
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          Agustin Arancibia Mac-Guire
                        </p>
                        <p className="text-gray-300 font-mono">
                          +569 8889 6773
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Mail className="h-5 w-5" />
                      Correo Electrónico
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-gray-300">
                      <a
                        href="mailto:contacto@plataformaastral.cl"
                        className="text-primary hover:underline"
                      >
                        contacto@plataformaastral.cl
                      </a>
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Clock className="h-5 w-5" />
                      Horario de Atención
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p>Lunes a Viernes: 8:00 - 18:00</p>
                      <p>Sábado: 9:00 - 13:00</p>
                      <p>Domingo: Cerrado</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Form */}
              <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white">
                    Envíanos un mensaje
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Completa el formulario y nos pondremos en contacto contigo
                    lo antes posible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium mb-1 text-white"
                        >
                          Nombre
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium mb-1 text-white"
                        >
                          Apellido
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-1 text-white"
                      >
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium mb-1 text-white"
                      >
                        Asunto
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium mb-1 text-white"
                      >
                        Mensaje
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white resize-none"
                        required
                      ></textarea>
                    </div>

                    <Button type="submit" className="w-full">
                      Enviar mensaje
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <MinEducFooter />
      </div>
    </div>
  );
}
