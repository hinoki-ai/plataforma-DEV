"use client";

import { useEffect, useState } from "react";

export default function UnauthorizedPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only throw error after component has mounted (client-side)
  if (isMounted) {
    const unauthorizedError = new Error(
      "Acceso restringido. Tu sesión terminó o no tienes permiso para entrar aquí. Vuelve a iniciar sesión si es necesario.",
    );
    unauthorizedError.name = "UnauthorizedError";
    throw unauthorizedError;
  }

  // Return loading state during SSR/build time
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Verificando permisos...
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Por favor espera mientras verificamos tu acceso.
        </p>
      </div>
    </div>
  );
}
