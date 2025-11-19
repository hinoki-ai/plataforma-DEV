"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { INSTITUTION_TYPE_INFO } from "@/lib/educational-system";
import { Building2, Users, Settings, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

export function InstitutionManagement() {
  const institutions = useQuery(api.institutionInfo.getAllInstitutions);
  const router = useRouter();
  const { t } = useDivineParsing(["common"]);
  const tc = (key: string) => t(key, "common");

  if (institutions === undefined) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          {tc("institution_management.title")}
        </CardTitle>
        <CardDescription>
          {tc("institution_management.subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tc("institution_management.table.name")}</TableHead>
                <TableHead>{tc("institution_management.table.type")}</TableHead>
                <TableHead>
                  {tc("institution_management.table.contact")}
                </TableHead>
                <TableHead>
                  {tc("institution_management.table.status")}
                </TableHead>
                <TableHead>
                  {tc("institution_management.table.created")}
                </TableHead>
                <TableHead className="text-right">
                  {tc("institution_management.table.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {institutions.map((inst) => {
                const typeInfo =
                  INSTITUTION_TYPE_INFO[
                    inst.institutionType as keyof typeof INSTITUTION_TYPE_INFO
                  ];

                return (
                  <TableRow key={inst._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {typeInfo?.icon}
                        {inst.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={typeInfo?.color}>
                        {typeInfo?.chileanName || inst.institutionType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{inst.email}</div>
                        <div className="text-muted-foreground text-xs">
                          {inst.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={inst.isActive ? "default" : "destructive"}
                        className={
                          inst.isActive ? "bg-green-500 hover:bg-green-600" : ""
                        }
                      >
                        {inst.isActive
                          ? tc("institution_management.status.active")
                          : tc("institution_management.status.inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(inst._creationTime, "PP", { locale: es })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/master/institutions/${inst._id}/users`,
                            )
                          }
                        >
                          <Users className="h-4 w-4 mr-1" />
                          {tc("institution_management.buttons.users")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/master/institutions/${inst._id}/settings`,
                            )
                          }
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          {tc("institution_management.buttons.settings")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {institutions.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {tc("institution_management.empty")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
