"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BookOpen, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OALinkedDisplayProps {
  classContentId: Id<"classContent">;
  compact?: boolean;
}

export function OALinkedDisplay({
  classContentId,
  compact = false,
}: OALinkedDisplayProps) {
  const linkedOA = useQuery(api.learningObjectives.getClassContentOA, {
    classContentId,
  });

  if (linkedOA === undefined) {
    return <div className="text-xs text-muted-foreground">Cargando OA...</div>;
  }

  if (!linkedOA || linkedOA.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic">
        No hay OA vinculados
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {linkedOA.map((link) => {
          if (!link.objective) return null;
          return (
            <Popover key={link._id}>
              <PopoverTrigger asChild>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-secondary text-xs"
                >
                  <BookOpen className="h-3 w-3 mr-1" />
                  {link.objective.code}
                </Badge>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">{link.objective.code}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {link.coverage === "COMPLETA"
                        ? "Cobertura completa"
                        : "Cobertura parcial"}
                    </span>
                  </div>
                  <p className="text-sm">{link.objective.description}</p>
                  {link.indicators && link.indicators.length > 0 && (
                    <div className="space-y-1 pt-2 border-t">
                      <p className="text-xs font-medium text-muted-foreground">
                        Indicadores evaluados:
                      </p>
                      <div className="space-y-1">
                        {link.indicators.map(
                          (ind: Doc<"evaluationIndicators">) => (
                            <div
                              key={ind._id}
                              className="flex items-start gap-2 text-xs"
                            >
                              <CheckCircle2 className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                              <div>
                                <span className="font-medium">{ind.code}:</span>{" "}
                                <span className="text-muted-foreground">
                                  {ind.description}
                                </span>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Objetivos de Aprendizaje Vinculados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {linkedOA.map((link) => {
          if (!link.objective) return null;
          return (
            <div
              key={link._id}
              className="p-3 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <Badge variant="default">{link.objective.code}</Badge>
                  <Badge
                    variant={
                      link.coverage === "COMPLETA" ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {link.coverage === "COMPLETA"
                      ? "Cobertura Completa"
                      : "Cobertura Parcial"}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {link.objective.description}
              </p>

              {link.objective.unit && (
                <p className="text-xs text-muted-foreground">
                  Unidad: {link.objective.unit}
                </p>
              )}

              {link.indicators && link.indicators.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-xs font-medium flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Indicadores de Evaluación:
                  </p>
                  <div className="space-y-1.5">
                    {link.indicators.map((ind: Doc<"evaluationIndicators">) => (
                      <div
                        key={ind._id}
                        className="flex items-start gap-2 p-2 bg-muted/50 rounded text-xs"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {ind.code}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-xs",
                                ind.level === "AVANZADO"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : ind.level === "INTERMEDIO"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                    : ind.level === "BASICO"
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
                              )}
                            >
                              {ind.level}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">
                            {ind.description}
                          </p>
                          {ind.evaluationCriteria && (
                            <p className="text-muted-foreground mt-1 italic">
                              Criterio: {ind.evaluationCriteria}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
