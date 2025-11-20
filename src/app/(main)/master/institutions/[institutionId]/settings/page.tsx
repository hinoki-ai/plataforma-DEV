"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Building2 } from "lucide-react";
import { useParams } from "next/navigation";
import { MasterPageTemplate } from "@/components/master/MasterPageTemplate";
import { Badge } from "@/components/ui/badge";

export default function InstitutionSettingsPage() {
  const params = useParams();
  const institutionId = params.institutionId as Id<"institutionInfo">;

  const institution = useQuery(api.institutionInfo.getInstitutionById, {
    institutionId,
  });

  if (institution === undefined) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (institution === null) {
    return <div>Institución no encontrada</div>;
  }

  return (
    <MasterPageTemplate
      title={`Configuración - ${institution.name}`}
      subtitle=""
      context="MASTER_INSTITUTION_SETTINGS"
    >
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Información Institucional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Nombre
              </div>
              <div>{institution.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Tipo
              </div>
              <Badge variant="outline">{institution.institutionType}</Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Email
              </div>
              <div>{institution.email}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Teléfono
              </div>
              <div>{institution.phone}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Dirección
              </div>
              <div>{institution.address}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Website
              </div>
              <a
                href={institution.website}
                target="_blank"
                className="text-blue-500 hover:underline"
              >
                {institution.website}
              </a>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Niveles Soportados
            </div>
            <div className="flex flex-wrap gap-2">
              {institution.supportedLevels &&
              Array.isArray(institution.supportedLevels) ? (
                institution.supportedLevels.map((level: string) => (
                  <Badge key={level} variant="secondary">
                    {level}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  No configurado
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </MasterPageTemplate>
  );
}

