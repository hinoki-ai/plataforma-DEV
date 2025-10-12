# Plataforma Astral - SaaS Platform for Educational Management

A comprehensive SaaS platform for teacher, admin, and parent control with extensive features, built with Next.js 15 and Convex (real-time serverless backend), designed for educational institutions.

## 📋 Índice de Documentación

- [📖 Descripción General](#-descripción-general)
- [🚀 Guía de Inicio Rápido](#-guía-de-inicio-rápido)
- [🏗️ Arquitectura](#️-arquitectura)
- [🔐 Modelo de Seguridad](#-modelo-de-seguridad)
- [📊 Base de Datos](#-base-de-datos)
- [🧪 Testing](#-testing)
- [🚢 Despliegue](#-despliegue)
- [📚 Documentación Completa](#-documentación-completa)

## 📖 Descripción General

**Plataforma Astral** is a comprehensive SaaS platform that manages:

- 📚 Planificación docente
- 📅 Reuniones apoderados-profesores
- 📊 Calendario escolar
- 👥 Gestión de usuarios por roles
- 🗳️ Sistema de votación Centro Consejo
- 📁 Recursos multimedia (fotos/videos)

## 🚀 Guía de Inicio Rápido

### Requisitos Previos

- Node.js 18+
- npm o yarn
- Cuenta Convex (gratis en convex.dev)

### Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Inicializar Convex
npx convex dev
# Sigue las instrucciones en el navegador para crear/seleccionar proyecto

# 3. Configurar variables de entorno
cp .env.example .env
# Añade NEXT_PUBLIC_CONVEX_URL del paso 2 a .env

# 4. Iniciar desarrollo
# Terminal 1: mantén Convex corriendo
npx convex dev

# Terminal 2: inicia Next.js
npm run dev
```

### Cuentas de Prueba

| Rol         | Email                            | Contraseña  |
| ----------- | -------------------------------- | ----------- |
| **Admin**   | <admin@plataforma-astral.com>    | admin123    |
| **Teacher** | <profesor@plataforma-astral.com> | profesor123 |
| **Parent**  | <parent@plataforma-astral.com>   | parent123   |

## 🏗️ Arquitectura

### Stack Tecnológico

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Build System**: Turbopack (optimizado para máxima velocidad)
- **Backend**: Convex (Serverless con actualizaciones en tiempo real)
- **Base de Datos**: Convex (TypeScript type-safe database)
- **Autenticación**: NextAuth.js v5
- **Estilos**: Tailwind CSS + shadcn/ui
- **Testing**: Vitest + Playwright + Lighthouse CI

### ⚡ Build System Optimization

**Turbopack-Only Setup**: El proyecto utiliza exclusivamente Turbopack para desarrollo y producción, eliminando cualquier dependencia de webpack. Esto proporciona:

- 🚀 **Compilación 53% más rápida** en producción
- ⚡ **Hot reload instantáneo** en desarrollo
- 📦 **Bundles optimizados** automáticamente
- 🎯 **Resolución de módulos inteligente** con aliases configurados

### Estructura de Carpetas

```text
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Rutas de autenticación
│   ├── (main)/                   # Rutas protegidas por rol
│   │   ├── admin/               # Solo ADMIN
│   │   ├── profesor/            # Solo PROFESOR
│   │   └── parent/              # Solo PARENT
│   ├── api/                     # Endpoints REST
│   └── centro-consejo/          # Solo OAuth (Centro Consejo)
├── services/
│   ├── actions/                 # Server Actions (CUD)
│   └── queries/                 # Consultas (Read)
├── lib/                         # Utilidades
└── components/                  # Componentes UI
```

## 🔐 Modelo de Seguridad

### Roles y Permisos

```typescript
enum UserRole {
  ADMIN      // Acceso completo al sistema
  PROFESOR   // Gestión de planificación y reuniones
  PARENT     // Acceso a información y solicitud de reuniones
  PUBLIC     // Acceso público limitado
}
```

### Características de Seguridad

- ✅ Autenticación por credenciales (profesores/admins)
- ✅ OAuth para Centro Consejo (Google/Facebook)
- ✅ Aislamiento completo entre roles
- ✅ Protección CSRF en todas las mutaciones
- ✅ Validación de entrada con Zod
- ✅ Limitación de tasa (rate limiting)

## 📊 Base de Datos

### Entidades Principales

- **User**: Usuarios del sistema
- **PlanningDocument**: Documentos de planificación
- **Meeting**: Reuniones apoderados-profesores
- **CalendarEvent**: Eventos del calendario escolar
- **TeamMember**: Equipo multidisciplinario
- **CentroConsejoMember**: Miembros del Centro Consejo

### Comandos de Convex

```bash
# Iniciar servidor de desarrollo Convex
npx convex dev

# Abrir dashboard de Convex
npx convex dashboard

# Desplegar a producción
npx convex deploy

# Ver datos en tiempo real
npx convex dashboard
```

## 🧪 Testing

### Tipos de Pruebas

- **Unit Tests**: Lógica de negocio con Vitest
- **E2E Tests**: Flujos de usuario con Playwright
- **Accesibilidad**: axe-core integration
- **Performance**: Lighthouse CI

### Comandos de Testing

```bash
# Todos los tests
npm run test:all

# Tests unitarios
npm run test:unit

# Tests E2E
npm run test:e2e

# Tests de accesibilidad
npm run test:a11y
```

## 🚢 Despliegue

### Desarrollo

```bash
npm run dev          # Servidor de desarrollo
npm run db:studio    # Interfaz de base de datos
```

### Producción

```bash
npm run build        # Construir para producción
npm run start        # Servidor de producción
```

## 🚀 Simple Deployment Strategy

This project uses **industry-standard single-branch deployment**:

### Environment Matrix

| Environment     | Location      | URL                      | Purpose               |
| --------------- | ------------- | ------------------------ | --------------------- |
| **Development** | Local Machine | `localhost:3000`         | Local development     |
| **Production**  | Vercel        | `plataforma.aramac.dev`  | Live production       |

### Quick Start

```bash
# 1. Local development
cp .env.example .env.local
npm run dev              # Next.js on localhost:3000
npx convex dev          # Convex backend (separate terminal)

# 2. Deploy to production
npm run lint            # Check code quality
npm run type-check      # Verify TypeScript
npx convex deploy       # Deploy backend
git push origin main    # Deploy frontend (auto-deploys to Vercel)
```

### Test Credentials

After deployment, login with:

- **Admin**: `admin@plataforma-astral.com` / `admin123`
- **Teacher**: `profesor@plataforma-astral.com` / `profesor123`

### Environment Variables

```bash
# Convex (requerido)
NEXT_PUBLIC_CONVEX_URL="https://your-project.convex.cloud"

# NextAuth (requerido)
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Almacenamiento de archivos
CLOUDINARY_URL="cloudinary://KEY:SECRET@CLOUD_NAME"
```

## 📚 Documentación Completa

### Documentos Disponibles

- **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)** - Documentación técnica completa
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Documentación de API y Server Actions
- **[DATABASE.md](./DATABASE.md)** - Esquema detallado de base de datos
- **[TESTING.md](./TESTING.md)** - Estrategia de testing

### Comandos Rápidos

```bash
# Desarrollo
npm run dev                    # Iniciar servidor
npm run db:studio             # Base de datos GUI
npm run format                # Formatear código

# Testing
npm run test                  # Tests unitarios
npm run test:e2e             # Tests E2E
npm run test:all             # Todos los tests

# Base de datos
npm run db:generate          # Generar cliente Prisma
npm run db:push              # Aplicar esquema
npm run db:seed              # Datos de prueba
npx convex dashboard         # Manage Convex data
```

## 🔍 Características por Rol

### Administradores

- Gestión completa de usuarios
- Configuración del sistema
- Gestión del equipo multidisciplinario
- Administración global del calendario

### Profesores

- Crear y editar planificación docente
- Programar reuniones con apoderados
- Gestión del calendario personal
- Subir recursos educativos

### Padres

- Solicitar reuniones con profesores
- Ver calendario escolar
- Acceder a recursos educativos
- Comunicación con docentes

### Centro Consejo

- Sistema de votación
- Información institucional
- Recursos específicos del consejo
- Participación en reuniones

## 🎯 Siguientes Pasos

1. **Configurar variables de entorno**
2. **Ejecutar migraciones de base de datos**
3. **Crear usuarios de prueba**
4. **Explorar la documentación completa**
5. **Comenzar desarrollo de nuevas funcionalidades**

---

**Proyecto**: Plataforma Astral
**Versión**: 1.0.0
**Última actualización**: October 2025
**Stack**: Next.js 15 + TypeScript + Convex
