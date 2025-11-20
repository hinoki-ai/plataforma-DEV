/**
 * INSTITUTION MANAGEMENT - ENGLISH ONLY
 *
 * CRITICAL RULE: This component MUST remain English-only and hardcoded.
 * No translations, i18n hooks, or internationalization allowed.
 *
 * This is a strict requirement that cannot be broken for:
 * - Master dashboard consistency
 * - Technical admin interface standards
 * - Performance optimization
 * - Avoiding translation overhead for system administrators
 *
 * If you need to add text, hardcode it in English only.
 * DO NOT add useDivineParsing, useLanguage, or any translation hooks.
 */

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
import { enUS } from "date-fns/locale";
import { useRouter } from "next/navigation";

export function InstitutionManagement() {
  const institutions = useQuery(api.institutionInfo.getAllInstitutions);
  const router = useRouter();

  if (institutions === undefined) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="border-blue-200 dark:border-blue-800">
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                        {typeInfo?.name || inst.institutionType}
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
                        {inst.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(inst._creationTime, "PP", { locale: enUS })}
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
                          Users
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
                          Settings
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
                    No institutions found
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
