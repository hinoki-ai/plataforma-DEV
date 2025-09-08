import type { PlanningDocument } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { memo } from 'react';

// i18n
import { useLanguage } from '@/components/language/LanguageContext';

interface PlanningDocumentCardProps {
  document: PlanningDocument & {
    author: {
      id: string;
      name: string | null;
      email: string;
    };
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

export const PlanningDocumentCard = memo(function PlanningDocumentCard({
  document,
  onEdit,
  onDelete,
  isAdmin,
}: PlanningDocumentCardProps) {
  const { t, language } = useLanguage();

  const formattedDate = format(new Date(document.updatedAt), 'dd MMM yyyy', {
    locale: language === 'es' ? es : enUS,
  });

  return (
    <Card
      className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col group"
      role="listitem"
      tabIndex={0}
      aria-label={`Planificación: ${document.title} - ${document.subject} ${document.grade}`}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-base md:text-lg lg:text-xl line-clamp-2 group-hover:text-primary transition-colors duration-200">
              {document.title}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary">{document.subject}</Badge>
              <Badge variant="outline">{document.grade}</Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground line-clamp-3">
            {document.content}
          </div>

          <div className="text-xs text-muted-foreground">
            <p>{t('planning.card.author', 'common')} {document.author.name || document.author.email}</p>
            <p>{t('planning.card.updated', 'common')} {formattedDate}</p>
          </div>

          {document.attachments && (
            <div className="text-xs">
              📎{' '}
              {Array.isArray(document.attachments)
                ? document.attachments.length
                : 0}{' '}
              {t('planning.card.files', 'common')}
            </div>
          )}

          {(onEdit || onDelete) && (
            <div className="flex gap-2 mt-auto pt-4">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(document.id)}
                  aria-label={`${t('planning.card.edit', 'common')} ${document.title}`}
                >
                  {t('planning.card.edit', 'common')}
                </Button>
              )}
              {onDelete &&
                (isAdmin || document.authorId === 'current-user-id') && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(document.id)}
                    aria-label={`${t('planning.card.delete', 'common')} ${document.title}`}
                  >
                    {t('planning.card.delete', 'common')}
                  </Button>
                )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

PlanningDocumentCard.displayName = 'PlanningDocumentCard';
