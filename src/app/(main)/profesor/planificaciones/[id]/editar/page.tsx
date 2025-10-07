import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPlanningDocumentById } from '@/services/queries/planning';
import { updatePlanningDocument } from '@/services/actions/planning';
import { PlanningDocumentForm } from '@/components/planning/PlanningDocumentForm';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/ui/page-transition';
import { t } from '@/lib/server-translations';

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function EditarPlanificacionPage({ params }: Props) {
  const { id } = await params;
  const document = await getPlanningDocumentById(id);

  if (!document.success || !document.data) {
    return <div>{t('profesor.planning.not_found', 'profesor')}</div>;
  }

  const doc = document.data;

  const updateAction = updatePlanningDocument.bind(null, doc._id);

  return (
    <PageTransition
      skeletonType="form"
      skeletonProps={{ fields: 8 }}
      duration={700}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/profesor/planificaciones/${id}`}>
            <Button variant="outline" size="sm">
              {t('profesor.planning.back', 'profesor')}
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t('profesor.planning.edit', 'profesor')}
            </h1>
            <p className="text-muted-foreground mt-1">{doc.title}</p>
          </div>
        </div>

        <PlanningDocumentForm
          action={updateAction}
          initialData={{
            title: doc.title,
            content: doc.content,
            subject: doc.subject,
            grade: doc.grade,
            attachments: doc.attachments
              ? JSON.parse(JSON.stringify(doc.attachments))
              : undefined,
          }}
          isEditing
        />
      </div>
    </PageTransition>
  );
}
