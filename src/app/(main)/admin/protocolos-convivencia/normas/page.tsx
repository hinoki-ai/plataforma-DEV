"use client";

import { Suspense, useState } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { LoadingState } from "@/components/ui/loading-states";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, CheckCircle, XCircle, AlertCircle, FileText, Plus, Edit, Trash2, Search } from "lucide-react";

function NormasAdminContent() {
  const { t } = useDivineParsing(["navigation", "common"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const normas = [
    {
      id: 1,
      title: "Respeto Mutuo",
      description: "Tratar a todos los miembros de la comunidad con respeto y cortesía",
      status: "active",
      category: "valores",
      createdBy: "María González",
      createdAt: "2024-01-15",
      violations: 12,
    },
    {
      id: 2,
      title: "Puntualidad",
      description: "Asistir a clases y actividades en el horario establecido",
      status: "active",
      category: "disciplina",
      createdBy: "Carlos Rodríguez",
      createdAt: "2024-01-10",
      violations: 28,
    },
    {
      id: 3,
      title: "Participación Activa",
      description: "Contribuir activamente en las actividades de aprendizaje",
      status: "active",
      category: "aprendizaje",
      createdBy: "Ana López",
      createdAt: "2024-01-08",
      violations: 5,
    },
    {
      id: 4,
      title: "Cuidado del Medio Ambiente",
      description: "Mantener limpio el establecimiento y sus alrededores",
      status: "active",
      category: "responsabilidad",
      createdBy: "Pedro Martínez",
      createdAt: "2024-01-05",
      violations: 8,
    },
    {
      id: 5,
      title: "Uso Apropiado de Tecnología",
      description: "Utilizar dispositivos tecnológicos de manera responsable y educativa",
      status: "review",
      category: "tecnologia",
      createdBy: "Laura Sánchez",
      createdAt: "2024-01-20",
      violations: 15,
    },
  ];

  const filteredNormas = normas.filter(norma => {
    const matchesSearch = norma.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         norma.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || norma.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "inactive":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "review":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Activa</Badge>;
      case "inactive":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Inactiva</Badge>;
      case "review":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">En Revisión</Badge>;
      default:
        return <Badge variant="secondary">Activa</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const categories = {
      valores: { label: "Valores", color: "bg-purple-100 text-purple-800" },
      disciplina: { label: "Disciplina", color: "bg-blue-100 text-blue-800" },
      aprendizaje: { label: "Aprendizaje", color: "bg-green-100 text-green-800" },
      responsabilidad: { label: "Responsabilidad", color: "bg-orange-100 text-orange-800" },
      tecnologia: { label: "Tecnología", color: "bg-cyan-100 text-cyan-800" },
    };
    const cat = categories[category as keyof typeof categories] || { label: category, color: "bg-gray-100 text-gray-800" };
    return <Badge variant="secondary" className={cat.color}>{cat.label}</Badge>;
  };

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Gestión de {t("nav.protocolos_comportamiento.normas", "navigation")}
            </h1>
            <p className="text-muted-foreground mt-2">
              Administración de normas y reglas de convivencia escolar
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              <Users className="w-4 h-4 mr-2" />
              {filteredNormas.filter(n => n.status === "active").length} Activas
            </Badge>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Norma
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nueva Norma</DialogTitle>
                  <DialogDescription>
                    Define una nueva norma para la convivencia escolar
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Título</label>
                    <Input placeholder="Título de la norma" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Descripción</label>
                    <Textarea placeholder="Descripción detallada de la norma" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Categoría</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="valores">Valores</SelectItem>
                        <SelectItem value="disciplina">Disciplina</SelectItem>
                        <SelectItem value="aprendizaje">Aprendizaje</SelectItem>
                        <SelectItem value="responsabilidad">Responsabilidad</SelectItem>
                        <SelectItem value="tecnologia">Tecnología</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsCreateDialogOpen(false)}>
                    Crear Norma
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar normas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="valores">Valores</SelectItem>
                  <SelectItem value="disciplina">Disciplina</SelectItem>
                  <SelectItem value="aprendizaje">Aprendizaje</SelectItem>
                  <SelectItem value="responsabilidad">Responsabilidad</SelectItem>
                  <SelectItem value="tecnologia">Tecnología</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Norms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNormas.map((norma) => (
            <Card key={norma.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex items-center">
                    {getStatusIcon(norma.status)}
                    <span className="ml-2">{norma.title}</span>
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getCategoryBadge(norma.category)}
                  {getStatusBadge(norma.status)}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {norma.description}
                </CardDescription>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Creado por:</span>
                    <span className="font-medium">{norma.createdBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fecha:</span>
                    <span>{norma.createdAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Infracciones:</span>
                    <Badge variant="outline">{norma.violations}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredNormas.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron normas</h3>
              <p className="text-muted-foreground">
                No hay normas que coincidan con los criterios de búsqueda.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}

export default function NormasAdminPage() {
  return (
    <ErrorBoundary
      fallback={<div>Error al cargar la página de gestión de normas</div>}
    >
      <Suspense fallback={<LoadingState />}>
        <NormasAdminContent />
      </Suspense>
    </ErrorBoundary>
  );
}
