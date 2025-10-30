import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/server-auth";
import { getRoleAccess } from "@/lib/role-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Download,
  FileText,
  Link as LinkIcon,
  Image,
  Users,
  Heart,
  GraduationCap,
  Lightbulb,
  Globe,
  Calendar,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { FixedBackgroundLayout } from "@/components/layout/FixedBackgroundLayout";

export default async function RecursosPage() {
  const session = await requireAuth();
  const roleAccess = getRoleAccess(session.user.role);

  // Ensure user has access to parent section
  if (!roleAccess.canAccessParent) {
    redirect("/unauthorized");
  }

  const educationalResources = [
    {
      id: 1,
      title: "Guía de Apoyo en Matemáticas",
      description:
        "Ejercicios y actividades para reforzar conceptos matemáticos básicos",
      type: "pdf",
      grade: "1° a 4° Básico",
      downloadUrl: "#",
      size: "2.5 MB",
    },
    {
      id: 2,
      title: "Manual de Lectoescritura",
      description:
        "Estrategias y ejercicios para mejorar la lectura y escritura",
      type: "pdf",
      grade: "Pre-básica a 2° Básico",
      downloadUrl: "#",
      size: "4.1 MB",
    },
    {
      id: 3,
      title: "Actividades de Ciencias Naturales",
      description: "Experimentos simples para realizar en casa",
      type: "pdf",
      grade: "3° a 6° Básico",
      downloadUrl: "#",
      size: "3.2 MB",
    },
  ];

  const onlineResources = [
    {
      id: 1,
      title: "Portal MINEDUC",
      description: "Recursos educativos oficiales del Ministerio de Educación",
      url: "https://www.mineduc.cl",
      category: "Oficial",
    },
    {
      id: 2,
      title: "Aprendo en Línea",
      description: "Plataforma con contenidos curriculares por nivel",
      url: "https://www.curriculumnacional.cl/estudiante/",
      category: "Curricular",
    },
    {
      id: 3,
      title: "Biblioteca Digital Escolar",
      description: "Libros digitales y recursos de lectura",
      url: "https://bdescolar.mineduc.cl/",
      category: "Lectura",
    },
  ];

  const parentingResources = [
    {
      id: 1,
      title: "Apoyo Emocional en Casa",
      description: "Estrategias para acompañar emocionalmente a tu estudiante",
      icon: Heart,
      topics: [
        "Gestión emocional",
        "Comunicación efectiva",
        "Resolución de conflictos",
      ],
    },
    {
      id: 2,
      title: "Técnicas de Estudio",
      description: "Cómo crear hábitos de estudio efectivos en el hogar",
      icon: GraduationCap,
      topics: ["Organización del tiempo", "Espacio de estudio", "Motivación"],
    },
    {
      id: 3,
      title: "Desarrollo Integral",
      description: "Actividades para el desarrollo físico, social y cognitivo",
      icon: Lightbulb,
      topics: ["Juegos educativos", "Actividad física", "Creatividad"],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Recursos Educativos
        </h1>
        <p className="text-muted-foreground">
          Materiales y herramientas para apoyar el aprendizaje de tu estudiante en
          casa.
        </p>
      </div>

      {/* Educational Materials */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Materiales Educativos Descargables
            </CardTitle>
            <CardDescription>
              Guías y actividades preparadas por nuestros profesores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {educationalResources.map((resource) => (
                <div
                  key={resource.id}
                  className="border border-border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <Badge variant="secondary" className="text-xs">
                      {resource.type.toUpperCase()}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">
                    {resource.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {resource.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>{resource.grade}</span>
                    <span>{resource.size}</span>
                  </div>
                  <Button size="sm" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Online Resources */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Recursos en Línea
            </CardTitle>
            <CardDescription>
              Enlaces a plataformas educativas recomendadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {onlineResources.map((resource) => (
                <div
                  key={resource.id}
                  className="border border-border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <LinkIcon className="h-8 w-8 text-green-500" />
                    <Badge variant="outline" className="text-xs">
                      {resource.category}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">
                    {resource.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {resource.description}
                  </p>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    <Link
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visitar
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parent Guides */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Guías para Padres
            </CardTitle>
            <CardDescription>
              Materiales para apoyar el desarrollo educativo en casa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parentingResources.map((resource) => (
                <div
                  key={resource.id}
                  className="border border-border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <resource.icon className="h-8 w-8 text-purple-500" />
                    <Badge variant="secondary" className="text-xs">
                      {resource.title}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">
                    {resource.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {resource.description}
                  </p>
                  <div className="space-y-2">
                    {resource.topics.map((topic, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs mr-1"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Talleres para Padres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Talleres mensuales sobre temas educativos y de desarrollo
              infantil.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/parent/calendario-escolar">Ver Cronograma</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Contact for Resources */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>¿Necesitas Más Recursos?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Si necesitas materiales específicos o tienes sugerencias sobre
                recursos educativos, no dudes en contactarnos.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link href="/parent/comunicacion">Enviar Solicitud</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="mailto:recursos@plataforma-astral.com">
                    Email Directo
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
