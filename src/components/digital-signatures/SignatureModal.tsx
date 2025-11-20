"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { PenTool, X, RotateCcw, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language/useDivineLanguage";

type RecordType =
  | "CLASS_CONTENT"
  | "ATTENDANCE"
  | "OBSERVATION"
  | "GRADE"
  | "MEETING"
  | "PARENT_MEETING";

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  recordType: RecordType;
  recordId: string;
  teacherId: Id<"users">;
  recordLabel?: string;
}

export function SignatureModal({
  isOpen,
  onClose,
  onSuccess,
  recordType,
  recordId,
  teacherId,
  recordLabel,
}: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t } = useLanguage();
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createSignature = useMutation(api.digitalSignatures.createSignature);

  // Clear canvas when dialog opens
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
      }
    }
  }, [isOpen]);

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Set proper canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = 200;

        // Set drawing properties
        ctx.strokeStyle = "#2563eb"; // Blue color
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSubmit = async () => {
    if (!hasSignature) {
      toast.error(t("digital-signatures.signature.provide_signature"));
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get signature as base64 data
    const signatureData = canvas.toDataURL("image/png");

    // Get user context (IP, user agent)
    const ipAddress = await fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => data.ip)
      .catch(() => undefined);

    const userAgent = navigator.userAgent;

    setIsSubmitting(true);
    try {
      await createSignature({
        recordType,
        recordId,
        signedBy: teacherId,
        signatureData,
        signatureMethod: "ELECTRONIC",
        ipAddress,
        userAgent,
      });

      toast.success(t("digital-signatures.signature.signature_registered"));
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(
        error.message || t("digital-signatures.signature.signature_error"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRecordTypeLabel = (type: RecordType): string => {
    const labels: Record<RecordType, string> = {
      CLASS_CONTENT: "Contenido de Clase",
      ATTENDANCE: "Asistencia",
      OBSERVATION: "Observación",
      GRADE: "Calificación",
      MEETING: "Reunión",
      PARENT_MEETING: "Reunión con Apoderado",
    };
    return labels[type];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5 text-primary" />
            Firma Digital - Circular N°30
          </DialogTitle>
          <DialogDescription>
            Firma electrónica del registro: {getRecordTypeLabel(recordType)}
            {recordLabel && ` - ${recordLabel}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Conforme a Circular N°30 del MINEDUC, toda entrada al libro de
              clases debe ser firmada digitalmente por el profesor responsable.
              Esta firma certifica la veracidad de la información registrada.
            </AlertDescription>
          </Alert>

          {/* Signature Canvas */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Firma Electrónica <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed rounded-lg bg-muted/30">
              <canvas
                ref={canvasRef}
                className="w-full cursor-crosshair h-[200px] touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearSignature}
              disabled={!hasSignature}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {t("digital-signatures.signature.clear_signature")}
            </Button>
          </div>

          <Alert>
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm">
              Su firma será registrada con fecha, hora, IP y dispositivo. El
              registro quedará protegido y solo podrá ser modificado por
              administradores con permisos especiales.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              {t("digital-signatures.signature.cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!hasSignature || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                t("digital-signatures.certification.certifying")
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {t("digital-signatures.signature.sign_and_save")}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
