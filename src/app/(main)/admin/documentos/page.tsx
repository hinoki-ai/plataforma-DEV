"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FileText, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useResponsiveMode } from "@/lib/hooks/useDesktopToggle";
import { typography, layout } from "@/lib/responsive-utils";
import { PDFViewer } from "@/components/ui/pdf-viewer";
import { toast } from "sonner";
import { PageTransition } from "@/components/ui/page-transition";

// i18n
import { useLanguage } from "@/components/language/LanguageContext";

interface DocumentUpload {
  id: string;
  name: string;
  type: "reglamento" | "plan" | "manual" | "protocolo" | "propuesta_tecnica";
  number: number;
  url: string;
  uploadDate: string;
}

const getDocumentCategories = (
  t: (key: string, namespace?: string) => string,
) => [
  {
    type: "reglamento" as const,
    label: t("documents.category.reglamentos", "common"),
    count: 4,
  },
  {
    type: "plan" as const,
    label: t("documents.category.planes", "common"),
    count: 5,
  },
  {
    type: "manual" as const,
    label: t("documents.category.manuales", "common"),
    count: 3,
  },
  {
    type: "protocolo" as const,
    label: t("documents.category.protocolos", "common"),
    count: 9,
  },
  {
    type: "propuesta_tecnica" as const,
    label: "Propuesta Técnica",
    count: 2,
  },
];

export default function AdminDocumentosPage() {
  const { data: session } = useSession();
  const { isDesktopForced } = useResponsiveMode();
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [pdfViewer, setPdfViewer] = useState<{
    isOpen: boolean;
    src: string;
    title: string;
  } | null>(null);
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);

  const handleFileUpload = async (
    file: File,
    type: "reglamento" | "plan" | "manual" | "protocolo" | "propuesta_tecnica",
    number: number,
  ) => {
    if (session?.user?.role !== "ADMIN") {
      toast.error(t("documents.admin.required", "common"));
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("number", number.toString());

    try {
      const response = await fetch("/api/admin/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(t("documents.upload.error", "common"));

      const result = await response.json();
      setDocuments((prev) => [...prev, result.document]);

      toast.success(`${file.name} ${t("documents.upload.success", "common")}`);
    } catch {
      toast.error(t("documents.upload.failure", "common"));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/admin/documents/${documentId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error(t("documents.delete.error", "common"));

      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));

      toast.success(t("documents.delete.success", "common"));
    } catch {
      toast.error(t("documents.delete.failure", "common"));
    }
  };

  const handleOpenPdf = (src: string, title: string) => {
    setPdfViewer({ isOpen: true, src, title });
  };

  const handleClosePdf = () => {
    setPdfViewer(null);
  };

  return (
    <PageTransition
      skeletonType="cards"
      skeletonProps={{ columns: 2, rows: 2 }}
      duration={700}
    >
      <div className={layout.container(isDesktopForced)}>
        <div className={layout.spacing.section(isDesktopForced)}>
          <h1
            className={`${typography.heading(isDesktopForced)} font-bold text-foreground mb-6`}
          >
            {t("documents.title", "common")}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {getDocumentCategories(t).map(({ type, label, count }) => (
              <Card key={type} className="border-primary/40 shadow-lg">
                <CardHeader className="flex flex-row items-center gap-3">
                  <FileText className="w-6 h-6 text-primary" />
                  <CardTitle className="text-lg">{label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(count)].map((_, i) => {
                      const docNumber = i + 1;
                      const existingDoc = documents.find(
                        (doc) => doc.type === type && doc.number === docNumber,
                      );

                      return (
                        <div
                          key={docNumber}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <span className="font-medium">
                            {label} {docNumber}
                          </span>
                          <div className="flex items-center gap-2">
                            {existingDoc ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleOpenPdf(
                                      existingDoc.url,
                                      existingDoc.name,
                                    )
                                  }
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteDocument(existingDoc.id)
                                  }
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </>
                            ) : (
                              <Input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleFileUpload(file, type, docNumber);
                                  }
                                }}
                                className="text-sm"
                                disabled={uploading}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-sm text-muted-foreground mt-8">
            <p>
              📁 {t("documents.help.storage", "common")}{" "}
              <code>/public/uploads/</code>
            </p>
            <p>📝 {t("documents.help.permissions", "common")}</p>
          </div>
        </div>

        {/* PDF Viewer Modal */}
        {pdfViewer?.isOpen && (
          <PDFViewer
            src={pdfViewer.src}
            title={pdfViewer.title}
            onClose={handleClosePdf}
          />
        )}
      </div>
    </PageTransition>
  );
}
