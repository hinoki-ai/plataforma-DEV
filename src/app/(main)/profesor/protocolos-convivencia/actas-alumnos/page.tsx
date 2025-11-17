"use client";

import { Suspense, useState } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { LoadingState } from "@/components/ui/loading-states";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Upload,
  FileText,
  Download,
  Eye,
  Calendar,
  User,
  Users,
} from "lucide-react";

function ActasAlumnosContent() {
  const { t } = useDivineParsing(["navigation", "common"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const actas = [
    {
      id: 1,
      student: "María González",
      grade: "8° Básico",
      date: "2024-11-14",
      type: "Entrevista de Orientación",
      reason: "Dificultades de concentración en clases",
      interviewer: "Psicólogo Escolar",
      fileUrl: "#",
      status: "completado",
    },
    {
      id: 2,
      student: "Carlos Rodríguez",
      grade: "7° Básico",
      date: "2024-11-13",
      type: "Entrevista Disciplinaria",
      reason: "Comportamiento agresivo con compañeros",
      interviewer: "Inspector General",
      fileUrl: "#",
      status: "completado",
    },
    {
      id: 3,
      student: "Pedro Martínez",
      grade: "9° Básico",
      date: "2024-11-11",
      type: "Entrevista de Seguimiento",
      reason: "Evaluación de progreso académico",
      interviewer: "Orientadora",
      fileUrl: "#",
      status: "pendiente_revision",
    },
    {
      id: 4,
      student: "Ana López",
      grade: "6° Básico",
      date: "2024-11-10",
      type: "Entrevista Inicial",
      reason: "Adaptación al nuevo curso",
      interviewer: "Profesor Jefe",
      fileUrl: "#",
      status: "completado",
    },
  ];

  const filteredActas = actas.filter((acta) => {
    const matchesSearch =
      acta.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acta.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acta.interviewer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade =
      selectedGrade === "all" || acta.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completado":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Completado
          </Badge>
        );
      case "pendiente_revision":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pendiente Revisión
          </Badge>
        );
      case "borrador":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Borrador
          </Badge>
        );
      default:
        return <Badge variant="secondary">Completado</Badge>;
    }
  };

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("nav.protocolos_convivencia.actas_alumnos", "navigation")}
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestión de actas de entrevistas con alumnos
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              {filteredActas.length} Actas
            </Badge>
            <Dialog
              open={isUploadDialogOpen}
              onOpenChange={setIsUploadDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Acta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Subir Nueva Acta</DialogTitle>
                  <DialogDescription>
                    Complete los detalles del acta de entrevista con alumno
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Estudiante</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estudiante" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maria">María González</SelectItem>
                        <SelectItem value="carlos">Carlos Rodríguez</SelectItem>
                        <SelectItem value="pedro">Pedro Martínez</SelectItem>
                        <SelectItem value="ana">Ana López</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Tipo de Entrevista
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="orientacion">
                          Entrevista de Orientación
                        </SelectItem>
                        <SelectItem value="disciplinaria">
                          Entrevista Disciplinaria
                        </SelectItem>
                        <SelectItem value="seguimiento">
                          Entrevista de Seguimiento
                        </SelectItem>
                        <SelectItem value="inicial">
                          Entrevista Inicial
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Archivo PDF</label>
                    <Input type="file" accept=".pdf" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Motivo</label>
                    <Textarea placeholder="Breve descripción del motivo de la entrevista" />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsUploadDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsUploadDialogOpen(false)}>
                    Subir Acta
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
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por estudiante, motivo o entrevistador..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Curso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los cursos</SelectItem>
                  <SelectItem value="6° Básico">6° Básico</SelectItem>
                  <SelectItem value="7° Básico">7° Básico</SelectItem>
                  <SelectItem value="8° Básico">8° Básico</SelectItem>
                  <SelectItem value="9° Básico">9° Básico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Actas List */}
        <div className="space-y-4">
          {filteredActas.map((acta) => (
            <Card key={acta.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <User className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{acta.student}</p>
                        <p className="text-sm text-muted-foreground">
                          Curso: {acta.grade}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm font-medium flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Fecha: {acta.date}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Tipo: {acta.type}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Entrevistador: {acta.interviewer}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Motivo:</strong> {acta.reason}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {getStatusBadge(acta.status)}
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredActas.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No se encontraron actas
              </h3>
              <p className="text-muted-foreground">
                No hay actas que coincidan con los criterios de búsqueda.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Institutional Documents Integration */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos Institucionales Relacionados</CardTitle>
            <CardDescription>
              Documentos del listado institucional relacionados con entrevistas
              estudiantiles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">50. Documentos PIE</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Programas de Integración Escolar con actas, evaluaciones y
                  derivaciones.
                </p>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Ver Documento
                </Button>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">
                  52. Fichas de Derivación Psicosocial
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Registro de derivaciones y seguimientos psicosociales de
                  estudiantes.
                </p>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Ver Documento
                </Button>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">
                  53. Informes de Seguimiento Individual
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Documentación detallada del seguimiento individual de
                  estudiantes.
                </p>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Ver Documento
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function ActasAlumnosPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState />}>
        <ActasAlumnosContent />
      </Suspense>
    </ErrorBoundary>
  );
}
