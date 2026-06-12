# Backlog Funcional MVP — ElijoCreer

## Objetivo del MVP

Construir una aplicación web colaborativa de pronósticos para el **Mundial 2026**, donde usuarios puedan crear cuenta, unirse a grupos públicos o privados, cargar sus predicciones, competir con reglas configurables por grupo y visualizar rankings sociales.

---

## Alcance del MVP

### Incluye
- autenticación de usuarios
- creación y unión a grupos
- grupos públicos y privados
- configuración de reglas de puntaje por grupo
- fixture del Mundial 2026
- carga de pronósticos por partido
- cierre de pronósticos al comenzar el partido
- carga de resultados oficiales globales
- cálculo de puntos por grupo
- ranking por grupo
- perfil básico con estadísticas

### No incluye por ahora
- múltiples torneos activos
- chat en tiempo real
- pagos
- premios monetarios
- notificaciones push avanzadas
- integraciones externas complejas

---

## Épica 1 — Acceso y cuenta de usuario

### Feature 1.1 — Registro e inicio de sesión

#### User Story 1.1.1
**Como** visitante  
**Quiero** crear una cuenta  
**Para** participar en grupos y cargar mis pronósticos.

**Criterios de aceptación**
- el usuario puede registrarse con email y contraseña
- el sistema valida datos obligatorios
- el usuario queda autenticado al completar el registro
- si hay error, se informa de manera clara

#### User Story 1.1.2
**Como** usuario registrado  
**Quiero** iniciar sesión  
**Para** acceder a mis grupos, pronósticos y ranking.

**Criterios de aceptación**
- el usuario puede iniciar sesión con sus credenciales
- el sistema muestra error si las credenciales son inválidas
- la sesión persiste según la configuración esperada

---

### Feature 1.2 — Perfil básico

#### User Story 1.2.1
**Como** usuario autenticado  
**Quiero** ver mi perfil  
**Para** consultar mis estadísticas y participación.

**Criterios de aceptación**
- el perfil muestra nombre y avatar o inicial
- el perfil muestra grupos en los que participa
- el perfil muestra estadísticas básicas del torneo

---

## Épica 2 — Gestión de grupos

### Feature 2.1 — Crear grupo

#### User Story 2.1.1
**Como** usuario autenticado  
**Quiero** crear un grupo  
**Para** competir con amigos, familia u oficina.

**Criterios de aceptación**
- el usuario puede definir nombre y descripción
- el usuario puede elegir si el grupo es público o privado
- el creador queda asignado como admin del grupo
- el grupo queda disponible para ser compartido

---

### Feature 2.2 — Unirse a grupo

#### User Story 2.2.1
**Como** usuario autenticado  
**Quiero** unirme a un grupo público  
**Para** empezar a competir sin invitación manual.

**Criterios de aceptación**
- el usuario puede descubrir y entrar a grupos públicos
- al unirse, pasa a formar parte del ranking del grupo

#### User Story 2.2.2
**Como** usuario autenticado  
**Quiero** unirme a un grupo privado mediante código o link  
**Para** participar en una competencia cerrada.

**Criterios de aceptación**
- el sistema acepta un código o enlace válido
- si el acceso es correcto, el usuario se incorpora al grupo
- si el código no es válido, se muestra error claro

---

### Feature 2.3 — Administración del grupo

#### User Story 2.3.1
**Como** admin de grupo  
**Quiero** gestionar miembros y accesos  
**Para** controlar quién participa.

**Criterios de aceptación**
- el admin puede ver los miembros del grupo
- el admin puede compartir código o link de invitación
- el admin puede identificar el tipo de grupo: público o privado

#### User Story 2.3.2
**Como** admin de grupo  
**Quiero** editar la configuración básica del grupo  
**Para** mantener la competencia organizada.

**Criterios de aceptación**
- el admin puede editar nombre y descripción
- el admin puede cambiar visibilidad pública/privada
- los cambios impactan en la vista del grupo

---

## Épica 3 — Reglas de puntaje por grupo

### Feature 3.1 — Configurar sistema de puntaje

#### User Story 3.1.1
**Como** admin de grupo  
**Quiero** definir las reglas de puntaje  
**Para** personalizar la competencia de mi grupo.

**Criterios de aceptación**
- el admin puede definir puntos por resultado exacto
- el admin puede definir puntos por acertar ganador o empate
- el admin puede configurar bonus opcionales
- el sistema valida que las reglas tengan formato correcto

#### User Story 3.1.2
**Como** miembro del grupo  
**Quiero** ver cómo se calculan los puntos  
**Para** entender las reglas de mi competencia.

**Criterios de aceptación**
- el grupo muestra un resumen claro del sistema de puntaje
- el resumen está visible sin lenguaje técnico innecesario

---

## Épica 4 — Fixture del Mundial 2026

### Feature 4.1 — Visualización de partidos

#### User Story 4.1.1
**Como** usuario autenticado  
**Quiero** ver el fixture del Mundial 2026  
**Para** conocer los partidos y cargar mis pronósticos.

**Criterios de aceptación**
- el usuario ve partidos por fase y fecha
- cada partido muestra equipos, fecha, hora y estado
- el sistema distingue al menos: próximo, en juego y finalizado

#### User Story 4.1.2
**Como** usuario autenticado  
**Quiero** filtrar partidos  
**Para** enfocarme en una fase o jornada concreta.

**Criterios de aceptación**
- el fixture permite filtrar por fase
- el fixture permite filtrar por estado

---

## Épica 5 — Pronósticos

### Feature 5.1 — Cargar pronóstico

#### User Story 5.1.1
**Como** usuario autenticado y miembro de un grupo  
**Quiero** cargar mi pronóstico para un partido  
**Para** participar del ranking del grupo.

**Criterios de aceptación**
- el usuario puede ingresar goles para ambos equipos
- el sistema asocia el pronóstico al usuario, grupo y partido
- el pronóstico queda guardado correctamente

#### User Story 5.1.2
**Como** usuario autenticado  
**Quiero** editar mi pronóstico antes del inicio del partido  
**Para** corregir mi apuesta antes del cierre.

**Criterios de aceptación**
- el usuario puede editar mientras el partido no haya comenzado
- al comenzar el partido, el pronóstico queda bloqueado
- el sistema informa visualmente si sigue editable o ya cerró

---

### Feature 5.2 — Estado del pronóstico

#### User Story 5.2.1
**Como** usuario autenticado  
**Quiero** ver si ya pronostiqué o no un partido  
**Para** saber qué tengo pendiente.

**Criterios de aceptación**
- el sistema indica si el partido está pendiente, pronosticado o cerrado
- la home puede mostrar pronósticos pendientes

---

## Épica 6 — Resultados oficiales

### Feature 6.1 — Gestión global de resultados

#### User Story 6.1.1
**Como** admin global  
**Quiero** cargar el resultado oficial de un partido  
**Para** habilitar el cálculo de puntos y ranking.

**Criterios de aceptación**
- el admin global puede cargar goles oficiales
- el sistema vincula ese resultado al partido correcto
- el resultado queda visible para todos los grupos

#### User Story 6.1.2
**Como** usuario  
**Quiero** ver el resultado oficial del partido  
**Para** comparar mi pronóstico con lo sucedido.

**Criterios de aceptación**
- cada partido finalizado muestra el resultado oficial
- el resultado es único y común para todos los grupos

---

## Épica 7 — Cálculo de puntaje y ranking

### Feature 7.1 — Scoring por grupo

#### User Story 7.1.1
**Como** miembro de un grupo  
**Quiero** recibir puntos según las reglas configuradas por ese grupo  
**Para** competir bajo la lógica elegida por el admin.

**Criterios de aceptación**
- el sistema calcula puntos según reglas del grupo
- el cálculo se realiza usando el resultado oficial y el pronóstico del usuario
- el puntaje queda asociado al grupo, no globalmente

#### User Story 7.1.2
**Como** miembro de un grupo  
**Quiero** ver por qué recibí determinada puntuación  
**Para** entender el scoring.

**Criterios de aceptación**
- el sistema indica si acertó exacto, ganador/empate u otra condición
- el detalle de puntos es visible por partido

---

### Feature 7.2 — Ranking del grupo

#### User Story 7.2.1
**Como** miembro de un grupo  
**Quiero** ver la tabla de posiciones  
**Para** saber cómo voy respecto de los demás.

**Criterios de aceptación**
- el ranking muestra al menos posición, nombre y puntos
- el ranking puede mostrar aciertos o métricas complementarias
- el top 3 puede destacarse visualmente

#### User Story 7.2.2
**Como** miembro de un grupo  
**Quiero** que el ranking se actualice con los resultados oficiales  
**Para** ver la competencia al día.

**Criterios de aceptación**
- luego de cargar un resultado oficial, el ranking refleja los nuevos puntajes

---

## Épica 8 — Home social y experiencia de uso

### Feature 8.1 — Resumen del usuario

#### User Story 8.1.1
**Como** usuario autenticado  
**Quiero** ver una home con mis grupos, pendientes y actividad  
**Para** entrar rápido a lo importante.

**Criterios de aceptación**
- la home muestra grupos del usuario
- la home muestra próximos partidos
- la home muestra pronósticos pendientes
- la home muestra accesos rápidos al ranking y a pronosticar

---

### Feature 8.2 — Vista social del grupo

#### User Story 8.2.1
**Como** miembro de un grupo  
**Quiero** ver una vista principal del grupo  
**Para** sentir la competencia y actividad compartida.

**Criterios de aceptación**
- la vista del grupo muestra ranking resumido
- muestra miembros del grupo
- muestra próximos partidos
- puede mostrar actividad reciente simple del grupo

---

## Prioridad sugerida de implementación

### Prioridad Alta
1. registro / login
2. crear grupo
3. unirse a grupo
4. fixture del Mundial 2026
5. cargar pronóstico
6. cierre de pronóstico por hora
7. cargar resultados oficiales
8. calcular puntos por grupo
9. ranking del grupo

### Prioridad Media
10. perfil del usuario
11. configuración de reglas del grupo
12. administración del grupo
13. home con pendientes y actividad

### Prioridad Baja para MVP inicial
14. actividad social ampliada
15. logros o insignias
16. comparativas avanzadas entre usuarios

---

## Reglas funcionales transversales

1. El torneo del MVP es solo **Mundial 2026**.
2. Los resultados oficiales son globales y comunes a todos los grupos.
3. Las reglas de puntaje son propias de cada grupo.
4. Un usuario puede pertenecer a múltiples grupos.
5. Un pronóstico no puede editarse una vez iniciado el partido.
6. El ranking es independiente por grupo.

---

## Cómo usar este backlog para Stitch

Este backlog no reemplaza los prompts visuales, pero los mejora.

Sirve para pedirle a Stitch refinamientos como:
- estados reales de partidos y pronósticos
- permisos por rol
- pantallas con acciones correctas
- vistas sociales con contenido realista
- configuraciones del admin alineadas al negocio
