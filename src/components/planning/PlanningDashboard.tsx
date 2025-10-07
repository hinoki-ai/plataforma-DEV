'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { PlanningDocumentActions } from './PlanningDocumentActions';
import { PlanningDocumentSearch } from './PlanningDocumentSearch';
import { useResponsiveMode } from '@/lib/hooks/useDesktopToggle';
import { layout, typography } from '@/lib/responsive-utils';
import { useLanguage } from '@/components/language/LanguageContext';
import type { PlanningDocumentsResponse } from '@/lib/types/service-responses';

type PlanningDocumentWithAuthor = PlanningDocumentsResponse['data'][0];

interface PlanningDashboardProps {
  documents: PlanningDocumentWithAuthor[];
  searchParams?: Promise<{
    q?: string;
    subject?: string;
    grade?: string;
  }> | {
    q?: string;
    subject?: string;
    grade?: string;
  };
}

export function PlanningDashboard({
  documents,
  searchParams,
}: PlanningDashboardProps) {
  const { isDesktopForced } = useResponsiveMode();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1
          className={`${typography.heading(isDesktopForced)} font-bold text-foreground`}
        >
          {t('planning.dashboard.title', 'common')}
        </h1>
        <Link href="/profesor/planificaciones/crear">
          <Button className={isDesktopForced ? 'h-12 px-8 text-base' : ''}>
            {t('planning.dashboard.new_button', 'common')}
          </Button>
        </Link>
      </div>

      <PlanningDocumentSearch />

      {documents.length === 0 ? (
        <Card>
          <CardContent
            className={`${layout.spacing.component(isDesktopForced)} flex flex-col items-center justify-center py-16`}
          >
            <div className="text-center">
              <h3
                className={`${typography.subheading(isDesktopForced)} font-semibold text-foreground mb-2`}
              >
                {t('planning.dashboard.empty.title', 'common')}
              </h3>
              <p
                className={`${typography.body(isDesktopForced)} text-muted-foreground mb-6`}
              >
                {t('planning.dashboard.empty.description', 'common')}
              </p>
              <Link href="/profesor/planificaciones/crear">
                <Button
                  className={isDesktopForced ? 'h-12 px-8 text-base' : ''}
                >
                  {t('planning.dashboard.empty.create_button', 'common')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div
          className="container-responsive"
          role="region"
          aria-label={t('planning.dashboard.list_label', 'common')}
        >
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
          >
            {documents.map((document, index) => (
              <Card
                key={document.id}
                role="listitem"
                tabIndex={0}
                aria-label={`${t('planning.dashboard.document_label', 'common')}: ${document.title} - ${document.subject} ${document.grade}`}
                className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col group animate-fade-in"
                style={{ animationDelay: `${Math.min(index, 20) * 50}ms` }}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-base md:text-lg lg:text-xl line-clamp-2 group-hover:text-primary transition-colors duration-200">
                        {document.title}
                      </CardTitle>
                      <CardDescription className="mt-2 text-sm md:text-base">
                        <span className="font-medium">{document.subject}</span>
                        <span className="mx-2 text-muted-foreground">•</span>
                        <span>{document.grade}</span>
                      </CardDescription>
                    </div>
                    <PlanningDocumentActions documentId={document.id} />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    <p className="text-sm md:text-base text-muted-foreground line-clamp-3 lg:line-clamp-4 transition-all duration-200">
                      {document.content.length > 150
                        ? `${document.content.substring(0, 150)}...`
                        : document.content}
                    </p>

                    <div className="flex justify-between items-center text-xs md:text-sm text-muted-foreground mt-auto pt-4 border-t border-border/50">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {t('planning.dashboard.by_author', 'common')} {document.author.name || t('planning.dashboard.anonymous', 'common')}
                        </span>
                      </div>
                      <span className="text-xs md:text-sm">
                        {formatDate(document.updatedAt)}
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex gap-2 pt-4 mt-auto"
                  >
                    <Link
                      href={`/profesor/planificaciones/${document.id}`}
                      className="flex-1"
                      aria-label={`${t('planning.dashboard.view_details', 'common')} ${document.title}`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full md:text-sm md:h-10"
                      >
                        {t('planning.dashboard.view_button', 'common')}
                      </Button>
                    </Link>
                    <Link
                      href={`/profesor/planificaciones/${document.id}/editar`}
                      aria-label={`${t('planning.dashboard.edit_label', 'common')} ${document.title}`}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="md:text-sm md:h-10 md:px-4 hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        {t('planning.dashboard.edit_button', 'common')}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
