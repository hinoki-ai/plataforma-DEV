"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import MinEducFooter from "@/components/layout/MinEducFooter";
import CompactFooter from "@/components/layout/CompactFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDivineParsing } from "@/components/language/useDivineLanguage";

interface DocsLandingContentProps {
  htmlContent: string;
}

export function DocsLandingContent({ htmlContent }: DocsLandingContentProps) {
  const { t } = useDivineParsing(["common"]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 bg-docs flex flex-col">
      <Header />
      <main className="container mx-auto px-4 pt-8 pb-12 flex-1">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Hero Section with Enhanced Visual Appeal */}
          <div className="text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-3xl -z-10"></div>
            <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-2xl p-8 mx-auto inline-block transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📚</span>
                </div>
              </div>
              <h1 className="text-center text-4xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                {t("docs.title", "common")}
              </h1>
              <p className="text-center text-lg md:text-xl font-medium leading-relaxed text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                {t("docs.subtitle", "common")}
              </p>
              <div className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-500 dark:text-slate-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>
                  {t("docs.content.last_updated", "common")}: October 13, 2025
                </span>
              </div>
            </div>
          </div>

          {/* Main Content Card with Enhanced Design */}
          <div className="max-w-4xl mx-auto">
            {/* Main Content */}
            <div>
              <Card className="backdrop-blur-xl bg-white/90 dark:bg-slate-800/90 border border-white/30 dark:border-slate-700/50 rounded-2xl shadow-2xl">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <span className="text-3xl">📖</span>
                    {t("docs.index.title", "common")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Header Section */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                      Índice de documentación
                    </h2>
                    <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">
                      Documentación Técnica
                    </h3>
                    <h4 className="text-base font-medium text-slate-600 dark:text-slate-400">
                      Sistema de Gestión Educativa Plataforma Astral
                    </h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <span>Última actualización: October 13, 2025</span>
                      <span className="hidden sm:block">•</span>
                      <span>
                        Estado: Listo para producción con integración completa
                        de Convex ✅
                      </span>
                    </div>
                  </div>

                  <hr className="border-slate-200 dark:border-slate-700" />

                  {/* Documentation Index */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="text-2xl">📚</span>
                      Índice de Documentación
                    </h3>

                    {/* Main Systems */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                        Sistemas Principales
                      </h4>
                      <div className="space-y-2 pl-4">
                        <div className="text-slate-600 dark:text-slate-400">
                          <Link
                            href="/docs/AI_KNOWLEDGE_BASE"
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            Base de Conocimiento IA
                          </Link>
                          <span className="block text-sm text-slate-500 dark:text-slate-500 mt-1">
                            Arquitectura y diseño completo del sistema (includes
                            authentication) - PRINCIPAL
                          </span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">
                          <Link
                            href="/docs/ANIMATION_GUIDE"
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            Guía de Animación
                          </Link>
                          <span className="block text-sm text-slate-500 dark:text-slate-500 mt-1">
                            Componentes UI y patrones de experiencia de usuario
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Specialized Features */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                        Características Especializadas
                      </h4>
                      <div className="space-y-2 pl-4">
                        <div className="text-slate-600 dark:text-slate-400">
                          <Link
                            href="/docs/VOTING_SYSTEM"
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            Sistema de Votación
                          </Link>
                          <span className="block text-sm text-slate-500 dark:text-slate-500 mt-1">
                            Herramientas de toma de decisiones democráticas
                          </span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">
                          <Link
                            href="/docs/ROLE_SYSTEM"
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            Sistema de Roles
                          </Link>
                          <span className="block text-sm text-slate-500 dark:text-slate-500 mt-1">
                            Permisos de usuario y control de acceso
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Operations and Troubleshooting */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                        Operaciones y Solución de Problemas
                      </h4>
                      <div className="space-y-2 pl-4">
                        <div className="text-slate-600 dark:text-slate-400">
                          <Link
                            href="/docs/ENVIRONMENT"
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            Configuración del Entorno
                          </Link>
                          <span className="block text-sm text-slate-500 dark:text-slate-500 mt-1">
                            Configuraciones de desarrollo y despliegue
                          </span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">
                          <Link
                            href="/docs/AI_KNOWLEDGE_BASE#troubleshooting"
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            Solución de Problemas
                          </Link>
                          <span className="block text-sm text-slate-500 dark:text-slate-500 mt-1">
                            Problemas comunes y soluciones (see troubleshooting
                            sections)
                          </span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">
                          <Link
                            href="/docs/EMERGENCY_ACCESS_PROCEDURES"
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            Procedimientos de Emergencia
                          </Link>
                          <span className="block text-sm text-slate-500 dark:text-slate-500 mt-1">
                            Recuperación crítica del sistema
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-200 dark:border-slate-700" />

                  {/* Quick Start */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="text-2xl">🚀</span>
                      Inicio Rápido
                    </h3>
                    <div className="space-y-2 font-mono text-sm bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border">
                      <div className="text-slate-700 dark:text-slate-300">
                        <span className="text-slate-600 dark:text-slate-400">
                          Desarrollo:
                        </span>{" "}
                        npm run dev
                        <span className="text-slate-500 dark:text-slate-500 ml-2">
                          - Iniciar servidor de desarrollo local
                        </span>
                      </div>
                      <div className="text-slate-700 dark:text-slate-300">
                        <span className="text-slate-600 dark:text-slate-400">
                          Compilación:
                        </span>{" "}
                        npm run build
                        <span className="text-slate-500 dark:text-slate-500 ml-2">
                          - Crear compilación de producción
                        </span>
                      </div>
                      <div className="text-slate-700 dark:text-slate-300">
                        <span className="text-slate-600 dark:text-slate-400">
                          Despliegue:
                        </span>{" "}
                        npm run deploy
                        <span className="text-slate-500 dark:text-slate-500 ml-2">
                          - Despliegue automatizado completo
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Main Features */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="text-2xl">📖</span>
                      Características Principales
                    </h3>
                    <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>
                          <strong className="text-slate-700 dark:text-slate-300">
                            Autenticación Multi-rol
                          </strong>{" "}
                          - Roles de Administrador, Profesor, Apoderado y Master
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>
                          <strong className="text-slate-700 dark:text-slate-300">
                            Colaboración en Tiempo Real
                          </strong>{" "}
                          - Actualizaciones en vivo con backend Convex
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>
                          <strong className="text-slate-700 dark:text-slate-300">
                            Diseño Responsivo
                          </strong>{" "}
                          - Plataforma educativa mobile-first
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>
                          <strong className="text-slate-700 dark:text-slate-300">
                            APIs Completas
                          </strong>{" "}
                          - Endpoints REST y GraphQL
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>
                          <strong className="text-slate-700 dark:text-slate-300">
                            Seguridad Avanzada
                          </strong>{" "}
                          - Control de acceso basado en roles y cifrado
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Tech Stack */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="text-2xl">🔧</span>
                      Stack Tecnológico
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                          Frontend
                        </h4>
                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                          <li>• Next.js 16, React 19, TypeScript</li>
                          <li>• Tailwind CSS</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                          Backend
                        </h4>
                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                          <li>
                            • Convex (base de datos y funciones en tiempo real)
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                          Autenticación
                        </h4>
                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                          <li>• Clerk (OAuth + flujos personalizados)</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                          Despliegue
                        </h4>
                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                          <li>• Vercel (frontend)</li>
                          <li>• Convex Cloud (backend)</li>
                        </ul>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                          Monitoreo
                        </h4>
                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                          <li>
                            • Analíticas personalizadas y seguimiento de errores
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Footer Note */}
                  <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      Para información detallada, consulta los archivos de
                      documentación específicos vinculados arriba.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Enhanced Footer Section */}
          <div className="backdrop-blur-xl bg-gradient-to-r from-slate-50/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-700/90 border border-white/30 dark:border-slate-600/30 rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">📂</span>
                </div>
                <div className="text-sm">
                  <p className="text-slate-600 dark:text-slate-300 font-medium">
                    {t("docs.github.message", "common")}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    <span className="font-mono bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-xs">
                      docs
                    </span>
                    {t("docs.github.repository", "common")}
                  </p>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-300 dark:bg-slate-600 hidden sm:block"></div>
              <a
                href="https://github.com/hinoki-ai/plataforma-DEV/tree/main/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span>🔗</span>
                {t("docs.github.link", "common")}
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </main>
      <MinEducFooter />
      <CompactFooter />
    </div>
  );
}

export default DocsLandingContent;
