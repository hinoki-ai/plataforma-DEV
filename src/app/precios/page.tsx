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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-foreground">
            Planes y Precios
          </h1>
          <p className="text-lg text-center text-muted-foreground mb-12">
            Elige el plan que mejor se adapte a tus necesidades educativas.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Plan Básico */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">Plan Básico</CardTitle>
                <CardDescription>Para estudiantes individuales</CardDescription>
                <div className="text-3xl font-bold text-primary">
                  $9.990<span className="text-sm font-normal">/mes</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li>✓ Acceso a plataforma educativa</li>
                  <li>✓ Materiales de estudio básicos</li>
                  <li>✓ Seguimiento académico</li>
                  <li>✓ Soporte por email</li>
                </ul>
                <Button className="w-full">Seleccionar Plan</Button>
              </CardContent>
            </Card>

            {/* Plan Profesional */}
            <Card className="relative border-primary">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Más Popular
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Plan Profesional</CardTitle>
                <CardDescription>
                  Para familias y grupos pequeños
                </CardDescription>
                <div className="text-3xl font-bold text-primary">
                  $19.990<span className="text-sm font-normal">/mes</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li>✓ Todo lo del Plan Básico</li>
                  <li>✓ Hasta 5 estudiantes</li>
                  <li>✓ Materiales avanzados</li>
                  <li>✓ Reuniones virtuales</li>
                  <li>✓ Soporte prioritario</li>
                </ul>
                <Button className="w-full" variant="default">
                  Seleccionar Plan
                </Button>
              </CardContent>
            </Card>

            {/* Plan Institucional */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">Plan Institucional</CardTitle>
                <CardDescription>Para escuelas y colegios</CardDescription>
                <div className="text-3xl font-bold text-primary">
                  Contactar
                  <span className="text-sm font-normal block">
                    Personalizado
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li>✓ Solución completa</li>
                  <li>✓ Estudiantes ilimitados</li>
                  <li>✓ Integración con sistemas existentes</li>
                  <li>✓ Soporte técnico dedicado</li>
                  <li>✓ Capacitación del personal</li>
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
  );
}
