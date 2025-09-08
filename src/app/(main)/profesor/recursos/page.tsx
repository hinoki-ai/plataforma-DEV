'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PageTransition } from '@/components/ui/page-transition';
import { Button } from '@/components/ui/button';
import { useDivineParsing } from '@/components/language/useDivineLanguage';
import { useState, useEffect, Suspense } from 'react';
import { ExternalLink, BookOpen, Video, Image, Wrench, FileText, Users } from 'lucide-react';
import { LoadingState } from '@/components/ui/loading-states';
import { ErrorBoundary } from '@/components/ui/error-boundary';

interface ResourceItem {
  title: string;
  description: string;
  url: string;
  type: string;
}

interface ResourceCategory {
  title: string;
  description: string;
  items: ResourceItem[];
}

const categoryIcons = {
  digitalLibrary: BookOpen,
  teachingMaterials: FileText,
  multimediaResources: Video,
  pedagogicalTools: Wrench,
  assessments: FileText,
  community: Users,
};

const resourceTypeColors = {
  library: 'bg-blue-100 text-blue-800',
  educational: 'bg-green-100 text-green-800',
  videos: 'bg-red-100 text-red-800',
  language: 'bg-purple-100 text-purple-800',
  images: 'bg-yellow-100 text-yellow-800',
  tool: 'bg-indigo-100 text-indigo-800',
  assessment: 'bg-orange-100 text-orange-800',
  collaboration: 'bg-pink-100 text-pink-800',
  community: 'bg-teal-100 text-teal-800',
  social: 'bg-cyan-100 text-cyan-800',
  marketplace: 'bg-emerald-100 text-emerald-800',
};

function RecursosContent() {
  const { t } = useDivineParsing(['common', 'profesor']);
  const [resources, setResources] = useState<Record<string, ResourceCategory> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResources() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/profesor/resources');
        const data = await response.json();

        if (data.success) {
          setResources(data.data);
        } else {
          setError(data.error || 'Error al cargar recursos');
        }
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError('Error al cargar los recursos educativos');
      } finally {
        setLoading(false);
      }
    }

    fetchResources();
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('profesor.resources.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('profesor.resources.description')}
          </p>
        </div>
        <div className="text-center py-16">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error al cargar recursos
          </h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!resources) {
    return null;
  }

  const categories = Object.entries(resources);
  const selectedResource = selectedCategory ? resources[selectedCategory] : null;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t('profesor.resources.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('profesor.resources.description')}
        </p>
      </div>

      {!selectedCategory ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(([key, category]) => {
            const IconComponent = categoryIcons[key as keyof typeof categoryIcons] || BookOpen;
            return (
              <Card key={key} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.items.length} recursos disponibles
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedCategory(key)}
                  >
                    Explorar recursos
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setSelectedCategory(null)}
            >
              ← Volver a categorías
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {selectedResource?.title}
              </h2>
              <p className="text-muted-foreground">
                {selectedResource?.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedResource?.items.map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {item.description}
                      </CardDescription>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      resourceTypeColors[item.type as keyof typeof resourceTypeColors] ||
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visitar recurso
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RecursosEducativosPage() {
  return (
    <ErrorBoundary fallback={<div>Error al cargar la página de recursos</div>}>
      <Suspense fallback={<LoadingState />}>
        <RecursosContent />
      </Suspense>
    </ErrorBoundary>
  );
}
