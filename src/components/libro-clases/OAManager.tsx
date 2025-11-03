"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BookOpen, Plus, Edit, Trash2, Eye } from "lucide-react";
import { SUBJECTS } from "@/lib/constants";

const oaSchema = z.object({
  code: z.string().min(1, "El código del OA es requerido"),
  subject: z.string().min(1, "La asignatura es requerida"),
  level: z.enum(["BASICA", "MEDIA"], {
    message: "Debe seleccionar un nivel",
  }),
  grade: z.string().min(1, "El grado es requerido"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  unit: z.string().optional(),
  semester: z.enum(["PRIMER_SEMESTRE", "SEGUNDO_SEMESTRE", "ANUAL"]),
});

const indicatorSchema = z.object({
  code: z.string().min(1, "El código del indicador es requerido"),
  description: z
    .string()
    .min(5, "La descripción debe tener al menos 5 caracteres"),
  evaluationCriteria: z.string().optional(),
  level: z.enum(["INICIAL", "BASICO", "INTERMEDIO", "AVANZADO"]),
});

type OAFormData = z.infer<typeof oaSchema>;
type IndicatorFormData = z.infer<typeof indicatorSchema>;

const GRADES = [
  "1ro",
  "2do",
  "3ro",
  "4to",
  "5to",
  "6to",
  "7mo",
  "8vo",
  "1ro Medio",
  "2do Medio",
  "3ro Medio",
  "4to Medio",
];

export function OAManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isIndicatorDialogOpen, setIsIndicatorDialogOpen] = useState(false);
  const [selectedOA, setSelectedOA] = useState<Id<"learningObjectives"> | null>(
    null,
  );
  const [editingOA, setEditingOA] = useState<any | null>(null);
  const [filterSubject, setFilterSubject] = useState<string | undefined>(
    undefined,
  );
  const [filterLevel, setFilterLevel] = useState<string | undefined>(undefined);
  const [filterGrade, setFilterGrade] = useState<string | undefined>(undefined);

  const createOA = useMutation(api.learningObjectives.createLearningObjective);
  const updateOA = useMutation(api.learningObjectives.updateLearningObjective);
  const createIndicator = useMutation(
    api.learningObjectives.createEvaluationIndicator,
  );
  const updateIndicator = useMutation(
    api.learningObjectives.updateEvaluationIndicator,
  );

  const learningObjectives = useQuery(
    api.learningObjectives.getLearningObjectives,
    {
      subject: filterSubject,
      level: filterLevel,
      grade: filterGrade,
      isActive: true,
    },
  );

  const oaForm = useForm<OAFormData>({
    resolver: zodResolver(oaSchema),
    defaultValues: {
      code: "",
      subject: "",
      level: "BASICA",
      grade: "",
      description: "",
      unit: "",
      semester: "ANUAL",
    },
  });

  const indicatorForm = useForm<IndicatorFormData>({
    resolver: zodResolver(indicatorSchema),
    defaultValues: {
      code: "",
      description: "",
      evaluationCriteria: "",
      level: "BASICO",
    },
  });

  const handleOpenDialog = (oa?: any) => {
    if (oa) {
      setEditingOA(oa);
      oaForm.reset({
        code: oa.code,
        subject: oa.subject,
        level: oa.level as "BASICA" | "MEDIA",
        grade: oa.grade,
        description: oa.description,
        unit: oa.unit || "",
        semester: oa.semester,
      });
    } else {
      setEditingOA(null);
      oaForm.reset({
        code: "",
        subject: "",
        level: "BASICA",
        grade: "",
        description: "",
        unit: "",
        semester: "ANUAL",
      });
    }
    setIsDialogOpen(true);
  };

  const handleOpenIndicatorDialog = (oaId: Id<"learningObjectives">) => {
    setSelectedOA(oaId);
    indicatorForm.reset({
      code: "",
      description: "",
      evaluationCriteria: "",
      level: "BASICO",
    });
    setIsIndicatorDialogOpen(true);
  };

  const onSubmitOA = async (data: OAFormData) => {
    try {
      if (editingOA) {
        await updateOA({
          objectiveId: editingOA._id,
          ...data,
        });
        toast.success("OA actualizado exitosamente");
      } else {
        await createOA(data);
        toast.success("OA creado exitosamente");
      }
      setIsDialogOpen(false);
      oaForm.reset();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el OA");
    }
  };

  const onSubmitIndicator = async (data: IndicatorFormData) => {
    if (!selectedOA) return;

    try {
      await createIndicator({
        learningObjectiveId: selectedOA,
        ...data,
      });
      toast.success("Indicador creado exitosamente");
      setIsIndicatorDialogOpen(false);
      indicatorForm.reset();
    } catch (error: any) {
      toast.error(error.message || "Error al crear el indicador");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Gestión de Objetivos de Aprendizaje (OA)
          </h2>
          <p className="text-muted-foreground mt-1">
            Administre los OA y sus indicadores de evaluación según Decreto 67
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo OA
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          value={filterSubject || "all"}
          onValueChange={(value) =>
            setFilterSubject(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por asignatura" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las asignaturas</SelectItem>
            {SUBJECTS.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterLevel || "all"}
          onValueChange={(value) =>
            setFilterLevel(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por nivel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los niveles</SelectItem>
            <SelectItem value="BASICA">Básica</SelectItem>
            <SelectItem value="MEDIA">Media</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filterGrade || "all"}
          onValueChange={(value) =>
            setFilterGrade(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por grado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los grados</SelectItem>
            {GRADES.map((grade) => (
              <SelectItem key={grade} value={grade}>
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* OA Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Asignatura</TableHead>
              <TableHead>Nivel</TableHead>
              <TableHead>Grado</TableHead>
              <TableHead>Semestre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Indicadores</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {learningObjectives === undefined ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : learningObjectives.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                >
                  No hay OA registrados. Cree uno nuevo para comenzar.
                </TableCell>
              </TableRow>
            ) : (
              learningObjectives.map((oa) => (
                <TableRow key={oa._id}>
                  <TableCell>
                    <Badge variant="outline">{oa.code}</Badge>
                  </TableCell>
                  <TableCell>{oa.subject}</TableCell>
                  <TableCell>{oa.level}</TableCell>
                  <TableCell>{oa.grade}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {oa.semester === "PRIMER_SEMESTRE"
                        ? "1er Semestre"
                        : oa.semester === "SEGUNDO_SEMESTRE"
                          ? "2do Semestre"
                          : "Anual"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {oa.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {oa.indicators?.length || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenIndicatorDialog(oa._id)}
                        title="Agregar indicador"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(oa)}
                        title="Editar OA"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* OA Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOA ? "Editar OA" : "Crear Nuevo OA"}
            </DialogTitle>
            <DialogDescription>
              Complete la información del Objetivo de Aprendizaje según el
              curriculum MINEDUC
            </DialogDescription>
          </DialogHeader>

          <Form {...oaForm}>
            <form
              onSubmit={oaForm.handleSubmit(onSubmitOA)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={oaForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código del OA</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: OA01, OA02..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={oaForm.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asignatura</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar asignatura" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SUBJECTS.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={oaForm.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nivel</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BASICA">Básica</SelectItem>
                          <SelectItem value="MEDIA">Media</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={oaForm.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grado</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar grado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GRADES.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={oaForm.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semestre</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PRIMER_SEMESTRE">
                            1er Semestre
                          </SelectItem>
                          <SelectItem value="SEGUNDO_SEMESTRE">
                            2do Semestre
                          </SelectItem>
                          <SelectItem value="ANUAL">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={oaForm.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Unidad 1, Unidad 2..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={oaForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción del OA</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción completa del objetivo de aprendizaje..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Descripción detallada del objetivo según curriculum
                      MINEDUC
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Indicator Dialog */}
      <Dialog
        open={isIndicatorDialogOpen}
        onOpenChange={setIsIndicatorDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agregar Indicador de Evaluación</DialogTitle>
            <DialogDescription>
              Cree un indicador de evaluación para el OA seleccionado
            </DialogDescription>
          </DialogHeader>

          <Form {...indicatorForm}>
            <form
              onSubmit={indicatorForm.handleSubmit(onSubmitIndicator)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={indicatorForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código del Indicador</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: IE01, IE02..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={indicatorForm.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nivel de Logro</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="INICIAL">Inicial</SelectItem>
                          <SelectItem value="BASICO">Básico</SelectItem>
                          <SelectItem value="INTERMEDIO">Intermedio</SelectItem>
                          <SelectItem value="AVANZADO">Avanzado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={indicatorForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción del Indicador</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción del indicador de evaluación..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={indicatorForm.control}
                name="evaluationCriteria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Criterios de Evaluación (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Criterios específicos para evaluar este indicador..."
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsIndicatorDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Crear Indicador</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
