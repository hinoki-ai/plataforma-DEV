"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import MinEducFooter from "@/components/layout/MinEducFooter";
import CompactFooter from "@/components/layout/CompactFooter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DocsLandingContentProps {
  htmlContent: string;
}

export function DocsLandingContent({ htmlContent }: DocsLandingContentProps) {
  return (
    <div className="min-h-screen bg-responsive-desktop bg-docs flex flex-col">
      <Header />
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center">
            <div className="backdrop-blur-md bg-white/5 dark:bg-black/30 rounded-2xl border border-white/10 dark:border-white/5 shadow-2xl p-6 mx-auto inline-block">
              <h1 className="text-center text-4xl md:text-5xl font-bold leading-tight text-gray-900 dark:text-white drop-shadow-2xl">
                Documentación Técnica
              </h1>
              <p className="text-center text-lg md:text-xl font-medium leading-relaxed text-gray-700 dark:text-gray-300 mt-3">
                Recursos, guías y especificaciones de Plataforma Astral
              </p>
            </div>
          </div>

          <Card className="backdrop-blur-xl bg-card/85 border border-border/80 rounded-2xl shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground text-lg font-semibold">
                Índice de documentación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <nav>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <span aria-hidden>←</span>
                  Volver al inicio
                </Link>
              </nav>
              <div
                className="prose prose-slate dark:prose-invert max-w-none text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </CardContent>
          </Card>

          <div className="backdrop-blur-xl bg-card/70 border border-border/70 rounded-2xl shadow-lg p-6 text-sm text-muted-foreground">
            Para una referencia completa, visita la carpeta
            <span className="mx-1 font-medium text-foreground">docs</span>
            del repositorio:
            <a
              href="https://github.com/hinoki-ai/plataforma-DEV/tree/main/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-primary hover:text-primary/80 underline"
            >
              Abrir en GitHub →
            </a>
          </div>
        </div>
      </main>
      <MinEducFooter />
      <CompactFooter />
    </div>
  );
}

export default DocsLandingContent;
