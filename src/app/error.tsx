"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ef4444 0%, #a855f7 100%)",
      }}
    >
      <div
        style={{
          maxWidth: "28rem",
          padding: "2rem",
          textAlign: "center",
          color: "white",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
          }}
        >
          ¡Ups! Algo salió mal
        </h1>
        <p style={{ marginBottom: "2rem", opacity: 0.8 }}>
          {error?.message || "Ha ocurrido un error inesperado"}
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{
              padding: "0.75rem 1.5rem",
              background: "white",
              color: "#a855f7",
              borderRadius: "0.5rem",
              border: "none",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Intentar nuevamente
          </button>
          <a
            href="/"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              background: "rgba(255, 255, 255, 0.2)",
              color: "white",
              borderRadius: "0.5rem",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}
