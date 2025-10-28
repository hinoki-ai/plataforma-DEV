import { Metadata } from "next";
import Header from "@/components/layout/Header";
import MinEducFooter from "@/components/layout/MinEducFooter";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Testimonios | Plataforma Astral",
  description:
    "Lee las experiencias de padres, estudiantes y profesores que confían en nuestra plataforma educativa.",
};

export default function TestimoniosPage() {
  const testimonials = [
    {
      name: "María González",
      role: "Madre de familia",
      content:
        "La plataforma ha transformado la forma en que mi hijo aprende. Los profesores son excepcionales y el seguimiento personalizado es invaluable.",
      avatar: "MG",
    },
    {
      name: "Carlos Rodríguez",
      role: "Estudiante",
      content:
        "Me encanta cómo puedo acceder a mis materiales en cualquier momento. Los recursos son de alta calidad y muy interactivos.",
      avatar: "CR",
    },
    {
      name: "Ana López",
      role: "Profesora",
      content:
        "Como docente, aprecio las herramientas que me permiten dar un mejor seguimiento a cada estudiante. La plataforma facilita mi trabajo diario.",
      avatar: "AL",
    },
    {
      name: "Juan Martínez",
      role: "Padre",
      content:
        "El nivel de compromiso con la educación de calidad es evidente. Mis hijos han mejorado notablemente su rendimiento académico.",
      avatar: "JM",
    },
    {
      name: "Sofia Hernández",
      role: "Directora escolar",
      content:
        "Hemos implementado la plataforma en toda la institución y los resultados han sido extraordinarios. Altamente recomendado.",
      avatar: "SH",
    },
    {
      name: "Diego Silva",
      role: "Estudiante avanzado",
      content:
        "Los programas de innovación me han ayudado a desarrollar habilidades que van más allá del currículo tradicional.",
      avatar: "DS",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-foreground">
            Lo que dicen nuestros usuarios
          </h1>
          <p className="text-lg text-center text-muted-foreground mb-12">
            Descubre las experiencias reales de quienes confían en nuestra
            plataforma educativa.
          </p>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                      <span className="text-primary font-semibold">
                        {testimonial.avatar}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {testimonial.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <blockquote className="text-muted-foreground italic">
                    &ldquo;{testimonial.content}&rdquo;
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <MinEducFooter />
    </div>
  );
}
