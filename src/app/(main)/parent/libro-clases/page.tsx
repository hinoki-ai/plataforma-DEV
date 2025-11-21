"use client";

import { Suspense } from "react";
import { ParentLibroClasesView } from "@/components/libro-clases/ParentLibroClasesView";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LoadingState } from "@/components/ui/loading-states";

export default function ParentLibroClasesPage() {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Error en Libro de Clases</h2>
          <p className="text-muted-foreground">
            Ha ocurrido un error al cargar el libro de clases. Inténtalo de nuevo.
          </p>
        </div>
      }
    >
      <Suspense fallback={<LoadingState />}>
        <ParentLibroClasesView view="overview" />
      </Suspense>
    </ErrorBoundary>
  );
}
