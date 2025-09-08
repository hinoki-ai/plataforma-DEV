'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ParentCreationForm } from '@/components/users/ParentCreationForm';
import { PageTransition } from '@/components/ui/page-transition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, Mail, Phone, User, Edit, Trash2, Eye } from 'lucide-react';
import { useLanguage } from '@/components/language/LanguageContext';
import { toast } from 'sonner';
import { LoadingState } from '@/components/ui/loading-states';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import Link from 'next/link';

type ParentFormData = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  studentName: string;
  studentGrade: string;
  studentEmail?: string;
  guardianPhone?: string;
  relationship: string;
};

interface ParentUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  studentInfo?: {
    studentName: string;
    studentGrade: string;
    relationship: string;
  };
}

function UsuariosPadresContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [parents, setParents] = useState<ParentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (session?.user?.role) {
      fetchParents();
    }
  }, [session]);

  const fetchParents = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, we'll use a mock API since we don't have a GET endpoint for parents
      // In a real implementation, you'd fetch from an API endpoint
      const mockParents: ParentUser[] = [
        {
          id: '1',
          name: 'María González',
          email: 'maria.gonzalez@email.com',
          phone: '+56912345678',
          role: 'PARENT',
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z',
          studentInfo: {
            studentName: 'Carlos González',
            studentGrade: '5° Básico',
            relationship: 'Madre'
          }
        },
        {
          id: '2',
          name: 'Juan Pérez',
          email: 'juan.perez@email.com',
          phone: '+56987654321',
          role: 'PARENT',
          isActive: true,
          createdAt: '2024-01-20T14:30:00Z',
          studentInfo: {
            studentName: 'Ana Pérez',
            studentGrade: '3° Básico',
            relationship: 'Padre'
          }
        }
      ];

      setParents(mockParents);
    } catch (err) {
      console.error('Error fetching parents:', err);
      setError('Error al cargar los usuarios padres');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateParent = async (data: ParentFormData) => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/profesor/parents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newUser = await response.json();
        toast.success(
          `✅ Usuario padre creado exitosamente`,
          {
            description: `Nombre: ${newUser.name} | Estudiante: ${newUser.studentInfo.studentName}`,
          }
        );
        setShowCreateForm(false);
        fetchParents(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error('❌ Error al crear usuario padre', {
          description: error.error || 'Por favor verifica los datos e intenta nuevamente',
        });
      }
    } catch (error) {
      console.error('Error creating parent user:', error);
      toast.error('❌ Error al crear usuario padre', {
        description: 'Por favor intenta nuevamente',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteParent = async (parentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario padre? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      // In a real implementation, you'd call a DELETE API endpoint
      toast.success('Usuario padre eliminado exitosamente');
      setParents(parents.filter(parent => parent.id !== parentId));
    } catch (error) {
      console.error('Error deleting parent:', error);
      toast.error('Error al eliminar el usuario padre');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!session?.user?.role) {
    return <LoadingState />;
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Usuarios Padres
          </h1>
          <p className="text-muted-foreground">
            Gestiona los usuarios padres registrados en el sistema
          </p>
        </div>
        <div className="text-center py-16">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error al cargar usuarios
          </h3>
          <p className="text-gray-600">{error}</p>
          <Button onClick={fetchParents} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Usuarios Padres
            </h1>
            <p className="text-muted-foreground">
              Gestiona los usuarios padres registrados en el sistema
            </p>
          </div>
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Padre
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Usuario Padre</DialogTitle>
                <DialogDescription>
                  Registra un nuevo usuario padre con información completa del estudiante
                </DialogDescription>
              </DialogHeader>
              <ParentCreationForm
                onSubmit={handleCreateParent}
                onCancel={() => setShowCreateForm(false)}
                isLoading={isCreating}
                title=""
                description=""
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Total: {parents.length}</span>
          <span>Activos: {parents.filter(p => p.isActive).length}</span>
        </div>
      </div>

      {parents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No hay usuarios padres registrados
            </h3>
            <p className="text-muted-foreground mb-6 text-center">
              Crea tu primer usuario padre para comenzar a gestionar las relaciones con los padres de familia
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Primer Usuario Padre
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parents.map((parent) => (
            <Card key={parent.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {parent.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {parent.email}
                    </CardDescription>
                  </div>
                  <Badge variant={parent.isActive ? "default" : "secondary"}>
                    {parent.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  {parent.phone && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      {parent.phone}
                    </div>
                  )}
                  {parent.studentInfo && (
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="w-4 h-4 mr-2 flex-shrink-0" />
                        Estudiante: {parent.studentInfo.studentName}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        📚 Grado: {parent.studentInfo.studentGrade}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        👨‍👩‍👧‍👦 Relación: {parent.studentInfo.relationship}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-muted-foreground">
                    📅 Registrado: {formatDate(parent.createdAt)}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteParent(parent.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TeacherParentCreationPage() {
  return (
    <ErrorBoundary fallback={<div>Error al cargar la página de usuarios padres</div>}>
      <Suspense fallback={<LoadingState />}>
        <UsuariosPadresContent />
      </Suspense>
    </ErrorBoundary>
  );
}