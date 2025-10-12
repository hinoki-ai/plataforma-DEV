export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        maxWidth: '28rem',
        padding: '2rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1rem' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Página no encontrada</h2>
        <p style={{ marginBottom: '2rem', opacity: 0.8 }}>
          Lo sentimos, la página que buscas no existe.
        </p>
        <a href="/" style={{
          display: 'inline-block',
          padding: '0.75rem 1.5rem',
          background: 'white',
          color: '#667eea',
          borderRadius: '0.5rem',
          textDecoration: 'none',
          fontWeight: '500'
        }}>
          Volver al inicio
        </a>
      </div>
    </div>
  );
}
