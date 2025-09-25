'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useDivineParsing } from '@/components/language/useDivineLanguage';
import { getRoleAccess } from '@/lib/role-utils';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Archive,
  Search,
  ArrowLeft,
  Mail,
  Calendar,
  Filter,
  Download,
  Eye,
  Trash2,
  Star,
  StarOff,
} from 'lucide-react';
import Link from 'next/link';
import { FixedBackgroundLayout } from '@/components/layout/FixedBackgroundLayout';

interface ArchivedMessage {
  id: string;
  type: string;
  from: string;
  subject: string;
  content: string;
  preview?: string;
  date: string;
  read: boolean;
  priority: string;
  category?: string;
  isStarred?: boolean;
  archivedAt: string;
}

export default function ArchivoPage() {
  const { data: session, status } = useSession();
  const { t } = useDivineParsing(['common', 'parent']);
  const [messages, setMessages] = useState<ArchivedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    // Simulate API call
    const loadMessages = async () => {
      setLoading(true);
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessages(mockMessages);
      setLoading(false);
    };

    loadMessages();
  }, []);

  // Mock archived messages
  const mockMessages: ArchivedMessage[] = [
    {
      id: '1',
      type: 'message',
      from: 'Dirección',
      subject: 'Reunión de Padres - Marzo 2024',
      content: 'Estimados padres, les informamos sobre la reunión programada...',
      preview: 'Estimados padres, les informamos sobre la reunión programada para el próximo mes.',
      date: '2024-02-15',
      read: true,
      priority: 'normal',
      category: 'meetings',
      isStarred: false,
      archivedAt: '2024-03-01',
    },
    {
      id: '2',
      type: 'message',
      from: 'Profesor Jefe',
      subject: 'Informe de Rendimiento Académico',
      content: 'Adjunto el informe parcial del rendimiento académico...',
      preview: 'Adjunto el informe parcial del rendimiento académico del primer trimestre.',
      date: '2024-01-30',
      read: true,
      priority: 'high',
      category: 'academic',
      isStarred: true,
      archivedAt: '2024-02-15',
    },
    {
      id: '3',
      type: 'notification',
      from: 'Sistema',
      subject: 'Cambio en Horarios de Clases',
      content: 'Se informa que los horarios de clases han sido modificados...',
      preview: 'Se informa que los horarios de clases han sido modificados por mantención.',
      date: '2024-01-20',
      read: false,
      priority: 'normal',
      category: 'administrative',
      isStarred: false,
      archivedAt: '2024-02-01',
    },
    {
      id: '4',
      type: 'message',
      from: 'Coordinación PIE',
      subject: 'Evaluación Especializada',
      content: 'La evaluación especializada ha sido completada...',
      preview: 'La evaluación especializada ha sido completada con resultados positivos.',
      date: '2024-01-10',
      read: true,
      priority: 'high',
      category: 'special_needs',
      isStarred: true,
      archivedAt: '2024-01-25',
    },
  ];

  // Handle loading state
  if (status === 'loading') {
    return (
      <FixedBackgroundLayout backgroundImage="/images/backgrounds/communication-bg.jpg">
        <div className="flex items-center justify-center min-h-screen">
          <div>{t('parent.students.loading')}</div>
        </div>
      </FixedBackgroundLayout>
    );
  }

  // Ensure user has access to parent section
  if (!session || !session.user) {
    redirect('/login');
  }

  const roleAccess = getRoleAccess(session.user.role);
  if (!roleAccess.canAccessParent) {
    redirect('/unauthorized');
  }

  const filteredMessages = messages
    .filter(message => {
      const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          message.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          message.content.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = filterCategory === 'all' || message.category === filterCategory;
      const matchesPriority = filterPriority === 'all' || message.priority === filterPriority;

      return matchesSearch && matchesCategory && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'priority':
          const priorityOrder = { high: 3, normal: 2, low: 1 };
          return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
        case 'sender':
          return a.from.localeCompare(b.from);
        default:
          return 0;
      }
    });

  const toggleStar = (messageId: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
    ));
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const exportMessages = () => {
    // In a real app, this would generate and download a file
    console.log('Exporting messages...');
  };

  return (
    <FixedBackgroundLayout backgroundImage="/images/backgrounds/communication-bg.jpg">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              asChild
              className="mb-4"
            >
              <Link href="/parent/comunicacion">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Archivo de Mensajes
            </h1>
            <p className="text-muted-foreground">
              Accede a tus mensajes archivados organizados por fecha y categoría
            </p>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar mensajes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      <SelectItem value="academic">Académico</SelectItem>
                      <SelectItem value="meetings">Reuniones</SelectItem>
                      <SelectItem value="administrative">Administrativo</SelectItem>
                      <SelectItem value="special_needs">Educación Especial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority Filter */}
                <div>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las prioridades</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">Más recientes</SelectItem>
                      <SelectItem value="date-asc">Más antiguos</SelectItem>
                      <SelectItem value="priority">Prioridad</SelectItem>
                      <SelectItem value="sender">Remitente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Export Button */}
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={exportMessages}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Messages List */}
          <div className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <div className="animate-pulse">Cargando mensajes archivados...</div>
                  </div>
                </CardContent>
              </Card>
            ) : filteredMessages.length > 0 ? (
              filteredMessages.map((message) => (
                <Card key={message.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Mail className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-foreground">
                                {message.from}
                              </span>
                              {message.priority === 'high' && (
                                <Badge variant="destructive" className="text-xs">
                                  Alta Prioridad
                                </Badge>
                              )}
                              {message.isStarred && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <h4 className="font-medium text-foreground mb-1">
                              {message.subject}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {message.preview || message.content.substring(0, 100) + '...'}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(message.date).toLocaleDateString()}
                              </span>
                              <span>
                                Archivado: {new Date(message.archivedAt).toLocaleDateString()}
                              </span>
                              {message.category && (
                                <Badge variant="outline" className="text-xs">
                                  {message.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleStar(message.id)}
                        >
                          {message.isStarred ? (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMessage(message.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No se encontraron mensajes
                    </h3>
                    <p className="text-gray-500">
                      No hay mensajes archivados que coincidan con los filtros aplicados
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Stats */}
          {!loading && (
            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {messages.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Archivados
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {messages.filter(m => m.isStarred).length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Favoritos
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {messages.filter(m => m.read).length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Leídos
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {messages.filter(m => m.priority === 'high').length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Alta Prioridad
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </FixedBackgroundLayout>
  );
}