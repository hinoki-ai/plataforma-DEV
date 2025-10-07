"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PageTransition } from "@/components/ui/page-transition";
import { PMEDashboard } from "@/components/pme/PMEDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDivineParsing } from "@/components/language/useDivineLanguage";

import {
  Users,
  Shield,
  Settings,
  Download,
  Upload,
  Plus,
  Eye,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Crown,
  FileText,
} from "lucide-react";
import { PMEGoal } from "@/lib/types/pme";
import { toast } from "sonner";

export const dynamic = "force-dynamic";

// Mock data representing ALL teachers' PME goals - Admin sees EVERYTHING
const mockAllPMEGoals: any[] = [
  // Teacher 1 Goals
  {
    id: "pme-1",
    userId: "user-1",
    title: "Fortalecer habilidades de comunicación oral",
    description:
      "Desarrollar competencias comunicativas en estudiantes de NT1 a través de actividades lúdicas y participativas.",
    category: "COMMUNICATION",
    priority: "HIGH",
    status: "IN_PROGRESS",
    level: "NT1",
    startDate: "2025-03-01T00:00:00.000Z",
    targetDate: "2025-06-30T00:00:00.000Z",
    progress: 60,
    evidence: [
      {
        id: "ev-3",
        type: "DOCUMENT",
        title: "Evaluación diagnóstica",
        url: "/uploads/evidence/evaluacion.pdf",
        uploadDate: "2025-03-15T00:00:00.000Z",
      },
    ],
    createdBy: "user-1",
    createdAt: "2025-03-01T00:00:00.000Z",
    updatedAt: "2025-03-15T00:00:00.000Z",
  },
  // Teacher 2 Goals
  {
    id: "pme-2",
    userId: "user-1",
    title: "Fortalecer habilidades matemáticas básicas",
    description:
      "Desarrollar competencias numéricas y de resolución de problemas en estudiantes de NT2.",
    category: "MATHEMATICS",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    level: "NT2",
    startDate: "2025-03-01T00:00:00.000Z",
    targetDate: "2025-07-31T00:00:00.000Z",
    progress: 40,
    evidence: [],
    createdBy: "user-1",
    createdAt: "2025-03-01T00:00:00.000Z",
    updatedAt: "2025-03-25T00:00:00.000Z",
  },
  // Teacher 3 Goals
  {
    id: "pme-3",
    userId: "user-1",
    title: "Implementar estrategias de educación inclusiva",
    description:
      "Adaptar metodologías y materiales para atender la diversidad de estudiantes, incluyendo aquellos con necesidades educativas especiales.",
    category: "INCLUSIVE_EDUCATION",
    priority: "HIGH",
    status: "PENDING_REVIEW",
    level: "BOTH",
    startDate: "2025-04-01T00:00:00.000Z",
    targetDate: "2025-08-31T00:00:00.000Z",
    progress: 25,
    evidence: [
      {
        id: "ev-2",
        type: "DOCUMENT",
        title: "Plan de adaptaciones curriculares",
        url: "/uploads/evidence/adaptaciones.pdf",
        uploadDate: "2025-04-05T00:00:00.000Z",
      },
    ],
    createdBy: "user-1",
    createdAt: "2025-04-01T00:00:00.000Z",
    updatedAt: "2025-04-05T00:00:00.000Z",
  },
  // Teacher 4 Goals
  {
    id: "pme-4",
    userId: "teacher-4",
    title: "Fortalecer participación familiar",
    description:
      "Crear estrategias para involucrar más a las familias en el proceso educativo.",
    category: "FAMILY_ENGAGEMENT",
    priority: "HIGH",
    status: "APPROVED",
    level: "ALL",
    startDate: "2025-03-15T00:00:00.000Z",
    targetDate: "2025-09-30T00:00:00.000Z",
    progress: 80,
    evidence: [
      {
        id: "ev-3",
        type: "PHOTO",
        title: "Taller padres",
        url: "/uploads/evidence/taller-padres.jpg",
        uploadDate: "2025-04-10T00:00:00.000Z",
      },
      {
        id: "ev-4",
        type: "DOCUMENT",
        title: "Encuesta satisfacción",
        url: "/uploads/evidence/encuesta.pdf",
        uploadDate: "2025-04-15T00:00:00.000Z",
      },
    ],
    createdBy: "teacher-4",
    createdAt: "2025-03-15T00:00:00.000Z",
    updatedAt: "2025-04-20T00:00:00.000Z",
  },
  // Teacher 5 Goals
  {
    id: "pme-5",
    userId: "teacher-5",
    title: "Mejorar ambiente de aprendizaje",
    description:
      "Optimizar espacios físicos y materiales educativos para favorecer el aprendizaje.",
    category: "LEARNING_ENVIRONMENT",
    priority: "MEDIUM",
    status: "COMPLETED",
    level: "BOTH",
    startDate: "2025-02-01T00:00:00.000Z",
    targetDate: "2025-05-31T00:00:00.000Z",
    progress: 100,
    evidence: [
      {
        id: "ev-5",
        type: "PHOTO",
        title: "Aula reorganizada",
        url: "/uploads/evidence/aula-nueva.jpg",
        uploadDate: "2025-05-20T00:00:00.000Z",
      },
      {
        id: "ev-6",
        type: "VIDEO",
        title: "Tour virtual aula",
        url: "/uploads/evidence/tour-aula.mp4",
        uploadDate: "2025-05-25T00:00:00.000Z",
      },
    ],
    createdBy: "teacher-5",
    createdAt: "2025-02-01T00:00:00.000Z",
    updatedAt: "2025-05-25T00:00:00.000Z",
  },
];

const mockTeachers = [
  {
    id: "teacher-1",
    name: "María González",
    email: "maria@manitospintadas.cl",
    level: "NT1",
  },
  {
    id: "teacher-2",
    name: "Ana Rodríguez",
    email: "ana@manitospintadas.cl",
    level: "NT2",
  },
  {
    id: "teacher-3",
    name: "Carmen Silva",
    email: "carmen@manitospintadas.cl",
    level: "NT1",
  },
  {
    id: "teacher-4",
    name: "Patricia López",
    email: "patricia@manitospintadas.cl",
    level: "BOTH",
  },
  {
    id: "teacher-5",
    name: "Isabel Martínez",
    email: "isabel@manitospintadas.cl",
    level: "NT2",
  },
];

export default function AdminPMEPage() {
  const { data: session } = useSession();
  const { t } = useDivineParsing(["common", "admin", "profesor"]);
  const [allGoals, setAllGoals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<string | "all">("all");

  useEffect(() => {
    // Simulate loading ALL PME data from ALL teachers
    setTimeout(() => {
      setAllGoals(mockAllPMEGoals);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Admin statistics across ALL teachers
  const adminStats = {
    totalGoals: allGoals.length,
    totalTeachers: mockTeachers.length,
    pendingReview: allGoals.filter((g) => g.status === "PENDING_REVIEW").length,
    needsRevision: allGoals.filter((g) => g.status === "NEEDS_REVISION").length,
    approved: allGoals.filter((g) => g.status === "APPROVED").length,
    completed: allGoals.filter((g) => g.status === "COMPLETED").length,
    averageProgress:
      allGoals.length > 0
        ? Math.round(
            allGoals.reduce((sum, goal) => sum + (goal.progress ?? 0), 0) /
              allGoals.length,
          )
        : 0,
  };

  // Filter goals by selected teacher
  const filteredGoals =
    selectedTeacher === "all"
      ? allGoals
      : allGoals.filter((goal) => goal.userId === selectedTeacher);

  // ADMIN MASTER CONTROL FUNCTIONS
  const handleCreateGoalForTeacher = () => {
    toast.info("🔧 Admin: Crear objetivo PME para cualquier profesor");
  };

  const handleEditAnyGoal = (goal: PMEGoal) => {
    toast.info(`🔧 Admin editando: ${goal.title}`);
  };

  const handleApproveGoal = (goalId: string) => {
    toast.success("✅ Admin: Objetivo PME aprobado");
    setAllGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              status: "APPROVED",
              adminNotes: "Aprobado por administración",
            }
          : goal,
      ),
    );
  };

  const handleRejectGoal = (goalId: string, reason: string) => {
    toast.error(`❌ Admin: Objetivo rechazado - ${reason}`);
    setAllGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? { ...goal, status: "NEEDS_REVISION", adminNotes: reason }
          : goal,
      ),
    );
  };

  const handleDeleteGoal = (goalId: string) => {
    if (confirm("¿Eliminar permanentemente este objetivo PME?")) {
      toast.success("🗑️ Admin: Objetivo PME eliminado");
      setAllGoals((prev) => prev.filter((goal) => goal.id !== goalId));
    }
  };

  const handleForceCompleteGoal = (goalId: string) => {
    toast.success("👑 Admin: Objetivo marcado como completado");
    setAllGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              status: "COMPLETED",
              progress: 100,
              completionDate: new Date().toISOString(),
              adminNotes: "Completado por administración",
            }
          : goal,
      ),
    );
  };

  const handleBulkAction = (action: string) => {
    toast.info(`👑 Admin: Acción masiva - ${action}`);
  };

  const handleExportAllData = () => {
    toast.success("📊 Admin: Exportando todos los datos PME");
  };

  const handleImportGoals = () => {
    toast.info("📂 Admin: Importar objetivos PME masivamente");
  };

  return (
    <PageTransition skeletonType="page" duration={700}>
      <div className="container mx-auto px-4 py-6">
        {/* Admin Header with Master Controls */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                PME - Control Administrativo Total
                <Badge className="bg-yellow-100 text-yellow-800 gap-1">
                  <Shield className="w-3 h-3" />
                  ADMIN
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Gestión completa de todos los Planes de Mejoramiento Educativo •
                Control total sobre {adminStats.totalTeachers} profesores
              </p>
            </div>
          </div>

          {/* Master Admin Controls */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleCreateGoalForTeacher} className="gap-2">
              <Plus className="w-4 h-4" />
              Crear Objetivo (Cualquier Profesor)
            </Button>
            <Button
              variant="outline"
              onClick={handleExportAllData}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar Todos los Datos
            </Button>
            <Button
              variant="outline"
              onClick={handleImportGoals}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Importación Masiva
            </Button>
            <Button
              variant="outline"
              onClick={() => handleBulkAction("Aprobar Pendientes")}
              className="gap-2 text-green-700"
            >
              <CheckCircle className="w-4 h-4" />
              Aprobar Todos Pendientes
            </Button>
            <Button
              variant="outline"
              onClick={() => handleBulkAction("Generar Reportes")}
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              Reportes Institucionales
            </Button>
          </div>
        </div>

        {/* Admin Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {adminStats.totalGoals}
              </div>
              <div className="text-xs text-muted-foreground">
                Total Objetivos
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {adminStats.totalTeachers}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("ui.teachers")}
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {adminStats.pendingReview}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("ui.pending")}
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {adminStats.needsRevision}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("common.needs_revision", "Needs Revision")}
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {adminStats.approved}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("ui.approved")}
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {adminStats.completed}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("ui.completed")}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teacher Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t("admin.pme.filter_by_teacher")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedTeacher === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTeacher("all")}
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                {t("admin.pme.all_teachers")} ({allGoals.length})
              </Button>
              {mockTeachers.map((teacher) => {
                const teacherGoals = allGoals.filter(
                  (g) => g.userId === teacher.id,
                );
                const pendingGoals = teacherGoals.filter(
                  (g) => g.status === "PENDING_REVIEW",
                ).length;
                return (
                  <Button
                    key={teacher.id}
                    variant={
                      selectedTeacher === teacher.id ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedTeacher(teacher.id)}
                    className="gap-2"
                  >
                    {teacher.name} ({teacherGoals.length})
                    {pendingGoals > 0 && (
                      <Badge variant="destructive" className="ml-1 text-xs">
                        {pendingGoals}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced PME Dashboard with Admin Powers */}
        <PMEDashboard />

        {/* Admin-Only Actions Panel */}
        <Card className="mt-6 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              {t("admin.pme.admin_actions", "Special Administrative Actions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="justify-start gap-2 h-auto p-4 border-green-200 hover:bg-green-50"
                onClick={() => {
                  const goalToComplete = filteredGoals.find(
                    (g) => g.status === "IN_PROGRESS",
                  );
                  if (goalToComplete)
                    handleForceCompleteGoal(goalToComplete.id);
                }}
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">{t("ui.force_complete")}</div>
                  <div className="text-xs text-muted-foreground">
                    {t("admin.pme.mark_completed", "Mark goal as completed")}
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start gap-2 h-auto p-4 border-red-200 hover:bg-red-50"
                onClick={() => {
                  const goalToDelete = filteredGoals.find(
                    (g) => g.status === "PENDING",
                  );
                  if (goalToDelete) handleDeleteGoal(goalToDelete.id);
                }}
              >
                <Trash2 className="w-5 h-5 text-red-600" />
                <div className="text-left">
                  <div className="font-medium">{t("ui.delete_goals")}</div>
                  <div className="text-xs text-muted-foreground">
                    {t("admin.pme.delete_permanently", "Delete permanently")}
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start gap-2 h-auto p-4 border-blue-200 hover:bg-blue-50"
                onClick={() => handleBulkAction("Reasignar Objetivos")}
              >
                <Settings className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">{t("ui.reassign")}</div>
                  <div className="text-xs text-muted-foreground">
                    {t("admin.pme.change_teacher")}
                  </div>
                </div>
              </Button>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>👑 Privilegios de Administrador:</strong> Tienes control
                total sobre todos los objetivos PME. Puedes crear, editar,
                aprobar, rechazar y eliminar cualquier objetivo de cualquier
                profesor.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
