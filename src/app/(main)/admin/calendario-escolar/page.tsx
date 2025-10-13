import { Metadata } from "next";
import { CalendarDays, Plus, Download, Upload } from "lucide-react";
import UnifiedCalendarView from "@/components/calendar/UnifiedCalendarView";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/page-transition";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Calendario Escolar 2025 - Administración | Plataforma Astral",
  description:
    "Sistema profesional de gestión de calendario escolar. Administra fechas importantes, eventos académicos y actividades institucionales desde una plataforma integral.",
  keywords:
    "calendario escolar, administración, gestión educativa, Chile, 2025, plataforma SaaS, Astral",
  openGraph: {
    title: "Calendario Escolar 2025 - Administración | Plataforma Astral",
    description:
      "Sistema profesional de gestión de calendario escolar con funciones avanzadas de administración.",
    type: "website",
  },
};

export default function CalendarioEscolarAdminPage() {
  return (
    <PageTransition skeletonType="page" duration={700}>
      <div className="min-h-screen bg-background">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b border-border">
          <div className="container mx-auto px-4 py-8 sm:py-12">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <CalendarDays className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Calendario Escolar 2025 - Administración
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Gestiona y supervisa el año académico completo con nuestro
                calendario interactivo. Administra fechas importantes, eventos
                especiales y actividades para los estudiantes de NT1 y NT2.
              </p>
            </div>
          </div>
        </div>

        {/* Admin Controls */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Panel de Administración
              </h2>
              <p className="text-muted-foreground">
                Gestión completa del calendario escolar con funciones avanzadas
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="w-4 h-4" />
                Importar CSV
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Exportar CSV
              </Button>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Nuevo Evento
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="container mx-auto px-4 py-8">
          <UnifiedCalendarView
            mode="full"
            showAdminControls={true}
            showExport={true}
            initialCategories={[
              "ACADEMIC",
              "HOLIDAY",
              "SPECIAL",
              "ADMINISTRATIVE",
              "MEETING",
            ]}
            userRole="ADMIN"
          />
        </div>

        {/* Admin Features Info */}
        <div className="bg-muted/30 border-t border-border">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  Gestión de Eventos
                </h3>
                <p className="text-sm text-muted-foreground">
                  Crear, editar y eliminar eventos del calendario
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  Importar/Exportar
                </h3>
                <p className="text-sm text-muted-foreground">
                  Importar eventos desde CSV y exportar el calendario completo
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  Eventos Recurrentes
                </h3>
                <p className="text-sm text-muted-foreground">
                  Crear eventos que se repiten semanal o mensualmente
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Plantillas</h3>
                <p className="text-sm text-muted-foreground">
                  Usar plantillas predefinidas para eventos comunes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
