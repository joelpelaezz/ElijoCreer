# Modelo Relacional Detallado MVP — ElijoCreer

## 1. Objetivo

Definir el modelo relacional detallado del MVP de **ElijoCreer** para soportar:
- autenticación y perfiles
- grupos públicos y privados
- membresías y roles
- fixture del Mundial 2026
- pronósticos por usuario y grupo
- resultados oficiales globales
- reglas de puntaje por grupo
- scoring y ranking por grupo

Este documento baja la arquitectura conceptual a una estructura relacional lista para implementación.

---

## 2. Criterios de modelado

1. El MVP usa solo **Mundial 2026**, pero el modelo no debe quedar hardcodeado a un único torneo.
2. Los **resultados oficiales** son globales por partido.
3. Las **reglas de puntaje** pertenecen al grupo.
4. Los **pronósticos** pertenecen a un usuario dentro de un grupo para un partido.
5. El **scoring** se persiste separado del pronóstico para trazabilidad y recálculo.
6. La seguridad debe poder implementarse con RLS por usuario, grupo y rol.

---

## 3. Convenciones recomendadas

- Primary keys: `uuid`
- Timestamps: `timestamptz`
- Slugs/códigos públicos: `text` con `unique`
- Estados acotados: `text` + `check constraint` o `enum`
- Foreign keys explícitas en todas las relaciones

---

## 4. Tablas principales

## 4.1 profiles

### Propósito
Extender la identidad base de `auth.users` con información pública del usuario.

### Columnas
- `id uuid primary key` → FK a `auth.users(id)`
- `display_name text not null`
- `avatar_url text null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### Restricciones
- `display_name` no vacío

### Índices recomendados
- PK sobre `id`
- opcional índice sobre `display_name`

---

## 4.2 tournaments

### Propósito
Representar torneos soportados por la plataforma.

### Columnas
- `id uuid primary key`
- `name text not null`
- `slug text not null unique`
- `year int not null`
- `status text not null`
- `starts_at timestamptz null`
- `ends_at timestamptz null`
- `created_at timestamptz not null default now()`

### Restricciones
- `status in ('draft', 'active', 'finished', 'archived')`
- `year >= 2026`

### Índices recomendados
- unique index sobre `slug`
- index sobre `status`

---

## 4.3 teams

### Propósito
Representar selecciones/equipos de un torneo.

### Columnas
- `id uuid primary key`
- `tournament_id uuid not null` FK → `tournaments(id)`
- `name text not null`
- `short_name text not null`
- `code text not null`
- `crest_url text null`
- `created_at timestamptz not null default now()`

### Restricciones
- unique `(tournament_id, code)`
- unique `(tournament_id, name)`

### Índices recomendados
- index sobre `tournament_id`
- unique index sobre `(tournament_id, code)`

---

## 4.4 matches

### Propósito
Representar partidos oficiales del torneo.

### Columnas
- `id uuid primary key`
- `tournament_id uuid not null` FK → `tournaments(id)`
- `stage text not null`
- `round_label text null`
- `match_number int null`
- `home_team_id uuid not null` FK → `teams(id)`
- `away_team_id uuid not null` FK → `teams(id)`
- `starts_at timestamptz not null`
- `status text not null default 'scheduled'`
- `venue text null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### Restricciones
- `status in ('scheduled', 'live', 'finished', 'cancelled')`
- `home_team_id <> away_team_id`

### Índices recomendados
- index sobre `tournament_id`
- index sobre `starts_at`
- index sobre `status`
- index compuesto `(tournament_id, stage, starts_at)`

---

## 4.5 official_results

### Propósito
Guardar el resultado oficial único de cada partido.

### Columnas
- `id uuid primary key`
- `match_id uuid not null unique` FK → `matches(id)`
- `home_score int not null`
- `away_score int not null`
- `loaded_by uuid not null` FK → `profiles(id)`
- `loaded_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### Restricciones
- `home_score >= 0`
- `away_score >= 0`

### Índices recomendados
- unique index sobre `match_id`
- index sobre `loaded_by`

---

## 4.6 groups

### Propósito
Representar grupos de competencia.

### Columnas
- `id uuid primary key`
- `name text not null`
- `slug text null`
- `description text null`
- `visibility text not null default 'private'`
- `invite_code text not null unique`
- `owner_user_id uuid not null` FK → `profiles(id)`
- `tournament_id uuid not null` FK → `tournaments(id)`
- `is_active boolean not null default true`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### Restricciones
- `visibility in ('public', 'private')`
- `name` no vacío

### Índices recomendados
- unique index sobre `invite_code`
- index sobre `owner_user_id`
- index sobre `tournament_id`
- index sobre `visibility`
- opcional unique index sobre `slug`

---

## 4.7 group_members

### Propósito
Relacionar usuarios con grupos y definir su rol.

### Columnas
- `id uuid primary key`
- `group_id uuid not null` FK → `groups(id)`
- `user_id uuid not null` FK → `profiles(id)`
- `role text not null default 'member'`
- `joined_at timestamptz not null default now()`
- `status text not null default 'active'`

### Restricciones
- unique `(group_id, user_id)`
- `role in ('admin', 'member')`
- `status in ('active', 'pending', 'removed')`

### Índices recomendados
- unique index sobre `(group_id, user_id)`
- index sobre `user_id`
- index sobre `group_id`
- index compuesto `(group_id, role)`

---

## 4.8 group_scoring_rules

### Propósito
Guardar la configuración vigente de puntaje de cada grupo.

### Columnas
- `id uuid primary key`
- `group_id uuid not null unique` FK → `groups(id)`
- `exact_score_points int not null default 5`
- `outcome_points int not null default 3`
- `one_team_score_points int not null default 0`
- `bonus_points int not null default 0`
- `updated_by uuid not null` FK → `profiles(id)`
- `updated_at timestamptz not null default now()`

### Restricciones
- `exact_score_points >= 0`
- `outcome_points >= 0`
- `one_team_score_points >= 0`
- `bonus_points >= 0`

### Índices recomendados
- unique index sobre `group_id`
- index sobre `updated_by`

### Nota
Para MVP se recomienda una sola configuración vigente por grupo. Si después querés versionado, se agrega otra tabla histórica.

---

## 4.9 predictions

### Propósito
Guardar el pronóstico de un usuario para un partido dentro de un grupo.

### Columnas
- `id uuid primary key`
- `group_id uuid not null` FK → `groups(id)`
- `match_id uuid not null` FK → `matches(id)`
- `user_id uuid not null` FK → `profiles(id)`
- `predicted_home_score int not null`
- `predicted_away_score int not null`
- `is_locked boolean not null default false`
- `locked_at timestamptz null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### Restricciones
- unique `(group_id, match_id, user_id)`
- `predicted_home_score >= 0`
- `predicted_away_score >= 0`

### Índices recomendados
- unique index sobre `(group_id, match_id, user_id)`
- index sobre `user_id`
- index sobre `match_id`
- index sobre `group_id`
- index compuesto `(group_id, user_id)`

### Regla de negocio importante
La edición debe prohibirse si el partido ya comenzó, aunque la columna `is_locked` no haya sido actualizada todavía. El lock no puede depender solo del frontend.

---

## 4.10 prediction_scores

### Propósito
Persistir el resultado del cálculo de puntos de un pronóstico.

### Columnas
- `id uuid primary key`
- `prediction_id uuid not null unique` FK → `predictions(id)`
- `group_id uuid not null` FK → `groups(id)`
- `match_id uuid not null` FK → `matches(id)`
- `user_id uuid not null` FK → `profiles(id)`
- `points_awarded int not null default 0`
- `hit_exact_score boolean not null default false`
- `hit_outcome boolean not null default false`
- `hit_one_team_score boolean not null default false`
- `bonus_awarded int not null default 0`
- `scoring_reason text null`
- `calculated_at timestamptz not null default now()`

### Restricciones
- `points_awarded >= 0`
- `bonus_awarded >= 0`

### Índices recomendados
- unique index sobre `prediction_id`
- index sobre `group_id`
- index sobre `user_id`
- index sobre `match_id`
- index compuesto `(group_id, user_id)`
- index compuesto `(group_id, points_awarded)`

### Nota
Duplicar `group_id`, `match_id` y `user_id` en esta tabla simplifica consultas de ranking y reporting del MVP.

---

## 4.11 group_activity (opcional MVP liviano)

### Propósito
Permitir una actividad reciente básica dentro del grupo.

### Columnas
- `id uuid primary key`
- `group_id uuid not null` FK → `groups(id)`
- `user_id uuid null` FK → `profiles(id)`
- `activity_type text not null`
- `reference_id uuid null`
- `message text not null`
- `created_at timestamptz not null default now()`

### Restricciones
- `activity_type in ('joined_group', 'prediction_created', 'prediction_updated', 'result_loaded', 'rules_updated')`

### Índices recomendados
- index sobre `group_id`
- index compuesto `(group_id, created_at desc)`

### Nota
Puede omitirse si querés un MVP todavía más corto.

---

## 5. Relaciones resumidas

```text
auth.users 1---1 profiles

tournaments 1---N teams
tournaments 1---N matches
tournaments 1---N groups

matches N---1 teams (home_team_id)
matches N---1 teams (away_team_id)
matches 1---1 official_results

groups 1---N group_members
profiles 1---N group_members

groups 1---1 group_scoring_rules

groups 1---N predictions
matches 1---N predictions
profiles 1---N predictions

predictions 1---1 prediction_scores
```

---

## 6. Constraints de negocio recomendadas

## 6.1 Un usuario no puede duplicarse en un grupo
- enforced por `unique (group_id, user_id)` en `group_members`

## 6.2 Un usuario no puede pronosticar dos veces el mismo partido en el mismo grupo
- enforced por `unique (group_id, match_id, user_id)` en `predictions`

## 6.3 Un partido tiene un único resultado oficial
- enforced por `unique (match_id)` en `official_results`

## 6.4 Un grupo tiene una sola configuración vigente de puntaje
- enforced por `unique (group_id)` en `group_scoring_rules`

## 6.5 Un pronóstico tiene un solo scoring vigente
- enforced por `unique (prediction_id)` en `prediction_scores`

---

## 7. Índices críticos para performance

### Altamente recomendados
- `matches(starts_at)`
- `matches(tournament_id, stage, starts_at)`
- `group_members(group_id, user_id)`
- `predictions(group_id, match_id, user_id)`
- `predictions(group_id, user_id)`
- `prediction_scores(group_id, user_id)`
- `prediction_scores(group_id, match_id)`

### Para ranking
- `prediction_scores(group_id, user_id)`

### Para feed o actividad
- `group_activity(group_id, created_at desc)`

---

## 8. Vistas lógicas recomendadas (sin definir SQL aún)

## 8.1 group_leaderboard_view
Propósito:
- sumar puntos por usuario y grupo
- contar aciertos
- exponer posición derivable

Campos esperados:
- group_id
- user_id
- total_points
- exact_hits
- outcome_hits
- predictions_count

---

## 8.2 user_group_summary_view
Propósito:
- mostrar grupos del usuario con métricas rápidas

Campos esperados:
- group_id
- user_id
- total_points
- pending_predictions
- rank_position

---

## 8.3 match_prediction_detail_view
Propósito:
- comparar resultado oficial y pronósticos de un usuario dentro de un grupo

Campos esperados:
- group_id
- match_id
- user_id
- predicted_home_score
- predicted_away_score
- official_home_score
- official_away_score
- points_awarded
- scoring_reason

---

## 9. Reglas de RLS a contemplar en el diseño

## 9.1 profiles
- cada usuario puede leer y actualizar su propio perfil
- lectura pública limitada si se decide mostrar nombres en rankings

## 9.2 groups
- cualquier usuario autenticado puede ver grupos públicos
- miembros pueden ver grupos privados a los que pertenecen
- solo admin/owner puede actualizar grupo

## 9.3 group_members
- un usuario puede ver su membresía
- miembros del grupo pueden ver otros miembros del mismo grupo
- solo admin del grupo puede gestionar altas/bajas según la política final

## 9.4 group_scoring_rules
- miembros pueden leer
- solo admin del grupo puede actualizar

## 9.5 predictions
- el usuario puede crear/editar sus propios pronósticos en grupos donde participa
- miembros del grupo podrían leer pronósticos según la estrategia del producto
  - opción A: visibles solo después del cierre
  - opción B: visibles siempre

## 9.6 prediction_scores
- miembros del grupo pueden leer scoring del grupo
- escritura solo por backend/función controlada o rol administrativo del sistema

## 9.7 official_results
- lectura pública/autenticada
- escritura solo admin global

---

## 10. Decisiones abiertas que impactan el modelo

1. **Visibilidad de pronósticos entre usuarios**
   - antes del inicio del partido
   - después del cierre
   - solo después del resultado

2. **Versionado de reglas del grupo**
   - MVP: una regla vigente
   - futuro: historial de cambios

3. **Soporte a penales/alargue**
   - para MVP puede limitarse a score principal
   - si querés más precisión, habrá que extender `official_results`

4. **Actividad social persistida o derivada**
   - tabla propia o feed calculado desde eventos existentes

---

## 11. Orden recomendado de implementación de tablas

1. `profiles`
2. `tournaments`
3. `teams`
4. `matches`
5. `groups`
6. `group_members`
7. `group_scoring_rules`
8. `official_results`
9. `predictions`
10. `prediction_scores`
11. `group_activity` (si se incluye)

---

## 12. Resumen ejecutivo

El modelo relacional del MVP de **ElijoCreer** queda estructurado sobre cuatro ejes:

1. **Identidad**
   - `profiles`

2. **Competencia social**
   - `groups`
   - `group_members`
   - `group_scoring_rules`

3. **Torneo oficial**
   - `tournaments`
   - `teams`
   - `matches`
   - `official_results`

4. **Juego y ranking**
   - `predictions`
   - `prediction_scores`

Este modelo soporta el MVP sin trabarlo y deja abierta la puerta para:
- múltiples torneos
- reglas más complejas
- más features sociales
- mejor analítica y reporting
