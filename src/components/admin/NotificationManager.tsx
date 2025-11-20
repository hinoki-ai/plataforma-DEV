"use client";

import React, { useState } from "react";
import { Bell, Send, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { useSession } from "@/lib/auth-client";

interface NotificationManagerProps {
  className?: string;
}

export function NotificationManager({ className }: NotificationManagerProps) {
  const { data: session } = useSession();
  const { createNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info" as const,
    category: "system" as const,
    priority: "medium" as const,
    isBroadcast: false,
    recipientIds: [] as string[],
    actionUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.message.trim()) {
      return;
    }

    setLoading(true);
    try {
      await createNotification({
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        category: formData.category,
        priority: formData.priority,
        isBroadcast: formData.isBroadcast,
        recipientIds: formData.isBroadcast ? undefined : formData.recipientIds,
        actionUrl: formData.actionUrl.trim() || undefined,
      });

      // Reset form
      setFormData({
        title: "",
        message: "",
        type: "info",
        category: "system",
        priority: "medium",
        isBroadcast: false,
        recipientIds: [],
        actionUrl: "",
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const canManageNotifications =
    session?.user?.role === "ADMIN" ||
    session?.user?.role === "PROFESOR" ||
    session?.user?.role === "MASTER";

  if (!canManageNotifications) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tienes permisos para gestionar notificaciones</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Gestor de Notificaciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Título de la notificación"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700"
                      >
                        Info
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="success">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700"
                      >
                        Éxito
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="warning">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-700"
                      >
                        Advertencia
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="error">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-red-100 text-red-700"
                      >
                        Error
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-700"
                      >
                        Sistema
                      </Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensaje *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder="Contenido de la notificación"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Reunión</SelectItem>
                  <SelectItem value="voting">Votación</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                  <SelectItem value="academic">Académico</SelectItem>
                  <SelectItem value="administrative">Administrativo</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) =>
                  setFormData((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="actionUrl">URL de acción (opcional)</Label>
              <Input
                id="actionUrl"
                value={formData.actionUrl}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    actionUrl: e.target.value,
                  }))
                }
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="broadcast"
              checked={formData.isBroadcast}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  isBroadcast: checked,
                  recipientIds: checked ? [] : prev.recipientIds,
                }))
              }
            />
            <Label htmlFor="broadcast" className="flex items-center gap-2">
              {formData.isBroadcast ? (
                <>
                  <Users className="h-4 w-4" />
                  Enviar a todos los usuarios
                </>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  Enviar a usuarios específicos
                </>
              )}
            </Label>
          </div>

          {!formData.isBroadcast && (
            <div className="space-y-2">
              <Label>ID de destinatarios (separados por coma)</Label>
              <Input
                value={formData.recipientIds.join(", ")}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    recipientIds: e.target.value
                      .split(",")
                      .map((id) => id.trim())
                      .filter((id) => id),
                  }))
                }
                placeholder="user-id-1, user-id-2, user-id-3"
              />
              <p className="text-xs text-muted-foreground">
                IDs de usuarios separados por coma. Déjalo vacío para enviar a
                todos.
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {loading ? "Enviando..." : "Enviar Notificación"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
