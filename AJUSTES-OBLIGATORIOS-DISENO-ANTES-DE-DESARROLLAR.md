# Ajustes Obligatorios de Diseño Antes de Desarrollar — ElijoCreer

## 1. Objetivo

Definir los ajustes mínimos y obligatorios que deben aplicarse a los diseños de Stitch antes de pasar a implementación.

Este documento toma como base:
- `AUDITORIA-FUNCIONAL-DISENOS-STITCH.md`
- `BACKLOG-MVP-ELIJOCREER.md`
- `DESIGN.md`

La idea NO es rediseñar todo, sino limpiar el alcance para que desarrollo no arranque sobre pantallas ambiguas.

---

## 2. Criterio de priorización

### Prioridad P1 — Bloqueante
Si no se corrige, puede romper:
- alcance del MVP
- modelo funcional
- implementación técnica
- coherencia del producto

### Prioridad P2 — Importante
No bloquea por completo, pero puede generar:
- ambigüedad funcional
- UX inconsistente
- retrabajo en frontend/backend

### Prioridad P3 — Deseable
Mejora consistencia, calidad visual o claridad narrativa.

---

## 3. Ajustes P1 — Bloqueantes

## P1.1 Unificar contexto de torneo

### Problema
En los diseños aparecen referencias mezcladas a:
- Mundial 2026
- Qatar 2022
- Clausura 2026

### Riesgo
Esto rompe la coherencia narrativa y complica:
- dataset inicial
- fixture
- copy
- validación funcional

### Ajuste obligatorio
Todas las pantallas del MVP deben referenciar exclusivamente:
- **Mundial 2026**

### Aplicar en
- carga de pronóstico
- fixture
- dashboard/home
- resultados y scoring
- ranking
- panel admin global

---

## P1.2 Alinear foco del producto al ranking por grupo

### Problema
Algunos diseños dan protagonismo a:
- ranking global
- ranking nacional
- top 5% de Argentina

### Riesgo
Eso introduce una feature no consolidada en el backlog y puede obligar a construir:
- ranking global real
- agregaciones adicionales
- lógica competitiva fuera del MVP

### Ajuste obligatorio
El foco principal del MVP debe ser:
- **ranking por grupo**

### Regla de diseño
- si se mantiene alguna referencia global, debe ser secundaria, decorativa o explícitamente futura
- no debe dominar home, grupo ni ranking principal

### Aplicar en
- home mobile
- dashboard desktop
- ranking mobile
- ranking desktop

---

## P1.3 Eliminar features fuera del MVP

### Problema
Se detectaron elementos como:
- Joker Prediction
- Stakes / apuestas monetarias
- Points Engine como feature visible de usuario
- System Health
- dashboards operativos excesivos

### Riesgo
Genera contaminación de alcance y arrastra desarrollo innecesario.

### Ajuste obligatorio
Quitar o esconder del MVP visual:
- Joker Prediction
- Total Stakes
- Health dashboards
- métricas operativas no necesarias

### Aplicar en
- dashboard desktop
- ranking desktop
- panel admin global desktop
- sidebars y CTAs secundarios

---

## P1.4 Simplificar el panel admin global

### Problema
El admin global quedó sobredimensionado para el MVP.

### Alcance correcto del admin global en MVP
Debe cubrir solamente:
- cargar resultados oficiales
- ver fixture
- editar estado de partido
- revisar cola de partidos pendientes

### Ajuste obligatorio
Eliminar o bajar de prioridad visual:
- system health
- user activity operacional
- real-time vs historical si no existe
- módulos tipo engine/analytics avanzados

### Aplicar en
- `admin_global_refinado_elijocreer`
- `panel_admin_global_elijocreer_refined`

---

## P1.5 Aclarar que ElijoCreer es la marca y no el nombre del grupo

### Problema
En algunos diseños aparece “La Scaloneta” con demasiado peso visual, lo que puede confundirse con la marca del producto.

### Ajuste obligatorio
- **Marca del producto**: `ElijoCreer`
- **Nombre de grupo demo**: puede ser `La Scaloneta`, pero debe verse claramente como nombre de grupo

### Regla visual
El branding principal siempre debe ser ElijoCreer.

### Aplicar en
- pantallas de grupo
- headers
- hero sections

---

## 4. Ajustes P2 — Importantes

## P2.1 Hacer explícito el flujo de unión a grupo

### Problema
El backlog contempla:
- unirse a grupo público
- unirse por código o link

Pero ese flujo no está suficientemente visible en las pantallas auditadas.

### Ajuste recomendado
Agregar una pantalla o estado claro para:
- ingresar código
- pegar/encontrar link
- explorar grupo público

### Aplicar en
- home
- crear/unirse a grupo
- onboarding autenticado

---

## P2.2 Endurecer estados de pronóstico

### Problema
Se sugiere que un pronóstico puede cerrarse, pero no siempre queda visualmente inequívoco.

### Ajuste recomendado
Definir estados visuales consistentes:
- pendiente
- guardado
- editable
- cerrado

### Aplicar en
- fixture
- carga de pronóstico
- home
- grupo

---

## P2.3 Endurecer estados de partido

### Problema
Los estados aparecen, pero no siempre con patrón totalmente consistente.

### Ajuste recomendado
Usar un set fijo de estados:
- próximo
- en vivo
- finalizado

### Regla
Mismo badge, mismo color, misma semántica en todas las pantallas.

---

## P2.4 Hacer más explícito el rol del usuario dentro del grupo

### Problema
El backlog distingue:
- admin de grupo
- miembro

Pero el diseño no siempre lo hace obvio.

### Ajuste recomendado
Agregar señales claras:
- badge admin
- badge miembro
- permisos visibles solo donde corresponda

### Aplicar en
- grupo
- administración del grupo
- reglas del grupo

---

## P2.5 Aterrizar mejor la actividad reciente

### Problema
La actividad reciente está bien como idea, pero debe corresponder a eventos reales del modelo.

### Eventos válidos para MVP
- usuario se unió al grupo
- cargó pronóstico
- actualizó pronóstico
- se cargó resultado oficial
- se actualizaron reglas

### Ajuste recomendado
Evitar actividades abstractas sin correlato funcional.

---

## 5. Ajustes P3 — Deseables

## P3.1 Unificar tono textual

### Ajuste recomendado
Revisar que el copy use un mismo tono:
- cercano
- futbolero
- simple
- sin vocabulario técnico innecesario

---

## P3.2 Unificar navegación entre mobile y desktop

### Ajuste recomendado
Mantener consistencia conceptual entre secciones:
- Dashboard / Inicio
- Mis grupos
- Fixture / Partidos
- Ranking
- Reglas
- Perfil

No hace falta que el layout sea idéntico, pero sí la arquitectura mental.

---

## P3.3 Refinar semántica de métricas

### Ajuste recomendado
Definir y mantener consistencia en métricas como:
- puntos
- exactos
- aciertos
- tendencia
- pendientes

---

## 6. Lista de chequeo antes de congelar diseño

## Branding
- [ ] El producto se llama ElijoCreer en todas las pantallas
- [ ] Los nombres de grupos demo no compiten con la marca

## Contexto
- [ ] Todo está alineado a Mundial 2026
- [ ] No quedan referencias a Qatar 2022
- [ ] No quedan referencias a Clausura 2026

## Alcance MVP
- [ ] No aparecen Joker Prediction ni mecánicas no aprobadas
- [ ] No aparecen Stakes o lenguaje de apuestas monetarias
- [ ] El panel admin global está reducido a lo esencial del MVP

## Experiencia funcional
- [ ] El foco principal es ranking por grupo
- [ ] Existe forma clara de unirse a grupo
- [ ] Los estados de partido son consistentes
- [ ] Los estados de pronóstico son consistentes
- [ ] Los roles admin/member son visibles cuando corresponde

## Consistencia
- [ ] Actividad reciente responde a eventos reales
- [ ] Mobile y desktop comparten misma lógica funcional
- [ ] Las reglas del grupo se entienden fácil

---

## 7. Recomendación final

No hace falta otra ronda gigante de diseño.

La jugada correcta es:
1. aplicar estos ajustes mínimos
2. volver a validar rápido contra backlog
3. congelar pantallas MVP
4. recién ahí pasar a backlog técnico / implementación

---

## 8. Resultado esperado

Una vez aplicados estos ajustes, las pantallas quedan:
- coherentes con el backlog
- alineadas con el modelo técnico
- limpias de features fuera de alcance
- listas para handoff de desarrollo
