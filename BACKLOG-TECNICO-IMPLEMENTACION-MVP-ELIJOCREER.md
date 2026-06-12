# Backlog Técnico de Implementación — ElijoCreer

> **Proyecto**: ElijoCreer — Prode colaborativo para el Mundial 2026
> **Stack**: Next.js + TypeScript + Tailwind + Supabase (Auth, Postgres, RLS)
> **Deploy**: Vercel (frontend) + Supabase Cloud (backend/DB)
> **Propósito**: Desglose granular de tareas técnicas listas para tomar y codificar

---

## Convenciones

- **Estimación**: Story Points (1, 2, 3, 5, 8, 13)
- **Estado**: `pending` | `in_progress` | `done`
- **Dependencias**: tarea precursora que debe estar terminada antes de empezar
- **Prioridad**: 1 (inmediata), 2 (alta), 3 (media), 4 (baja)
- Cada tarea produce código entregable + testeo manual o automatizado mínimos

---

## Fase 0 — Setup del proyecto

> Dependencias: ninguna
> Esta fase se hace UNA VEZ y habilita todo lo demás.

### T0.1 — Inicializar proyecto Next.js con TypeScript y Tailwind

- Crear app Next.js con `create-next-app`
- Configurar TypeScript estricto
- Configurar Tailwind CSS con diseño mobile-first
- Configurar estructura de carpetas inicial: `src/app`, `src/features`, `src/components`, `src/lib`, `src/services`
- Agregar archivo `.env.local.example` con variables requeridas
- Configurar ESLint y Prettier

**Estimación**: 3 SP  
**Prioridad**: 1  
**Criterios de aceptación**:
- `npm run dev` compila y abre en localhost
- Tailwind genera CSS correcto
- Estructura de carpetas creada

---

### T0.2 — Crear proyecto Supabase y configurar cliente

- Crear proyecto en Supabase Cloud
- Obtener `SUPABASE_URL` y `SUPABASE_ANON_KEY`
- Instalar `@supabase/supabase-js` y `@supabase/ssr` (o el helper de Next.js)
- Crear cliente Supabase en `src/lib/supabase/client.ts`
- Crear helper de server-side en `src/lib/supabase/server.ts`

**Estimación**: 2 SP  
**Prioridad**: 1  
**Dependencias**: T0.1  
**Criterios de aceptación**:
- Cliente se conecta al proyecto de Supabase
- Las variables de entorno están cargadas correctamente
- Se puede hacer una consulta de prueba

---

### T0.3 — Configurar Supabase Auth (email + password)

- Habilitar auth en Supabase dashboard (Email/Password)
- Configurar URLs de redirección (localhost + dominio productivo)
- Implementar proveedor de sesión en la app (`SessionContext` o middleware)
- Crear hook `useAuth` con `user`, `session`, `signIn`, `signUp`, `signOut`

**Estimación**: 3 SP  
**Prioridad**: 1  
**Dependencias**: T0.2  
**Criterios de aceptación**:
- Usuario puede registrarse con email y contraseña
- Usuario puede iniciar sesión
- Sesión persiste al recargar
- `signOut` cierra sesión correctamente

---

### T0.4 — Crear trigger automático de perfil al registrarse

- Configurar trigger en Supabase que cree `profile` automaticamente cuando se crea un `auth.users`
- El perfil inicial usa el email como `display_name` por defecto
- Hookear en frontend para redirigir al usuario a completar su perfil si está incompleto

**Estimación**: 2 SP  
**Prioridad**: 1  
**Dependencias**: T0.2  
**Criterios de aceptación**:
- Al registrarse, se crea automáticamente un registro en `profiles`
- El perfil tiene el `id` igual al `auth.users.id`

---

### T0.5 — Layout base con header, navegación y tema

- Crear layout principal con header responsivo
- Header: logo "ElijoCreer", nav links, avatar/nombre de usuario
- Mobile: menú hamburguesa
- Footer mínimo con derechos
- Tema visual con la paleta definida (celeste, blanco, azul profundo, dorado sutil)

**Estimación**: 3 SP  
**Prioridad**: 1  
**Dependencias**: T0.1  
**Criterios de aceptación**:
- Todas las páginas comparten el layout
- Navegación adaptativa mobile/desktop
- Usuario autenticado ve su avatar/initial
- Usuario no autenticado ve login/register

---

## Fase 1 — Base de datos (migrations)

> Dependencias: T0.2 (Supabase creado)
> Orden recomendado: el de las tablas en el modelo relacional

### T1.1 — Migración: tabla `profiles`

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

- Crear migración
- Aplicar en Supabase

**Estimación**: 1 SP  
**Prioridad**: 1  
**Dependencias**: T0.2  

---

### T1.2 — Migración: tablas `tournaments` y `teams`

- Crear tabla `tournaments`
- Crear tabla `teams` con FK a `tournaments`
- Agregar constraints e índices

**Estimación**: 1 SP  
**Prioridad**: 1  
**Dependencias**: T1.1  

---

### T1.3 — Migración: tabla `matches`

- Crear tabla `matches` con FKs a `tournaments` y `teams`
- Agregar check constraint: `home_team_id <> away_team_id`
- Índices compuestos

**Estimación**: 2 SP  
**Prioridad**: 1  
**Dependencias**: T1.2  

---

### T1.4 — Migración: tabla `official_results`

- Crear tabla `official_results` con FK a `matches`
- Unique constraint en `match_id`
- Check constraints de scores >= 0

**Estimación**: 1 SP  
**Prioridad**: 1  
**Dependencias**: T1.3  

---

### T1.5 — Migración: tablas `groups`, `group_members`, `group_scoring_rules`

- Crear `groups` con FK a `profiles(owner_user_id)` y `tournaments`
- Crear `group_members` con unique `(group_id, user_id)`, FK a ambas tablas
- Crear `group_scoring_rules` con unique `group_id`
- Agregar `invite_code` autogenerado en `groups`

**Estimación**: 3 SP  
**Prioridad**: 1  
**Dependencias**: T1.1, T1.2  

---

### T1.6 — Migración: tabla `predictions`

- Crear tabla `predictions` con unique `(group_id, match_id, user_id)`
- FKs a `groups`, `matches`, `profiles`
- Check constraints de scores >= 0
- Columna `is_locked` con default `false`

**Estimación**: 2 SP  
**Prioridad**: 1  
**Dependencias**: T1.3, T1.5  

---

### T1.7 — Migración: tabla `prediction_scores`

- Crear tabla `prediction_scores` con unique `prediction_id`
- Duplicar `group_id`, `match_id`, `user_id` para queries más rápidas
- Campos de detalle: `points_awarded`, `hit_exact_score`, `hit_outcome`, `bonus_awarded`, `scoring_reason`

**Estimación**: 2 SP  
**Prioridad**: 1  
**Dependencias**: T1.6  

---

### T1.8 — Migración: tabla `group_activity` (opcional MVP)

- Crear tabla `group_activity` con FK a `groups` y opcional a `profiles`
- Check constraint sobre `activity_type`
- Índice compuesto `(group_id, created_at desc)`

**Estimación**: 1 SP  
**Prioridad**: 4 (baja — puede postergarse)  
**Dependencias**: T1.5  

---

### T1.9 — Políticas RLS en todas las tablas

**Tablas y reglas esperadas**:

| Tabla | Lectura | Escritura |
|-------|---------|-----------|
| `profiles` | Propio usuario / público acotado | Propio usuario |
| `groups` | Públicos: todos; Privados: miembros | Owner/admin |
| `group_members` | Miembros del grupo | Admin del grupo |
| `group_scoring_rules` | Miembros del grupo | Admin del grupo |
| `predictions` | Miembros del grupo (ver nota) | Propio usuario si no locked |
| `prediction_scores` | Miembros del grupo | Solo backend/función |
| `official_results` | Todos autenticados | Admin global |
| `matches` | Todos autenticados | Admin global |
| `teams` | Todos autenticados | Admin global |
| `tournaments` | Todos autenticados | Admin global |

- Implementar cada policy una por una
- Testing manual de casos borde: no owner no puede editar, no miembro no puede leer grupo privado, etc.

**Estimación**: 5 SP  
**Prioridad**: 1  
**Dependencias**: T1.1 a T1.8  
**Criterios de aceptación**:
- Un usuario NO puede leer predicciones de otro usuario fuera de su grupo
- Un usuario NO puede editar predicciones de otro usuario
- Un usuario NO miembro de un grupo privado NO puede ver ese grupo
- Admin de grupo puede editar reglas de puntaje
- Solo admin global puede cargar resultados oficiales

---

### T1.10 — Vistas lógicas

- Crear `group_leaderboard_view` (suma de puntos por usuario/grupo + conteo de aciertos)
- Crear `user_group_summary_view` (grupos del usuario + puntos + pendientes)
- Crear `match_prediction_detail_view` (comparación resultado oficial vs pronóstico)

**Estimación**: 2 SP  
**Prioridad**: 2  
**Dependencias**: T1.7, T1.9  

---

## Fase 2 — Seed de datos

### T2.1 — Seed: torneo y equipos del Mundial 2026

- Crear script SQL para insertar el torneo "Mundial FIFA 2026" (activo)
- Insertar los 48 equipos clasificados
- Datos: nombre, código FIFA, escudo (URL placeholder)

**Estimación**: 2 SP  
**Prioridad**: 1  
**Dependencias**: T1.2  

---

### T2.2 — Seed: fixture completo del Mundial 2026

- Insertar los 104 partidos del Mundial 2026
- Distribuir por fase: grupos, R32, R16, cuartos, semis, tercer puesto, final
- Asignar fechas estimadas (basadas en el calendario oficial)

**Estimación**: 3 SP  
**Prioridad**: 1  
**Dependencias**: T1.3, T2.1  

---

## Fase 3 — Feature: Auth (frontend + backend)

### T3.1 — Página de login

- Página `/login` con formulario de email + contraseña
- Validación de campos
- Manejo de errores (credenciales inválidas, usuario no encontrado)
- Redirección post-login a `/home`
- Diseño responsive siguiendo la paleta de ElijoCreer

**Estimación**: 3 SP  
**Prioridad**: 1  
**Dependencias**: T0.3, T0.5  

---

### T3.2 — Página de registro

- Página `/register` con formulario de email + contraseña + confirmación
- Validación de formato de email, fortaleza de contraseña
- Manejo de errores (usuario ya existe, email inválido)
- Redirección post-registro a completar perfil → `/home`

**Estimación**: 3 SP  
**Prioridad**: 1  
**Dependencias**: T0.3, T0.4, T0.5  

---

### T3.3 — Protección de rutas (middleware)

- Implementar middleware de Next.js para redirigir al login si no hay sesión
- Rutas públicas: `/`, `/login`, `/register`
- Rutas protegidas: todo lo demás
- Redirigir a `/home` si el usuario ya está autenticado y visita login/register

**Estimación**: 2 SP  
**Prioridad**: 1  
**Dependencias**: T3.1  

---

## Fase 4 — Feature: Perfil

### T4.1 — Página de perfil del usuario

- Página `/profile`
- Mostrar: avatar (iniciales si no hay foto), display_name, email
- Mostrar estadísticas: grupos en los que participa, puntos totales por grupo, pronósticos realizados
- Botón para editar display_name
- Botón para cerrar sesión

**Estimación**: 3 SP  
**Prioridad**: 2  
**Dependencias**: T1.10 (views), T3.1  

---

### T4.2 — Edición de perfil

- Modal o inline edit para cambiar `display_name`
- Validación: nombre no vacío
- Guardar en `profiles`
- Feedback visual de éxito/error

**Estimación**: 2 SP  
**Prioridad**: 2  
**Dependencias**: T4.1  

---

## Fase 5 — Feature: Fixture

### T5.1 — Página de fixture del Mundial 2026

- Página `/fixture`
- Listado de partidos agrupados por fase (Grupo A, Grupo B, R32, Cuartos...)
- Cada partido muestra: escudos, nombres, fecha/hora, estado (scheduled/live/finished)
- Los partidos finalizados muestran el resultado oficial si existe
- Los partidos próximos están ordenados por fecha ascendente

**Estimación**: 5 SP  
**Prioridad**: 1  
**Dependencias**: T2.2, T0.5  

---

### T5.2 — Filtros en fixture

- Filtro por fase (dropdown o tabs)
- Filtro por estado (próximos, en vivo, finalizados)
- Los filtros son por query params para poder compartir URL

**Estimación**: 2 SP  
**Prioridad**: 2  
**Dependencias**: T5.1  

---

## Fase 6 — Feature: Grupos

### T6.1 — Página de creación de grupo

- Página `/groups/new`
- Formulario: nombre, descripción, visibilidad (público/privado)
- Al crear: el usuario queda como admin
- Se genera `invite_code` automático (UUID corto o string aleatorio)
- Redirigir a `/groups/[groupId]` tras crear

**Estimación**: 3 SP  
**Prioridad**: 1  
**Dependencias**: T1.5, T0.5  

---

### T6.2 — Página de detalle del grupo

- Página `/groups/[groupId]`
- Header con nombre, descripción, visibilidad
- Miembros del grupo (lista con avatares y roles)
- Ranking resumido (top 5 + "ver ranking completo")
- Próximos partidos del fixture (con acceso a pronosticar)
- Actividad reciente (si existe T1.8)
- Botón para compartir código de invitación (copia al portapapeles)
- Si el usuario es admin: acceso a admin del grupo

**Estimación**: 5 SP  
**Prioridad**: 1  
**Dependencias**: T5.1, T1.5, T7.2 (ranking), T0.5  

---

### T6.3 — Unirse a grupo público

- Página `/groups/join` o modal con selector de grupos públicos
- Lista de grupos públicos con nombre, descripción, cantidad de miembros
- Botón "Unirme" que agrega al usuario como miembro
- Feedback visual al unirse

**Estimación**: 3 SP  
**Prioridad**: 1  
**Dependencias**: T6.2  

---

### T6.4 — Unirse a grupo privado por código

- Modal/página para ingresar código de invitación
- Validar que el código existe y el grupo está activo
- Si es válido: agregar al usuario como miembro y redirigir al grupo
- Si no: mostrar error claro

**Estimación**: 2 SP  
**Prioridad**: 1  
**Dependencias**: T6.2  

---

### T6.5 — Admin de grupo (configuración general)

- Página `/groups/[groupId]/admin`
- Editar nombre y descripción
- Cambiar visibilidad (público/privada)
- Ver código de invitación (regenerable)
- Lista de miembros con opción a remover (futuro)
- Solo visible para admin del grupo

**Estimación**: 3 SP  
**Prioridad**: 2  
**Dependencias**: T6.2  

---

## Fase 7 — Feature: Reglas de puntaje

### T7.1 — Configuración de reglas de puntaje

- Página `/groups/[groupId]/rules`
- Formulario con campos:
  - Puntos por resultado exacto (default: 5)
  - Puntos por acertar ganador/empate (default: 3)
  - Puntos por acertar score de un equipo (default: 0)
  - Bonus adicional (default: 0)
- Validación: valores >= 0
- Solo admin puede editar
- Miembros pueden ver (modo lectura)

**Estimación**: 3 SP  
**Prioridad**: 2  
**Dependencias**: T1.5, T6.2  

---

### T7.2 — Visualización de reglas para miembros

- Resumen claro de cómo se puntúa en el grupo
- Visible desde la página del grupo o desde un modal
- Lenguaje simple: "Acertás el resultado exacto → 5 puntos | Acertás quién gana → 3 puntos"

**Estimación**: 1 SP  
**Prioridad**: 2  
**Dependencias**: T7.1  

---

## Fase 8 — Feature: Pronósticos

### T8.1 — Cargar pronóstico para un partido

- Desde el fixture: click en un partido próximo → modal o página de pronóstico
- Inputs para goles de local y visitante
- Selector de grupo (si el usuario pertenece a varios)
- Validación: scores >= 0
- Guardar en `predictions`
- Al guardar: feedback visual y actualización del fixture a "pronosticado"

**Estimación**: 5 SP  
**Prioridad**: 1  
**Dependencias**: T5.1, T1.6, T6.2  

---

### T8.2 — Editar pronóstico antes del inicio

- Si el partido no ha comenzado: mostrar botón de editar
- Modal/página igual a T8.1 pero con datos precargados
- Al guardar: actualizar `predictions`
- Si el partido ya empezó: el pronóstico está en modo solo lectura

**Estimación**: 2 SP  
**Prioridad**: 1  
**Dependencias**: T8.1  

---

### T8.3 — Lock automático de pronósticos

- Mecanismo que impida editar un pronóstico si `starts_at < now()`
- Validación en backend (RLS o función PostgreSQL)
- Validación en frontend (deshabilitar inputs, mostrar candado)
- Actualizar `is_locked = true` y `locked_at`

**Estimación**: 3 SP  
**Prioridad**: 1  
**Dependencias**: T8.2, T1.9 (RLS)  

---

### T8.4 — Estado visual de pronósticos en fixture

- En el fixture: cada partido muestra el estado del pronóstico del usuario para ese grupo
- Estados: "Pendiente", "Pronosticado", "Cerrado"
- Iconos o colores distintivos
- Partidos finalizados muestran comparación: mi pronóstico vs resultado oficial

**Estimación**: 3 SP  
**Prioridad**: 2  
**Dependencias**: T8.1, T5.1  

---

## Fase 9 — Feature: Resultados oficiales (admin global)

### T9.1 — Panel de admin global (matches)

- Página `/admin/matches` (solo accesible para admin global)
- Lista de partidos filtrable por estado y fase
- Para cada partido finalizado o en vivo: formulario para cargar resultado

**Estimación**: 3 SP  
**Prioridad**: 1  
**Dependencias**: T2.2, T0.5  

---

### T9.2 — Cargar resultado oficial

- Formulario en `/admin/matches` para ingresar `home_score` y `away_score`
- Validación: scores >= 0
- Guardar en `official_results`
- Una vez cargado, el resultado es visible globalmente
- Disparar cálculo de scoring (T10.1)

**Estimación**: 2 SP  
**Prioridad**: 1  
**Dependencias**: T9.1, T1.4  

---

## Fase 10 — Feature: Scoring y ranking

### T10.1 — Motor de cálculo de puntajes (Edge Function o DB function)

- Crear función PostgreSQL o Edge Function que:
  1. Toma un `match_id` con resultado oficial cargado
  2. Busca todos los `predictions` para ese partido (en todos los grupos)
  3. Para cada predicción, obtiene las `group_scoring_rules` del grupo correspondiente
  4. Compara resultado oficial vs predicción
  5. Calcula puntos según las reglas del grupo
  6. Inserta/actualiza en `prediction_scores`

- Llamar automáticamente al cargar un resultado oficial
- Permitir recalcular manualmente si es necesario

**Estimación**: 8 SP  
**Prioridad**: 1  
**Dependencias**: T1.7, T1.5, T1.4, T1.6  

**Criterios de aceptación**:
- Al cargar resultado de un partido, todos los pronósticos de ese partido reciben su puntaje
- El cálculo respeta las reglas de cada grupo
- Se guarda la razón del scoring (`hit_exact_score`, `hit_outcome`, etc.)
- Si se recalculan reglas de un grupo, se puede re-ejecutar el scoring

---

### T10.2 — Página de ranking del grupo

- Página `/groups/[groupId]/ranking`
- Tabla de posiciones: posición, avatar, nombre, puntos, aciertos exactos, pronósticos realizados
- Top 3 destacado visualmente (medallas/colores)
- El ranking se obtiene de `group_leaderboard_view`
- El usuario actual se destaca en la tabla

**Estimación**: 5 SP  
**Prioridad**: 1  
**Dependencias**: T1.10 (view), T6.2  

---

### T10.3 — Detalle de puntaje por partido

- Desde el fixture o desde el ranking, al hacer click en un partido: ver detalle de puntos
- Modal que muestra: resultado oficial, mi pronóstico, puntos obtenidos, razón
- Lista de todos los pronósticos del grupo para ese partido (si la política lo permite)

**Estimación**: 3 SP  
**Prioridad**: 2  
**Dependencias**: T10.1, T8.4  

---

## Fase 11 — Feature: Home social

### T11.1 — Home del usuario

- Página `/home`
- Secciones:
  1. **Mis grupos** — cards con nombre, miembros, mi posición, puntos
  2. **Próximos partidos** — próximos 5 partidos del fixture con acceso directo a pronosticar
  3. **Pronósticos pendientes** — partidos próximos donde aún no cargué pronóstico
  4. **Actividad reciente** (si existe T1.8)
- Acceso rápido: botón "Pronosticar" → fixture, "Ver ranking" → ranking del primer grupo

**Estimación**: 5 SP  
**Prioridad**: 2  
**Dependencias**: T5.1, T6.2, T8.1, T10.2  

---

## Fase 12 — Feature: Landing page

### T12.1 — Landing page pública

- Página `/` (raíz)
- Propuesta de valor: "ElijoCreer — El prode del Mundial 2026"
- Secciones:
  1. Hero con tagline y CTA a registro
  2. Cómo funciona (3 pasos simples)
  3. Características principales (grupos, pronósticos, ranking)
  4. Footer
- Diseño mobile-first con la identidad visual de ElijoCreer

**Estimación**: 3 SP  
**Prioridad**: 2  
**Dependencias**: T0.5  

---

## Fase 13 — Deploy

### T13.1 — Deploy en Vercel (producción)

- Conectar repo a Vercel
- Configurar variables de entorno en Vercel
- Configurar dominio personalizado (si aplica)
- Verificar build en producción
- Verificar rutas protegidas y públicas

**Estimación**: 2 SP  
**Prioridad**: 1  
**Dependencias**: T0.1, T3.3  

---

### T13.2 — Deploy de seed data a producción

- Ejecutar migrations en producción de Supabase
- Ejecutar seed de equipos y fixture en producción
- Verificar RLS funcionando en producción

**Estimación**: 1 SP  
**Prioridad**: 1  
**Dependencias**: T2.2, T13.1  

---

## Resumen de estimaciones

| Fase | SP |
|------|----|
| Fase 0 — Setup | 13 |
| Fase 1 — Base de datos | 20 |
| Fase 2 — Seed | 5 |
| Fase 3 — Auth | 8 |
| Fase 4 — Perfil | 5 |
| Fase 5 — Fixture | 7 |
| Fase 6 — Grupos | 16 |
| Fase 7 — Reglas de puntaje | 4 |
| Fase 8 — Pronósticos | 13 |
| Fase 9 — Resultados oficiales | 5 |
| Fase 10 — Scoring y ranking | 16 |
| Fase 11 — Home social | 5 |
| Fase 12 — Landing | 3 |
| Fase 13 — Deploy | 3 |
| **Total** | **~118 SP** |

### Priorización para Sprint 1 (core jugable)

Para tener un MVP funcional y jugable lo antes posible:

1. **Fase 0** — Setup (13 SP)
2. **Fase 1** — DB + RLS (20 SP)
3. **Fase 2** — Seed (5 SP)
4. **Fase 3** — Auth (8 SP)
5. **Fase 5** — Fixture (7 SP)
6. **Fase 6** — Grupos: crear, unirse, ver (10 SP de los 16)
7. **Fase 8** — Pronósticos: crear y lock (10 SP de los 13)
8. **Fase 9** — Resultados: admin global (5 SP)
9. **Fase 10** — Scoring + ranking base (13 SP de los 16)
10. **Fase 13** — Deploy (3 SP)

**Total Sprint 1**: ~94 SP → core jugable completo

### Sprint 2 (experiencia pulida)

- Perfil completo (5 SP)
- Reglas de puntaje (4 SP)
- Home social (5 SP)
- Landing pública (3 SP)
- Detalle de puntaje por partido (3 SP)
- Estados visuales en fixture (3 SP)
- Activity feed (1 SP)

---

## Notas técnicas importantes

1. **Pronósticos y resultado siempre separados**: nunca mezclar en la misma tabla. La trazabilidad es clave para recálculos.

2. **RLS como primera línea de defensa**: no confiar solo en el frontend. Cada consulta debe estar protegida por políticas RLS.

3. **El scoring se persiste, no se calcula en vivo**: `prediction_scores` almacena el resultado del cálculo. El ranking consulta esta tabla, no recalcula en cada request.

4. **Lock de pronósticos**: validación triple — frontend deshabilita, RLS bloquea escritura si `starts_at < now()`, y función DB como respaldo.

5. **Recálculo controlado**: si cambian reglas de un grupo, se puede re-ejecutar el scoring solo para ese grupo. No afecta a otros grupos.

6. **Seed data**: el fixture del Mundial 2026 se inserta vía migración/seed SQL. No se hardcodea en el frontend.

7. **Admin global**: se define por una columna `is_global_admin` en `profiles` o por una tabla de roles separada. Para MVP, una columna booleana es suficiente.
