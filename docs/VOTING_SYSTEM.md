# Sistema de Votaciones - Plataforma Astral

## 📋 Resumen Ejecutivo

El Sistema de Votaciones es una plataforma integral para la gestión democrática de decisiones en el Centro de Padres de la Plataforma Educativa Astral. Permite a los administradores crear, gestionar y monitorear votaciones, mientras que los padres pueden participar de manera segura y transparente.

## 🎯 Características Principales

### Características para Administradores

- ✅ **Gestión Completa de Votaciones**: Crear, editar, eliminar y monitorear votaciones
- ✅ **Categorización Avanzada**: 10 categorías predefinidas (Académico, Financiero, etc.)
- ✅ **Configuración Flexible**: Múltiples opciones de configuración por votación
- ✅ **Analytics en Tiempo Real**: Estadísticas detalladas y resultados visuales
- ✅ **Control de Acceso**: Gestión de permisos y autenticación
- ✅ **Interfaz Intuitiva**: Dashboard moderno con filtros y búsqueda

### Características para Padres

- ✅ **Votación Segura**: Autenticación requerida, una votación por usuario
- ✅ **Resultados Transparentes**: Visualización en tiempo real de resultados
- ✅ **Interfaz Responsiva**: Funciona en móviles, tablets y desktop
- ✅ **Notificaciones**: Feedback inmediato sobre el estado del voto
- ✅ **Historial Personal**: Ver votaciones anteriores y resultados

## 🏗️ Arquitectura del Sistema

### Base de Datos

```sql
-- Tabla principal de votaciones
votes (
  id, title, description, category, end_date,
  is_active, is_public, allow_multiple_votes,
  max_votes_per_user, require_authentication,
  created_by, created_at, updated_at
)

-- Opciones de votación
vote_options (
  id, text, vote_id, created_at
)

-- Respuestas de usuarios
vote_responses (
  id, vote_id, option_id, user_id, created_at
)
```

### API Endpoints

#### Administradores

- `GET /api/admin/votes` - Listar todas las votaciones con estadísticas
- `POST /api/admin/votes` - Crear nueva votación
- `PUT /api/admin/votes` - Actualizar votación existente
- `DELETE /api/admin/votes` - Eliminar votación

#### Padres

- `GET /api/parent/votes` - Obtener votaciones disponibles
- `POST /api/parent/votes` - Enviar voto

### Seguridad

- 🔐 **Autenticación**: NextAuth con roles de usuario
- 🛡️ **Autorización**: Verificación de roles (ADMIN/PARENT)
- 🔒 **Validación**: Zod schemas para validación de datos
- 🚫 **Prevención de Fraude**: Una votación por usuario por encuesta
- ⏰ **Límites de Tiempo**: Votaciones con fechas de cierre automático

## 📊 Categorías de Votación

| Categoría          | Descripción                          | Color    |
| ------------------ | ------------------------------------ | -------- |
| **GENERAL**        | Votaciones generales del centro      | Gris     |
| **ACADEMIC**       | Decisiones académicas y curriculares | Azul     |
| **ADMINISTRATIVE** | Gestión administrativa               | Púrpura  |
| **SOCIAL**         | Actividades sociales y eventos       | Verde    |
| **FINANCIAL**      | Decisiones financieras y presupuesto | Amarillo |
| **INFRASTRUCTURE** | Mejoras de infraestructura           | Naranja  |
| **CURRICULUM**     | Cambios en el currículum             | Índigo   |
| **EVENTS**         | Eventos y celebraciones              | Rosa     |
| **POLICIES**       | Políticas y reglamentos              | Rojo     |
| **OTHER**          | Otras categorías                     | Gris     |

## ⚙️ Configuraciones de Votación

### Configuraciones Básicas

- **Título**: Nombre de la votación (requerido)
- **Descripción**: Explicación detallada (opcional)
- **Categoría**: Clasificación temática
- **Fecha de Cierre**: Cuándo termina la votación
- **Estado**: Activa/Inactiva

### Configuraciones Avanzadas

- **Pública/Privada**: Control de visibilidad
- **Múltiples Votos**: Permitir votar por varias opciones
- **Límite de Votos**: Máximo número de votos por usuario
- **Autenticación**: Requerir login para votar

## 🎨 Interfaz de Usuario

### Dashboard de Administración

- 📈 **Estadísticas en Tiempo Real**: Total votaciones, activas, cerradas, votos
- 🔍 **Búsqueda y Filtros**: Por estado, categoría, texto
- ➕ **Creación Intuitiva**: Formulario dinámico con validación
- 📊 **Vista de Resultados**: Gráficos y porcentajes
- ⚡ **Acciones Rápidas**: Editar, eliminar, duplicar

### Interfaz de Padres

- 🗳️ **Votación Simple**: Un clic para votar
- 📊 **Resultados Visuales**: Barras de progreso y porcentajes
- ⏰ **Contador Regresivo**: Tiempo restante para votar
- ✅ **Confirmación**: Feedback inmediato del voto
- 📱 **Responsive**: Optimizado para móviles

## 🚀 Instalación y Configuración

### 1. Migración de Base de Datos

```bash
# Generar migración
npx prisma migrate dev --name enhance_voting_system

# Aplicar migración
npx prisma migrate deploy
```

### 2. Crear Datos de Prueba

```bash
# Ejecutar script de muestra
npx tsx scripts/create-sample-votes.ts
```

### 3. Verificar Configuración

- ✅ Base de datos conectada
- ✅ Usuarios admin creados
- ✅ Permisos configurados
- ✅ API endpoints funcionando

## 📱 Uso del Sistema

### Guía para Administradores

#### Crear Nueva Votación

1. Ir a `/admin/votaciones`
2. Hacer clic en "Nueva Votación"
3. Completar formulario:
   - Título y descripción
   - Seleccionar categoría
   - Establecer fecha de cierre
   - Configurar opciones avanzadas
   - Agregar opciones de voto (mínimo 2, máximo 10)
4. Hacer clic en "Crear"

#### Gestionar Votaciones Existentes

- **Editar**: Hacer clic en el ícono de editar
- **Eliminar**: Hacer clic en el ícono de eliminar (confirmación requerida)
- **Filtrar**: Usar filtros por estado o búsqueda por texto
- **Ver Resultados**: Los resultados se muestran en tiempo real

### Guía para Padres

#### Participar en Votaciones

1. Ir a `/parent` (dashboard de padres)
2. Ver sección "Votaciones del Centro de Padres"
3. Seleccionar votación activa
4. Revisar opciones y descripción
5. Hacer clic en "Votar" en la opción deseada
6. Confirmar voto

#### Ver Resultados

- Los resultados se actualizan automáticamente
- Ver porcentajes y número de votos
- Identificar opción seleccionada (marcada con ✓)

## 🔧 Configuración Avanzada

### Variables de Entorno

```env
# Base de datos
CONVEX_URL="[Convex deployment URL]"

# Autenticación
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Roles de usuario
DEFAULT_ADMIN_EMAIL="admin@plataforma-astral.com"
DEFAULT_ADMIN_PASSWORD="admin123"
```

### Personalización

- **Categorías**: Modificar enum `VoteCategory` en schema
- **Colores**: Actualizar función `getCategoryColor()` en componentes
- **Límites**: Ajustar validaciones en schemas Zod
- **UI**: Personalizar componentes en `/components/parent/` y `/components/admin/`

## 📈 Analytics y Reportes

### Métricas Disponibles

- **Total de Votaciones**: Por categoría y estado
- **Participación**: Número de votos por votación
- **Tendencias**: Votaciones más populares
- **Tiempo**: Duración promedio de votaciones
- **Usuarios**: Participación por usuario

### Exportación de Datos

- 📊 **Resultados CSV**: Exportar resultados por votación
- 📋 **Reportes PDF**: Generar reportes completos
- 📈 **Gráficos**: Visualizaciones interactivas
- 📱 **Notificaciones**: Alertas automáticas

## 🔒 Seguridad y Privacidad

### Medidas de Seguridad

- **Autenticación**: NextAuth con múltiples proveedores
- **Autorización**: Roles granulares (ADMIN, PARENT)
- **Validación**: Zod schemas para todos los inputs
- **Auditoría**: Logs de todas las acciones
- **Rate Limiting**: Protección contra spam

### Privacidad

- **Anonimato**: Los votos individuales son privados
- **Transparencia**: Solo resultados agregados son públicos
- **Consentimiento**: Usuarios deben aceptar términos
- **Retención**: Datos se eliminan según políticas

## 🐛 Solución de Problemas

### Problemas Comunes

#### Error: "No autorizado"

- Verificar que el usuario esté logueado
- Confirmar que tenga el rol correcto (ADMIN/PARENT)
- Revisar configuración de NextAuth

#### Error: "Ya has votado"

- Verificar constraint único en base de datos
- Revisar lógica de validación en API
- Limpiar cache del navegador

#### Error: "Votación no encontrada"

- Verificar que la votación exista en base de datos
- Confirmar que esté activa y pública
- Revisar permisos de usuario

### Logs y Debugging

```bash
# Ver logs de la aplicación
npm run dev

# Verificar base de datos
npx prisma studio

# Ejecutar tests
npm run test
```

## 🚀 Roadmap y Mejoras Futuras

### Próximas Características

- 📧 **Notificaciones por Email**: Alertas automáticas
- 📱 **App Móvil**: Aplicación nativa para votaciones
- 🔗 **Integración con Calendario**: Votaciones programadas
- 📊 **Analytics Avanzados**: Machine learning para predicciones
- 🌐 **API Pública**: Integración con sistemas externos

### Mejoras Técnicas

- ⚡ **Performance**: Caching y optimización
- 🔄 **Real-time**: WebSockets para actualizaciones
- 📱 **PWA**: Progressive Web App
- 🌍 **Internacionalización**: Múltiples idiomas
- ♿ **Accesibilidad**: WCAG 2.1 compliance

## 📞 Soporte

### Contacto

- **Email**: <soporte@plataforma-astral.com>
- **Teléfono**: (45) 278 3486
- **Horarios**: Lunes a Viernes 8:00 - 17:00

### Documentación Adicional

- [Guía de Usuario](USER_GUIDE.md)
- [API Documentation](API_DOCS.md)
- [Troubleshooting](TROUBLESHOOTING.md)

---

Desarrollado con ❤️ para la Plataforma Educativa Astral
