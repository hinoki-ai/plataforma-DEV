"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OALinkedDisplay } from "./OALinkedDisplay";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BookOpen, Calendar, FileText, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClassContentForm } from "./ClassContentForm";

interface ClassContentListProps {
  courseId: Id<"courses">;
  teacherId: Id<"users">;
}

export function ClassContentList({
  courseId,
  teacherId,
}: ClassContentListProps) {
  const [selectedContent, setSelectedContent] = useState<any | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Get course content
  const classContent = useQuery(api.classContent.getCourseContent, {
    courseId,
  });

  if (classContent === undefined) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-pulse text-muted-foreground">
          Cargando contenidos...
        </div>
      </div>
    );
  }

  if (!classContent || classContent.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No hay contenidos registrados
          </h3>
          <p className="text-muted-foreground">
            Comience registrando contenido de clase usando el formulario arriba
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleEdit = (content: any) => {
    setSelectedContent(content);
    setIsEditDialogOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditDialogOpen(false);
    setSelectedContent(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">
            Contenidos Registrados ({classContent.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Lista de todos los contenidos de clase registrados
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {classContent.map((content) => (
          <Card key={content._id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">
                      {format(new Date(content.date), "PPP", { locale: es })}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">{content.subject}</Badge>
                    {content.period && (
                      <Badge variant="outline" className="text-xs">
                        {content.period}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(content)}
                  title="Editar contenido"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Topic */}
              <div>
                <p className="text-sm font-medium mb-1">Tema:</p>
                <p className="text-sm text-muted-foreground">{content.topic}</p>
              </div>

              {/* OA Linked Display */}
              <div>
                <p className="text-sm font-medium mb-2">Objetivos de Aprendizaje:</p>
                <OALinkedDisplay
                  classContentId={content._id}
                  compact={true}
                />
              </div>

              {/* Content Preview */}
              <div>
                <p className="text-sm font-medium mb-1">Contenido:</p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {content.content}
                </p>
              </div>

              {/* Activities, Resources, Homework - if present */}
              {(content.activities || content.resources || content.homework) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t">
                  {content.activities && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Actividades:
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {content.activities}
                      </p>
                    </div>
                  )}
                  {content.resources && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Recursos:
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {content.resources}
                      </p>
                    </div>
                  )}
                  {content.homework && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Tarea:
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {content.homework}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Contenido de Clase</DialogTitle>
            <DialogDescription>
              Modifique el contenido y los OA vinculados
            </DialogDescription>
          </DialogHeader>
          {selectedContent && (
            <ClassContentForm
              courseId={courseId}
              teacherId={teacherId}
              initialData={{
                _id: selectedContent._id,
                date: selectedContent.date,
                subject: selectedContent.subject,
                topic: selectedContent.topic,
                objectives: selectedContent.objectives,
                content: selectedContent.content,
                activities: selectedContent.activities,
                resources: selectedContent.resources,
                homework: selectedContent.homework,
                period: selectedContent.period,
              }}
              onSuccess={() => {
                handleCloseEdit();
              }}
              onCancel={handleCloseEdit}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

