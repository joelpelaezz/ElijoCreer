# Stitch — Prompt Final de Corrección MVP ElijoCreer

## Uso recomendado

Este prompt está pensado para una **última ronda corta de corrección** sobre las pantallas ya generadas.

No debe usarse para rediseñar todo desde cero.

Objetivo:
- limpiar inconsistencias
- alinear las pantallas al MVP real
- dejar el diseño listo para handoff técnico y desarrollo

---

## Prompt final

```text
Quiero hacer una última ronda de corrección sobre las interfaces ya generadas de “ElijoCreer”.

IMPORTANTE:
- no rediseñar desde cero
- conservar la identidad visual y los aciertos de las pantallas actuales
- aplicar solamente correcciones para alinear el diseño con el MVP real
- mantener la estética moderna, premium, deportiva y social inspirada en la Selección Argentina

Tomá como referencia de producto:
- ElijoCreer es una app colaborativa y social de pronósticos del Mundial 2026
- los usuarios crean cuenta, se unen a grupos públicos o privados, cargan pronósticos y compiten con ranking por grupo
- cada grupo tiene reglas de puntaje definidas por su admin
- los resultados oficiales son globales para todos los grupos

Tomá como referencia de diseño:
- paleta celeste, blanco, azul profundo y dorado sutil
- look limpio, emocional, elegante y claro
- experiencia tipo app social + fantasy sports + dashboard moderno

Ahora aplicá estas correcciones obligatorias:

1. Unificar todo el contexto del producto a Mundial 2026
- eliminar referencias a Qatar 2022
- eliminar referencias a Clausura 2026
- cualquier texto, subtítulo, etapa o ejemplo debe responder al Mundial 2026

2. Recentrar la experiencia en ranking por grupo
- bajar el protagonismo del ranking global
- si hay referencias globales, deben ser secundarias o decorativas
- el núcleo del MVP es competir dentro de grupos

3. Eliminar features fuera del MVP
- quitar Joker Prediction
- quitar Stakes o referencias a apuestas monetarias
- quitar métricas o módulos tipo System Health, Total Stakes, Points Engine visible, dashboards operativos excesivos

4. Simplificar el panel admin global
- dejarlo enfocado en:
  - cargar resultados oficiales
  - revisar fixture
  - editar estado de partidos
  - gestionar partidos pendientes
- eliminar vistas operativas complejas que no pertenecen al MVP

5. Dejar clarísimo el branding
- la marca del producto es ElijoCreer
- si aparece “La Scaloneta”, debe quedar claro que es solo un nombre de grupo de ejemplo
- ElijoCreer siempre debe ser la marca principal

6. Reforzar estados funcionales del MVP
- estados de partido consistentes: próximo, en vivo, finalizado
- estados de pronóstico consistentes: pendiente, guardado, editable, cerrado
- roles visibles cuando corresponda: admin del grupo, miembro

7. Hacer más claro el flujo de grupos
- mostrar mejor diferencia entre grupo público y privado
- reforzar el concepto de invitación por código o link
- si existe vista para unirse a grupo, mantenerla alineada con esto

8. Alinear actividad reciente con eventos reales del MVP
- usuario se unió al grupo
- usuario cargó o actualizó pronóstico
- se cargó resultado oficial
- se actualizaron reglas del grupo

9. Mantener consistencia entre mobile y desktop
- misma lógica funcional
- misma semántica de estados
- misma arquitectura mental de navegación

No agregues nuevas funcionalidades.
No expandas el producto.
Solo corregí y dejá las pantallas listas para implementar el MVP real.
```

---

## Variante corta para mobile

```text
Refiná las pantallas mobile ya generadas de ElijoCreer sin rediseñar desde cero. Conservá el estilo visual actual, pero corregí las inconsistencias para alinearlas al MVP real.

Correcciones obligatorias:
- unificar todo a Mundial 2026
- quitar referencias a Qatar 2022 y Clausura 2026
- priorizar ranking por grupo, no ranking global
- quitar Joker Prediction, Stakes y features fuera del MVP
- dejar claro que ElijoCreer es la marca y La Scaloneta solo puede ser nombre de grupo
- reforzar estados de partido: próximo, en vivo, finalizado
- reforzar estados de pronóstico: pendiente, guardado, editable, cerrado
- hacer más clara la diferencia entre grupos públicos y privados
- mostrar mejor invitación por código o link
- alinear actividad reciente a eventos reales del MVP

Mantener estética moderna, premium, deportiva y social inspirada en la Selección Argentina.
No agregar nuevas funciones. Solo corregir y dejar listo para implementación.
```

---

## Variante corta para desktop

```text
Refiná las pantallas desktop ya generadas de ElijoCreer sin rediseñar desde cero. Conservá el estilo visual actual, pero corregí las inconsistencias para alinearlas al MVP real.

Correcciones obligatorias:
- unificar todo a Mundial 2026
- quitar referencias a Qatar 2022 y Clausura 2026
- priorizar ranking por grupo, no ranking global
- quitar Joker Prediction, Stakes y features fuera del MVP
- simplificar el panel admin global para que solo cubra resultados oficiales, fixture, estado de partidos y pendientes
- dejar claro que ElijoCreer es la marca y La Scaloneta solo puede ser nombre de grupo
- reforzar estados de partido: próximo, en vivo, finalizado
- reforzar estados de pronóstico: pendiente, guardado, editable, cerrado
- hacer más clara la diferencia entre grupos públicos y privados
- mostrar mejor invitación por código o link
- alinear actividad reciente a eventos reales del MVP

Mantener estética moderna, premium, deportiva y social inspirada en la Selección Argentina.
No agregar nuevas funciones. Solo corregir y dejar listo para implementación.
```
