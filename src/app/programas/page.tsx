import { Metadata } from "next";
import Header from "@/components/layout/Header";
import MinEducFooter from "@/components/layout/MinEducFooter";
import LegalFooter from "@/components/layout/LegalFooter";

export const metadata: Metadata = {
  title: "Programas Educativos | Plataforma Astral",
  description:
    "Conoce nuestros programas educativos diseñados para el desarrollo integral de los estudiantes.",
};

export default function ProgramasPage() {
  return (
    <div className="min-h-screen bg-responsive-desktop bg-programas">
      <div className="min-h-screen bg-linear-to-b from-black/30 via-black/20 to-black/40 flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-16 flex-1">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8 text-foreground">
              Nuestros Programas Educativos
            </h1>
            <p className="text-lg text-center text-foreground/90 mb-12">
              Descubre los programas diseñados para potenciar el talento y el
              desarrollo integral de cada estudiante.
            </p>

            {/* Program content will go here */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Placeholder for program cards */}
              <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl shadow-2xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  Programa de Desarrollo
                </h3>
                <p className="text-muted-foreground">
                  Programa integral para el desarrollo académico y personal de
                  los estudiantes.
                </p>
              </div>

              <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl shadow-2xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  Programa de Innovación
                </h3>
                <p className="text-muted-foreground">
                  Fomentando la creatividad y el pensamiento crítico en el
                  aprendizaje.
                </p>
              </div>

              <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl shadow-2xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-foreground">
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
        <LegalFooter />
      </div>
    </div>
  );
}
