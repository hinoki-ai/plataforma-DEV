"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  MessageSquare,
  Calendar,
  TrendingUp,
  FileText,
  Users,
  Bell,
  Download,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Settings,
} from "lucide-react";

interface StudentProgress {
  id: string;
  name: string;
  grade: string;
  subjects: {
    name: string;
    progress: number;
    grade: string;
    lastUpdated: string;
  }[];
  attendance: number;
  behavior: string;
}

interface Communication {
  id: string;
  type: "message" | "announcement" | "event";
  title: string;
  content: string;
  date: string;
  read: boolean;
  priority: "low" | "medium" | "high";
}

interface AcademicResource {
  id: string;
  title: string;
  type: "document" | "video" | "link";
  subject: string;
  grade: string;
  url: string;
  description: string;
}

// ⚡ Performance: Move static configurations outside component to prevent recreation
const PRIORITY_COLORS = {
  high: "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive",
  medium:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  default: "bg-muted text-muted-foreground",
} as const;

const TYPE_ICONS = {
  message: MessageSquare,
  announcement: Bell,
  event: Calendar,
  default: FileText,
} as const;

const RESOURCE_ICONS = {
  document: FileText,
  video: Eye,
  link: BookOpen,
  default: FileText,
} as const;

// ⚡ Performance: Extract utility functions to prevent recreation
const getPriorityColor = (priority: string) => {
  return (
    PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] ||
    PRIORITY_COLORS.default
  );
};

const getTypeIcon = (type: string) => {
  return TYPE_ICONS[type as keyof typeof TYPE_ICONS] || TYPE_ICONS.default;
};

const getResourceIcon = (type: string) => {
  return (
    RESOURCE_ICONS[type as keyof typeof RESOURCE_ICONS] ||
    RESOURCE_ICONS.default
  );
};

// ⚡ Performance: Move mock data outside component to prevent recreation
const MOCK_STUDENT_PROGRESS: StudentProgress[] = [
  {
    id: "1",
    name: "María González",
    grade: "3° Básico",
    subjects: [
      {
        name: "Matemáticas",
        progress: 85,
        grade: "6.8",
        lastUpdated: "2024-01-15",
      },
      {
        name: "Lenguaje",
        progress: 92,
        grade: "7.2",
        lastUpdated: "2024-01-14",
      },
      {
        name: "Ciencias",
        progress: 78,
        grade: "6.5",
        lastUpdated: "2024-01-13",
      },
      {
        name: "Historia",
        progress: 88,
        grade: "7.0",
        lastUpdated: "2024-01-12",
      },
    ],
    attendance: 95,
    behavior: "Excelente",
  },
];

const MOCK_COMMUNICATIONS: Communication[] = [
  {
    id: "1",
    type: "announcement",
    title: "Reunión de Apoderados",
    content:
      "Se realizará una reunión de apoderados el próximo viernes a las 18:00 hrs.",
    date: "2024-01-20",
    read: false,
    priority: "high",
  },
  {
    id: "2",
    type: "message",
    title: "Mensaje del Profesor",
    content:
      "Su estudiante ha mostrado excelente progreso en matemáticas este mes.",
    date: "2024-01-18",
    read: true,
    priority: "medium",
  },
  {
    id: "3",
    type: "event",
    title: "Actividad Extraprogramática",
    content: "Invitación a participar en el taller de arte los sábados.",
    date: "2024-01-16",
    read: false,
    priority: "low",
  },
];

const MOCK_ACADEMIC_RESOURCES: AcademicResource[] = [
  {
    id: "1",
    title: "Guía de Matemáticas 3° Básico",
    type: "document",
    subject: "Matemáticas",
    grade: "3° Básico",
    url: "/resources/math-guide.pdf",
    description: "Material de apoyo para reforzar conceptos matemáticos",
  },
  {
    id: "2",
    title: "Video: Comprensión Lectora",
    type: "video",
    subject: "Lenguaje",
    grade: "3° Básico",
    url: "/resources/reading-comprehension.mp4",
    description: "Técnicas para mejorar la comprensión lectora",
  },
  {
    id: "3",
    title: "Portal Educativo",
    type: "link",
    subject: "General",
    grade: "3° Básico",
    url: "https://www.mineduc.cl",
    description: "Recursos oficiales del Ministerio de Educación",
  },
];

export default function ParentDashboardFeatures() {
  const [activeTab, setActiveTab] = useState("overview");

  // ⚡ Performance: Memoize data references to prevent unnecessary re-renders
  const studentProgress = useMemo(() => MOCK_STUDENT_PROGRESS, []);
  const communications = useMemo(() => MOCK_COMMUNICATIONS, []);
  const academicResources = useMemo(() => MOCK_ACADEMIC_RESOURCES, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Panel de Apoderados
          </h1>
          <p className="text-muted-foreground">
            Monitoreo académico y comunicación con la escuela
          </p>
        </div>
        <Button asChild>
          <Link href="/parent/settings">
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Link>
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="progress">Progreso</TabsTrigger>
          <TabsTrigger value="communication">Comunicación</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Promedio General
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6.9</div>
                <p className="text-xs text-muted-foreground">
                  +0.3 desde el mes pasado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Asistencia
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">95%</div>
                <p className="text-xs text-muted-foreground">19 de 20 días</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Mensajes Nuevos
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">2 sin leer</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Próximos Eventos
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">Esta semana</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>
                Últimas actualizaciones y eventos importantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {communications.slice(0, 3).map((comm) => (
                  <div key={comm.id} className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-full ${getPriorityColor(comm.priority)}`}
                    >
                      {React.createElement(getTypeIcon(comm.type), {
                        className: "h-4 w-4",
                      })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium">{comm.title}</h4>
                        {!comm.read && <Badge variant="secondary">Nuevo</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {comm.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {comm.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {studentProgress.map((student) => (
            <Card key={student.id}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>
                    {student.name} - {student.grade}
                  </span>
                </CardTitle>
                <CardDescription>
                  Progreso académico detallado por asignatura
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso General</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                {/* Subjects Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                  {student.subjects.map((subject) => (
                    <Card key={subject.name} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{subject.name}</h4>
                        <Badge variant="outline">{subject.grade}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progreso</span>
                          <span>{subject.progress}%</span>
                        </div>
                        <Progress value={subject.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          Última actualización: {subject.lastUpdated}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Additional Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Asistencia: {student.attendance}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Comportamiento: {student.behavior}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="communication" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Comunicaciones</h3>
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Nuevo Mensaje
            </Button>
          </div>

          <div className="space-y-4">
            {communications.map((comm) => (
              <Card
                key={comm.id}
                className={!comm.read ? "border-primary/20 bg-primary/5" : ""}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-full ${getPriorityColor(comm.priority)}`}
                    >
                      {React.createElement(getTypeIcon(comm.type), {
                        className: "h-4 w-4",
                      })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{comm.title}</h4>
                          {!comm.read && (
                            <Badge variant="secondary">Nuevo</Badge>
                          )}
                          <Badge className={getPriorityColor(comm.priority)}>
                            {comm.priority}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {comm.date}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {comm.content}
                      </p>
                      <div className="flex space-x-2 mt-3">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Ver Detalles
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Responder
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Recursos Académicos</h3>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Descargar Todo
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {academicResources.map((resource) => (
              <Card
                key={resource.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    {React.createElement(getResourceIcon(resource.type), {
                      className: "h-4 w-4 text-muted-foreground",
                    })}
                    <CardTitle className="text-sm">{resource.title}</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    {resource.subject} • {resource.grade}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3">
                    {resource.description}
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" asChild>
                      <Link href={resource.url}>
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Descargar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
