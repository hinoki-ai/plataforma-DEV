"use client";

import { Suspense } from "react";
import { AdminLibroClasesView } from "@/components/libro-clases/AdminLibroClasesView";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LoadingState } from "@/components/ui/loading-states";

export default function AdminLibroClasesPage() {
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
        <AdminLibroClasesView />
      </Suspense>
    </ErrorBoundary>
  );
}
