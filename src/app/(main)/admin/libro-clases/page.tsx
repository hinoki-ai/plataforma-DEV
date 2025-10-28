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
import { BookOpen, Plus, Search, Filter } from "lucide-react";
import { useDivineParsing } from "@/components/language/useDivineLanguage";

export default function AdminLibroClasesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useDivineParsing(["common", "admin"]);

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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
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
          title="Libro de Clases - Administración"
          subtitle="Gestión centralizada de libros de clases de toda la institución"
          actions={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Libro de Clases
            </Button>
          }
        />

        {/* Search and Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar libros de clases..."
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Books Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Sample book cards - in real implementation, these would come from API */}
          {[
            {
              title: "Matemáticas 8° Básico",
              teacher: "Prof. Ana López",
              students: 28,
              status: "active",
            },
            {
              title: "Lenguaje 7° Básico",
              teacher: "Prof. Carlos Rodríguez",
              students: 32,
              status: "active",
            },
            {
              title: "Ciencias 9° Básico",
              teacher: "Prof. María González",
              students: 25,
              status: "draft",
            },
            {
              title: "Historia 6° Básico",
              teacher: "Prof. Juan Martínez",
              students: 30,
              status: "active",
            },
            {
              title: "Inglés 8° Básico",
              teacher: "Prof. Sofia Hernández",
              students: 26,
              status: "review",
            },
            {
              title: "Educación Física",
              teacher: "Prof. Diego Silva",
              students: 35,
              status: "active",
            },
          ].map((book, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{book.title}</CardTitle>
                  </div>
                  <Badge
                    variant={
                      book.status === "active"
                        ? "default"
                        : book.status === "draft"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {book.status === "active"
                      ? "Activo"
                      : book.status === "draft"
                        ? "Borrador"
                        : "En Revisión"}
                  </Badge>
                </div>
                <CardDescription>{book.teacher}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {book.students} estudiantes
                  </span>
                  <Button variant="outline" size="sm">
                    Ver Detalles
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
