export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white font-system">
      <h1 className="text-6xl font-bold m-0 drop-shadow-lg">
        404
      </h1>
      <h2 className="text-2xl my-4 text-center">
        Página no encontrada
      </h2>
      <p className="text-xl my-4 text-center opacity-90">
        La página que buscas no existe.
      </p>
      <a
        href="/"
        className="px-6 py-3 bg-white text-blue-500 no-underline rounded-lg font-bold shadow-lg hover:shadow-xl transition-shadow"
      >
        Volver al inicio
      </a>
    </div>
  );
}
