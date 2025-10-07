"use client";

import React, { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Crown,
  Shield,
  Key,
  Users,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  RoleIndicator,
  RoleAwareBreadcrumb,
  RoleAwareHeader,
} from "@/components/layout/RoleAwareNavigation";

interface Role {
  id: string;
  name: string;
  description: string;
  users: number;
  permissions: string[];
  status: "active" | "inactive";
  created: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  roles: string[];
}

const roles: Role[] = [
  {
    id: "master",
    name: "MASTER",
    description: "Control absoluto del sistema",
    users: 2,
    permissions: ["all"],
    status: "active",
    created: "2024-01-01",
  },
  {
    id: "admin",
    name: "ADMIN",
    description: "Administración completa del sistema",
    users: 12,
    permissions: ["manage_users", "manage_content", "view_reports"],
    status: "active",
    created: "2024-01-01",
  },
  {
    id: "profesor",
    name: "PROFESOR",
    description: "Gestión de estudiantes y contenido educativo",
    users: 45,
    permissions: ["manage_students", "create_content", "view_reports"],
    status: "active",
    created: "2024-01-01",
  },
  {
    id: "parent",
    name: "PARENT",
    description: "Acceso a información de estudiantes",
    users: 38,
    permissions: ["view_student_info", "communicate"],
    status: "active",
    created: "2024-01-01",
  },
];

const permissions: Permission[] = [
  {
    id: "all",
    name: "Acceso Total",
    description: "Control completo del sistema",
    category: "System",
    roles: ["MASTER"],
  },
  {
    id: "manage_users",
    name: "Gestionar Usuarios",
    description: "Crear, editar y eliminar usuarios",
    category: "Users",
    roles: ["ADMIN"],
  },
  {
    id: "manage_content",
    name: "Gestionar Contenido",
    description: "Administrar contenido educativo",
    category: "Content",
    roles: ["ADMIN", "PROFESOR"],
  },
  {
    id: "view_reports",
    name: "Ver Reportes",
    description: "Acceso a reportes y analytics",
    category: "Reports",
    roles: ["ADMIN", "PROFESOR"],
  },
  {
    id: "manage_students",
    name: "Gestionar Estudiantes",
    description: "Administrar estudiantes",
    category: "Students",
    roles: ["PROFESOR"],
  },
  {
    id: "create_content",
    name: "Crear Contenido",
    description: "Crear material educativo",
    category: "Content",
    roles: ["PROFESOR"],
  },
  {
    id: "view_student_info",
    name: "Ver Info Estudiantes",
    description: "Acceso a información estudiantil",
    category: "Students",
    roles: ["PARENT"],
  },
  {
    id: "communicate",
    name: "Comunicar",
    description: "Enviar mensajes y comunicaciones",
    category: "Communication",
    roles: ["PARENT", "PROFESOR"],
  },
];

function RoleOverviewCard() {
  const stats = useMemo(
    () => ({
      totalRoles: roles.length,
      activeRoles: roles.filter((r) => r.status === "active").length,
      totalUsers: roles.reduce((sum, role) => sum + role.users, 0),
      totalPermissions: permissions.length,
    }),
    [],
  );

  return (
    <Card className="border-yellow-200 dark:border-yellow-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Resumen de Roles
        </CardTitle>
        <CardDescription>
          Estado general del sistema de roles y permisos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
            <Shield className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {stats.totalRoles}
            </div>
            <div className="text-sm text-muted-foreground">Roles Totales</div>
          </div>

          <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {stats.activeRoles}
            </div>
            <div className="text-sm text-muted-foreground">Roles Activos</div>
          </div>

          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {stats.totalUsers}
            </div>
            <div className="text-sm text-muted-foreground">
              Usuarios Asignados
            </div>
          </div>

          <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <Key className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {stats.totalPermissions}
            </div>
            <div className="text-sm text-muted-foreground">
              Permisos Totales
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RolesTableCard() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Gestión de Roles
        </CardTitle>
        <CardDescription>
          Administrar roles del sistema y sus permisos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-muted-foreground">
            {roles.length} roles encontrados
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Rol
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Usuarios</TableHead>
                <TableHead>Permisos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-600" />
                      {role.name}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {role.description}
                  </TableCell>
                  <TableCell>{role.users}</TableCell>
                  <TableCell>{role.permissions.length}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        role.status === "active" ? "default" : "secondary"
                      }
                    >
                      {role.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRole(role)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {selectedRole && (
          <Alert className="mt-4">
            <Eye className="h-4 w-4" />
            <AlertTitle>Detalles del Rol: {selectedRole.name}</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-1 text-sm">
                <div>
                  <strong>Permisos:</strong>{" "}
                  {selectedRole.permissions.join(", ")}
                </div>
                <div>
                  <strong>Creado:</strong> {selectedRole.created}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

function PermissionsMatrixCard() {
  const categories = useMemo(() => {
    const cats = new Set(permissions.map((p) => p.category));
    return Array.from(cats);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Matriz de Permisos
        </CardTitle>
        <CardDescription>
          Permisos asignados por rol y categoría
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="font-medium text-sm mb-3 text-muted-foreground uppercase">
                {category}
              </h3>
              <div className="space-y-2">
                {permissions
                  .filter((p) => p.category === category)
                  .map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-sm">
                          {permission.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {permission.description}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {permission.roles.map((role) => (
                          <Badge
                            key={role}
                            variant="outline"
                            className="text-xs"
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RoleAssignmentCard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Asignación de Roles
        </CardTitle>
        <CardDescription>Asignar y cambiar roles de usuarios</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800 dark:text-yellow-200">
              ⚠️ Operación Sensible
            </AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
              Cambiar roles puede afectar significativamente los permisos de los
              usuarios. Asegúrate de que los cambios sean necesarios y estén
              autorizados.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar Usuario</label>
              <Input
                placeholder="Email del usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nuevo Rol</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol..." />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full" disabled={!searchTerm || !selectedRole}>
            <Shield className="h-4 w-4 mr-2" />
            Actualizar Rol del Usuario
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function RoleManagementDashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6 p-6">
      {/* Role Management Header */}
      <RoleAwareHeader
        title="👑 ROLE MANAGEMENT - SUPREME ROLE CONTROL"
        subtitle={`Control absoluto de roles y permisos - Arquitecto ${session?.user?.name || "Master Developer"}`}
        actions={
          <div className="flex items-center gap-4">
            <Badge
              variant="outline"
              className="text-yellow-600 border-yellow-600"
            >
              <Crown className="h-3 w-3 mr-1" />
              ROLE MANAGEMENT
            </Badge>
            <RoleIndicator role="MASTER" />
          </div>
        }
      />

      {/* Role Overview */}
      <RoleOverviewCard />

      {/* Management Sections */}
      <div className="space-y-6">
        <RolesTableCard />
        <PermissionsMatrixCard />
        <RoleAssignmentCard />
      </div>
    </div>
  );
}
