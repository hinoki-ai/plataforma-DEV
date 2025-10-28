import { Metadata } from "next";
import Header from "@/components/layout/Header";
import MinEducFooter from "@/components/layout/MinEducFooter";

export const metadata: Metadata = {
  title: "Programas Educativos | Plataforma Astral",
  description:
    "Conoce nuestros programas educativos diseñados para el desarrollo integral de los estudiantes.",
};

export default function ProgramasPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-foreground">
            Nuestros Programas Educativos
          </h1>
          <p className="text-lg text-center text-muted-foreground mb-12">
            Descubre los programas diseñados para potenciar el talento y el
            desarrollo integral de cada estudiante.
          </p>

          {/* Program content will go here */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Placeholder for program cards */}
            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <h3 className="text-xl font-semibold mb-4">
                Programa de Desarrollo
              </h3>
              <p className="text-muted-foreground">
                Programa integral para el desarrollo académico y personal de los
                estudiantes.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <h3 className="text-xl font-semibold mb-4">
                Programa de Innovación
              </h3>
              <p className="text-muted-foreground">
                Fomentando la creatividad y el pensamiento crítico en el
                aprendizaje.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <h3 className="text-xl font-semibold mb-4">
                Programa de Liderazgo
              </h3>
              <p className="text-muted-foreground">
                Desarrollando habilidades de liderazgo y trabajo en equipo.
              </p>
            </div>
          </div>
        </div>
      </main>
      <MinEducFooter />
    </div>
  );
}
