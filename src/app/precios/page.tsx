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

export const metadata: Metadata = {
  title: "Precios | Plataforma Astral",
  description:
    "Conoce nuestros planes y precios para acceder a la plataforma educativa.",
};

export default function PreciosPage() {
  return (
    <div className="min-h-screen bg-responsive-desktop bg-precios">
      <div className="min-h-screen bg-gradient-to-b from-black/30 via-black/20 to-black/40">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8 text-white">
              Planes y Precios
            </h1>
            <p className="text-lg text-center text-white/90 mb-12">
              Elige el plan que mejor se adapte a tus necesidades educativas.
            </p>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Plan Básico */}
              <Card className="relative backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">
                    Plan Básico
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Hasta 50 estudiantes
                  </CardDescription>
                  <div className="text-3xl font-bold text-primary">
                    $2.000<span className="text-sm font-normal">/mes</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>✓ Acceso a plataforma educativa</li>
                    <li>✓ Materiales de estudio básicos</li>
                    <li>✓ Seguimiento académico</li>
                    <li>✓ Soporte por email</li>
                  </ul>
                  <Button className="w-full">Seleccionar Plan</Button>
                </CardContent>
              </Card>

              {/* Plan Avanzado */}
              <Card className="relative backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Más Popular
                  </span>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl text-white">
                    Plan Avanzado
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Hasta 350 estudiantes
                  </CardDescription>
                  <div className="text-3xl font-bold text-primary">
                    $1.750<span className="text-sm font-normal">/mes</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>✓ Todo lo del Plan Básico</li>
                    <li>✓ Materiales avanzados</li>
                    <li>✓ Reuniones virtuales</li>
                    <li>✓ Soporte prioritario</li>
                    <li>✓ Análisis de rendimiento</li>
                  </ul>
                  <Button className="w-full" variant="default">
                    Seleccionar Plan
                  </Button>
                </CardContent>
              </Card>

              {/* Plan Institucional */}
              <Card className="relative backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">
                    Plan Institucional
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Hasta 1.000 estudiantes
                  </CardDescription>
                  <div className="text-3xl font-bold text-primary">
                    $1.500<span className="text-sm font-normal">/mes</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>✓ Solución completa</li>
                    <li>✓ Integración con sistemas existentes</li>
                    <li>✓ Soporte técnico dedicado</li>
                    <li>✓ Capacitación del personal</li>
                    <li>✓ Reportes avanzados</li>
                  </ul>
                  <Button className="w-full" variant="outline">
                    Contactar Ventas
                  </Button>
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
