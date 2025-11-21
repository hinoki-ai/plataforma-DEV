"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { Id } from "@/convex/_generated/dataModel";

interface InstitutionReassignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: Id<"users"> | null;
  userName: string;
  userEmail: string;
  currentInstitutionId?: Id<"institutionInfo">;
}

interface Institution {
  _id: Id<"institutionInfo">;
  name: string;
  email: string;
  institutionType: string;
  isActive: boolean;
}

export function InstitutionReassignmentDialog({
  isOpen,
  onClose,
  userId,
  userName,
  userEmail,
  currentInstitutionId,
}: InstitutionReassignmentDialogProps) {
  const { t } = useDivineParsing(["common", "admin"]);
  const [selectedInstitutionId, setSelectedInstitutionId] =
    useState<string>("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const institutions = useQuery(api.users.getActiveInstitutions) || [];
  const reassignUser = useMutation(api.users.reassignUserToInstitution);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedInstitutionId("");
      setReason("");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!userId || !selectedInstitutionId) {
      toast.error("❌ Error de validación", {
        description: "Usuario e institución son requeridos",
      });
      return;
    }

    if (selectedInstitutionId === currentInstitutionId) {
      toast.error("❌ Error de validación", {
        description: "El usuario ya pertenece a esta institución",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await reassignUser({
        userId,
        newInstitutionId: selectedInstitutionId as Id<"institutionInfo">,
        reason: reason.trim() || undefined,
      });

      toast.success("✅ Usuario reasignado exitosamente", {
        description: `El usuario ${userName} ha sido movido a la nueva institución`,
      });

      onClose();
    } catch (error) {
      console.error("Reassignment error:", error);
      toast.error("❌ Error al reasignar usuario", {
        description:
          error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedInstitution = institutions.find(
    (inst) => inst._id === selectedInstitutionId,
  );

  const currentInstitution = institutions.find(
    (inst) => inst._id === currentInstitutionId,
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reasignar Usuario a Institución</DialogTitle>
          <DialogDescription>
            Cambia la institución asignada para este usuario. Esta acción
            requiere permisos de administrador.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Usuario</h4>
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>

          {/* Current Institution */}
          {currentInstitution && (
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Institución Actual</h4>
              <Badge variant="outline" className="text-xs">
                {currentInstitution.name}
              </Badge>
            </div>
          )}

          {/* New Institution Selection */}
          <div className="space-y-2">
            <Label htmlFor="institution">Nueva Institución *</Label>
            <Select
              value={selectedInstitutionId}
              onValueChange={setSelectedInstitutionId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar institución..." />
              </SelectTrigger>
              <SelectContent>
                {institutions.map((institution) => (
                  <SelectItem key={institution._id} value={institution._id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{institution.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {institution.institutionType} • {institution.email}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Razón del cambio (opcional)</Label>
            <Textarea
              id="reason"
              placeholder="Ej: Transferencia solicitada por el usuario, cambio administrativo..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Preview */}
          {selectedInstitution && (
            <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">
                Vista Previa del Cambio
              </h4>
              <p className="text-sm">
                <span className="font-medium">{userName}</span> será movido de{" "}
                <Badge variant="outline" className="text-xs">
                  {currentInstitution?.name || "Sin institución"}
                </Badge>{" "}
                a{" "}
                <Badge variant="outline" className="text-xs">
                  {selectedInstitution.name}
                </Badge>
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedInstitutionId || isSubmitting}
            className="bg-primary hover:bg-primary-90"
          >
            {isSubmitting ? "Reasignando..." : "Reasignar Usuario"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
