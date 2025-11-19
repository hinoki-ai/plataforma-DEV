export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{
        fontSize: '6rem',
        fontWeight: 'bold',
        margin: '0',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
      }}>
        404
      </h1>
      <h2 style={{
        fontSize: '2rem',
        margin: '1rem 0',
        textAlign: 'center'
      }}>
        Página no encontrada
      </h2>
      <p style={{
        fontSize: '1.2rem',
        margin: '1rem 0 2rem 0',
        textAlign: 'center',
        opacity: 0.9
      }}>
        La página que buscas no existe.
      </p>
      <a
        href="/"
        style={{
          padding: '12px 24px',
          backgroundColor: 'white',
          color: '#667eea',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          transition: 'transform 0.2s',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        Volver al inicio
      </a>
    </div>
  );
}
