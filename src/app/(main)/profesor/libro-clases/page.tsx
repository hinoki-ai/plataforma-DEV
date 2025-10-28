"use client";

import { useState, useEffect } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleAwareHeader } from "@/components/layout/RoleAwareNavigation";
import { BookOpen, Plus, Calendar, Users, FileText } from "lucide-react";
import { useDivineParsing } from "@/components/language/useDivineLanguage";

export default function ProfesorLibroClasesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useDivineParsing(["common", "profesor"]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <RoleAwareHeader
          title="Mis Libros de Clases"
          subtitle="Gestiona tus clases y el progreso de tus estudiantes"
          actions={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Clase
            </Button>
          }
        />

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Clases Activas
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Estudiantes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">147</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Actividades Pendientes
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Próxima Clase
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">Hoy 14:00</div>
              <div className="text-xs text-muted-foreground">
                Matemáticas 8°B
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classes List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Mis Clases</h2>

          {[
            {
              subject: "Matemáticas",
              grade: "8° Básico",
              students: 28,
              nextClass: "Hoy 14:00",
              status: "active",
            },
            {
              subject: "Matemáticas",
              grade: "7° Básico",
              students: 32,
              nextClass: "Mañana 10:00",
              status: "active",
            },
            {
              subject: "Ciencias",
              grade: "8° Básico",
              students: 26,
              nextClass: "Viernes 11:00",
              status: "active",
            },
            {
              subject: "Ciencias",
              grade: "7° Básico",
              students: 30,
              nextClass: "Sin programar",
              status: "inactive",
            },
          ].map((classItem, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {classItem.subject} - {classItem.grade}
                      </h3>
                      <p className="text-muted-foreground">
                        {classItem.students} estudiantes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">Próxima clase</p>
                      <p className="text-sm text-muted-foreground">
                        {classItem.nextClass}
                      </p>
                    </div>
                    <Badge
                      variant={
                        classItem.status === "active" ? "default" : "secondary"
                      }
                    >
                      {classItem.status === "active" ? "Activa" : "Inactiva"}
                    </Badge>
                    <Button variant="outline">Gestionar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
