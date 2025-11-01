"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import MinEducFooter from "@/components/layout/MinEducFooter";
import CompactFooter from "@/components/layout/CompactFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DocsArticleContentProps {
  htmlContent: string;
  fileName: string;
  githubUrl: string;
}

export function DocsArticleContent({
  htmlContent,
  fileName,
  githubUrl,
}: DocsArticleContentProps) {
  return (
    <div className="min-h-screen bg-responsive-desktop bg-docs flex flex-col">
      <Header />
      <main className="container mx-auto px-4 pt-8 pb-12 flex-1">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center">
            <div className="backdrop-blur-md bg-white/5 dark:bg-black/30 rounded-2xl border border-white/10 dark:border-white/5 shadow-2xl p-6 mx-auto inline-block">
              <h1 className="text-center text-3xl md:text-4xl font-bold leading-tight text-gray-900 dark:text-white drop-shadow-2xl">
                {fileName}
              </h1>
              <p className="text-center text-base md:text-lg font-medium leading-relaxed text-gray-700 dark:text-gray-300 mt-3">
                Especificación técnica desde la carpeta docs del proyecto
              </p>
            </div>
          </div>

          <Card className="backdrop-blur-xl bg-card/85 border border-border/80 rounded-2xl shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground text-lg font-semibold">
                Contenido del documento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <nav>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <span aria-hidden>←</span>
                  Volver al índice
                </Link>
              </nav>
              <div
                className="prose prose-slate dark:prose-invert max-w-none text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </CardContent>
          </Card>

          <div className="backdrop-blur-xl bg-card/70 border border-border/70 rounded-2xl shadow-lg p-6 text-sm text-muted-foreground">
            <p>
              Archivo:{" "}
              <code className="bg-muted px-2 py-1 rounded">{fileName}</code>
            </p>
            <p className="mt-2">
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 underline"
              >
                Ver en GitHub →
              </a>
            </p>
          </div>
        </div>
      </main>
      <MinEducFooter />
      <CompactFooter />
    </div>
  );
}

export default DocsArticleContent;
