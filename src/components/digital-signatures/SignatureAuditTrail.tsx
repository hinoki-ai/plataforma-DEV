"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, type Doc } from "@/convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

type RecordType =
  | "CLASS_CONTENT"
  | "ATTENDANCE"
  | "OBSERVATION"
  | "GRADE"
  | "MEETING"
  | "PARENT_MEETING";

interface SignatureAuditTrailProps {
  recordType?: RecordType;
  recordId?: string;
  courseId?: Id<"courses">;
}

type SignatureWithDetails = Doc<"digitalSignatures"> & {
  signer?: Doc<"users"> | null;
  certifier?: Doc<"users"> | null;
};

export function SignatureAuditTrail({
  recordType,
  recordId,
  courseId,
}: SignatureAuditTrailProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<RecordType | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "CERTIFIED" | "UNCERTIFIED"
  >("ALL");

  // Get all signatures for the course or specific record
  // Note: You may need to create a custom query for this
  const signatures = useQuery(
    api.digitalSignatures.getSignaturesByUser,
    "skip",
  ) as SignatureWithDetails[] | undefined;

  const getRecordTypeLabel = (type: RecordType): string => {
    const labels: Record<RecordType, string> = {
      CLASS_CONTENT: "Contenido",
      ATTENDANCE: "Asistencia",
      OBSERVATION: "Observación",
      GRADE: "Calificación",
      MEETING: "Reunión",
      PARENT_MEETING: "Reunión Apoderado",
    };
    return labels[type];
  };

  const getRecordTypeIcon = (type: RecordType) => {
    switch (type) {
      case "CLASS_CONTENT":
        return <FileText className="h-4 w-4" />;
      case "ATTENDANCE":
        return <CheckCircle className="h-4 w-4" />;
      case "OBSERVATION":
        return <Eye className="h-4 w-4" />;
      case "GRADE":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredSignatures = signatures?.filter((sig: SignatureWithDetails) => {
    if (filterType !== "ALL" && sig.recordType !== filterType) {
      return false;
    }
    if (filterStatus === "CERTIFIED" && !sig.isCertified) {
      return false;
    }
    if (filterStatus === "UNCERTIFIED" && sig.isCertified) {
      return false;
    }
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return sig.recordId.toLowerCase().includes(searchLower) || false;
    }
    return true;
  });

  const handleViewSignature = (signatureData: string) => {
    // Open signature in a new modal or window
    const blob = new Blob([signatureData], { type: "image/png" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Historial de Firmas Digitales
          </h2>
          <p className="text-muted-foreground">
            Auditoría completa de todas las firmas digitales registradas
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Busque y filtre el historial de firmas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Registro</label>
              <Select
                value={filterType}
                onValueChange={(value) => setFilterType(value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="CLASS_CONTENT">Contenidos</SelectItem>
                  <SelectItem value="ATTENDANCE">Asistencias</SelectItem>
                  <SelectItem value="GRADE">Calificaciones</SelectItem>
                  <SelectItem value="OBSERVATION">Observaciones</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select
                value={filterStatus}
                onValueChange={(value) => setFilterStatus(value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="CERTIFIED">Certificados</SelectItem>
                  <SelectItem value="UNCERTIFIED">Sin Certificar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Búsqueda</label>
              <Input
                placeholder="Buscar por ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signatures Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Firmas</CardTitle>
          <CardDescription>
            Historial completo de firmas digitales del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {signatures === undefined ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-muted-foreground">
                Cargando historial...
              </div>
            </div>
          ) : filteredSignatures && filteredSignatures.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>ID Registro</TableHead>
                    <TableHead>Firmado Por</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Certificado Por</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSignatures.map((sig: SignatureWithDetails) => (
                    <TableRow key={sig._id}>
                      <TableCell className="font-medium">
                        {format(sig.createdAt, "dd/MM/yyyy HH:mm:ss", {
                          locale: es,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRecordTypeIcon(sig.recordType)}
                          <span className="text-sm">
                            {getRecordTypeLabel(sig.recordType)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {sig.recordId.substring(0, 20)}...
                      </TableCell>
                      <TableCell>
                        {sig.signer?.name || sig.signer?.email || "Desconocido"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {sig.signatureMethod === "ELECTRONIC"
                            ? "Electrónica"
                            : sig.signatureMethod === "BIOMETRIC"
                              ? "Biométrica"
                              : "Certificado"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {sig.isCertified ? (
                          <Badge className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Certificado
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-yellow-500">
                            <Clock className="h-3 w-3 mr-1" />
                            Pendiente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {sig.isCertified && sig.certifier
                          ? sig.certifier.name || sig.certifier.email
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewSignature(sig.signatureData)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Sin registros</p>
              <p className="text-sm">No se encontraron firmas digitales</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
