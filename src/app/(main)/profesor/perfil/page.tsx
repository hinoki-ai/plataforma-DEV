"use client";

export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/ui/page-transition";
import Image from "next/image";
import { FixedBackgroundLayout } from "@/components/layout/FixedBackgroundLayout";
import { Badge } from "@/components/ui/badge";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Edit,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function PerfilPage() {
  const { data: session } = useSession();
  const { t } = useDivineParsing(["common", "profesor"]);
  const [activeTab, setActiveTab] = useState("resumen");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { key: "resumen", label: t("profesor.tabs.summary", "common") },
    { key: "tareas", label: t("profesor.tabs.tasks", "common") },
    {
      key: "certificados",
      label: t("profesor.tabs.certificates", "common"),
    },
    { key: "ajustes", label: t("profesor.tabs.settings", "common") },
  ];

  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    avatar: "/public/images/avatar-placeholder.png",
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: false,
    taskReminders: true,
  });

  const [tasks] = useState([
    {
      id: 1,
      title: "Revisar planificaciones pendientes",
      description:
        "Tienes 3 planificaciones que necesitan revisión antes del viernes",
      status: "pending",
      priority: "high",
      dueDate: "2024-01-20",
    },
    {
      id: 2,
      title: "Preparar reunión con padres",
      description:
        "Reunión programada para discutir el progreso de los estudiantes",
      status: "in_progress",
      priority: "medium",
      dueDate: "2024-01-22",
    },
    {
      id: 3,
      title: "Actualizar calificaciones",
      description: "Ingresar las últimas calificaciones del trimestre",
      status: "completed",
      priority: "high",
      dueDate: "2024-01-18",
    },
  ]);

  const [certificates] = useState([
    {
      id: 1,
      title: "Certificado de Especialización en Educación Especial",
      description: "Educación Especial de Lenguaje - Universidad de Chile",
      issuedDate: "2023-06-15",
      issuer: "Universidad de Chile",
      downloadUrl: "#",
    },
    {
      id: 2,
      title: "Diploma de Excelencia Docente",
      description: "Reconocimiento por 10 años de servicio destacado",
      issuedDate: "2022-12-10",
      issuer: "Ministerio de Educación",
      downloadUrl: "#",
    },
    {
      id: 3,
      title: "Certificación en Metodologías Activas",
      description: "Curso especializado en enseñanza interactiva",
      issuedDate: "2023-03-20",
      issuer: "Centro de Formación Docente",
      downloadUrl: "#",
    },
  ]);

  useEffect(() => {
    if (session?.user) {
      setUserProfile({
        name:
          session.user.name || t("profesor.perfil.default_name", "profesor"),
        email:
          session.user.email || t("profesor.perfil.default_email", "profesor"),
        phone: t("profesor.perfil.default_phone", "profesor"),
        bio: t("profesor.perfil.default_bio", "profesor"),
        avatar: "/public/images/avatar-placeholder.png",
      });
    }
  }, [session]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // In a real implementation, you'd save to an API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success(t("profesor.perfil.profile_updated", "profesor"));
      setShowEditDialog(false);
    } catch (error) {
      toast.error(t("profesor.perfil.profile_error", "profesor"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // In a real implementation, you'd save to an API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success(t("profesor.perfil.settings_saved", "profesor"));
    } catch (error) {
      toast.error(t("profesor.perfil.settings_error", "profesor"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadCertificate = (certificateId: number) => {
    // In a real implementation, you'd trigger a download
    toast.success(t("profesor.perfil.downloading_certificate", "profesor"));
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800">
            {t("profesor.perfil.task_completed", "profesor")}
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            {t("profesor.perfil.task_in_progress", "profesor")}
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-orange-100 text-orange-800">
            {t("profesor.perfil.task_pending", "profesor")}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <PageTransition
      skeletonType="detail"
      skeletonProps={{ sections: 2 }}
      duration={700}
    >
      <div className="flex items-center justify-center py-6">
        <Card className="w-full max-w-xl shadow-lg border-border relative overflow-visible mx-2">
          {/* Cover image */}
          <div className="h-32 w-full rounded-t-lg bg-linear-to-r from-primary-200 to-secondary-200 relative">
            {/* Floating avatar */}
            <div className="absolute left-1/2 -bottom-12 transform -translate-x-1/2 z-10">
              <div className="w-24 h-24 rounded-full border-4 border-background shadow-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                <Image
                  src={
                    session?.user
                      ? "/public/images/avatar-placeholder.png"
                      : userProfile.avatar ||
                        "/public/images/avatar-placeholder.png"
                  }
                  alt={t("profesor.perfil.avatar_alt", "profesor")}
                  className="w-full h-full object-cover"
                  width={96}
                  height={96}
                />
              </div>
            </div>
          </div>
          <CardHeader className="pt-16 pb-4 flex flex-col items-center">
            <CardTitle className="text-2xl font-bold text-primary text-center mb-1">
              {userProfile.name}
            </CardTitle>
            <span className="text-sm text-muted-foreground mb-2">
              {session?.user?.role ||
                t("profesor.perfil.role_profesor", "profesor")}
            </span>
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="mb-2">
                  <Edit className="mr-2 h-4 w-4" />
                  {t("profesor.edit_profile", "common")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {t("profesor.perfil.edit_profile_dialog", "profesor")}
                  </DialogTitle>
                  <DialogDescription>
                    {t("profesor.perfil.update_personal_info", "profesor")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">
                      {t("profesor.perfil.full_name", "profesor")}
                    </Label>
                    <Input
                      id="name"
                      value={userProfile.name}
                      onChange={(e) =>
                        setUserProfile((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userProfile.email}
                      onChange={(e) =>
                        setUserProfile((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">
                      {t("profesor.perfil.phone", "profesor")}
                    </Label>
                    <Input
                      id="phone"
                      value={userProfile.phone}
                      onChange={(e) =>
                        setUserProfile((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">
                      {t("profesor.perfil.bio", "profesor")}
                    </Label>
                    <Textarea
                      id="bio"
                      value={userProfile.bio}
                      onChange={(e) =>
                        setUserProfile((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      {isSaving
                        ? t("common.saving", "common")
                        : t("profesor.perfil.save_profile", "profesor")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowEditDialog(false)}
                    >
                      {t("common.cancel", "common")}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          {/* Tab bar */}
          <div className="flex justify-center gap-2 border-b border-border px-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={cn(
                  "px-4 py-2 font-medium rounded-t transition-all duration-150",
                  activeTab === tab.key
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-primary/5",
                )}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <CardContent className="pt-6 pb-8 px-4">
            {activeTab === "resumen" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Información Personal
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-muted-foreground block text-xs">
                            Email
                          </span>
                          <span className="text-foreground">
                            {userProfile.email}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-muted-foreground block text-xs">
                            Teléfono
                          </span>
                          <span className="text-foreground">
                            {userProfile.phone || "No especificado"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-muted-foreground block text-xs">
                            {t("profesor.perfil.role", "profesor")}
                          </span>
                          <span className="text-foreground">
                            {session?.user?.role ||
                              t("profesor.perfil.role_profesor", "profesor")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Biografía
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {userProfile.bio}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Estadísticas
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm text-muted-foreground">
                          Planificaciones
                        </span>
                        <span className="font-semibold text-foreground">
                          12
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm text-muted-foreground">
                          Tareas Completadas
                        </span>
                        <span className="font-semibold text-foreground">
                          34
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm text-muted-foreground">
                          Certificados
                        </span>
                        <span className="font-semibold text-foreground">
                          {certificates.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "tareas" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-foreground">Mis Tareas</h3>
                  <div className="text-sm text-muted-foreground">
                    {tasks.filter((t) => t.status !== "completed").length}{" "}
                    pendientes
                  </div>
                </div>
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 border border-border rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getTaskStatusIcon(task.status)}
                            <h4 className="font-medium text-foreground">
                              {task.title}
                            </h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {task.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              📅 Vence:{" "}
                              {new Date(task.dueDate).toLocaleDateString(
                                "es-ES",
                              )}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                task.priority === "high"
                                  ? "bg-red-100 text-red-800"
                                  : task.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                              }`}
                            >
                              {task.priority === "high"
                                ? "Alta"
                                : task.priority === "medium"
                                  ? "Media"
                                  : "Baja"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 ml-4">
                          {getTaskStatusBadge(task.status)}
                          {task.status !== "completed" && (
                            <Button size="sm" variant="outline">
                              Marcar como completada
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "certificados" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-foreground">
                    Certificados y Diplomas
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    {certificates.length} certificados
                  </div>
                </div>
                <div className="space-y-3">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-4 border border-border rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground mb-1">
                            {cert.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {cert.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>🏫 {cert.issuer}</span>
                            <span>
                              📅{" "}
                              {new Date(cert.issuedDate).toLocaleDateString(
                                "es-ES",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadCertificate(cert.id)}
                          className="ml-4"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Descargar
                        </Button>
                      </div>
                    </div>
                  ))}
                  {certificates.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No tienes certificados registrados aún
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "ajustes" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-4">
                    Configuración de Cuenta
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">
                          Notificaciones por Email
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Recibe actualizaciones sobre tus actividades por email
                        </p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            emailNotifications: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">
                          Notificaciones Push
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Recibe notificaciones en tiempo real en tu navegador
                        </p>
                      </div>
                      <Switch
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            pushNotifications: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">
                          Reportes Semanales
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Recibe un resumen semanal de tus actividades
                        </p>
                      </div>
                      <Switch
                        checked={settings.weeklyReports}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            weeklyReports: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">
                          Recordatorios de Tareas
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Recibe recordatorios sobre tareas pendientes
                        </p>
                      </div>
                      <Switch
                        checked={settings.taskReminders}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            taskReminders: checked,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">
                      Privacidad y Seguridad
                    </h4>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">
                          Perfil Público
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Permitir que otros profesores vean tu perfil
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">
                          Actividad en Línea
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Mostrar cuándo estuviste activo por última vez
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="w-full"
                  >
                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
