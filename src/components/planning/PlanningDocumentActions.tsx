"use client";

import { useState } from "react";
import { deletePlanningDocument } from "@/services/actions/planning";
import { Button } from "@/components/ui/button";

// i18n
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

interface PlanningDocumentActionsProps {
  documentId: string;
}

export function PlanningDocumentActions({
  documentId,
}: PlanningDocumentActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { t } = useDivineParsing(["common"]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePlanningDocument(documentId);
      // The action will revalidate and redirect automatically
    } catch (error) {
      console.error("Error deleting document:", error);
      // Error handling - will be handled by parent component or toast notification
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (showDeleteConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {t("planning.delete.confirm", "common")}
        </span>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting
            ? t("planning.deleting", "common")
            : t("planning.delete.yes", "common")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDeleteConfirm(false)}
          disabled={isDeleting}
        >
          {t("planning.delete.no", "common")}
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setShowDeleteConfirm(true)}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      {t("planning.file.delete", "common")}
    </Button>
  );
}
