"use client";

import { DonutBackground } from "@/components/ui/donut-background";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <DonutBackground>
      <div className="w-full max-w-sm mx-auto rounded-3xl border border-red-500/25 bg-black/82 px-6 py-8 text-center text-red-500 shadow-[0_0_32px_rgba(255,68,68,0.2)] backdrop-blur-md sm:max-w-md sm:px-8 sm:py-10">
        <h1 className="text-3xl font-bold mb-4 text-red-400 drop-shadow-[0_0_16px_rgba(255,68,68,0.42)] sm:text-4xl">
          ¡Ups! Algo salió mal
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-red-300/90 sm:text-base break-words">
          {error?.message || "Ha ocurrido un error inesperado"}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <button
            onClick={reset}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-transparent bg-red-500 px-5 text-sm font-semibold text-black shadow-[0_0_18px_rgba(255,68,68,0.3)] transition-transform duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:h-11"
          >
            Intentar nuevamente
          </button>
          <a
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-red-500/35 bg-red-500/10 px-5 text-sm font-semibold text-red-400 backdrop-blur transition-transform duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:h-11"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </DonutBackground>
  );
}
