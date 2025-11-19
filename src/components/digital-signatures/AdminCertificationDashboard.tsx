"use client";

import { useState, type ChangeEvent } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Lock,
  Unlock,
  Eye,
  AlertTriangle,
  Download,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useEnterNavigation } from "@/lib/hooks/useFocusManagement";
import { useLanguage } from "@/components/language/useDivineLanguage";

type RecordType =
  | "CLASS_CONTENT"
  | "ATTENDANCE"
  | "OBSERVATION"
  | "GRADE"
  | "MEETING"
  | "PARENT_MEETING";

type UncertifiedSignature = Doc<"digitalSignatures"> & {
  signer: Doc<"users"> | null;
};

interface AdminCertificationDashboardProps {
  userId: Id<"users">;
}

export function AdminCertificationDashboard({
  userId,
}: AdminCertificationDashboardProps) {
  const { t } = useLanguage();
  const [selectedRecordType, setSelectedRecordType] = useState<
    RecordType | "ALL"
  >("ALL");
  const [selectedPeriod, setSelectedPeriod] = useState<
    "PRIMER_SEMESTRE" | "SEGUNDO_SEMESTRE" | "ANUAL" | "ALL"
  >("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [isCertifying, setIsCertifying] = useState(false);
  const [selectedCourseId, setSelectedCourseId] =
    useState<Id<"courses"> | null>(null);

  // Get uncertified signatures
  const uncertifiedSignatures = useQuery(
    api.digitalSignatures.getUncertifiedSignatures,
    selectedRecordType !== "ALL" ? { recordType: selectedRecordType } : "skip",
  );

  // Get all courses for filtering
  const courses = useQuery(api.courses.getCourses, {
    academicYear: new Date().getFullYear(),
    isActive: true,
  });

  const certifySignature = useMutation(api.digitalSignatures.certifySignature);

  const getRecordTypeLabel = (type: RecordType): string => {
    const labels: Record<RecordType, string> = {
      CLASS_CONTENT: t("digital-signatures.certification.content"),
      ATTENDANCE: t("digital-signatures.certification.attendance"),
      OBSERVATION: t("digital-signatures.certification.observation"),
      GRADE: t("digital-signatures.certification.grade"),
      MEETING: t("digital-signatures.certification.meeting"),
      PARENT_MEETING: t("digital-signatures.certification.parent_meeting"),
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

  const certifySignatureWithToast = async (
    signatureId: Id<"digitalSignatures">,
    successMessage: string,
    errorPrefix: string = t("digital-signatures.certification.certify_error"),
  ) => {
    setIsCertifying(true);
    try {
      await certifySignature({
        signatureId,
        certifiedBy: userId,
      });
      toast.success(successMessage);
      return true;
    } catch (error: any) {
      console.error(`${errorPrefix} ${signatureId}:`, error);
      toast.error(error.message || errorPrefix);
      return false;
    } finally {
      setIsCertifying(false);
    }
  };

  const handleBulkCertify = async () => {
    if (selectedRecords.length === 0) {
      toast.error(t("digital-signatures.certification.select_at_least_one"));
      return;
    }

    setIsCertifying(true);
    let successCount = 0;

    try {
      for (const signatureId of selectedRecords) {
        const success = await certifySignature({
          signatureId: signatureId as Id<"digitalSignatures">,
          certifiedBy: userId,
        })
          .then(() => true)
          .catch(() => false);
        if (success) successCount++;
      }

      toast.success(
        `${successCount} de ${selectedRecords.length} ${t("digital-signatures.certification.records_certified_success")}`,
      );
      setSelectedRecords([]);
    } catch (error: any) {
      toast.error(error.message || t("digital-signatures.certification.bulk_certify_error"));
    } finally {
      setIsCertifying(false);
    }
  };

  const handleCertifySingle = async (signatureId: Id<"digitalSignatures">) => {
    await certifySignatureWithToast(
      signatureId,
      t("digital-signatures.certification.certify_success"),
      t("digital-signatures.certification.certify_error"),
    );
  };

  const toggleRecordSelection = (signatureId: string) => {
    setSelectedRecords((prev: string[]) =>
      prev.includes(signatureId)
        ? prev.filter((id: string) => id !== signatureId)
        : [...prev, signatureId],
    );
  };

  const filteredSignatures = uncertifiedSignatures?.filter(
    (sig: UncertifiedSignature) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          sig.recordId.toLowerCase().includes(searchLower) ||
          sig.signer?.name?.toLowerCase().includes(searchLower) ||
          false
        );
      }
      return true;
    },
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t("digital-signatures.certification.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("digital-signatures.certification.description")}
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("digital-signatures.certification.pending")}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {uncertifiedSignatures?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("digital-signatures.certification.pending_records")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("digital-signatures.certification.content")}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {uncertifiedSignatures?.filter(
                (c: UncertifiedSignature) => c.recordType === "CLASS_CONTENT",
              ).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("digital-signatures.certification.pending_records")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("digital-signatures.certification.attendance")}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {uncertifiedSignatures?.filter(
                (c: UncertifiedSignature) => c.recordType === "ATTENDANCE",
              ).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("digital-signatures.certification.pending_records")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("digital-signatures.certification.grade")}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {uncertifiedSignatures?.filter(
                (c: UncertifiedSignature) => c.recordType === "GRADE",
              ).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("digital-signatures.certification.pending_records")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("digital-signatures.certification.filters_and_search")}</CardTitle>
          <CardDescription>
            {t("digital-signatures.certification.search_records")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("digital-signatures.certification.record_type")}</label>
              <Select
                value={selectedRecordType}
                onValueChange={(value: string) =>
                  setSelectedRecordType(value as RecordType | "ALL")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t("digital-signatures.certification.all")}</SelectItem>
                  <SelectItem value="CLASS_CONTENT">{t("digital-signatures.certification.contents")}</SelectItem>
                  <SelectItem value="ATTENDANCE">{t("digital-signatures.certification.attendances")}</SelectItem>
                  <SelectItem value="GRADE">{t("digital-signatures.certification.grades")}</SelectItem>
                  <SelectItem value="OBSERVATION">{t("digital-signatures.certification.observations")}</SelectItem>
                  <SelectItem value="MEETING">{t("digital-signatures.certification.meetings")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("common.search", "Buscar")}</label>
              <Input
                placeholder={t("digital-signatures.certification.search_placeholder")}
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("digital-signatures.certification.course")}</label>
              <Select
                value={selectedCourseId || "ALL"}
                onValueChange={(value: string) =>
                  setSelectedCourseId(
                    value === "ALL" ? null : (value as Id<"courses">),
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t("digital-signatures.certification.all_courses")}</SelectItem>
                  {courses?.map((course: Doc<"courses">) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.name} - {course.grade} {course.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex items-end">
              <Button
                onClick={handleBulkCertify}
                disabled={selectedRecords.length === 0 || isCertifying}
                className="w-full"
              >
                {isCertifying
                  ? t("digital-signatures.certification.certifying")
                  : `${t("digital-signatures.certification.certify_selected")} (${selectedRecords.length})`}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Certifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("digital-signatures.certification.pending_certifications")}</CardTitle>
          <CardDescription>
            {t("digital-signatures.certification.pending_certifications_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uncertifiedSignatures === undefined ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-muted-foreground">
                {t("digital-signatures.certification.loading_certifications")}
              </div>
            </div>
          ) : filteredSignatures && filteredSignatures.length > 0 ? (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {t("digital-signatures.certification.select_records_alert")}
                </AlertDescription>
              </Alert>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedRecords.length === filteredSignatures.length
                        }
                        onCheckedChange={(checked: boolean) => {
                          if (checked) {
                            setSelectedRecords(
                              filteredSignatures.map(
                                (c: UncertifiedSignature) => c._id,
                              ),
                            );
                          } else {
                            setSelectedRecords([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>{t("digital-signatures.certification.type")}</TableHead>
                    <TableHead>{t("digital-signatures.certification.record_id")}</TableHead>
                    <TableHead>{t("digital-signatures.certification.signed_by")}</TableHead>
                    <TableHead>{t("digital-signatures.certification.date")}</TableHead>
                    <TableHead>{t("digital-signatures.certification.status")}</TableHead>
                    <TableHead className="text-right">{t("digital-signatures.certification.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSignatures.map((sig: UncertifiedSignature) => (
                    <TableRow key={sig._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRecords.includes(sig._id)}
                          onCheckedChange={(checked: boolean) =>
                            toggleRecordSelection(sig._id)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRecordTypeIcon(sig.recordType)}
                          <span className="font-medium">
                            {getRecordTypeLabel(sig.recordType)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {sig.recordId.substring(0, 16)}...
                      </TableCell>
                      <TableCell>
                        {sig.signer?.name || sig.signer?.email || t("digital-signatures.certification.unknown")}
                      </TableCell>
                      <TableCell>
                        {format(sig.createdAt, "dd/MM/yyyy HH:mm", {
                          locale: es,
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-yellow-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {t("digital-signatures.certification.pending")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleCertifySingle(
                              sig._id as Id<"digitalSignatures">,
                            )
                          }
                          disabled={isCertifying}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {t("digital-signatures.certification.certify")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{t("digital-signatures.certification.no_pending_records")}</p>
              <p className="text-sm">{t("digital-signatures.certification.all_records_certified")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
