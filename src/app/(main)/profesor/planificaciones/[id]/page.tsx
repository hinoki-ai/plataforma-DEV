import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlanningDocumentById } from "@/services/queries/planning";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { PlanningDocumentActions } from "@/components/planning/PlanningDocumentActions";
import { AttachmentList } from "@/components/planning/AttachmentList";
import type { SimpleFileMetadata as FileMetadata } from "@/lib/simple-upload";
import { PageTransition } from "@/components/ui/page-transition";
import { t } from "@/lib/server-translations";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function PlanificacionDetailPage({ params }: Props) {
  const { id } = await params;
  const document = await getPlanningDocumentById(id);

  if (!document.success || !document.data) {
    return <div>{t("profesor.planning.not_found", "profesor")}</div>;
  }

  const doc = document.data;

  // Parse attachments if they exist
  const attachments: FileMetadata[] = doc.attachments
    ? JSON.parse(JSON.stringify(doc.attachments))
    : [];

  return (
    <PageTransition
      skeletonType="detail"
      skeletonProps={{ sections: 3 }}
      duration={700}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/profesor/planificaciones">
              <Button variant="outline" size="sm">
                {t("profesor.planning.back", "profesor")}
              </Button>
            </Link>
            <div>
              <p className="text-muted-foreground mt-1">
                {doc.subject} • {doc.grade}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/profesor/planificaciones/${doc._id}/editar`}>
              <Button variant="outline">
                {t("profesor.planning.edit_button", "profesor")}
              </Button>
            </Link>
            <PlanningDocumentActions documentId={doc._id} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("profesor.planning.content", "profesor")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {doc.content}
                  </div>
                </div>
              </CardContent>
            </Card>

            {attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("profesor.planning.attachments", "profesor")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AttachmentList attachments={attachments} />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("profesor.planning.information", "profesor")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("profesor.planning.subject", "profesor")}
                  </label>
                  <p className="text-foreground">{doc.subject}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("profesor.planning.grade", "profesor")}
                  </label>
                  <p className="text-foreground">{doc.grade}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("profesor.planning.author", "profesor")}
                  </label>
                  <p className="text-foreground">{doc.author.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("profesor.planning.created", "profesor")}
                  </label>
                  <p className="text-foreground">
                    {formatDate(new Date(doc.createdAt))}
                  </p>
                </div>

                {doc.updatedAt !== doc.createdAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("profesor.planning.last_updated", "profesor")}
                    </label>
                    <p className="text-foreground">
                      {formatDate(new Date(doc.updatedAt))}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {t("profesor.planning.actions", "profesor")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href={`/profesor/planificaciones/${doc._id}/editar`}
                  className="block"
                >
                  <Button variant="outline" className="w-full">
                    {t("profesor.planning.edit_planning", "profesor")}
                  </Button>
                </Link>

                <Button variant="outline" className="w-full">
                  {t("profesor.planning.export_pdf", "profesor")}
                </Button>

                <Button variant="outline" className="w-full">
                  {t("profesor.planning.duplicate", "profesor")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
