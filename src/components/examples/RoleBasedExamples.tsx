'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  RoleGuard,
  RoleBasedComponent,
  PermissionBasedComponent,
  FeatureToggle,
  RoleBasedButton,
  useRoleAccess,
} from '@/components/auth/RoleGuard';
import {
  RoleIndicator,
  RoleAwareBreadcrumb,
  RoleAwareHeader,
} from '@/components/layout/RoleAwareNavigation';
import { useNavigation } from '@/components/layout/NavigationContext';
import {
  Crown,
  Shield,
  GraduationCap,
  Users,
  Eye,
  Edit,
  Trash2,
  Upload,
  Settings,
  CheckCircle,
} from 'lucide-react';

export function RoleBasedExamples() {
  const { user } = useNavigation();
  const roleAccess = useRoleAccess();

  return (
    <div className="space-y-8">
      <RoleAwareHeader
        title="Ejemplos de Componentes Basados en Roles"
        subtitle="Demostración de funcionalidades de control de acceso"
      />

      <RoleAwareBreadcrumb />

      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RoleIndicator role={user.role || 'PUBLIC'} />
            Información del Usuario Actual
          </CardTitle>
          <CardDescription>
            Estado actual de autenticación y permisos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {roleAccess.isMaster ? '✅' : '❌'}
              </div>
              <div className="text-sm text-muted-foreground">MASTER</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {roleAccess.isAdmin ? '✅' : '❌'}
              </div>
              <div className="text-sm text-muted-foreground">ADMIN</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {roleAccess.isProfesor ? '✅' : '❌'}
              </div>
              <div className="text-sm text-muted-foreground">PROFESOR</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {roleAccess.isParent ? '✅' : '❌'}
              </div>
              <div className="text-sm text-muted-foreground">PARENT</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Guard Examples */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              RoleGuard Examples
            </CardTitle>
            <CardDescription>
              Componentes que se muestran/ocultan basados en roles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* MASTER Only */}
            <RoleGuard roles={['MASTER']} showUnauthorized={false}>
              <Alert>
                <Crown className="h-4 w-4" />
                <AlertDescription>
                  🎯 Solo visible para MASTER - Herramientas de desarrollo
                </AlertDescription>
              </Alert>
            </RoleGuard>

            {/* ADMIN and MASTER */}
            <RoleGuard roles={['ADMIN', 'MASTER']} showUnauthorized={false}>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  👑 Visible para ADMIN y MASTER - Gestión administrativa
                </AlertDescription>
              </Alert>
            </RoleGuard>

            {/* PROFESOR, ADMIN, MASTER */}
            <RoleGuard roles={['PROFESOR', 'ADMIN', 'MASTER']} showUnauthorized={false}>
              <Alert>
                <GraduationCap className="h-4 w-4" />
                <AlertDescription>
                  📚 Visible para PROFESOR, ADMIN, MASTER - Funciones académicas
                </AlertDescription>
              </Alert>
            </RoleGuard>

            {/* PARENT, PROFESOR, ADMIN, MASTER */}
            <RoleGuard roles={['PARENT', 'PROFESOR', 'ADMIN', 'MASTER']} showUnauthorized={false}>
              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  👨‍👩‍👧‍👦 Visible para todos los roles autenticados - Contenido general
                </AlertDescription>
              </Alert>
            </RoleGuard>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              PermissionBased Examples
            </CardTitle>
            <CardDescription>
              Componentes basados en permisos específicos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PermissionBasedComponent
              permission="users:manage"
              showUnauthorized={false}
            >
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Gestionar Usuarios
              </Button>
            </PermissionBasedComponent>

            <PermissionBasedComponent
              permission="planning:all"
              showUnauthorized={false}
            >
              <Button variant="outline" className="w-full justify-start">
                <Edit className="h-4 w-4 mr-2" />
                Ver Todas las Planificaciones
              </Button>
            </PermissionBasedComponent>

            <PermissionBasedComponent
              permission="files:upload"
              showUnauthorized={false}
            >
              <Button variant="outline" className="w-full justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Subir Archivos
              </Button>
            </PermissionBasedComponent>

            <PermissionBasedComponent
              permission="admin:dashboard"
              showUnauthorized={false}
            >
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Panel de Administración
              </Button>
            </PermissionBasedComponent>
          </CardContent>
        </Card>
      </div>

      {/* RoleBasedComponent Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            RoleBasedComponent Examples
            </CardTitle>
            <CardDescription>
              Contenido diferente para cada rol usando el mismo componente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <RoleBasedComponent
                master={
                  <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="h-4 w-4 text-yellow-600" />
                        <Badge variant="secondary">MASTER</Badge>
                      </div>
                      <p className="text-sm">Acceso completo al sistema. Herramientas de desarrollo disponibles.</p>
                    </CardContent>
                  </Card>
                }
                admin={
                  <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <Badge variant="secondary">ADMIN</Badge>
                      </div>
                      <p className="text-sm">Gestión administrativa completa del centro educativo.</p>
                    </CardContent>
                  </Card>
                }
                profesor={
                  <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="h-4 w-4 text-green-600" />
                        <Badge variant="secondary">PROFESOR</Badge>
                      </div>
                      <p className="text-sm">Herramientas pedagógicas y gestión de clases.</p>
                    </CardContent>
                  </Card>
                }
                parent={
                  <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <Badge variant="secondary">PARENT</Badge>
                      </div>
                      <p className="text-sm">Seguimiento del progreso de sus hijos e información escolar.</p>
                    </CardContent>
                  </Card>
                }
                public={
                  <Card className="border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="h-4 w-4 text-gray-600" />
                        <Badge variant="secondary">PUBLIC</Badge>
                      </div>
                      <p className="text-sm">Información pública del centro educativo.</p>
                    </CardContent>
                  </Card>
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Feature Toggle Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Feature Toggle Examples
            </CardTitle>
            <CardDescription>
              Características habilitadas/deshabilitadas por rol
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FeatureToggle feature="role-switching">
                <Alert>
                  <Crown className="h-4 w-4" />
                  <AlertDescription>
                    🎭 Feature &quot;role-switching&quot; está habilitada para este rol
                  </AlertDescription>
                </Alert>
              </FeatureToggle>

              <FeatureToggle feature="advanced-analytics">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    📊 Feature &quot;advanced-analytics&quot; está habilitada para este rol
                  </AlertDescription>
                </Alert>
              </FeatureToggle>

              <FeatureToggle feature="user-management">
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    👥 Feature &quot;user-management&quot; está habilitada para este rol
                  </AlertDescription>
                </Alert>
              </FeatureToggle>

              <FeatureToggle feature="bulk-operations">
                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    ⚡ Feature &quot;bulk-operations&quot; está habilitada para este rol
                  </AlertDescription>
                </Alert>
              </FeatureToggle>
            </div>
          </CardContent>
        </Card>

        {/* RoleBasedButton Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              RoleBasedButton Examples
            </CardTitle>
            <CardDescription>
              Botones que se muestran automáticamente basados en roles/permisos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <RoleBasedButton
                roles={['MASTER', 'ADMIN']}
                variant="default"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configuración (ADMIN+)
              </RoleBasedButton>

              <RoleBasedButton
                roles={['MASTER', 'ADMIN', 'PROFESOR']}
                variant="secondary"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar (PROFESOR+)
              </RoleBasedButton>

              <RoleBasedButton
                permissions={["users:manage"]}
                variant="destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Usuario
              </RoleBasedButton>

              <RoleBasedButton
                permissions={["files:upload"]}
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                Subir Archivo
              </RoleBasedButton>

              <RoleBasedButton
                permissions={["files:delete"]}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Borrar
              </RoleBasedButton>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Context Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Navigation Context
            </CardTitle>
            <CardDescription>
              Información del contexto de navegación actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Rol actual:</span>
                <Badge>{user.role || 'No autenticado'}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Permisos disponibles:</span>
                <span className="text-muted-foreground">
                  {user.roleAccess?.canAccessAdmin ? 'Admin, ' : ''}
                  {user.roleAccess?.canAccessProfesor ? 'Profesor, ' : ''}
                  {user.roleAccess?.canAccessParent ? 'Parent, ' : ''}
                  Public
                </span>
              </div>
              <div className="flex justify-between">
                <span>Items de navegación:</span>
                <span className="text-muted-foreground">
                  {user.role ? 'Cargados' : 'No disponibles'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
}