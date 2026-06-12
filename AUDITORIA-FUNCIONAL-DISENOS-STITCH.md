# Auditoría Funcional de Diseños Stitch — ElijoCreer

## 1. Objetivo

Auditar las interfaces exportadas en `/designs` contra:

- `BACKLOG-MVP-ELIJOCREER.md`
- `DESIGN.md`
- `ARQUITECTURA-TECNICA-MVP-ELIJOCREER.md`

El objetivo es identificar:
- cobertura funcional real
- pantallas faltantes
- inconsistencias de negocio
- inconsistencias de marca/UX
- ajustes recomendados antes de implementar

---

## 2. Material auditado

### Estructura detectada
- `designs/mobile/`
- `designs/desktop/`

### Tipo de artefactos encontrados
- `screen.png`
- `code.html`
- variantes base y refinadas

### Cobertura general observada
Se encontraron diseños para:
- landing
- login
- registro
- dashboard / inicio
- grupo
- fixture
- carga de pronóstico
- ranking
- reglas del grupo
- perfil
- administración de grupo
- panel admin global
- resultados / puntos

Conclusión inicial: **la cobertura de pantallas del MVP es alta**.

---

## 3. Resumen ejecutivo

### Estado general
Los diseños cubren bien el MVP a nivel visual y flujo principal.

### Fortaleza principal
La experiencia ya transmite:
- identidad futbolera
- clima premium/deportivo
- foco en ranking, grupo y competencia
- buena separación entre experiencia jugador y experiencia admin

### Problema principal
Hay **inconsistencias funcionales y narrativas** que, si no se corrigen antes de desarrollar, pueden contaminar implementación, datos y copy.

### Veredicto
**Aptos para continuar**, pero necesitan una ronda corta de ajuste funcional/documental antes de construir.

---

## 4. Cobertura funcional contra backlog

## 4.1 Acceso y cuenta

| Feature | Estado | Observación |
|---|---|---|
| Landing | Cubierto | Presente en mobile y desktop |
| Login | Cubierto | Presente |
| Registro | Cubierto | Presente |
| Perfil básico | Cubierto | Presente en mobile y desktop, con stats |

### Evaluación
Buen nivel de cobertura.

---

## 4.2 Gestión de grupos

| Feature | Estado | Observación |
|---|---|---|
| Crear grupo | Cubierto | Presente |
| Ver grupo | Cubierto | Presente |
| Administración del grupo | Cubierto | Presente |
| Público / privado | Parcial | Se ve en algunas variantes, pero no siempre es claro |
| Unirse por código/link | Parcial | Se ve código/link en grupo/admin, pero no el flujo explícito de ingreso |

### Evaluación
Cobertura sólida, pero faltaría reforzar mejor el flujo de **join group** como caso de uso explícito.

---

## 4.3 Reglas de puntaje por grupo

| Feature | Estado | Observación |
|---|---|---|
| Configuración de reglas | Cubierto | Presente en mobile y desktop |
| Explicación de scoring | Cubierto | Presente |
| Edición por admin de grupo | Parcial | Visualmente sugerido, pero no siempre explicitado |

### Evaluación
Muy bien resuelto a nivel visual.

---

## 4.4 Fixture del Mundial 2026

| Feature | Estado | Observación |
|---|---|---|
| Vista de fixture | Cubierto | Presente |
| Filtros por fase/estado | Parcial | Hay señales visuales, pero no siempre es evidente la capacidad real de filtrado |
| Estado de partido | Cubierto | Próximo / en vivo / finalizado aparecen bien |

### Evaluación
Buena base visual, pero conviene endurecer la semántica de filtros.

---

## 4.5 Pronósticos

| Feature | Estado | Observación |
|---|---|---|
| Cargar pronóstico | Cubierto | Presente |
| Editar antes del cierre | Parcial | El mensaje existe, pero faltan estados UX más explícitos |
| Bloqueo al iniciar partido | Parcial | Hay hints visuales, pero no siempre queda inequívoco |
| Pendientes en home | Cubierto | Visible |

### Evaluación
Muy bien orientado, pero necesita reglas de cierre todavía más claras para implementación.

---

## 4.6 Resultados oficiales y scoring

| Feature | Estado | Observación |
|---|---|---|
| Resultado oficial | Cubierto | Presente en diseños de resultados y admin |
| Comparación pronóstico vs real | Cubierto | Presente |
| Motivo del puntaje | Parcial | Se sugiere, pero podría explicitarse mejor |
| Carga global por admin | Cubierto | Presente |

### Evaluación
Cobertura buena.

---

## 4.7 Ranking

| Feature | Estado | Observación |
|---|---|---|
| Ranking del grupo | Cubierto | Presente |
| Top 3 destacado | Cubierto | Presente |
| Tabla detallada | Cubierto | Presente |
| Métricas complementarias | Parcial | Hay tendencia/exactos en algunos casos, no siempre consistente |

### Evaluación
Muy buen nivel.

---

## 4.8 Home y capa social

| Feature | Estado | Observación |
|---|---|---|
| Home con pendientes | Cubierto | Presente |
| Mis grupos | Cubierto | Presente |
| Actividad reciente | Parcial | Aparece sugerida, pero no siempre consistente |
| Sensación social | Cubierto | Muy lograda visualmente |

### Evaluación
Buen trabajo, aunque la actividad reciente podría aterrizarse mejor a eventos reales del backlog.

---

## 5. Hallazgos críticos

## 5.1 Inconsistencia de naming dentro de pantallas

Se detectan referencias a:
- `ElijoCreer`
- `La Scaloneta`

Ejemplos observados:
- grupo “La Scaloneta” como nombre interno de grupo → correcto si es ejemplo de grupo
- pero también aparece fuerte en títulos/identidad de algunas pantallas, lo cual puede confundirse con la marca del producto

### Recomendación
- **Marca del producto**: `ElijoCreer`
- **Nombre de grupo demo**: puede ser `La Scaloneta`, pero debe quedar claro que es un grupo, no la app

---

## 5.2 Inconsistencia de torneo / contexto temporal

Se detectaron referencias incompatibles con el MVP:
- `World Cup 2026`
- `Qatar 2022`
- `Clausura 2026`

Esto es un problema REAL, no cosmético.

### Por qué importa
Porque rompe:
- coherencia narrativa
- modelo de datos
- copy del producto
- fixtures y etapas del backlog

### Recomendación
Unificar TODO el producto demo a:
- **Mundial 2026**

Eliminar de las pantallas demo:
- Qatar 2022
- Clausura 2026
- cualquier copy de ligas distintas si el MVP es mundialista

---

## 5.3 Desalineación entre “ranking global” y “ranking por grupo”

En varios diseños aparece:
- ranking global
- rank nacional
- top 5% de Argentina

Pero el MVP funcional actual está centrado en:
- ranking por grupo
- competencia entre miembros del grupo

### Riesgo
Si se desarrolla así, el producto puede terminar con dos modelos competitivos simultáneos sin decisión de negocio formal.

### Recomendación
Para MVP:
- priorizar **ranking por grupo**
- si querés mostrar ranking global, dejarlo como **feature futura** o como elemento secundario no estructural

---

## 5.4 Presencia de features fuera del MVP

Se detectan elementos como:
- `Place Joker Prediction`
- `Total Stakes`
- lenguaje cercano a betting engine
- `System Health`
- `Points Engine`

### Problema
Eso mete ruido conceptual porque el MVP definido NO incluye:
- apuestas monetarias
- Joker mechanics
- observabilidad operativa compleja para usuario final

### Recomendación
Quitar o despriorizar del prototipo de MVP:
- Joker Prediction
- Stakes
- cualquier mecánica no aprobada en backlog

---

## 5.5 Admin global sobrediseñado para el MVP

El panel admin refinado desktop incluye cosas como:
- system health
- user activity
- live operations
- real-time / historical

### Problema
Está buenísimo visualmente, pero para MVP puede empujar desarrollo innecesario.

### Recomendación
Recortar el alcance del admin global a:
- cargar resultados oficiales
- gestionar fixture
- editar estado de partidos
- confirmar actualizaciones

Todo lo demás puede quedar como evolución futura.

---

## 5.6 Home con foco ambiguo

En algunos dashboards aparece foco en:
- ranking global
- métricas personales avanzadas
- navegación casi de fantasy app

Cuando el backlog pide que el foco principal sea:
- grupos del usuario
- próximos partidos
- pronósticos pendientes
- ranking del grupo

### Recomendación
Reordenar prioridades visuales:
1. pendientes
2. grupos
3. próximos partidos
4. ranking del grupo
5. actividad reciente

---

## 6. Hallazgos de UX

## 6.1 Lo que está muy bien
- lenguaje visual deportivo premium
- cards, badges y jerarquía visual fuertes
- ranking emocionalmente atractivo
- distinción usuario vs admin
- mobile con buena intención táctil
- desktop con mucha presencia de producto

---

## 6.2 Lo que conviene ajustar

### A. Estados de pronóstico
Deberían quedar más duros y explícitos:
- pendiente
- guardado
- editable
- cerrado

### B. Estados de grupo
Deberían verse más claramente:
- público
- privado
- admin
- miembro

### C. Flujos de join group
Falta visualización explícita del flujo de:
- ingresar código
- aceptar invitación
- unirse a grupo público

### D. Reglas de puntaje
Están bien, pero conviene mostrar mejor:
- qué regla aplica por partido
- que no necesariamente todo acumula
- si el bonus está activo o no

---

## 7. Hallazgos técnicos implícitos desde el diseño

Los diseños implican varios contratos funcionales que conviene documentar antes de construir:

1. El home necesita una consulta agregada por usuario.
2. El ranking necesita sumatorias rápidas por grupo.
3. La vista de grupo necesita miembros + ranking + partidos + actividad.
4. La carga de pronóstico necesita validación por hora de inicio.
5. El admin global necesita flujos simples de edición de resultado y estado de partido.

Esto confirma que el modelo relacional y la arquitectura planteados VAN BIEN.

---

## 8. Recomendaciones concretas antes de desarrollar

## Prioridad Alta
1. Unificar el contexto demo a **Mundial 2026**.
2. Eliminar referencias a `Qatar 2022` y `Clausura 2026`.
3. Bajar protagonismo de “ranking global” y reforzar “ranking del grupo”.
4. Eliminar features fuera de MVP: Joker, Stakes, Health, etc.
5. Simplificar el panel admin global al alcance real del backlog.

## Prioridad Media
6. Agregar o refinar pantalla/estado de unión a grupo.
7. Endurecer estados de pronóstico y partido.
8. Mostrar mejor rol del usuario en grupo (admin/member).
9. Aterrizar actividad reciente a eventos reales del modelo.

## Prioridad Baja
10. Revisar copy para que todo mantenga el mismo tono rioplatense o neutral producto.
11. Revisar naming de ejemplos de grupos para no mezclarlo con la marca.

---

## 9. Decisión recomendada

**No rediseñar todo.**

La recomendación correcta es:
- conservar la base visual
- hacer una ronda corta de limpieza funcional
- congelar pantallas del MVP
- recién después pasar a implementación

---

## 10. Conclusión final

Los diseños de Stitch están **bien encaminados y muy aprovechables**.

### Nivel de madurez actual
- **Visual**: alto
- **Funcional**: medio/alto
- **Alineación con MVP**: buena, pero con contaminación de features y copies fuera de alcance

### Estado recomendado
**Apto para pre-handoff**, con una corrección funcional corta antes de desarrollar.
