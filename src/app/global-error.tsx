"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es-CL">
      <body style={{
        margin: 0,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'linear-gradient(135deg, #ef4444 0%, #a855f7 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          maxWidth: '28rem',
          padding: '2rem',
          textAlign: 'center',
          color: 'white'
        }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Error Global</h1>
          <p style={{ marginBottom: '2rem', opacity: 0.8 }}>
            {error?.message || "Ha ocurrido un error crítico"}
          </p>
          <button
            onClick={reset}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'white',
              color: '#a855f7',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Intentar nuevamente
          </button>
        </div>
      </body>
    </html>
  );
}
