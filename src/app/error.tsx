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
      <div
        style={{
          maxWidth: "28rem",
          padding: "2rem",
          textAlign: "center",
          color: "#ff4444",
          background: "rgba(11, 11, 11, 0.85)",
          borderRadius: "1rem",
          backdropFilter: "blur(8px)",
          boxShadow: "0 0 40px rgba(255, 68, 68, 0.2)",
          border: "1px solid rgba(255, 68, 68, 0.3)",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            textShadow: "0 0 20px rgba(255, 68, 68, 0.5)",
          }}
        >
          ¡Ups! Algo salió mal
        </h1>
        <p
          style={{
            marginBottom: "2rem",
            opacity: 0.8,
            color: "#ffaaaa",
            wordBreak: "break-word",
          }}
        >
          {error?.message || "Ha ocurrido un error inesperado"}
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#ff4444",
              color: "#0b0b0b",
              borderRadius: "0.5rem",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              boxShadow: "0 0 20px rgba(255, 68, 68, 0.3)",
              transition: "all 0.3s ease",
            }}
          >
            Intentar nuevamente
          </button>
          <a
            href="/"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              background: "rgba(255, 68, 68, 0.2)",
              color: "#ff4444",
              borderRadius: "0.5rem",
              textDecoration: "none",
              fontWeight: "600",
              border: "1px solid rgba(255, 68, 68, 0.3)",
              transition: "all 0.3s ease",
            }}
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </DonutBackground>
  );
}
