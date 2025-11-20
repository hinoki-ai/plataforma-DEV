/**
 * INSTITUTION USERS MANAGEMENT - ENGLISH ONLY
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
import { Id } from "@/convex/_generated/dataModel";
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
import {
  Loader2,
  Users,
  Shield,
  User,
  GraduationCap,
  Baby,
} from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { useParams } from "next/navigation";

const ROLE_ICONS: Record<string, React.ReactNode> = {
  MASTER: <Shield className="h-4 w-4 text-red-500" />,
  ADMIN: <Shield className="h-4 w-4 text-blue-500" />,
  PROFESOR: <GraduationCap className="h-4 w-4 text-green-500" />,
  PARENT: <Baby className="h-4 w-4 text-purple-500" />,
  PUBLIC: <User className="h-4 w-4 text-gray-500" />,
};

const ROLE_LABELS: Record<string, string> = {
  MASTER: "Master",
  ADMIN: "Administrator",
  PROFESOR: "Teacher",
  PARENT: "Parent",
  PUBLIC: "Public",
};

export function InstitutionUsersManagement() {
  const params = useParams();
  const institutionId = params.institutionId as Id<"institutionInfo">;

  const users = useQuery(api.institutionInfo.getInstitutionUsers, {
    institutionId,
  });

  const institution = useQuery(api.institutionInfo.getInstitutionById, {
    institutionId,
  });

  if (users === undefined || institution === undefined) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  if (institution === null) {
    return <div>Institución no encontrada</div>;
  }

  return (
    <Card className="border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Institution Users - {institution.name}
        </CardTitle>
        <CardDescription>
          Manage users and their roles for {institution.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role in Institution</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Membership Status</TableHead>
                <TableHead>Registered Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {user.name || "Sin nombre"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {ROLE_ICONS[user.role as string] || (
                        <User className="h-4 w-4" />
                      )}
                      <Badge variant="outline">
                        {ROLE_LABELS[user.role as string] || "Public"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "ACTIVE" ? "default" : "secondary"
                      }
                      className={
                        user.status === "ACTIVE"
                          ? "bg-green-500 hover:bg-green-600"
                          : ""
                      }
                    >
                      {user.status === "ACTIVE" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(user._creationTime, "PP", { locale: enUS })}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No users found
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
