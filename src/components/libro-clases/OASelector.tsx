"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, type Doc } from "@/convex/_generated/dataModel";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, BookOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface OASelectorProps {
  courseId: Id<"courses">;
  subject?: string;
  value?: Id<"learningObjectives">[];
  onChange?: (selectedOAIds: Id<"learningObjectives">[]) => void;
  disabled?: boolean;
  multiSelect?: boolean;
}

interface SelectedOA {
  id: Id<"learningObjectives">;
  code: string;
  description: string;
  indicators: Doc<"evaluationIndicators">[];
}

export function OASelector({
  courseId,
  subject,
  value = [],
  onChange,
  disabled = false,
  multiSelect = true,
}: OASelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedOAs, setSelectedOAs] = useState<SelectedOA[]>([]);

  // Get course details to filter OA by level, grade
  const course = useQuery(
    api.courses.getCourseById,
    courseId ? { courseId } : "skip",
  );

  // Get learning objectives filtered by course level, grade, and subject
  const learningObjectives = useQuery(
    api.learningObjectives.getLearningObjectives,
    course
      ? {
          subject: subject || undefined,
          level: course.level,
          grade: course.grade,
          isActive: true,
        }
      : "skip",
  );

  // Load selected OA details when value changes
  useEffect(() => {
    if (value.length === 0) {
      setSelectedOAs([]);
      return;
    }

    if (!learningObjectives) return;

    const selected = value.reduce<SelectedOA[]>((acc, id) => {
      const obj = learningObjectives.find((o) => o._id === id);
      if (!obj) {
        return acc;
      }

      acc.push({
        id: obj._id,
        code: obj.code,
        description: obj.description,
        indicators: obj.indicators ?? [],
      });
      return acc;
    }, []);

    setSelectedOAs(selected);
  }, [value, learningObjectives]);

  const handleSelect = (oaId: Id<"learningObjectives">) => {
    if (!onChange) return;

    if (multiSelect) {
      const isSelected = value.includes(oaId);
      const newValue = isSelected
        ? value.filter((id) => id !== oaId)
        : [...value, oaId];
      onChange(newValue);
    } else {
      onChange([oaId]);
      setOpen(false);
    }
  };

  const handleRemove = (
    oaId: Id<"learningObjectives">,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (!onChange) return;
    onChange(value.filter((id) => id !== oaId));
  };

  if (!course || learningObjectives === undefined) {
    return (
      <div className="text-sm text-muted-foreground">
        Cargando objetivos de aprendizaje...
      </div>
    );
  }

  if (!learningObjectives || learningObjectives.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No hay objetivos de aprendizaje disponibles para esta asignatura, nivel
        y curso. Contacte al administrador para configurar los OA.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Selected OA Chips */}
      {selectedOAs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedOAs.map((oa) => (
            <Badge
              key={oa.id}
              variant="secondary"
              className="gap-1 pr-1 py-1.5"
            >
              <BookOpen className="h-3 w-3" />
              <span className="font-medium">{oa.code}</span>
              <span className="max-w-xs truncate text-xs">
                {oa.description.substring(0, 40)}...
              </span>
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => handleRemove(oa.id, e)}
                  className="ml-1 rounded-full hover:bg-secondary-foreground/20 p-0.5"
                  aria-label={`Eliminar ${oa.code}`}
                  title={`Eliminar ${oa.code}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* OA Selector Popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between"
          >
            <span className="text-muted-foreground">
              {selectedOAs.length > 0
                ? `${selectedOAs.length} OA seleccionado${
                    selectedOAs.length > 1 ? "s" : ""
                  }`
                : "Seleccionar Objetivos de Aprendizaje"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar OA por código o descripción..." />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>
                No se encontraron objetivos de aprendizaje.
              </CommandEmpty>
              <CommandGroup>
                {learningObjectives.map((oa) => {
                  const isSelected = value.includes(oa._id);
                  return (
                    <CommandItem
                      key={oa._id}
                      value={`${oa.code} ${oa.description}`}
                      onSelect={() => handleSelect(oa._id)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {oa.code}
                          </Badge>
                          {oa.unit && (
                            <span className="text-xs text-muted-foreground">
                              Unidad: {oa.unit}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {oa.semester === "PRIMER_SEMESTRE"
                              ? "1er Semestre"
                              : oa.semester === "SEGUNDO_SEMESTRE"
                                ? "2do Semestre"
                                : "Anual"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {oa.description}
                        </p>
                        {oa.indicators && oa.indicators.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {oa.indicators
                              .slice(0, 3)
                              .map((ind: Doc<"evaluationIndicators">) => (
                                <Badge
                                  key={ind._id}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {ind.code}
                                </Badge>
                              ))}
                            {oa.indicators.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{oa.indicators.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        Seleccione los Objetivos de Aprendizaje (OA) que fueron abordados en
        esta clase. Esto permite el seguimiento automático de la cobertura
        curricular según Decreto 67.
      </p>
    </div>
  );
}
