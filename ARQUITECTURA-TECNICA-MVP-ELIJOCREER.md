# Arquitectura Técnica MVP — ElijoCreer

## 1. Objetivo

Definir la arquitectura técnica del MVP de **ElijoCreer**, una aplicación web colaborativa de pronósticos para el Mundial 2026.

Este documento define:
- stack recomendado
- módulos del sistema
- arquitectura lógica
- modelo de datos conceptual
- seguridad y permisos
- estrategia de despliegue
- decisiones de escalabilidad para futuros torneos

---

## 2. Principios de arquitectura

### 2.1 Principios base
1. **MVP primero**: resolver el caso de uso del Mundial 2026 sin sobreingeniería.
2. **Escalable después**: aunque el MVP sea de un solo torneo, el diseño debe permitir crecer.
3. **Multi-tenant por grupo**: la competencia y reglas viven a nivel grupo.
4. **Resultado oficial único**: los resultados reales son globales para todos los grupos.
5. **Producto social antes que portal admin**: la experiencia principal es usuario + grupo + ranking.
6. **Seguridad desde el diseño**: aislamiento por usuario, grupo y rol.

---

## 3. Stack recomendado

## 3.1 Frontend
- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- Componentización orientada a features

### ¿Por qué?
- SSR/CSR híbrido
- muy buen fit para producto web social
- velocidad de iteración alta
- ecosistema sólido
- buen despliegue en Vercel

---

## 3.2 Backend y plataforma
- **Supabase**
  - Auth
  - Postgres
  - Row Level Security
  - opcional: Edge Functions para procesos específicos

### ¿Por qué?
- auth integrada
- base relacional ideal para grupos, partidos, rankings y reglas
- RLS útil para proteger acceso por usuario y grupo
- acelera mucho el MVP

---

## 3.3 Deploy
- **Vercel** para frontend
- **Supabase Cloud** para backend y base de datos

---

## 4. Arquitectura de alto nivel

```text
[ Navegador / Mobile Web ]
          |
          v
 [ Next.js App - UI + BFF liviano ]
          |
          +----------------------+
          |                      |
          v                      v
 [ Supabase Auth ]       [ Supabase Postgres ]
                                  |
                                  v
                        [ Reglas, grupos, partidos,
                          pronósticos, resultados,
                          scoring y ranking ]
```

---

## 5. Capas del sistema

## 5.1 Capa de presentación
Responsabilidad:
- renderizar pantallas
- gestionar navegación
- mostrar estados visuales
- capturar acciones del usuario

Incluye:
- landing
- login/registro
- home
- grupo
- fixture
- pronóstico
- ranking
- perfil
- administración

---

## 5.2 Capa de aplicación
Responsabilidad:
- coordinar casos de uso
- validar reglas del flujo
- decidir qué acciones están permitidas

Casos de uso principales:
- registrar usuario
- crear grupo
- unirse a grupo
- configurar reglas del grupo
- cargar pronóstico
- cerrar edición de pronóstico
- cargar resultado oficial
- recalcular scoring por grupo
- construir ranking

---

## 5.3 Capa de dominio
Responsabilidad:
- encapsular reglas de negocio

Conceptos de dominio principales:
- Usuario
- Grupo
- Miembro de grupo
- Partido
- Pronóstico
- Resultado oficial
- Regla de puntaje
- Puntaje calculado
- Ranking

Reglas críticas:
- un usuario puede pertenecer a varios grupos
- un grupo define sus propias reglas de puntaje
- un pronóstico queda bloqueado al iniciar el partido
- el resultado oficial es global
- el ranking se calcula por grupo

---

## 5.4 Capa de datos
Responsabilidad:
- persistencia
- consultas
- control de acceso a registros

Tecnología principal:
- Postgres (Supabase)

---

## 6. Módulos funcionales

## 6.1 Módulo de identidad y acceso
Responsabilidades:
- registro
- login
- sesión
- perfil básico

Actores:
- visitante
- usuario autenticado

---

## 6.2 Módulo de grupos
Responsabilidades:
- crear grupo
- gestionar visibilidad pública/privada
- unirse por código o enlace
- listar miembros
- administrar grupo

---

## 6.3 Módulo de reglas de puntaje
Responsabilidades:
- guardar configuración del grupo
- mostrar resumen entendible del scoring
- permitir cambios del admin

Importante:
Las reglas pertenecen al grupo, no al torneo.

---

## 6.4 Módulo de torneo y fixture
Responsabilidades:
- gestionar partidos del Mundial 2026
- guardar equipos, fases, fechas y estados
- exponer fixture filtrable

---

## 6.5 Módulo de pronósticos
Responsabilidades:
- cargar pronóstico por usuario, grupo y partido
- editar antes del inicio
- bloquear al comenzar el partido
- indicar estado del pronóstico

---

## 6.6 Módulo de resultados oficiales
Responsabilidades:
- carga global de resultados
- administración del fixture
- publicación del resultado final

Actores:
- admin global

---

## 6.7 Módulo de scoring y ranking
Responsabilidades:
- comparar resultado oficial vs pronóstico
- calcular puntos según reglas del grupo
- generar ranking por grupo
- exponer detalle por partido y acumulado

---

## 6.8 Módulo social básico
Responsabilidades:
- home del usuario
- actividad reciente simple
- visualización del ranking
- sensación de comunidad

---

## 7. Modelo de datos conceptual

## 7.1 Entidades principales

### users
Representa a cada persona autenticada.

Campos conceptuales:
- id
- email
- display_name
- avatar_url
- created_at

---

### groups
Representa un grupo de competencia.

Campos conceptuales:
- id
- name
- description
- visibility (`public` | `private`)
- invite_code
- owner_user_id
- created_at

---

### group_members
Relaciona usuarios con grupos.

Campos conceptuales:
- id
- group_id
- user_id
- role (`admin` | `member`)
- joined_at

---

### tournaments
Permite escalar a futuro.

En MVP:
- un torneo: Mundial 2026

Campos conceptuales:
- id
- name
- slug
- year
- status

---

### teams
Equipos del torneo.

Campos conceptuales:
- id
- tournament_id
- name
- short_name
- code
- crest_url

---

### matches
Partidos oficiales del torneo.

Campos conceptuales:
- id
- tournament_id
- stage
- round_label
- home_team_id
- away_team_id
- starts_at
- status (`scheduled` | `live` | `finished`)

---

### official_results
Resultado real del partido.

Campos conceptuales:
- id
- match_id
- home_score
- away_score
- loaded_by
- loaded_at

---

### group_scoring_rules
Reglas de puntaje por grupo.

Campos conceptuales:
- id
- group_id
- exact_score_points
- outcome_points
- bonus_points
- updated_by
- updated_at

---

### predictions
Pronóstico de un usuario dentro de un grupo para un partido.

Campos conceptuales:
- id
- group_id
- match_id
- user_id
- predicted_home_score
- predicted_away_score
- is_locked
- created_at
- updated_at

---

### prediction_scores
Resultado del cálculo de puntaje.

Campos conceptuales:
- id
- prediction_id
- group_id
- user_id
- points_awarded
- scoring_reason
- calculated_at

---

## 7.2 Relaciones clave
- `users` 1..N `group_members`
- `groups` 1..N `group_members`
- `groups` 1..1 `group_scoring_rules` o 1..N histórico si se versiona
- `tournaments` 1..N `teams`
- `tournaments` 1..N `matches`
- `matches` 1..1 `official_results`
- `users` + `groups` + `matches` → `predictions`
- `predictions` 1..1 `prediction_scores` en el modelo base del MVP

---

## 8. Roles y permisos

## 8.1 Visitante
Puede:
- ver landing
- registrarse
- iniciar sesión

No puede:
- crear pronósticos
- ver contenido privado de grupos

---

## 8.2 Usuario autenticado
Puede:
- crear grupo
- unirse a grupo
- ver fixture
- cargar pronósticos en sus grupos
- ver ranking de sus grupos
- ver su perfil

---

## 8.3 Admin de grupo
Puede además:
- editar grupo
- cambiar visibilidad
- compartir invitación
- configurar reglas de puntaje
- gestionar estructura básica del grupo

---

## 8.4 Admin global
Puede además:
- administrar partidos
- cargar resultados oficiales
- mantener datos del torneo

---

## 9. Seguridad

## 9.1 Autenticación
Implementar con Supabase Auth.

---

## 9.2 Autorización
Implementar por combinación de:
- rol del usuario
- pertenencia al grupo
- ownership de datos
- políticas RLS en base de datos

---

## 9.3 Regla de seguridad crítica
Un usuario solo debe poder:
- leer grupos donde participa, salvo grupos públicos permitidos
- crear/editar sus propios pronósticos
- ver ranking y datos de grupos a los que pertenece o públicos según la estrategia elegida

---

## 9.4 RLS recomendada
Aplicar RLS al menos sobre:
- groups
- group_members
- group_scoring_rules
- predictions
- prediction_scores

Patrones esperados:
- lectura por membresía
- escritura solo sobre recursos propios o administrables
- administración restringida por rol

---

## 10. Estrategia de cálculo de puntajes

## 10.1 Opción recomendada para MVP
Persistir el pronóstico y el resultado oficial por separado, y almacenar el resultado del cálculo en una tabla de scoring.

### Ventajas
- trazabilidad
- debugging más fácil
- ranking más rápido de consultar
- permite recalcular si cambian reglas

---

## 10.2 Momento del cálculo
Disparadores posibles:
- cuando se carga un resultado oficial
- cuando cambian reglas del grupo

### Recomendación MVP
- cálculo al cargar resultado oficial
- recalculo manual o controlado si cambian reglas

---

## 11. Estrategia de ranking

El ranking debe construirse por grupo, sumando los puntos acumulados de `prediction_scores`.

### Métricas mínimas
- posición
- usuario
- puntos totales
- cantidad de aciertos

### Métricas opcionales
- racha
- tendencia
- exactos acertados

---

## 12. Estrategia de UI y routing

## 12.1 Rutas sugeridas
- `/` landing
- `/login`
- `/register`
- `/home`
- `/groups/new`
- `/groups/[groupId]`
- `/groups/[groupId]/ranking`
- `/groups/[groupId]/rules`
- `/groups/[groupId]/admin`
- `/fixture`
- `/profile`
- `/admin/matches`
- `/admin/results`

---

## 12.2 Organización sugerida del frontend

```text
src/
  app/
  features/
    auth/
    groups/
    fixture/
    predictions/
    scoring/
    ranking/
    profile/
    admin/
  components/
  lib/
  services/
```

Esto ayuda a que el proyecto crezca por dominio y no por caos de carpetas.

---

## 13. Observabilidad mínima para MVP

No hace falta locura cósmica de observabilidad en el MVP, pero sí conviene tener:
- logs de errores de autenticación
- logs de carga de resultados oficiales
- trazabilidad del cálculo de puntajes
- registro de cambios de reglas del grupo

---

## 14. Escalabilidad futura

Aunque el MVP sea Mundial 2026, la arquitectura debe dejar preparado:

### 14.1 Multi-torneo
- tabla `tournaments`
- relación de equipos y partidos por torneo

### 14.2 Historial de reglas
- posibilidad de versionar reglas por grupo

### 14.3 Nuevos tipos de scoring
- bonus por fase
- predicciones especiales
- desempates

### 14.4 Nuevas experiencias sociales
- actividad avanzada
- comparativas entre usuarios
- insignias/logros

---

## 15. Decisiones técnicas recomendadas

1. **No hardcodear el Mundial 2026 en el modelo**, solo en el dataset inicial.
2. **No mezclar resultado oficial con pronóstico**.
3. **No calcular ranking exclusivamente en frontend**.
4. **No permitir reglas de puntaje sin validación**.
5. **No dejar permisos del grupo resueltos solo desde la UI**; deben existir en base de datos también.

---

## 16. Riesgos técnicos

### Riesgo 1
Cambiar reglas de puntaje después de haber calculado puntos.

Mitigación:
- recalculo controlado por grupo
- guardar scoring por registro y no solo en memoria

### Riesgo 2
Usuarios viendo datos de grupos que no les corresponden.

Mitigación:
- RLS por membresía
- separación clara entre grupos públicos y privados

### Riesgo 3
Pronósticos editables fuera de tiempo.

Mitigación:
- validación en backend y base
- no depender solo del frontend

### Riesgo 4
Pantallas admin demasiado acopladas al resto del producto.

Mitigación:
- separar módulo admin global
- mantener diseño consistente, pero responsabilidades distintas

---

## 17. Resumen ejecutivo

La arquitectura técnica recomendada para el MVP de **ElijoCreer** es:

- **Frontend**: Next.js + TypeScript + Tailwind
- **Backend/DB/Auth**: Supabase
- **Modelo central**: grupos, miembros, reglas, partidos, resultados oficiales, pronósticos y scoring
- **Seguridad**: Auth + RLS por pertenencia y rol
- **Escalabilidad**: estructura preparada para futuros torneos sin complejizar de más el MVP

Esta arquitectura prioriza:
- velocidad de salida
- claridad funcional
- seguridad razonable
- escalabilidad ordenada
