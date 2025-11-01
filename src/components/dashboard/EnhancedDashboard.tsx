"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, Reorder, AnimatePresence } from "motion/react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Settings,
  GripVertical,
  MoreHorizontal,
  EyeOff,
  Trash2,
  Plus,
  Calendar,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Widget types and interfaces
export interface Widget {
  id: string;
  type: string;
  title: string;
  visible: boolean;
  size: "small" | "medium" | "large";
  position: number;
  config?: Record<string, any>;
}

interface NotificationItem {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  timestamp: Date;
  priority: "high" | "medium" | "low";
  read: boolean;
  category: string;
}

interface WidgetProps {
  widget: Widget;
  onToggleVisibility: (id: string) => void;
  onRemove: (id: string) => void;
  onConfigChange: (id: string, config: Record<string, any>) => void;
}

// Smart Notifications Widget
function SmartNotificationsWidget({ widget }: WidgetProps) {
  const notifications = useMemo<NotificationItem[]>(() => {
    // Use deterministic timestamps for mock data
    const baseTime = new Date("2024-01-01T12:00:00Z").getTime();

    return [
      {
        id: "1",
        type: "info",
        title: "Nueva reunión programada",
        message: "Reunión con profesor de matemáticas el 15 de enero",
        timestamp: new Date(baseTime - 1800000),
        priority: "medium",
        read: false,
        category: "meetings",
      },
      {
        id: "2",
        type: "success",
        title: "Calificación actualizada",
        message: "Tu estudiante ha mejorado en ciencias naturales",
        timestamp: new Date(baseTime - 3600000),
        priority: "low",
        read: true,
        category: "grades",
      },
      {
        id: "3",
        type: "warning",
        title: "Documento pendiente",
        message: "Autorización para salida pedagógica requerida",
        timestamp: new Date(baseTime - 7200000),
        priority: "high",
        read: false,
        category: "documents",
      },
    ];
  }, []);

  const groupedNotifications = useMemo(() => {
    const groups = notifications.reduce(
      (acc, notification) => {
        const key = notification.priority;
        if (!acc[key]) acc[key] = [];
        acc[key].push(notification);
        return acc;
      },
      {} as Record<string, NotificationItem[]>,
    );

    return groups;
  }, [notifications]);

  const getNotificationColor = (type: string) => {
    const colors = {
      info: "bg-blue-50 border-blue-200 text-blue-800",
      success: "bg-green-50 border-green-200 text-green-800",
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
      error: "bg-red-50 border-red-200 text-red-800",
    };
    return colors[type as keyof typeof colors] || colors.info;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Notificaciones Inteligentes
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {notifications.filter((n) => !n.read).length} nuevas
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence>
          {Object.entries(groupedNotifications).map(([priority, items]) => (
            <div key={priority} className="space-y-2">
              {priority === "high" && (
                <div className="text-xs font-medium text-red-600 uppercase tracking-wide">
                  Alta prioridad
                </div>
              )}
              {items.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "p-3 rounded-lg border text-sm",
                    getNotificationColor(notification.type),
                    !notification.read && "ring-1 ring-blue-200",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{notification.title}</h4>
                      <p className="text-xs opacity-80">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs opacity-60">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Intl.RelativeTimeFormat("es").format(-1, "hour")}
                        </span>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// Progress Trending Widget
function ProgressTrendingWidget({ widget }: WidgetProps) {
  const trendData = [
    { subject: "Matemáticas", current: 85, previous: 78, trend: "up" },
    { subject: "Lenguaje", current: 92, previous: 89, trend: "up" },
    { subject: "Ciencias", current: 76, previous: 82, trend: "down" },
    { subject: "Historia", current: 88, previous: 85, trend: "up" },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Progreso Académico
        </CardTitle>
        <CardDescription className="text-xs">
          Tendencias del último mes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {trendData.map((subject, index) => (
          <motion.div
            key={subject.subject}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{subject.subject}</span>
              <div className="flex items-center gap-1">
                <TrendingUp
                  className={cn(
                    "h-3 w-3",
                    subject.trend === "up" ? "text-green-500" : "text-red-500",
                  )}
                  style={{
                    transform:
                      subject.trend === "down" ? "rotate(180deg)" : "none",
                  }}
                />
                <span className="text-xs text-muted-foreground">
                  {subject.current}%
                </span>
              </div>
            </div>
            <div className="relative">
              <Progress value={subject.current} className="h-2" />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${subject.current}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="absolute top-0 left-0 h-2 bg-linear-to-r from-blue-500 to-purple-500 rounded-full"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {subject.trend === "up" ? "+" : ""}
              {subject.current - subject.previous} desde el mes pasado
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

// Quick Actions Widget
function QuickActionsWidget({ widget }: WidgetProps) {
  const actions = [
    {
      id: "meeting",
      label: "Solicitar Reunión",
      icon: Calendar,
      color: "bg-blue-500",
    },
    {
      id: "message",
      label: "Enviar Mensaje",
      icon: MessageSquare,
      color: "bg-green-500",
    },
    {
      id: "documents",
      label: "Ver Documentos",
      icon: BookOpen,
      color: "bg-purple-500",
    },
    {
      id: "calendar",
      label: "Calendario",
      icon: Calendar,
      color: "bg-orange-500",
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col items-center p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-all duration-200"
              >
                <div
                  className={cn(
                    "p-2 rounded-full text-white mb-2",
                    action.color,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-center">
                  {action.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Multi-Child Tabs Widget
function MultiChildWidget({ widget }: WidgetProps) {
  const [selectedChild, setSelectedChild] = useState(0);

  const children = [
    { id: "1", name: "María González", grade: "5° Básico", avatar: "MG" },
    { id: "2", name: "Carlos González", grade: "8° Básico", avatar: "CG" },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Mis Hijos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-1 bg-muted p-1 rounded-md">
          {children.map((child, index) => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(index)}
              className={cn(
                "flex-1 px-2 py-1 text-xs rounded-sm transition-all duration-200",
                selectedChild === index
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {child.name.split(" ")[0]}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedChild}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-linear-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto">
                {children[selectedChild].avatar}
              </div>
              <div>
                <h3 className="font-medium">{children[selectedChild].name}</h3>
                <p className="text-sm text-muted-foreground">
                  {children[selectedChild].grade}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-muted rounded">
                  <div className="text-xs text-muted-foreground">
                    Asistencia
                  </div>
                  <div className="text-sm font-medium">95%</div>
                </div>
                <div className="p-2 bg-muted rounded">
                  <div className="text-xs text-muted-foreground">Promedio</div>
                  <div className="text-sm font-medium">8.5</div>
                </div>
                <div className="p-2 bg-muted rounded">
                  <div className="text-xs text-muted-foreground">Tareas</div>
                  <div className="text-sm font-medium">3/5</div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// Widget Configuration Modal
interface WidgetConfigModalProps {
  widget: Widget;
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: Record<string, any>) => void;
}

function WidgetConfigModal({
  widget,
  isOpen,
  onClose,
  onSave,
}: WidgetConfigModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar Widget: {widget.title}</DialogTitle>
          <DialogDescription>
            Configura las opciones de visualización para este widget
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="widget-size-select" className="text-sm font-medium">
              Tamaño del widget
            </label>
            <select
              id="widget-size-select"
              className="w-full mt-1 p-2 border rounded"
              aria-label="Seleccionar tamaño del widget"
            >
              <option value="small">Pequeño</option>
              <option value="medium" selected>
                Mediano
              </option>
              <option value="large">Grande</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={() => onSave({})}>Guardar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main Enhanced Dashboard Component
interface EnhancedDashboardProps {
  userRole: "admin" | "profesor" | "parent";
  initialWidgets?: Widget[];
  onWidgetsChange?: (widgets: Widget[]) => void;
}

export function EnhancedDashboard({
  userRole,
  initialWidgets = [],
  onWidgetsChange,
}: EnhancedDashboardProps) {
  const defaultWidgets: Widget[] = [
    {
      id: "1",
      type: "notifications",
      title: "Notificaciones",
      visible: true,
      size: "medium",
      position: 0,
    },
    {
      id: "2",
      type: "progress",
      title: "Progreso",
      visible: true,
      size: "medium",
      position: 1,
    },
    {
      id: "3",
      type: "quick-actions",
      title: "Acciones",
      visible: true,
      size: "small",
      position: 2,
    },
    {
      id: "4",
      type: "multi-child",
      title: "Hijos",
      visible: userRole === "parent",
      size: "medium",
      position: 3,
    },
  ];

  const [widgets, setWidgets] = useState<Widget[]>(
    initialWidgets.length > 0 ? initialWidgets : defaultWidgets,
  );
  const [configWidget, setConfigWidget] = useState<Widget | null>(null);

  const handleToggleVisibility = useCallback((id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w)),
    );
  }, []);

  const handleRemoveWidget = useCallback((id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const handleReorderWidgets = useCallback(
    (newOrder: Widget[]) => {
      const reorderedWidgets = newOrder.map((widget, index) => ({
        ...widget,
        position: index,
      }));
      setWidgets(reorderedWidgets);
      onWidgetsChange?.(reorderedWidgets);
    },
    [onWidgetsChange],
  );

  const visibleWidgets = widgets
    .filter((w) => w.visible)
    .sort((a, b) => a.position - b.position);

  const renderWidget = (widget: Widget) => {
    const commonProps = {
      widget,
      onToggleVisibility: handleToggleVisibility,
      onRemove: handleRemoveWidget,
      onConfigChange: (id: string, config: Record<string, any>) => {
        setWidgets((prev) =>
          prev.map((w) => (w.id === id ? { ...w, config } : w)),
        );
      },
    };

    switch (widget.type) {
      case "notifications":
        return <SmartNotificationsWidget key={widget.id} {...commonProps} />;
      case "progress":
        return <ProgressTrendingWidget key={widget.id} {...commonProps} />;
      case "quick-actions":
        return <QuickActionsWidget key={widget.id} {...commonProps} />;
      case "multi-child":
        return <MultiChildWidget key={widget.id} {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Personalizar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => {}}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Widget
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setWidgets(defaultWidgets)}>
              Restaurar por defecto
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Reorder.Group
        axis="y"
        values={visibleWidgets}
        onReorder={handleReorderWidgets}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {visibleWidgets.map((widget) => (
          <Reorder.Item
            key={widget.id}
            value={widget}
            className={cn(
              "relative group",
              widget.size === "large" && "md:col-span-2 lg:col-span-3",
              widget.size === "medium" && "md:col-span-1 lg:col-span-1",
              widget.size === "small" && "md:col-span-1 lg:col-span-1",
            )}
          >
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setConfigWidget(widget)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleToggleVisibility(widget.id)}
                  >
                    <EyeOff className="h-4 w-4 mr-2" />
                    Ocultar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleRemoveWidget(widget.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            </div>

            {renderWidget(widget)}
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {configWidget && (
        <WidgetConfigModal
          widget={configWidget}
          isOpen={!!configWidget}
          onClose={() => setConfigWidget(null)}
          onSave={(config) => {
            // Handle widget configuration save
            setConfigWidget(null);
          }}
        />
      )}
    </div>
  );
}

export default EnhancedDashboard;
