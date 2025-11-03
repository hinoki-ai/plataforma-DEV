"use client";

import { OAManager } from "@/components/libro-clases/OAManager";
import { PageTransition } from "@/components/ui/page-transition";
import { BookOpen } from "lucide-react";

export default function AdminObjetivosAprendizajePage() {
  return (
    <PageTransition skeletonType="page" duration={700}>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Objetivos de Aprendizaje</h1>
            <p className="text-muted-foreground">
              Gestión de OA e Indicadores de Evaluación según Decreto 67
            </p>
          </div>
        </div>

        {/* OA Manager Component */}
        <OAManager />
      </div>
    </PageTransition>
  );
}

